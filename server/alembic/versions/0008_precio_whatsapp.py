"""Coches: campo precio · Ajustes: número de WhatsApp

Revision ID: 0008_precio_whatsapp
Revises: 0007_page_views
Create Date: 2026-10-09
"""
from alembic import op

revision = "0008_precio_whatsapp"
down_revision = "0007_page_views"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Precio justo antes de los campos de estado (destacado/activo), o al final si no existen
    op.execute("""
        UPDATE collections
        SET fields_schema = (
            SELECT jsonb_agg(f ORDER BY ord)
            FROM (
                SELECT f, ord::numeric AS ord
                FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
                UNION ALL
                SELECT '{"name": "precio", "type": "number", "label": "Precio (€)"}'::jsonb,
                       COALESCE(
                           (SELECT MIN(ord) FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS s(f, ord)
                            WHERE f->>'name' IN ('destacado', 'activo')),
                           jsonb_array_length(fields_schema) + 1
                       ) - 0.5
            ) fields
        )
        WHERE slug = 'coches' AND NOT fields_schema @> '[{"name": "precio"}]'::jsonb
    """)

    # Número para el botón "Me interesa"; si está vacío se usa header_phone
    op.execute("ALTER TABLE site_settings ADD COLUMN whatsapp_number VARCHAR(40)")


def downgrade() -> None:
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS whatsapp_number")
    op.execute("""
        UPDATE collections
        SET fields_schema = COALESCE((
            SELECT jsonb_agg(f ORDER BY ord)
            FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
            WHERE f->>'name' != 'precio'
        ), '[]'::jsonb)
        WHERE slug = 'coches'
    """)
