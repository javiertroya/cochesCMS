from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi_pagination import Params
from sqlalchemy.exc import IntegrityError

from app.models.Auth import AuthResponse, AuthUser, LoginRequest, RefreshRequest, RefreshResponse
from app.models.User import UserCreate, UserPage, UserUpdate
from app.repositories.user_repository import UserRepository
from app.services.audit_log_service import AuditLogService
from app.services.user_service import UserService
from app.utils.auth_utils import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    require_admin,
)

from app.utils.rate_limit import RateLimiter

# ............................................................................
router = APIRouter()

# Fuerza bruta en el login: intentos fallidos en 15 minutos
# · 5 por IP + email (protege cada cuenta sin que un tercero pueda bloquearla desde otra IP)
# · 20 por IP (frena a quien prueba muchas cuentas)
_LOGIN_WINDOW = 15 * 60
_failed_by_account = RateLimiter(max_events=5, window_seconds=_LOGIN_WINDOW)
_failed_by_ip = RateLimiter(max_events=20, window_seconds=_LOGIN_WINDOW)


def _too_many_attempts(seconds: int) -> HTTPException:
    minutes = max(1, round(seconds / 60))
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Demasiados intentos fallidos. Inténtalo de nuevo en {minutes} min.",
        headers={"Retry-After": str(seconds)},
    )


# ── Auth ────────────────────────────────────────────────────────────────────

@router.post("/api/auth/login", response_model=AuthResponse)
def login(credentials: LoginRequest, request: Request):
    email = str(credentials.email).lower()
    ip = request.client.host if request.client else "desconocida"
    account_key = f"{ip}|{email}"

    blocked_for = max(_failed_by_account.retry_after(account_key), _failed_by_ip.retry_after(ip))
    if blocked_for:
        raise _too_many_attempts(blocked_for)

    result = UserService.login(str(credentials.email), credentials.password)
    if result is None:
        _failed_by_account.hit(account_key)
        _failed_by_ip.hit(ip)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    _failed_by_account.reset(account_key)
    if result == "inactive":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tu cuenta está desactivada. Contacta con un administrador.")
    return {
        "access_token": create_access_token(result),
        "refresh_token": create_refresh_token(result),
        "user": result,
    }


@router.post("/api/auth/refresh", response_model=RefreshResponse)
def refresh_token(payload: RefreshRequest):
    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    except TokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido o expirado")

    user_id = token_payload.get("user_id") or token_payload.get("sub")
    user = UserService.get_authenticated_user(int(user_id))
    if not user or not user.get("is_active"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado o desactivado")
    return {"access_token": create_access_token(user)}


@router.get("/api/auth/me", response_model=AuthUser)
def me(current_user: dict = Depends(get_current_user)):
    return current_user


# ── Admin — gestión de usuarios ─────────────────────────────────────────────

@router.get("/api/admin/users", response_model=UserPage)
def list_users(
    params: Params = Depends(),
    filter: str = Query("all", pattern="^(all|admin|editor|inactive)$"),
    search: str = Query(""),
    _current_user: dict = Depends(require_admin),
):
    result = UserService.get_paginated(params.page, params.size, filter, search)
    return UserPage.from_result(result, params)


@router.post("/api/admin/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, current_user: dict = Depends(require_admin)):
    try:
        created = UserService.create_user(user)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email.")

    AuditLogService.log(
        user=current_user,
        action="create",
        resource_type="user",
        resource_id=created["id"],
        resource_label=str(user.email),
    )
    return created


@router.put("/api/admin/users/{user_id}")
def update_user(user_id: int, user: UserUpdate, current_user: dict = Depends(require_admin)):
    before = UserRepository.find_by_id(user_id)
    try:
        updated = UserService.update_user(user_id, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email.")

    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    changes = {
        key: {"before": before.get(key), "after": updated.get(key)}
        for key in ("name", "email", "phone", "role", "is_active")
        if before and before.get(key) != updated.get(key)
    }
    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="user",
        resource_id=user_id,
        resource_label=updated["email"],
        changes=changes,
    )
    return updated


@router.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, current_user: dict = Depends(require_admin)):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")

    target = UserRepository.find_by_id(user_id)
    try:
        result = UserService.delete_user(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="user",
        resource_id=user_id,
        resource_label=target["email"] if target else f"Usuario #{user_id}",
    )
    return result
