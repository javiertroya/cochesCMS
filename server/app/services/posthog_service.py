import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv
from fastapi import HTTPException, status

from app.repositories.cms_page_repository import CmsPageRepository

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

POSTHOG_HOST = os.getenv("POSTHOG_HOST", "https://eu.posthog.com").rstrip("/")
POSTHOG_PROJECT_ID = os.getenv("POSTHOG_PROJECT_ID")
POSTHOG_PERSONAL_API_KEY = os.getenv("POSTHOG_PERSONAL_API_KEY")

VALID_RANGES = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
}

_cache = {}
_CACHE_TTL_SECONDS = 180


class PostHogService:
    @staticmethod
    def get_overview(date_range: str = "30d"):
        days = VALID_RANGES.get(date_range, VALID_RANGES["30d"])
        cache_key = f"overview:{days}"
        cached = _cache.get(cache_key)

        if cached and time.time() - cached["created_at"] < _CACHE_TTL_SECONDS:
            return {
                **cached["data"],
                "cached": True,
            }

        if not POSTHOG_PROJECT_ID or not POSTHOG_PERSONAL_API_KEY:
            return PostHogService._empty_response(
                days,
                configured=False,
                message="Configura POSTHOG_PROJECT_ID y POSTHOG_PERSONAL_API_KEY en el backend.",
            )

        data = PostHogService._load_overview(days)
        _cache[cache_key] = {
            "created_at": time.time(),
            "data": data,
        }
        return data

    @staticmethod
    def _load_overview(days: int):
        active_path_filter = PostHogService._active_path_filter()

        daily_query = f"""
            SELECT
                toDate(timestamp) AS day,
                count() AS pageviews,
                count(DISTINCT distinct_id) AS visitors
            FROM events
            WHERE event = '$pageview'
                AND timestamp >= now() - INTERVAL {days} DAY
                {active_path_filter}
            GROUP BY day
            ORDER BY day
            LIMIT {days + 1}
        """

        summary_query = f"""
            SELECT
                count() AS pageviews,
                count(DISTINCT distinct_id) AS visitors,
                countIf(toDate(timestamp) = today()) AS today_pageviews
            FROM events
            WHERE event = '$pageview'
                AND timestamp >= now() - INTERVAL {days} DAY
                {active_path_filter}
        """

        top_pages_query = f"""
            SELECT
                properties.$pathname AS pathname,
                count() AS pageviews
            FROM events
            WHERE event = '$pageview'
                AND timestamp >= now() - INTERVAL {days} DAY
                AND properties.$pathname IS NOT NULL
                {active_path_filter}
            GROUP BY pathname
            ORDER BY pageviews DESC
            LIMIT 8
        """

        top_events_query = f"""
            SELECT
                event,
                count() AS total
            FROM events
            WHERE timestamp >= now() - INTERVAL {days} DAY
            GROUP BY event
            ORDER BY total DESC
            LIMIT 8
        """

        traffic_sources_query = f"""
            SELECT
                CASE
                    WHEN properties.$utm_source IS NOT NULL AND properties.$utm_source != ''
                        THEN properties.$utm_source
                    WHEN properties.$referring_domain = '$direct'
                        OR properties.$referring_domain IS NULL
                        OR properties.$referring_domain = ''
                        THEN 'Directo'
                    WHEN properties.$referring_domain LIKE '%google%'
                        OR properties.$referring_domain LIKE '%bing%'
                        OR properties.$referring_domain LIKE '%yahoo%'
                        OR properties.$referring_domain LIKE '%duckduckgo%'
                        THEN 'Búsqueda'
                    WHEN properties.$referring_domain LIKE '%facebook%'
                        OR properties.$referring_domain LIKE '%instagram%'
                        OR properties.$referring_domain LIKE '%twitter%'
                        OR properties.$referring_domain LIKE '%x.com%'
                        OR properties.$referring_domain LIKE '%linkedin%'
                        OR properties.$referring_domain LIKE '%tiktok%'
                        THEN 'Redes sociales'
                    ELSE properties.$referring_domain
                END AS source,
                count(DISTINCT distinct_id) AS visitors
            FROM events
            WHERE event = '$pageview'
                AND timestamp >= now() - INTERVAL {days} DAY
                {active_path_filter}
            GROUP BY source
            HAVING source IS NOT NULL AND source != ''
            ORDER BY visitors DESC
            LIMIT 6
        """

        summary = PostHogService._query("admin_usage_summary", summary_query)
        daily = PostHogService._query("admin_daily_usage", daily_query)
        top_pages = PostHogService._query("admin_top_pages", top_pages_query)
        top_events = PostHogService._query("admin_top_events", top_events_query)
        traffic_sources = PostHogService._query("admin_traffic_sources", traffic_sources_query)

        timeline = [
            {
                "date": PostHogService._format_day(row[0]),
                "pageviews": int(row[1] or 0),
                "visitors": int(row[2] or 0),
            }
            for row in daily.get("results", [])
        ]

        pages = [
            {
                "path": row[0] or "/",
                "pageviews": int(row[1] or 0),
            }
            for row in top_pages.get("results", [])
        ]

        events = [
            {
                "event": row[0],
                "total": int(row[1] or 0),
            }
            for row in top_events.get("results", [])
        ]

        sources = [
            {
                "source": row[0],
                "visitors": int(row[1] or 0),
            }
            for row in traffic_sources.get("results", [])
            if row[0]
        ]

        summary_row = summary.get("results", [[0, 0, 0]])[0]
        total_pageviews = int(summary_row[0] or 0)
        total_visitors = int(summary_row[1] or 0)
        today_pageviews = int(summary_row[2] or 0)

        return {
            "configured": True,
            "range": f"{days}d",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "summary": {
                "pageviews": total_pageviews,
                "visitors": total_visitors,
                "todayPageviews": today_pageviews,
            },
            "timeline": timeline,
            "topPages": pages,
            "topEvents": events,
            "trafficSources": sources,
            "cached": bool(summary.get("is_cached") or daily.get("is_cached") or top_pages.get("is_cached") or top_events.get("is_cached")),
        }

    @staticmethod
    def _query(name: str, query: str):
        url = f"{POSTHOG_HOST}/api/projects/{POSTHOG_PROJECT_ID}/query/"
        payload = json.dumps({
            "query": {
                "kind": "HogQLQuery",
                "query": query,
            },
            "name": name,
            "refresh": "blocking",
        }).encode("utf-8")

        request = Request(
            url,
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {POSTHOG_PERSONAL_API_KEY}",
                "Content-Type": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=20) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8") or str(error)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"PostHog ha devuelto un error: {detail}",
            ) from error
        except URLError as error:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"No se pudo conectar con PostHog: {error.reason}",
            ) from error

    @staticmethod
    def _format_day(value):
        if isinstance(value, str):
            return value[:10]
        return str(value)

    @staticmethod
    def _active_page_paths():
        pages = CmsPageRepository.find_all(include_unpublished=False)
        paths = set()

        for page in pages:
            slug = (page.get("slug") or "").strip("/")
            if not slug or slug == "home":
                paths.add("/")
                paths.add("/home")
                continue

            path = f"/{slug}"
            paths.add(path)
            paths.add(f"{path}/")

        return sorted(paths)

    @staticmethod
    def _active_path_filter():
        paths = PostHogService._active_page_paths()
        if not paths:
            return ""

        values = ", ".join(PostHogService._sql_string(path) for path in paths)
        return f"AND properties.$pathname IN ({values})"

    @staticmethod
    def _sql_string(value: str):
        return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"

    @staticmethod
    def _empty_response(days: int, configured: bool, message: str):
        return {
            "configured": configured,
            "range": f"{days}d",
            "updatedAt": None,
            "summary": {
                "pageviews": 0,
                "visitors": 0,
                "todayPageviews": 0,
            },
            "timeline": [],
            "topPages": [],
            "topEvents": [],
            "trafficSources": [],
            "cached": False,
            "message": message,
        }
