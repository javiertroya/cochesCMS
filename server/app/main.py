from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi_pagination import add_pagination

from app import config
from app.db import check_database_connection
from app.routes.user_routes import router as user_router
from app.routes.collection_routes import router as collection_router
from app.routes.cms_page_routes import router as cms_page_router
from app.routes.admin_analytics_routes import router as admin_analytics_router
from app.routes.audit_log_routes import router as audit_log_router
from app.routes.redirect_routes import router as redirect_router
from app.routes.upload_routes import router as upload_router
from app.routes.media_routes import router as media_router
from app.routes.site_settings_routes import router as site_settings_router
from app.routes.request_routes import router as request_router
from app.services.storage_service import get_storage, verify_private_signature

# ............................
# El esquema de la BD se gestiona con Alembic: `alembic upgrade head`
app = FastAPI(title="Coches CMS API")

# ............................
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ............................
# En desarrollo (STORAGE_DRIVER=local) la API sirve los archivos públicos.
# Con R2 se sirven desde el dominio público del bucket.
storage = get_storage()
if config.STORAGE_DRIVER == "local":
    app.mount("/uploads", StaticFiles(directory=config.LOCAL_PUBLIC_ROOT), name="uploads")

    @app.get("/api/files/private/{key:path}")
    def get_private_file(key: str, expires: int = Query(...), sig: str = Query(...)):
        if not verify_private_signature(key, expires, sig):
            raise HTTPException(status_code=403, detail="Enlace caducado o no válido")
        try:
            path = storage.private_path(key)
        except ValueError:
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        if not path.is_file():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        return FileResponse(path)

# ............................
app.include_router(user_router)
app.include_router(collection_router)
app.include_router(cms_page_router)
app.include_router(admin_analytics_router)
app.include_router(audit_log_router)
app.include_router(redirect_router)
app.include_router(upload_router)
app.include_router(media_router)
app.include_router(site_settings_router)
app.include_router(request_router)

add_pagination(app)


# ............................
@app.get("/api/health")
def health():
    check_database_connection()
    return {"status": "ok", "storage": config.STORAGE_DRIVER}
