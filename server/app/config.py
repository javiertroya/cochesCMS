import os
from pathlib import Path

from dotenv import load_dotenv

# ............................
SERVER_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=SERVER_ROOT / ".env")


def _list(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


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
