from fastapi import APIRouter, Depends, Query, Request, Response

from app.models.PageView import PageViewCreate
from app.services.analytics_service import AnalyticsService
from app.utils.auth_utils import require_staff

router = APIRouter()


# ..............................
# Público: la web lo llama en cada cambio de página
@router.post("/api/analytics/pageview", status_code=204)
def track_pageview(payload: PageViewCreate, request: Request):
    AnalyticsService.track(
        path=payload.path,
        referrer=payload.referrer,
        utm_source=payload.utm_source,
        entry=payload.entry,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", ""),
    )
    return Response(status_code=204)


@router.get("/api/admin/analytics/overview")
def get_analytics_overview(
    range: str = Query("30d", pattern="^(7d|30d|90d)$"),
    _current_user: dict = Depends(require_staff),
):
    return AnalyticsService.get_overview(range)
