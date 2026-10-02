from sqlalchemy import text
from app.db import engine
from app.models.User import UserCreate, UserUpdate

# ............................................................................
class UserRepository:

    # ..............................
    @staticmethod
    def _serialize(row) -> dict | None:
        if not row:
            return None
        data = dict(row)
        data.pop("password", None)
        return data

    # ..............................
    @staticmethod
    def _base_select() -> str:
        return """
            SELECT u.id, u.name, u.email, u.phone, u.is_active,
                   u.created_at, u.updated_at, r.name AS role, u.role_id
            FROM users u
            JOIN roles r ON r.id = u.role_id
        """

    # ..............................
    @staticmethod
    def create(user: UserCreate, hashed_password: str) -> int:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO users (name, email, password, phone, role_id)
                    VALUES (:name, :email, :password, :phone,
                            (SELECT id FROM roles WHERE name = :role))
                    RETURNING id
                """),
                {
                    "name": user.name,
                    "email": str(user.email),
                    "password": hashed_password,
                    "phone": user.phone,
                    "role": user.role,
                },
            )
            return result.scalar()

    # ..............................
    @staticmethod
    def find_by_id(user_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text(UserRepository._base_select() + "WHERE u.id = :id"),
                {"id": user_id},
            )
            return UserRepository._serialize(result.mappings().first())

    # ..............................
    @staticmethod
    def find_by_email(email: str) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT u.*, r.name AS role
                    FROM users u JOIN roles r ON r.id = u.role_id
                    WHERE u.email = :email
                """),
                {"email": email},
            )
            return result.mappings().first()

    # ..............................
    @staticmethod
    def count_active_admins() -> int:
        with engine.connect() as connection:
            return connection.execute(
                text("""
                    SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id
                    WHERE r.name = 'admin' AND u.is_active = TRUE
                """)
            ).scalar() or 0

    # ..............................
    @staticmethod
    def find_paginated(page: int, limit: int, filter: str, search: str) -> dict:
        offset = (page - 1) * limit

        filter_clause = {
            "admin":    "AND r.name = 'admin'",
            "editor":   "AND r.name = 'editor'",
            "inactive": "AND u.is_active = FALSE",
        }.get(filter, "")

        search_clause = (
            "AND (u.name ILIKE :search OR u.email ILIKE :search)"
            if search else ""
        )

        params = {
            "limit": limit,
            "offset": offset,
            **({"search": f"%{search}%"} if search else {}),
        }

        base = UserRepository._base_select()

        with engine.connect() as connection:
            items_result = connection.execute(
                text(f"{base} WHERE 1=1 {filter_clause} {search_clause} ORDER BY u.name LIMIT :limit OFFSET :offset"),
                params,
            )
            items = [UserRepository._serialize(row) for row in items_result.mappings().all()]

            total_result = connection.execute(
                text(f"SELECT COUNT(*) FROM users u JOIN roles r ON r.id = u.role_id WHERE 1=1 {filter_clause} {search_clause}"),
                params,
            )
            total = total_result.scalar() or 0

            counts_result = connection.execute(
                text(f"""
                    SELECT
                        COUNT(*)                                               AS all_count,
                        SUM(CASE WHEN r.name = 'admin'     THEN 1 ELSE 0 END) AS admin_count,
                        SUM(CASE WHEN r.name = 'editor'    THEN 1 ELSE 0 END) AS editor_count,
                        SUM(CASE WHEN u.is_active = FALSE  THEN 1 ELSE 0 END) AS inactive_count
                    FROM users u JOIN roles r ON r.id = u.role_id
                    WHERE 1=1 {search_clause}
                """),
                params,
            )
            c = counts_result.mappings().first()

        return {
            "items": items,
            "total": total,
            "counts": {
                "all":      int(c["all_count"]      or 0),
                "admin":    int(c["admin_count"]    or 0),
                "editor":   int(c["editor_count"]   or 0),
                "inactive": int(c["inactive_count"] or 0),
            },
        }

    # ..............................
    @staticmethod
    def update(user_id: int, user: UserUpdate, hashed_password: str | None = None) -> dict | None:
        fields = user.model_dump(exclude_unset=True)
        role_name = fields.pop("role", None)

        password = fields.pop("password", None)
        if hashed_password and password:
            fields["password"] = hashed_password

        allowed = {"name", "email", "password", "phone", "is_active"}
        fields = {key: value for key, value in fields.items() if key in allowed}

        with engine.begin() as connection:
            set_parts = []
            params = {"id": user_id}

            for key, value in fields.items():
                set_parts.append(f"{key} = :{key}")
                params[key] = str(value) if key == "email" else value

            if role_name:
                set_parts.append("role_id = (SELECT id FROM roles WHERE name = :role_name)")
                params["role_name"] = role_name

            if not set_parts:
                return UserRepository.find_by_id(user_id)

            result = connection.execute(
                text(f"""
                    UPDATE users
                    SET {', '.join(set_parts)}, updated_at = now()
                    WHERE id = :id
                """),
                params,
            )

            if result.rowcount == 0:
                return None

        return UserRepository.find_by_id(user_id)

    # ..............................
    @staticmethod
    def delete(user_id: int):
        with engine.begin() as connection:
            connection.execute(
                text("DELETE FROM users WHERE id = :id"),
                {"id": user_id},
            )
