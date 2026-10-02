"""Esquema inicial del CMS (fase 0)

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-10-02
"""
from pathlib import Path

from alembic import op

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None

SQL_FILE = Path(__file__).resolve().parents[1] / "sql" / "0001_initial_schema.sql"


def upgrade() -> None:
    # exec_driver_sql evita que SQLAlchemy interprete ":algo" del JSON como parámetros
    op.get_bind().exec_driver_sql(SQL_FILE.read_text(encoding="utf-8"))


def downgrade() -> None:
    op.get_bind().exec_driver_sql("""
        DROP TABLE IF EXISTS audit_logs, redirects, site_settings, media, media_categories,
            collection_items, collections, page_components, component_types, nav_items,
            pages, users, roles CASCADE;
        DROP FUNCTION IF EXISTS set_collection_item_local_id();
    """)
