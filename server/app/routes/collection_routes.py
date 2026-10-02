from fastapi import APIRouter, Depends, HTTPException

from app.models.Collection import CollectionCreate, CollectionUpdate, CollectionItemCreate, CollectionItemUpdate
from app.repositories.collection_repository import CollectionRepository
from app.services.audit_log_service import AuditLogService, _diff
from app.services.collection_service import CollectionService
from app.utils.auth_utils import require_staff

_COLLECTION_DIFF_FIELDS = {"name", "slug", "description"}

router = APIRouter()


_TITLE_FIELDS = ("titulo", "title", "nombre", "name", "label", "heading", "asunto")

def _item_label(data, item_id: int) -> str:
    if isinstance(data, dict):
        data_lower = {k.lower(): v for k, v in data.items()}
        for key in _TITLE_FIELDS:
            val = data_lower.get(key)
            if isinstance(val, str) and val.strip() and not val.startswith(("/", "http")):
                return val[:80]
        for val in data.values():
            if isinstance(val, str) and val.strip() and not val.startswith(("/", "http")):
                return val[:80]
    return f"Ítem #{item_id}"


# ── Collections ─────────────────────────────────────────────────────────────

@router.get("/api/admin/collections")
def list_collections(_cu: dict = Depends(require_staff)):
    return CollectionService.find_all()


@router.get("/api/admin/collections/{collection_id}")
def get_collection(collection_id: int, _cu: dict = Depends(require_staff)):
    col = CollectionService.find_by_id(collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Colección no encontrada")
    return col


@router.post("/api/admin/collections")
def create_collection(data: CollectionCreate, cu: dict = Depends(require_staff)):
    try:
        created = CollectionService.create(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo crear la colección") from exc

    AuditLogService.log(
        user=cu,
        action="create",
        resource_type="collection",
        resource_id=created["id"],
        resource_label=created["name"],
    )
    return created


@router.put("/api/admin/collections/{collection_id}")
def update_collection(collection_id: int, data: CollectionUpdate, cu: dict = Depends(require_staff)):
    before = dict(CollectionService.find_by_id(collection_id) or {})
    updated = CollectionService.update(collection_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Colección no encontrada")

    after = dict(updated)
    AuditLogService.log(
        user=cu,
        action="update",
        resource_type="collection",
        resource_id=collection_id,
        resource_label=after.get("name", f"Colección #{collection_id}"),
        changes=_diff(before, after, _COLLECTION_DIFF_FIELDS),
    )
    return updated


@router.delete("/api/admin/collections/{collection_id}")
def delete_collection(collection_id: int, cu: dict = Depends(require_staff)):
    before = dict(CollectionService.find_by_id(collection_id) or {})
    try:
        result = CollectionService.delete(collection_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    AuditLogService.log(
        user=cu,
        action="delete",
        resource_type="collection",
        resource_id=collection_id,
        resource_label=before.get("name", f"Colección #{collection_id}"),
    )
    return result


# ── Public: colección por slug ───────────────────────────────────────────────

@router.get("/api/collections/{slug}")
def get_public_collection(slug: str):
    col = CollectionService.find_by_slug(slug)
    if not col:
        raise HTTPException(status_code=404, detail="Colección no encontrada")
    raw_items = CollectionService.find_items(col["id"])
    items = []
    for row in raw_items:
        item = dict(row["data"])
        item["id"] = row["global_id"]
        item["local_id"] = row["id"]
        items.append(item)
    return {"collection": col, "items": items}


# ── Items (PK compuesta: collection_id + id por colección) ──────────────────

@router.get("/api/admin/collections/{collection_id}/items")
def list_items(collection_id: int, _cu: dict = Depends(require_staff)):
    return CollectionService.find_items(collection_id)


@router.post("/api/admin/collections/{collection_id}/items")
def create_item(collection_id: int, item: CollectionItemCreate, cu: dict = Depends(require_staff)):
    try:
        created = CollectionService.create_item(collection_id, item)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo crear el item") from exc

    AuditLogService.log(
        user=cu,
        action="create",
        resource_type="collection_item",
        resource_id=created.get("global_id"),
        resource_label=_item_label(created.get("data"), created.get("id", 0)),
    )
    return created


@router.put("/api/admin/collections/{collection_id}/items/{item_id}")
def update_item(collection_id: int, item_id: int, item: CollectionItemUpdate, cu: dict = Depends(require_staff)):
    before_row = CollectionRepository.find_item(collection_id, item_id) or {}
    before_data = before_row.get("data", {})

    try:
        updated = CollectionService.update_item(collection_id, item_id, item)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    after_data = updated.get("data", {})
    changes = {"data": {"before": before_data, "after": after_data}} if before_data != after_data else {}

    collection = CollectionService.find_by_id(collection_id)
    collection_name = collection["name"] if collection else f"Colección #{collection_id}"

    AuditLogService.log(
        user=cu,
        action="update",
        resource_type="collection_item",
        resource_id=updated.get("global_id"),
        resource_label=collection_name,
        changes=changes,
    )
    return updated


@router.delete("/api/admin/collections/{collection_id}/items/{item_id}")
def delete_item(collection_id: int, item_id: int, cu: dict = Depends(require_staff)):
    before = CollectionRepository.find_item(collection_id, item_id) or {}
    try:
        result = CollectionService.delete_item(collection_id, item_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    AuditLogService.log(
        user=cu,
        action="delete",
        resource_type="collection_item",
        resource_id=before.get("global_id"),
        resource_label=_item_label(before.get("data", {}), item_id),
    )
    return result
