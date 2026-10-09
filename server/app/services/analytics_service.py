import hashlib
import hmac
import os
import re
from datetime import date, datetime, timezone
from urllib.parse import urlparse

from app.repositories.page_view_repository import PageViewRepository

VALID_RANGES = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
}

_HASH_KEY = (os.getenv("JWT_SECRET_KEY") or "").encode()
_BOT_RE = re.compile(r"bot|crawl|spider|slurp|preview|headless|lighthouse", re.IGNORECASE)
_EXCLUDED_PREFIXES = ("/admin", "/api", "/uploads")


def _visitor_hash(ip: str | None, user_agent: str) -> str:
    # Incluye el día: cuenta visitantes únicos sin cookies y sin poder seguir a nadie entre días
    raw = f"{date.today().isoformat()}|{ip or ''}|{user_agent}"
    return hmac.new(_HASH_KEY, raw.encode(), hashlib.sha256).hexdigest()


def _domain(url: str | None) -> str | None:
    if not url:
        return None
    host = (urlparse(url).hostname or "").lower()
    return host.removeprefix("www.") or None


class AnalyticsService:

    # ..............................
    @staticmethod
    def track(path: str, referrer: str | None, utm_source: str | None, entry: bool,
              ip: str | None, user_agent: str) -> None:
        if not user_agent or _BOT_RE.search(user_agent):
            return
        path = path.split("?")[0].split("#")[0] or "/"
        if not path.startswith("/") or path.startswith(_EXCLUDED_PREFIXES):
            return

        PageViewRepository.create(
            path=path,
            visitor_hash=_visitor_hash(ip, user_agent),
            referrer_domain=_domain(referrer) if entry else None,
            utm_source=((utm_source or "").strip() or None) if entry else None,
            is_entry=entry,
        )

    # ..............................
    @staticmethod
    def get_overview(date_range: str = "30d") -> dict:
        days = VALID_RANGES.get(date_range, VALID_RANGES["30d"])
        summary = PageViewRepository.summary(days)

        return {
            "configured": True,
            "range": f"{days}d",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "pageviews": int(summary["pageviews"] or 0),
                "visitors": int(summary["visitors"] or 0),
                "todayPageviews": int(summary["today_pageviews"] or 0),
            },
            "timeline": [
                {
                    "date": row["day"].isoformat(),
                    "pageviews": int(row["pageviews"]),
                    "visitors": int(row["visitors"]),
                }
                for row in PageViewRepository.daily(days)
            ],
            "topPages": [
                {"path": row["path"], "pageviews": int(row["pageviews"])}
                for row in PageViewRepository.top_pages(days)
            ],
            "trafficSources": [
                {"source": row["source"], "visitors": int(row["visitors"])}
                for row in PageViewRepository.traffic_sources(days)
            ],
        }
