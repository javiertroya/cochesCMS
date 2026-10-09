"""Analíticas propias: registro de visitas (sustituye a PostHog)

Revision ID: 0007_page_views
Revises: 0006_coches_gallery_status
Create Date: 2026-10-09
"""
from alembic import op

revision = "0007_page_views"
down_revision = "0006_coches_gallery_status"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # visitor_hash: HMAC de IP + navegador + día → cuenta visitantes sin cookies ni datos personales
    # is_entry: página de entrada llegando desde fuera del sitio (sirve para las fuentes de tráfico)
    op.execute("""
        CREATE TABLE page_views (
            id BIGSERIAL PRIMARY KEY,
            path VARCHAR(300) NOT NULL,
            visitor_hash VARCHAR(64) NOT NULL,
            referrer_domain VARCHAR(255),
            utm_source VARCHAR(100),
            is_entry BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX page_views_created_at_idx ON page_views (created_at)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS page_views")
