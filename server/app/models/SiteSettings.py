from typing import Literal, Optional
from pydantic import BaseModel, field_validator
from email_validator import EmailNotValidError, validate_email


class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    site_description: Optional[str] = None
    favicon_url: Optional[str] = None
    logo_url: Optional[str] = None
    header_phone: Optional[str] = None
    header_email: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None
    heading_color: Optional[str] = None
    link_color: Optional[str] = None
    font_family_heading: Optional[str] = None
    font_family_body: Optional[str] = None
    font_size_base: Optional[str] = None
    border_radius: Optional[str] = None
    footer_text: Optional[str] = None
    footer_address: Optional[str] = None
    footer_map_embed: Optional[str] = None
    footer_copyright: Optional[str] = None
    # Tema visual de la web pública: classic (colores de Estilos) o pro (lujo)
    site_theme: Optional[Literal["classic", "pro"]] = None
    # Correo que recibe los avisos de solicitudes (solo visible en el panel)
    notification_email: Optional[str] = None

    @field_validator("notification_email")
    @classmethod
    def validate_notification_email(cls, value: str | None) -> str | None:
        value = (value or "").strip()
        if not value:
            return None
        try:
            return validate_email(value, check_deliverability=False).normalized
        except EmailNotValidError as exc:
            raise ValueError("El correo de avisos no es válido") from exc
