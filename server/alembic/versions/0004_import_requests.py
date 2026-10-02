"""Importación a la carta: correo de avisos y componente de solicitudes (fase 3)

Revision ID: 0004_import_requests
Revises: 0003_requests
Create Date: 2026-10-02
"""
from alembic import op

revision = "0004_import_requests"
down_revision = "0003_requests"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Correo que recibe los avisos de nuevas solicitudes (si está vacío se usa ADMIN_NOTIFICATION_EMAIL)
    op.execute("ALTER TABLE site_settings ADD COLUMN notification_email VARCHAR(255)")
    op.execute("CREATE INDEX requests_type_idx ON requests (type)")
    op.execute("""
        INSERT INTO component_types (name, label, description)
        VALUES ('import_request', 'Importación a la carta', 'Dos opciones (búsqueda de coche / coche ya encontrado), cada una con su formulario. Los envíos llegan a Solicitudes y por correo.')
        ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM component_types ct
        WHERE ct.name = 'import_request'
          AND NOT EXISTS (SELECT 1 FROM page_components pc WHERE pc.component_type_id = ct.id)
    """)
    op.execute("DROP INDEX IF EXISTS requests_type_idx")
    op.execute("ALTER TABLE site_settings DROP COLUMN IF EXISTS notification_email")
