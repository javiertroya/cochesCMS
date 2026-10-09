import json
from datetime import datetime, timezone

from sqlalchemy import text

from app.db import engine


class AuditLogRepository:

    @staticmethod
    def create(
        *,
        user_id: int | None,
        user_email: str | None,
        action: str,
        resource_type: str,
        resource_id: int | None,
        resource_label: str,
        changes: dict | None = None,
    ) -> None:
        with engine.begin() as connection:
            connection.execute(
                text("""
                    INSERT INTO audit_logs
                        (user_id, user_email, action, resource_type, resource_id, resource_label, changes)
                    VALUES
                        (:user_id, :user_email, :action, :resource_type, :resource_id, :resource_label,
                         CAST(:changes AS jsonb))
                """),
                {
                    "user_id": user_id,
                    "user_email": user_email,
                    "action": action,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "resource_label": resource_label,
                    "changes": json.dumps(changes or {}),
                },
            )

    @staticmethod
    def find_all(
        *,
        action: str | None = None,
        resource_type: str | None = None,
        search: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        params = {"limit": limit}
        where_parts = []

        if action:
            where_parts.append("action = :action")
            params["action"] = action

        if resource_type:
            where_parts.append("resource_type = :resource_type")
            params["resource_type"] = resource_type

        if search:
            where_parts.append("""
                (
                    COALESCE(al.user_email, '') ILIKE :search
                    OR COALESCE(u.name, '') ILIKE :search
                    OR COALESCE(al.resource_label, '') ILIKE :search
                    OR COALESCE(al.resource_type, '') ILIKE :search
                )
            """)
            params["search"] = f"%{search}%"

        where_sql = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""

        with engine.connect() as connection:
            result = connection.execute(
                text(f"""
                    SELECT al.id, al.user_id, al.user_email,
                           COALESCE(u.name, al.user_email) AS user_name,
                           al.action, al.resource_type, al.resource_id,
                           al.resource_label, COALESCE(al.changes, '{{}}'::jsonb) AS changes, al.created_at
                    FROM audit_logs al
                    LEFT JOIN users u ON u.id = al.user_id
                    {where_sql}
                    ORDER BY al.created_at DESC, al.id DESC
                    LIMIT :limit
                """),
                params,
            )
            rows = []
            for row in result.mappings().all():
                d = dict(row)
                created_at = d.get("created_at")
                if isinstance(created_at, datetime):
                    # TIMESTAMPTZ ya trae zona horaria; solo las fechas sin zona se marcan como UTC
                    if created_at.tzinfo is None:
                        created_at = created_at.replace(tzinfo=timezone.utc)
                    d["created_at"] = created_at.isoformat()
                rows.append(d)
            return rows
