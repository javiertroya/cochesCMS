from sqlalchemy import text
from app.db import engine


class PageViewRepository:

    # ..............................
    @staticmethod
    def create(path: str, visitor_hash: str, referrer_domain: str | None, utm_source: str | None, is_entry: bool) -> None:
        with engine.begin() as connection:
            connection.execute(
                text("""
                    INSERT INTO page_views (path, visitor_hash, referrer_domain, utm_source, is_entry)
                    VALUES (:path, :visitor_hash, :referrer_domain, :utm_source, :is_entry)
                """),
                {
                    "path": path,
                    "visitor_hash": visitor_hash,
                    "referrer_domain": referrer_domain,
                    "utm_source": utm_source,
                    "is_entry": is_entry,
                },
            )

    # ..............................
    @staticmethod
    def summary(days: int) -> dict:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        COUNT(*) AS pageviews,
                        COUNT(DISTINCT visitor_hash) AS visitors,
                        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS today_pageviews
                    FROM page_views
                    WHERE created_at >= now() - make_interval(days => :days)
                """),
                {"days": days},
            )
            return dict(result.mappings().first())

    # ..............................
    # Una fila por día del rango, también los días sin visitas
    @staticmethod
    def daily(days: int) -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        d.day::date AS day,
                        COUNT(pv.id) AS pageviews,
                        COUNT(DISTINCT pv.visitor_hash) AS visitors
                    FROM generate_series(
                        date_trunc('day', now()) - make_interval(days => :days - 1),
                        date_trunc('day', now()),
                        INTERVAL '1 day'
                    ) AS d(day)
                    LEFT JOIN page_views pv
                        ON pv.created_at >= d.day AND pv.created_at < d.day + INTERVAL '1 day'
                    GROUP BY d.day
                    ORDER BY d.day
                """),
                {"days": days},
            )
            return [dict(row) for row in result.mappings().all()]

    # ..............................
    @staticmethod
    def top_pages(days: int, limit: int = 8) -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT path, COUNT(*) AS pageviews
                    FROM page_views
                    WHERE created_at >= now() - make_interval(days => :days)
                    GROUP BY path
                    ORDER BY pageviews DESC
                    LIMIT :limit
                """),
                {"days": days, "limit": limit},
            )
            return [dict(row) for row in result.mappings().all()]

    # ..............................
    # Origen de las visitas: solo cuenta la página de entrada al sitio
    @staticmethod
    def traffic_sources(days: int, limit: int = 6) -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text(r"""
                    SELECT source, COUNT(DISTINCT visitor_hash) AS visitors
                    FROM (
                        SELECT
                            visitor_hash,
                            CASE
                                WHEN utm_source IS NOT NULL AND utm_source != '' THEN utm_source
                                WHEN referrer_domain IS NULL OR referrer_domain = '' THEN 'Directo'
                                WHEN referrer_domain ~ '(google|bing|yahoo|duckduckgo|ecosia)\.' THEN 'Búsqueda'
                                WHEN referrer_domain ~ '(facebook|instagram|twitter|linkedin|tiktok|youtube|whatsapp)\.|^(t\.co|x\.com)$' THEN 'Redes sociales'
                                ELSE referrer_domain
                            END AS source
                        FROM page_views
                        WHERE is_entry AND created_at >= now() - make_interval(days => :days)
                    ) entries
                    GROUP BY source
                    ORDER BY visitors DESC
                    LIMIT :limit
                """),
                {"days": days, "limit": limit},
            )
            return [dict(row) for row in result.mappings().all()]
