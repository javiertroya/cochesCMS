from fastapi import APIRouter, Depends, Query

from app.services.posthog_service import PostHogService
from app.utils.auth_utils import require_staff

router = APIRouter()


@router.get("/api/admin/analytics/overview")
def get_analytics_overview(
    range: str = Query("30d", pattern="^(7d|30d|90d)$"),
    _current_user: dict = Depends(require_staff),
):
    return PostHogService.get_overview(range)
