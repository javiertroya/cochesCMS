from typing import Optional
from pydantic import BaseModel


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
