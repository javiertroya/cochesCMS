import base64
import hashlib
import hmac
import json
import os
import time
from datetime import timedelta
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.user_service import UserService

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

ACCESS_TOKEN_EXPIRE = timedelta(hours=8)
REFRESH_TOKEN_EXPIRE = timedelta(days=30)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY must be set")
JWT_ALGORITHM = "HS256"

bearer_scheme = HTTPBearer(auto_error=False)


class TokenError(Exception):
    pass


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(
    *,
    user_id: int,
    token_type: str,
    role: str | None = None,
    expires_delta: timedelta,
) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "token_type": token_type,
        "iat": now,
        "exp": now + int(expires_delta.total_seconds()),
    }
    if role:
        payload["role"] = role

    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    encoded_header = _b64encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(JWT_SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{encoded_header}.{encoded_payload}.{_b64encode(signature)}"


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any]:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
        signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        expected_signature = hmac.new(
            JWT_SECRET_KEY.encode("utf-8"),
            signing_input,
            hashlib.sha256,
        ).digest()
        received_signature = _b64decode(encoded_signature)

        if not hmac.compare_digest(received_signature, expected_signature):
            raise TokenError("Invalid token signature")

        payload = json.loads(_b64decode(encoded_payload))
    except Exception as exc:
        raise TokenError("Invalid token") from exc

    if payload.get("exp", 0) < int(time.time()):
        raise TokenError("Token expired")

    if expected_type and payload.get("token_type") != expected_type:
        raise TokenError("Invalid token type")

    return payload


def create_access_token(user: dict[str, Any]) -> str:
    return create_token(
        user_id=user["id"],
        token_type="access",
        role=user.get("role"),
        expires_delta=ACCESS_TOKEN_EXPIRE,
    )


def create_refresh_token(user: dict[str, Any]) -> str:
    return create_token(
        user_id=user["id"],
        token_type="refresh",
        role=user.get("role"),
        expires_delta=REFRESH_TOKEN_EXPIRE,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    user_id = payload.get("user_id") or payload.get("sub")
    user = UserService.get_authenticated_user(int(user_id))
    if not user or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o desactivado",
        )
    return user


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any] | None:
    if not credentials:
        return None

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenError:
        return None

    user_id = payload.get("user_id") or payload.get("sub")
    return UserService.get_authenticated_user(int(user_id))


def require_role(*roles: str):
    def dependency(current_user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )
        return current_user

    return dependency


# admin: todo el panel · editor: contenido (páginas, vehículos, multimedia, solicitudes)
require_admin = require_role("admin")
require_staff = require_role("admin", "editor")
