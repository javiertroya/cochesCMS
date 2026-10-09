"""Colección Marcas y campo marca de coches como relación obligatoria

Revision ID: 0009_marcas
Revises: 0008_precio_whatsapp
Create Date: 2026-10-09
"""
import json

from alembic import op
from sqlalchemy import text

revision = "0009_marcas"
down_revision = "0008_precio_whatsapp"
branch_labels = None
depends_on = None

BRANDS = [
    "Abarth", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "BYD", "Citroën",
    "Cupra", "Dacia", "DS", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar",
    "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Maserati", "Mazda", "McLaren",
    "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche",
    "Renault", "Rolls-Royce", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla",
    "Toyota", "Volkswagen", "Volvo",
]


def upgrade() -> None:
    conn = op.get_bind()

    # Colección protegida (no se puede borrar); sus elementos sí se pueden editar y ampliar
    collection_id = conn.execute(text("""
        INSERT INTO collections (name, slug, description, fields_schema, is_locked)
        VALUES ('Marcas', 'marcas', 'Marcas disponibles para los coches del catálogo.',
                CAST(:schema AS jsonb), TRUE)
        ON CONFLICT (slug) DO UPDATE SET is_locked = TRUE
        RETURNING id
    """), {"schema": json.dumps([{"name": "name", "type": "text", "label": "Nombre", "required": True}])}).scalar()

    existing = {
        row[0] for row in conn.execute(
            text("SELECT data->>'name' FROM collection_items WHERE collection_id = :id"),
            {"id": collection_id},
        )
    }
    for brand in BRANDS:
        if brand not in existing:
            conn.execute(
                text("INSERT INTO collection_items (collection_id, data) VALUES (:id, CAST(:data AS jsonb))"),
                {"id": collection_id, "data": json.dumps({"name": brand})},
            )

    # coches.marca: texto libre → relación obligatoria con Marcas (se guarda el nombre)
    conn.execute(text("""
        UPDATE collections
        SET fields_schema = (
            SELECT jsonb_agg(
                CASE WHEN f->>'name' = 'marca'
                     THEN f || '{"type": "relation", "collection": "marcas", "storeAs": "name", "required": true}'::jsonb
                     ELSE f END
                ORDER BY ord
            )
            FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
        )
        WHERE slug = 'coches' AND jsonb_array_length(fields_schema) > 0
    """))


def downgrade() -> None:
    op.execute("""
        UPDATE collections
        SET fields_schema = (
            SELECT jsonb_agg(
                CASE WHEN f->>'name' = 'marca'
                     THEN (f - 'collection' - 'storeAs') || '{"type": "text"}'::jsonb
                     ELSE f END
                ORDER BY ord
            )
            FROM jsonb_array_elements(fields_schema) WITH ORDINALITY AS t(f, ord)
        )
        WHERE slug = 'coches' AND jsonb_array_length(fields_schema) > 0
    """)
    op.execute("DELETE FROM collection_items WHERE collection_id = (SELECT id FROM collections WHERE slug = 'marcas')")
    op.execute("DELETE FROM collections WHERE slug = 'marcas'")
