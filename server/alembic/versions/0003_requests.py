"""Solicitudes de clientes desde los formularios públicos (fase 3)

Revision ID: 0003_requests
Revises: 0002_media_storage
Create Date: 2026-10-02
"""
from alembic import op

revision = "0003_requests"
down_revision = "0002_media_storage"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # type: contacto · importacion_busqueda · importacion_encontrado · interes_coche
    # vehicle_id queda sin FK hasta que exista la tabla vehicles (fase 2).
    # ip_hash: hash de la IP (no la IP en claro) para limitar envíos.
    op.execute("""
        CREATE TABLE requests (
            id SERIAL PRIMARY KEY,
            type VARCHAR(40) NOT NULL DEFAULT 'contacto',
            status VARCHAR(20) NOT NULL DEFAULT 'nueva'
                CHECK (status IN ('nueva', 'en_curso', 'presupuestada', 'cerrada')),
            data JSONB NOT NULL DEFAULT '{}'::jsonb,
            vehicle_id INTEGER,
            source_page VARCHAR(255),
            ip_hash VARCHAR(64),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX requests_status_idx ON requests (status)")
    op.execute("CREATE INDEX requests_created_at_idx ON requests (created_at DESC)")
    op.execute("CREATE INDEX requests_ip_hash_created_idx ON requests (ip_hash, created_at)")

    op.execute("""
        INSERT INTO component_types (name, label, description)
        VALUES ('full_form', 'Formulario completo', 'Formulario con nombre, teléfono, email y mensaje. Los envíos llegan a Solicitudes.')
        ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM component_types ct
        WHERE ct.name = 'full_form'
          AND NOT EXISTS (SELECT 1 FROM page_components pc WHERE pc.component_type_id = ct.id)
    """)
    op.execute("DROP TABLE IF EXISTS requests")
