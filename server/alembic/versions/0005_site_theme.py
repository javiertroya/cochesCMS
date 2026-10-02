"""Tema visual de la web pública (clásico / pro)

Revision ID: 0005_site_theme
Revises: 0004_import_requests
Create Date: 2026-10-02
"""
from alembic import op

revision = "0005_site_theme"
down_revision = "0004_import_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # classic: colores y fuentes de Estilos · pro: estética de lujo (negro, marfil y dorado)
    op.execute("""
        ALTER TABLE site_settings
            ADD COLUMN site_theme VARCHAR(20) NOT NULL DEFAULT 'classic'
                CHECK (site_theme IN ('classic', 'pro'))
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS site_theme")
