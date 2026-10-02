"""Almacenamiento de archivos con dos zonas:

- pública: fotos de coches, banners, logo… Se sirven directamente
  (R2 con dominio propio, o /uploads en desarrollo).
- privada: capturas que suben los clientes. Solo accesibles mediante
  URLs firmadas que caducan.

El driver se elige con STORAGE_DRIVER=local|r2.
"""

import hashlib
import hmac
import mimetypes
import os
import time
from pathlib import Path, PurePosixPath
from typing import Iterator
from urllib.parse import quote

from app import config

PUBLIC_CACHE_CONTROL = "public, max-age=31536000, immutable"

# Python 3.12 no conoce algunos tipos; sin esto /uploads sirve los .webp como text/plain
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/avif", ".avif")
mimetypes.add_type("image/x-icon", ".ico")


# ............................................................................
def _validate_key(key: str) -> str:
    """Normaliza una clave y bloquea rutas fuera del almacenamiento."""
    path = PurePosixPath(key.replace("\\", "/"))
    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise ValueError(f"Clave de almacenamiento no válida: {key}")
    return path.as_posix()


# ............................................................................
def _sign(key: str, expires: int) -> str:
    secret = (os.getenv("JWT_SECRET_KEY") or "").encode("utf-8")
    message = f"{key}:{expires}".encode("utf-8")
    return hmac.new(secret, message, hashlib.sha256).hexdigest()


def verify_private_signature(key: str, expires: int, signature: str) -> bool:
    if expires < int(time.time()):
        return False
    return hmac.compare_digest(_sign(key, expires), signature)


# ............................................................................
class LocalStorage:
    """Guarda en disco: server/uploads (pública) y server/private_uploads (privada)."""

    def __init__(self):
        self.public_root = config.LOCAL_PUBLIC_ROOT
        self.private_root = config.LOCAL_PRIVATE_ROOT
        self.public_root.mkdir(parents=True, exist_ok=True)
        self.private_root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str, private: bool) -> Path:
        root = (self.private_root if private else self.public_root).resolve()
        path = (root / _validate_key(key)).resolve()
        if root not in path.parents:
            raise ValueError(f"Clave de almacenamiento no válida: {key}")
        return path

    def put(self, key: str, data: bytes, content_type: str, *, private: bool = False) -> None:
        path = self._path(key, private)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    def delete(self, key: str, *, private: bool = False) -> None:
        path = self._path(key, private)
        if path.is_file():
            path.unlink()

    def get(self, key: str, *, private: bool = False) -> bytes:
        return self._path(key, private).read_bytes()

    def public_url(self, key: str) -> str:
        return f"/uploads/{_validate_key(key)}"

    def signed_url(self, key: str, expires_in: int = 3600) -> str:
        key = _validate_key(key)
        expires = int(time.time()) + expires_in
        return f"/api/files/private/{quote(key)}?expires={expires}&sig={_sign(key, expires)}"

    def private_path(self, key: str) -> Path:
        return self._path(key, private=True)

    def list_keys(self, *, private: bool = False) -> Iterator[tuple[str, int]]:
        root = self.private_root if private else self.public_root
        for path in sorted(root.rglob("*")):
            if path.is_file() and not path.name.startswith("."):
                yield path.relative_to(root).as_posix(), path.stat().st_size


# ............................................................................
class R2Storage:
    """Cloudflare R2 vía API S3. Un bucket público y otro privado."""

    def __init__(self):
        import boto3
        from botocore.config import Config

        missing = [
            name for name in (
                "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
                "R2_PUBLIC_BUCKET", "R2_PRIVATE_BUCKET", "R2_PUBLIC_URL",
            )
            if not getattr(config, name)
        ]
        if missing:
            raise RuntimeError(f"Faltan variables de entorno para R2: {', '.join(missing)}")

        self.client = boto3.client(
            "s3",
            endpoint_url=config.R2_ENDPOINT_URL or f"https://{config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=config.R2_ACCESS_KEY_ID,
            aws_secret_access_key=config.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
        )
        self.public_bucket = config.R2_PUBLIC_BUCKET
        self.private_bucket = config.R2_PRIVATE_BUCKET
        self.public_base_url = config.R2_PUBLIC_URL

    def _bucket(self, private: bool) -> str:
        return self.private_bucket if private else self.public_bucket

    def put(self, key: str, data: bytes, content_type: str, *, private: bool = False) -> None:
        extra = {"ContentType": content_type}
        if not private:
            extra["CacheControl"] = PUBLIC_CACHE_CONTROL
        self.client.put_object(Bucket=self._bucket(private), Key=_validate_key(key), Body=data, **extra)

    def delete(self, key: str, *, private: bool = False) -> None:
        self.client.delete_object(Bucket=self._bucket(private), Key=_validate_key(key))

    def get(self, key: str, *, private: bool = False) -> bytes:
        response = self.client.get_object(Bucket=self._bucket(private), Key=_validate_key(key))
        return response["Body"].read()

    def public_url(self, key: str) -> str:
        return f"{self.public_base_url}/{quote(_validate_key(key))}"

    def signed_url(self, key: str, expires_in: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.private_bucket, "Key": _validate_key(key)},
            ExpiresIn=expires_in,
        )

    def list_keys(self, *, private: bool = False) -> Iterator[tuple[str, int]]:
        paginator = self.client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self._bucket(private)):
            for obj in page.get("Contents", []):
                yield obj["Key"], obj["Size"]


# ............................................................................
_storage: LocalStorage | R2Storage | None = None


def get_storage() -> LocalStorage | R2Storage:
    global _storage
    if _storage is None:
        if config.STORAGE_DRIVER == "r2":
            _storage = R2Storage()
        elif config.STORAGE_DRIVER == "local":
            _storage = LocalStorage()
        else:
            raise RuntimeError(f"STORAGE_DRIVER no válido: {config.STORAGE_DRIVER}")
    return _storage


def key_from_public_url(url: str | None) -> str | None:
    """Recupera la clave a partir de una URL pública (para registros antiguos sin storage_key)."""
    if not url:
        return None
    for prefix in ("/uploads/", f"{config.R2_PUBLIC_URL}/" if config.R2_PUBLIC_URL else None):
        if prefix and url.startswith(prefix):
            return url.removeprefix(prefix)
    return None


def guess_content_type(key: str) -> str:
    return mimetypes.guess_type(key)[0] or "application/octet-stream"
