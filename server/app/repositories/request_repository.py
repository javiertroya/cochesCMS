import json

from sqlalchemy import text

from app.db import engine


_COLUMNS = "id, type, status, data, vehicle_id, source_page, created_at, updated_at"


class RequestRepository:

    @staticmethod
    def create(*, request_type: str, data: dict, source_page: str | None, ip_hash: str | None) -> dict:
        with engine.begin() as connection:
            result = connection.execute(
                text(f"""
                    INSERT INTO requests (type, data, source_page, ip_hash)
                    VALUES (:type, CAST(:data AS jsonb), :source_page, :ip_hash)
                    RETURNING {_COLUMNS}
                """),
                {
                    "type": request_type,
                    "data": json.dumps(data, ensure_ascii=False),
                    "source_page": source_page,
                    "ip_hash": ip_hash,
                },
            )
            return dict(result.mappings().first())

    @staticmethod
    def count_recent_by_ip(ip_hash: str, minutes: int) -> int:
        with engine.connect() as connection:
            return connection.execute(
                text("""
                    SELECT COUNT(*) FROM requests
                    WHERE ip_hash = :ip_hash
                      AND created_at > now() - make_interval(mins => :minutes)
                """),
                {"ip_hash": ip_hash, "minutes": minutes},
            ).scalar_one()

    @staticmethod
    def find_all(*, status: str | None = None, request_type: str | None = None, search: str | None = None) -> list[dict]:
        clauses = []
        params: dict = {}
        if status:
            clauses.append("status = :status")
            params["status"] = status
        if request_type:
            clauses.append("type = :type")
            params["type"] = request_type
        if search:
            clauses.append("data::text ILIKE :search")
            params["search"] = f"%{search}%"

        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with engine.connect() as connection:
            result = connection.execute(
                text(f"SELECT {_COLUMNS} FROM requests {where} ORDER BY created_at DESC LIMIT 500"),
                params,
            )
            return [dict(row) for row in result.mappings().all()]

    @staticmethod
    def count_by_status() -> dict[str, int]:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT status, COUNT(*) AS total FROM requests GROUP BY status"))
            return {row["status"]: row["total"] for row in result.mappings().all()}

    @staticmethod
    def find_by_id(request_id: int) -> dict | None:
        with engine.connect() as connection:
            row = connection.execute(
                text(f"SELECT {_COLUMNS} FROM requests WHERE id = :id"),
                {"id": request_id},
            ).mappings().first()
            return dict(row) if row else None

    @staticmethod
    def update_status(request_id: int, status: str) -> dict | None:
        with engine.begin() as connection:
            row = connection.execute(
                text(f"""
                    UPDATE requests
                    SET status = :status, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    RETURNING {_COLUMNS}
                """),
                {"id": request_id, "status": status},
            ).mappings().first()
            return dict(row) if row else None

    @staticmethod
    def delete(request_id: int) -> bool:
        with engine.begin() as connection:
            result = connection.execute(text("DELETE FROM requests WHERE id = :id"), {"id": request_id})
            return result.rowcount > 0
