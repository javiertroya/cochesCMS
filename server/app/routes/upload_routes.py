from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import text

from app.db import engine
from app.services.audit_log_service import AuditLogService
from app.services.media_service import (
    MediaUploadError,
    delete_stored_files,
    insert_media,
    mime_to_type,
    store_file,
    sync_unregistered_files,
)
from app.utils.auth_utils import require_staff

# ............................................................................
router = APIRouter()

# Carpeta (prefijo) donde se guarda cada tipo de subida
UPLOAD_TARGETS = {
    "cms": "cms",
    "media": "media",
    "noticias": "noticias",
    "vehiculos": "vehiculos",
    "logo": "brand",
    "favicon": "brand",
}


# ............................................................................
@router.post("/api/uploads/{target}")
async def upload_file(
    target: str,
    file: UploadFile = File(...),
    category_id: int | None = Form(default=None),
    current_user: dict = Depends(require_staff),
):
    folder = UPLOAD_TARGETS.get(target) or "media"
    resolved_category_id = None

    if category_id is not None:
        with engine.connect() as conn:
            cat = conn.execute(
                text("SELECT slug FROM media_categories WHERE id = :id"),
                {"id": category_id},
            ).mappings().first()
        if cat:
            folder = cat["slug"]
            resolved_category_id = category_id

    original_name = file.filename or "archivo"
    content = await file.read()

    try:
        # Pillow y la subida a R2 bloquean: se ejecutan fuera del event loop
        record = await run_in_threadpool(store_file, content, original_name, folder, target=target)
    except MediaUploadError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    with engine.begin() as conn:
        media = insert_media(conn, record, original_name, resolved_category_id)

    AuditLogService.log(
        user=current_user,
        action="create",
        resource_type="media",
        resource_id=media["id"],
        resource_label=original_name,
    )
    return {
        "id": media["id"],
        "url": record["url"],
        "filename": record["filename"],
        "width": record["width"],
        "height": record["height"],
        "variants": {name: v["url"] for name, v in record["variants"].items()},
    }


# ............................................................................
@router.get("/api/admin/media")
async def list_media(
    _current_user: dict = Depends(require_staff),
):
    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    m.id, m.filename, m.original_name, m.url, m.mime_type, m.file_size,
                    m.width, m.height, m.variants, m.category_id, m.created_at,
                    (
                        SELECT COUNT(*) FROM pages p
                        WHERE p.seo_og_image = m.url
                           OR p.header_slides::text LIKE '%' || m.url || '%'
                    ) + (
                        SELECT COUNT(*) FROM page_components pc
                        WHERE pc.config::text LIKE '%' || m.url || '%'
                    ) AS ref_count
                FROM media m
                ORDER BY m.created_at DESC
            """)
        )
        rows = result.mappings().all()

    return [
        {
            "id": row["id"],
            "filename": row["filename"],
            "original_name": row["original_name"],
            "url": row["url"],
            "mime_type": row["mime_type"],
            "file_size": row["file_size"],
            "width": row["width"],
            "height": row["height"],
            "variants": {name: v.get("url") for name, v in (row["variants"] or {}).items()},
            "category_id": row["category_id"],
            "ref_count": int(row["ref_count"] or 0),
            "type": mime_to_type(row["mime_type"] or ""),
        }
        for row in rows
    ]


# ............................................................................
@router.delete("/api/admin/media/{media_id}")
async def delete_media(
    media_id: int,
    current_user: dict = Depends(require_staff),
):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT url, storage_key, variants, original_name FROM media WHERE id = :id"),
            {"id": media_id},
        ).mappings().first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado",
        )

    await run_in_threadpool(delete_stored_files, row["storage_key"], row["url"], row["variants"])

    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM media WHERE id = :id"),
            {"id": media_id},
        )

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="media",
        resource_id=media_id,
        resource_label=row["original_name"] or row["url"],
    )
    return {"ok": True}


# ............................................................................
@router.post("/api/admin/media/sync")
async def sync_media(
    _current_user: dict = Depends(require_staff),
):
    """Registra en la biblioteca los archivos del almacenamiento que aún no estén en la BD."""
    synced = await run_in_threadpool(sync_unregistered_files)
    return {"synced": synced}
