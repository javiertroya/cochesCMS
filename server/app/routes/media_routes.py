import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text

from app.db import engine
from app.services.audit_log_service import AuditLogService
from app.utils.auth_utils import require_staff

# ............................................................................
router = APIRouter()


def _slugify(text_: str) -> str:
    text_ = unicodedata.normalize("NFKD", text_).encode("ascii", "ignore").decode("ascii")
    text_ = re.sub(r"[^\w\s-]", "", text_).strip().lower()
    return re.sub(r"[\s_-]+", "-", text_)


# ............................................................................
class CategoryCreate(BaseModel):
    name: str


class CategoryUpdate(BaseModel):
    name: str


class MediaUpdate(BaseModel):
    original_name: str | None = None
    category_id: int | None = None


# ............................................................................
@router.get("/api/admin/media/categories")
async def list_categories(_current_user: dict = Depends(require_staff)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, name, slug, created_at FROM media_categories ORDER BY name ASC")
        ).mappings().all()
    return [dict(r) for r in rows]


# ............................................................................
@router.post("/api/admin/media/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    current_user: dict = Depends(require_staff),
):
    slug = _slugify(body.name)
    if not slug:
        raise HTTPException(status_code=400, detail="Nombre de categoría inválido")

    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT id FROM media_categories WHERE slug = :slug"),
            {"slug": slug},
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")

        row = conn.execute(
            text("""
                INSERT INTO media_categories (name, slug)
                VALUES (:name, :slug)
                RETURNING id, name, slug, created_at
            """),
            {"name": body.name.strip(), "slug": slug},
        ).mappings().first()

    AuditLogService.log(
        user=current_user,
        action="create",
        resource_type="media_category",
        resource_id=row["id"],
        resource_label=body.name,
    )
    return dict(row)


# ............................................................................
@router.patch("/api/admin/media/categories/{category_id}")
async def update_category(
    category_id: int,
    body: CategoryUpdate,
    current_user: dict = Depends(require_staff),
):
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                UPDATE media_categories SET name = :name
                WHERE id = :id
                RETURNING id, name, slug, created_at
            """),
            {"id": category_id, "name": body.name.strip()},
        ).mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="media_category",
        resource_id=category_id,
        resource_label=body.name,
    )
    return dict(row)


# ............................................................................
@router.delete("/api/admin/media/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: dict = Depends(require_staff),
):
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT name FROM media_categories WHERE id = :id"),
            {"id": category_id},
        ).mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")

        conn.execute(
            text("UPDATE media SET category_id = NULL WHERE category_id = :id"),
            {"id": category_id},
        )
        conn.execute(
            text("DELETE FROM media_categories WHERE id = :id"),
            {"id": category_id},
        )

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="media_category",
        resource_id=category_id,
        resource_label=row["name"],
    )
    return {"ok": True}


# ............................................................................
@router.patch("/api/admin/media/{media_id}")
async def update_media(
    media_id: int,
    body: MediaUpdate,
    current_user: dict = Depends(require_staff),
):
    if body.original_name is None and body.category_id is None:
        raise HTTPException(status_code=400, detail="Nada que actualizar")

    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT id, original_name FROM media WHERE id = :id"),
            {"id": media_id},
        ).mappings().first()

        if not existing:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        updates = []
        params: dict = {"id": media_id}

        if body.original_name is not None:
            updates.append("original_name = :original_name")
            params["original_name"] = body.original_name.strip()

        if body.category_id is not None:
            updates.append("category_id = :category_id")
            params["category_id"] = body.category_id

        row = conn.execute(
            text(f"""
                UPDATE media SET {', '.join(updates)}
                WHERE id = :id
                RETURNING id, original_name, category_id
            """),
            params,
        ).mappings().first()

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="media",
        resource_id=media_id,
        resource_label=existing["original_name"],
    )
    return dict(row)


# ............................................................................
@router.patch("/api/admin/media/{media_id}/category/clear")
async def clear_media_category(
    media_id: int,
    current_user: dict = Depends(require_staff),
):
    """Set category_id to NULL for a media item."""
    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT id, original_name FROM media WHERE id = :id"),
            {"id": media_id},
        ).mappings().first()

        if not existing:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        row = conn.execute(
            text("UPDATE media SET category_id = NULL WHERE id = :id RETURNING id, original_name, category_id"),
            {"id": media_id},
        ).mappings().first()

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="media",
        resource_id=media_id,
        resource_label=existing["original_name"],
    )
    return dict(row)


# ............................................................................
@router.get("/api/admin/media/{media_id}/references")
async def get_media_references(
    media_id: int,
    _current_user: dict = Depends(require_staff),
):
    with engine.connect() as conn:
        media_row = conn.execute(
            text("SELECT url FROM media WHERE id = :id"),
            {"id": media_id},
        ).mappings().first()

        if not media_row:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        url = media_row["url"]
        pattern = f"%{url}%"
        references = []

        # Check pages.seo_og_image
        seo_rows = conn.execute(
            text("""
                SELECT id, title, slug
                FROM pages
                WHERE seo_og_image = :url
            """),
            {"url": url},
        ).mappings().all()

        for r in seo_rows:
            references.append({
                "page_id": r["id"],
                "page_title": r["title"],
                "page_slug": r["slug"],
                "location": "seo_image",
                "component_type": None,
            })

        # Check pages.header_slides
        slide_rows = conn.execute(
            text("""
                SELECT id, title, slug
                FROM pages
                WHERE header_slides::text LIKE :pattern
            """),
            {"pattern": pattern},
        ).mappings().all()

        for r in slide_rows:
            references.append({
                "page_id": r["id"],
                "page_title": r["title"],
                "page_slug": r["slug"],
                "location": "header_slides",
                "component_type": None,
            })

        # Check page_components.config
        comp_rows = conn.execute(
            text("""
                SELECT pc.id, pc.page_id, p.title AS page_title, p.slug AS page_slug,
                       ct.name AS component_type
                FROM page_components pc
                JOIN pages p ON p.id = pc.page_id
                JOIN component_types ct ON ct.id = pc.component_type_id
                WHERE pc.config::text LIKE :pattern
            """),
            {"pattern": pattern},
        ).mappings().all()

        for r in comp_rows:
            references.append({
                "page_id": r["page_id"],
                "page_title": r["page_title"],
                "page_slug": r["page_slug"],
                "location": "component",
                "component_type": r["component_type"],
            })

    return references
