from fastapi import APIRouter, Depends, Query

from app.services.audit_log_service import AuditLogService
from app.utils.auth_utils import require_admin


router = APIRouter()


@router.get("/api/admin/audit-logs")
def list_audit_logs(
    action: str | None = None,
    resource_type: str | None = None,
    search: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    _current_user: dict = Depends(require_admin),
):
    return AuditLogService.find_all(
        action=action,
        resource_type=resource_type,
        search=search,
        limit=limit,
    )
