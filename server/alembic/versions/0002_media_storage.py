"""Multimedia en R2: clave de almacenamiento, dimensiones y variantes (fase 1)

Revision ID: 0002_media_storage
Revises: 0001_initial_schema
Create Date: 2026-10-02
"""
from alembic import op

revision = "0002_media_storage"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE media
            ADD COLUMN storage_key TEXT,
            ADD COLUMN width INTEGER,
            ADD COLUMN height INTEGER,
            ADD COLUMN variants JSONB NOT NULL DEFAULT '{}'::jsonb
    """)
    op.execute("CREATE UNIQUE INDEX media_storage_key_idx ON media (storage_key) WHERE storage_key IS NOT NULL")
    op.execute("CREATE INDEX media_created_at_idx ON media (created_at DESC)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS media_created_at_idx")
    op.execute("DROP INDEX IF EXISTS media_storage_key_idx")
    op.execute("""
        ALTER TABLE media
            DROP COLUMN IF EXISTS variants,
            DROP COLUMN IF EXISTS height,
            DROP COLUMN IF EXISTS width,
            DROP COLUMN IF EXISTS storage_key
    """)
