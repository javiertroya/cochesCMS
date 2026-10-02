import json
import re
from pathlib import Path
from uuid import uuid4

from sqlalchemy import text

from app import config
from app.db import engine
from app.services.storage_service import get_storage, guess_content_type, key_from_public_url
from app.utils.image_utils import InvalidImageError, process_image


# ............................................................................
RASTER_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
RAW_EXTENSIONS = {".svg", ".ico", ".mp4", ".webm"}
# Logo y favicon se guardan sin convertir (se respetan formato y tamaño)
RAW_TARGETS = {"logo", "favicon"}

ALLOWED_EXTENSIONS = RASTER_EXTENSIONS | RAW_EXTENSIONS
EXTENSION_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".heif": "image/heif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
}
VARIANT_KEY_RE = re.compile(r"-(sm|md)\.webp$")


class MediaUploadError(ValueError):
    pass


# ............................................................................
def mime_to_type(mime_type: str) -> str:
    if mime_type.startswith("image/"):
        return "image"
    if mime_type.startswith("video/"):
        return "video"
    return "other"


def _check_size(data: bytes, extension: str):
    is_video = EXTENSION_MIME.get(extension, "").startswith("video/")
    limit_mb = config.MAX_VIDEO_MB if is_video else config.MAX_IMAGE_MB
    if len(data) > limit_mb * 1024 * 1024:
        raise MediaUploadError(f"El archivo supera el máximo de {limit_mb} MB")


# ............................................................................
def store_file(data: bytes, original_name: str, folder: str, *, target: str | None = None) -> dict:
    """Procesa (si procede) y guarda un archivo en la zona pública.

    Devuelve los datos para registrar en la tabla `media`.
    """
    extension = Path(original_name or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise MediaUploadError("Formato de archivo no permitido")
    _check_size(data, extension)

    storage = get_storage()
    base_name = uuid4().hex
    folder = folder.strip("/") or "media"

    if extension in RASTER_EXTENSIONS and target not in RAW_TARGETS:
        try:
            processed = process_image(data)
        except InvalidImageError as exc:
            raise MediaUploadError(str(exc)) from exc

        key = f"{folder}/{base_name}{processed.extension}"
        storage.put(key, processed.main.data, processed.content_type)

        variants = {}
        for name, version in processed.variants.items():
            variant_key = f"{folder}/{base_name}-{name}{processed.extension}"
            storage.put(variant_key, version.data, processed.content_type)
            variants[name] = {
                "key": variant_key,
                "url": storage.public_url(variant_key),
                "width": version.width,
                "height": version.height,
            }

        return {
            "filename": Path(key).name,
            "storage_key": key,
            "url": storage.public_url(key),
            "mime_type": processed.content_type,
            "file_size": len(processed.main.data),
            "width": processed.main.width,
            "height": processed.main.height,
            "variants": variants,
        }

    if extension in {".heic", ".heif"}:
        raise MediaUploadError("El logo y el favicon deben ser PNG, JPG, WebP o SVG")

    key = f"{folder}/{base_name}{extension}"
    mime_type = EXTENSION_MIME[extension]
    storage.put(key, data, mime_type)
    return {
        "filename": Path(key).name,
        "storage_key": key,
        "url": storage.public_url(key),
        "mime_type": mime_type,
        "file_size": len(data),
        "width": None,
        "height": None,
        "variants": {},
    }


# ............................................................................
def delete_stored_files(storage_key: str | None, url: str | None, variants: dict | None) -> None:
    """Borra el archivo principal y sus variantes. No falla si ya no existen."""
    storage = get_storage()
    keys = [storage_key or key_from_public_url(url)]
    keys += [variant.get("key") for variant in (variants or {}).values() if isinstance(variant, dict)]
    for key in filter(None, keys):
        try:
            storage.delete(key)
        except Exception:  # pragma: no cover - un archivo perdido no debe bloquear el borrado
            pass


# ............................................................................
def insert_media(conn, record: dict, original_name: str, category_id: int | None = None) -> dict:
    row = conn.execute(
        text("""
            INSERT INTO media (filename, original_name, url, storage_key, mime_type,
                               file_size, width, height, variants, category_id)
            VALUES (:filename, :original_name, :url, :storage_key, :mime_type,
                    :file_size, :width, :height, CAST(:variants AS JSONB), :category_id)
            ON CONFLICT DO NOTHING
            RETURNING id
        """),
        {
            **record,
            "original_name": original_name,
            "variants": json.dumps(record.get("variants") or {}),
            "category_id": category_id,
        },
    ).first()
    return {"id": row[0] if row else None, **record}


# ............................................................................
def sync_unregistered_files() -> int:
    """Registra en `media` los archivos del almacenamiento público que no estén en la BD."""
    storage = get_storage()

    with engine.connect() as conn:
        known_keys = set(filter(None, conn.execute(text("SELECT storage_key FROM media")).scalars().all()))
        known_urls = set(conn.execute(text("SELECT url FROM media")).scalars().all())

    stored = dict(storage.list_keys())
    to_insert = []
    for key, size in stored.items():
        extension = Path(key).suffix.lower()
        if extension not in EXTENSION_MIME or VARIANT_KEY_RE.search(key):
            continue
        url = storage.public_url(key)
        if key in known_keys or url in known_urls:
            continue

        # Las variantes siguen la convención <nombre>-sm.webp / <nombre>-md.webp
        variants = {}
        if extension == ".webp":
            for name in ("sm", "md"):
                variant_key = f"{key.removesuffix('.webp')}-{name}.webp"
                if variant_key in stored:
                    variants[name] = {"key": variant_key, "url": storage.public_url(variant_key)}

        to_insert.append({
            "filename": Path(key).name,
            "storage_key": key,
            "url": url,
            "mime_type": EXTENSION_MIME.get(extension) or guess_content_type(key),
            "file_size": size,
            "width": None,
            "height": None,
            "variants": variants,
        })

    if to_insert:
        with engine.begin() as conn:
            for record in to_insert:
                insert_media(conn, record, original_name=record["filename"])

    return len(to_insert)
