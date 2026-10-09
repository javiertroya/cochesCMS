from sqlalchemy import text

from app.db import engine
from app.models.SiteSettings import SiteSettingsUpdate

_COLUMNS = """
    id, site_name, site_description, favicon_url, logo_url,
    header_phone, header_email, whatsapp_number,
    primary_color, secondary_color, accent_color, background_color,
    text_color, heading_color, link_color,
    font_family_heading, font_family_body, font_size_base,
    border_radius, footer_text, footer_address, footer_map_embed,
    footer_copyright, notification_email, site_theme, updated_at
"""


class SiteSettingsRepository:

    @staticmethod
    def get() -> dict | None:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT {_COLUMNS} FROM site_settings WHERE id = 1"))
            row = result.mappings().first()
            return dict(row) if row else None

    @staticmethod
    def update(data: SiteSettingsUpdate) -> dict | None:
        fields = data.model_dump(exclude_unset=True)
        if not fields:
            return SiteSettingsRepository.get()

        set_parts = [f"{k} = :{k}" for k in fields]
        params = {**fields, "id": 1}

        with engine.begin() as conn:
            result = conn.execute(
                text(f"""
                    UPDATE site_settings
                    SET {', '.join(set_parts)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    RETURNING {_COLUMNS}
                """),
                params,
            )
            row = result.mappings().first()
            return dict(row) if row else None
