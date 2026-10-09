import os
from pathlib import Path

from dotenv import load_dotenv

# ............................
SERVER_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=SERVER_ROOT / ".env")


def _list(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


# ............................
# development · production. La imagen Docker es "production" por defecto; el
# docker-compose de desarrollo fija "development".
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
IS_PRODUCTION = APP_ENV == "production"

# ............................
CORS_ORIGINS = _list(os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"))

# ............................
# Almacenamiento de archivos: "local" (desarrollo) o "r2" (Cloudflare R2)
STORAGE_DRIVER = os.getenv("STORAGE_DRIVER", "local").lower()

LOCAL_PUBLIC_ROOT = SERVER_ROOT / "uploads"
LOCAL_PRIVATE_ROOT = SERVER_ROOT / "private_uploads"

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_PUBLIC_BUCKET = os.getenv("R2_PUBLIC_BUCKET", "")
R2_PRIVATE_BUCKET = os.getenv("R2_PRIVATE_BUCKET", "")
# Dominio público del bucket público, p. ej. https://img.midominio.com
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "").rstrip("/")
# Solo para pruebas con un servidor compatible con S3 (MinIO). En producción, vacío.
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL", "")

# ............................
# Límites de subida (MB)
MAX_IMAGE_MB = int(os.getenv("MAX_IMAGE_MB", "25"))
MAX_VIDEO_MB = int(os.getenv("MAX_VIDEO_MB", "200"))


# ............................
# Valores de ejemplo que nunca deben llegar a producción
_PLACEHOLDER_SECRETS = {"cambia_esto_por_un_valor_largo_y_aleatorio", "coches_dev_password"}


def check_production_settings() -> None:
    """En producción, la API no arranca con secretos débiles o de ejemplo."""
    if not IS_PRODUCTION:
        return

    problems = []
    jwt_secret = os.getenv("JWT_SECRET_KEY") or ""
    if len(jwt_secret) < 32 or jwt_secret in _PLACEHOLDER_SECRETS:
        problems.append("JWT_SECRET_KEY debe ser un valor aleatorio de al menos 32 caracteres")

    db_password = os.getenv("DB_PASSWORD") or ""
    if len(db_password) < 12 or db_password in _PLACEHOLDER_SECRETS:
        problems.append("DB_PASSWORD debe ser una contraseña propia de al menos 12 caracteres")

    if any("localhost" in origin or "127.0.0.1" in origin for origin in CORS_ORIGINS):
        problems.append("CORS_ORIGINS no debe incluir localhost (pon el dominio real, p. ej. https://tudominio.com)")

    if problems:
        raise RuntimeError(
            "Configuración insegura para producción (APP_ENV=production):\n- " + "\n- ".join(problems)
        )
