from fastapi import APIRouter, Depends, HTTPException

from app.models.SiteSettings import SiteSettingsUpdate
from app.services.audit_log_service import AuditLogService, _diff
from app.services.site_settings_service import SiteSettingsService
from app.utils.auth_utils import require_admin

router = APIRouter()

_SETTINGS_DIFF_FIELDS = {
    "site_name", "site_description", "favicon_url",
    "logo_url", "header_phone", "header_email",
    "primary_color", "secondary_color", "accent_color", "background_color",
    "text_color", "heading_color", "link_color",
    "font_family_heading", "font_family_body", "font_size_base",
    "border_radius", "footer_text", "footer_address", "footer_map_embed",
    "footer_copyright", "notification_email", "site_theme",
}

# Ajustes que no deben salir en la API pública
_PRIVATE_FIELDS = {"notification_email"}


@router.get("/api/settings")
def get_public_settings():
    settings = SiteSettingsService.get()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return {key: value for key, value in settings.items() if key not in _PRIVATE_FIELDS}


@router.get("/api/admin/settings")
def get_settings(_current_user: dict = Depends(require_admin)):
    settings = SiteSettingsService.get()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return settings


@router.put("/api/admin/settings")
def update_settings(data: SiteSettingsUpdate, current_user: dict = Depends(require_admin)):
    before = SiteSettingsService.get() or {}
    try:
        updated = SiteSettingsService.update(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo guardar la configuración") from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="site_settings",
        resource_id=1,
        resource_label="Configuración del sitio",
        changes=_diff(before, updated, _SETTINGS_DIFF_FIELDS),
    )
    return updated
