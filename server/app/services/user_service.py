from app.models.User import UserCreate, UserUpdate
from app.repositories.user_repository import UserRepository
from app.utils.password_utils import hash_password, verify_password

# ............................................................................
class UserService:

    # ..............................
    @staticmethod
    def _serialize(user: dict) -> dict:
        data = dict(user)
        data.pop("password", None)
        return data

    # ..............................
    @staticmethod
    def create_user(user: UserCreate) -> dict:
        hashed = hash_password(user.password)
        user_id = UserRepository.create(user, hashed)
        return UserRepository.find_by_id(user_id)

    # ..............................
    @staticmethod
    def login(email: str, password: str):
        user = UserRepository.find_by_email(email)
        if not user or not verify_password(password, user["password"]):
            return None
        if not user.get("is_active"):
            return "inactive"
        return UserService._serialize(dict(user))

    # ..............................
    @staticmethod
    def get_authenticated_user(user_id: int) -> dict | None:
        user = UserRepository.find_by_id(user_id)
        if not user:
            return None
        return UserService._serialize(user)

    # ..............................
    @staticmethod
    def get_paginated(page: int, limit: int, filter: str, search: str) -> dict:
        return UserRepository.find_paginated(page, limit, filter, search)

    # ..............................
    @staticmethod
    def _ensure_not_last_admin(current: dict, user_update: UserUpdate | None = None):
        """Evita quedarse sin ningún administrador activo."""
        if current["role"] != "admin" or not current["is_active"]:
            return
        losing_admin = user_update is None or (
            (user_update.role is not None and user_update.role != "admin")
            or user_update.is_active is False
        )
        if losing_admin and UserRepository.count_active_admins() <= 1:
            raise ValueError("Debe quedar al menos un administrador activo")

    # ..............................
    @staticmethod
    def update_user(user_id: int, user_update: UserUpdate):
        current = UserRepository.find_by_id(user_id)
        if not current:
            return None

        UserService._ensure_not_last_admin(current, user_update)

        hashed = hash_password(user_update.password) if user_update.password else None
        return UserRepository.update(user_id, user_update, hashed_password=hashed)

    # ..............................
    @staticmethod
    def delete_user(user_id: int):
        user = UserRepository.find_by_id(user_id)
        if not user:
            return None
        UserService._ensure_not_last_admin(user)
        UserRepository.delete(user_id)
        return {"message": "Usuario eliminado correctamente"}
