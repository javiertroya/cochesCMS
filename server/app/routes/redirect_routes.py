from fastapi import APIRouter, Depends, HTTPException

from app.models.Redirect import RedirectCreate, RedirectUpdate
from app.repositories.redirect_repository import RedirectRepository
from app.services.audit_log_service import AuditLogService, _diff
from app.services.redirect_service import RedirectService
from app.utils.auth_utils import require_admin

_REDIRECT_DIFF_FIELDS = {"from_path", "to_path", "status_code", "is_active"}

router = APIRouter()


@router.get("/api/admin/redirects")
def list_redirects(_current_user: dict = Depends(require_admin)):
    return RedirectService.find_all()


@router.post("/api/admin/redirects")
def create_redirect(data: RedirectCreate, current_user: dict = Depends(require_admin)):
    try:
        created = RedirectService.create(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo crear la redirección") from exc

    AuditLogService.log(
        user=current_user,
        action="create",
        resource_type="redirect",
        resource_id=created["id"],
        resource_label=created["from_path"],
    )
    return created


@router.put("/api/admin/redirects/{redirect_id}")
def update_redirect(
    redirect_id: int,
    data: RedirectUpdate,
    current_user: dict = Depends(require_admin),
):
    before = RedirectRepository.find_by_id(redirect_id) or {}
    try:
        updated = RedirectService.update(redirect_id, data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo actualizar la redirección") from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Redirección no encontrada")

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="redirect",
        resource_id=redirect_id,
        resource_label=updated["from_path"],
        changes=_diff(before, dict(updated), _REDIRECT_DIFF_FIELDS),
    )
    return updated


@router.delete("/api/admin/redirects/{redirect_id}")
def delete_redirect(redirect_id: int, current_user: dict = Depends(require_admin)):
    before = RedirectRepository.find_by_id(redirect_id)
    try:
        result = RedirectService.delete(redirect_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="redirect",
        resource_id=redirect_id,
        resource_label=before["from_path"] if before else f"Redirección #{redirect_id}",
    )
    return result
