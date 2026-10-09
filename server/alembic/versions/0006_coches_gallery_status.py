"""Coches: galería de fotos y campos destacado / activo

Revision ID: 0006_coches_gallery_status
Revises: 0005_site_theme
Create Date: 2026-10-09
"""
from alembic import op

revision = "0006_coches_gallery_status"
down_revision = "0005_site_theme"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # El campo "fotos" pasa a admitir varias imágenes (se guarda como array de URLs)
    op.execute("""
        UPDATE collections
        SET fields_schema = (
            SELECT jsonb_agg(
                CASE WHEN f->>'name' = 'fotos' AND f->>'type' = 'image'
                     THEN f || '{"multiple": true}'::jsonb
                     ELSE f END
                ORDER BY ord
            )
            FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
        )
        WHERE slug = 'coches' AND jsonb_array_length(fields_schema) > 0
    """)

    # Ítems existentes con una sola foto (texto) → array
    op.execute("""
        UPDATE collection_items ci
        SET data = jsonb_set(ci.data, '{fotos}', jsonb_build_array(ci.data->'fotos'))
        FROM collections c
        WHERE c.id = ci.collection_id AND c.slug = 'coches'
          AND jsonb_typeof(ci.data->'fotos') = 'string'
    """)

    # Campos de estado (solo si no existen ya)
    op.execute("""
        UPDATE collections
        SET fields_schema = fields_schema || '[{"name": "destacado", "type": "boolean", "label": "Destacado"}]'::jsonb
        WHERE slug = 'coches' AND NOT fields_schema @> '[{"name": "destacado"}]'::jsonb
    """)
    op.execute("""
        UPDATE collections
        SET fields_schema = fields_schema || '[{"name": "activo", "type": "boolean", "label": "Activo", "default": true}]'::jsonb
        WHERE slug = 'coches' AND NOT fields_schema @> '[{"name": "activo"}]'::jsonb
    """)


def downgrade() -> None:
    op.execute("""
        UPDATE collections
        SET fields_schema = COALESCE((
            SELECT jsonb_agg(f - 'multiple' ORDER BY ord)
            FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
            WHERE f->>'name' NOT IN ('destacado', 'activo')
        ), '[]'::jsonb)
        WHERE slug = 'coches'
    """)
