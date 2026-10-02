from sqlalchemy import text

from app.db import engine
from app.models.Redirect import RedirectCreate, RedirectUpdate


class RedirectRepository:

    @staticmethod
    def find_all() -> list[dict]:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT id, from_path, to_path, status_code, is_active, created_at, updated_at
                    FROM redirects
                    ORDER BY from_path
                """)
            )
            return [dict(row) for row in result.mappings().all()]

    @staticmethod
    def find_by_id(redirect_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT id, from_path, to_path, status_code, is_active, created_at, updated_at
                    FROM redirects
                    WHERE id = :id
                """),
                {"id": redirect_id},
            )
            row = result.mappings().first()
            return dict(row) if row else None

    @staticmethod
    def create(data: RedirectCreate) -> dict:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO redirects (from_path, to_path, status_code, is_active)
                    VALUES (:from_path, :to_path, :status_code, :is_active)
                    RETURNING id, from_path, to_path, status_code, is_active, created_at, updated_at
                """),
                data.model_dump(),
            )
            return dict(result.mappings().first())

    @staticmethod
    def update(redirect_id: int, data: RedirectUpdate) -> dict | None:
        fields = data.model_dump(exclude_unset=True)
        if not fields:
            return RedirectRepository.find_by_id(redirect_id)

        params = {"id": redirect_id}
        set_parts = []
        for key, value in fields.items():
            set_parts.append(f"{key} = :{key}")
            params[key] = value

        with engine.begin() as connection:
            result = connection.execute(
                text(f"""
                    UPDATE redirects
                    SET {', '.join(set_parts)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    RETURNING id, from_path, to_path, status_code, is_active, created_at, updated_at
                """),
                params,
            )
            row = result.mappings().first()
            return dict(row) if row else None

    @staticmethod
    def delete(redirect_id: int) -> bool:
        with engine.begin() as connection:
            result = connection.execute(
                text("DELETE FROM redirects WHERE id = :id"),
                {"id": redirect_id},
            )
            return result.rowcount > 0
