import json
from sqlalchemy import text
from app.db import engine
from app.models.Collection import CollectionCreate, CollectionUpdate, CollectionItemCreate, CollectionItemUpdate


class CollectionRepository:

    # ..............................
    @staticmethod
    def find_all() -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT c.*, COUNT(ci.global_id) AS item_count
                    FROM collections c
                    LEFT JOIN collection_items ci ON ci.collection_id = c.id
                    GROUP BY c.id
                    ORDER BY c.name
                """)
            )
            return [dict(row) for row in result.mappings().all()]

    # ..............................
    @staticmethod
    def find_by_id(collection_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT * FROM collections WHERE id = :id"),
                {"id": collection_id},
            )
            return result.mappings().first()

    # ..............................
    @staticmethod
    def find_by_slug(slug: str) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT * FROM collections WHERE slug = :slug"),
                {"slug": slug},
            )
            return result.mappings().first()

    # ..............................
    @staticmethod
    def create(collection: CollectionCreate) -> dict:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO collections (name, slug, description, fields_schema)
                    VALUES (:name, :slug, :description, CAST(:fields_schema AS jsonb))
                    RETURNING *
                """),
                {
                    "name": collection.name,
                    "slug": collection.slug,
                    "description": collection.description,
                    "fields_schema": json.dumps(collection.fields_schema),
                },
            )
            return dict(result.mappings().first())

    # ..............................
    @staticmethod
    def update(collection_id: int, data: CollectionUpdate) -> dict | None:
        fields = data.model_dump(exclude_unset=True)
        if not fields:
            return CollectionRepository.find_by_id(collection_id)

        params = {"id": collection_id}
        set_parts = []
        for key, value in fields.items():
            if key == "fields_schema":
                set_parts.append("fields_schema = CAST(:fields_schema AS jsonb)")
                params["fields_schema"] = json.dumps(value)
            else:
                set_parts.append(f"{key} = :{key}")
                params[key] = value

        with engine.begin() as connection:
            result = connection.execute(
                text(f"""
                    UPDATE collections
                    SET {', '.join(set_parts)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    RETURNING *
                """),
                params,
            )
            return result.mappings().first()

    # ..............................
    @staticmethod
    def delete(collection_id: int) -> bool:
        with engine.begin() as connection:
            result = connection.execute(
                text("DELETE FROM collections WHERE id = :id AND is_locked = FALSE"),
                {"id": collection_id},
            )
            return result.rowcount > 0

    # ──────────────────────────────────────────────────────────
    # Items (id = per-collection sequential, global_id = surrogate)
    # ──────────────────────────────────────────────────────────

    @staticmethod
    def find_items(collection_id: int) -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT global_id, collection_id, id, data, created_at, updated_at
                    FROM collection_items
                    WHERE collection_id = :collection_id
                    ORDER BY id ASC
                """),
                {"collection_id": collection_id},
            )
            return [dict(row) for row in result.mappings().all()]

    # ..............................
    @staticmethod
    def find_item_by_global_id(global_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT global_id, collection_id, id, data FROM collection_items WHERE global_id = :global_id"),
                {"global_id": global_id},
            )
            row = result.mappings().first()
            return dict(row) if row else None

    # ..............................
    @staticmethod
    def find_item(collection_id: int, item_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT global_id, collection_id, id, data FROM collection_items WHERE collection_id = :col_id AND id = :item_id"),
                {"col_id": collection_id, "item_id": item_id},
            )
            row = result.mappings().first()
            return dict(row) if row else None

    # ..............................
    @staticmethod
    def create_item(collection_id: int, item: CollectionItemCreate) -> dict:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO collection_items (collection_id, data)
                    VALUES (:collection_id, CAST(:data AS jsonb))
                    RETURNING global_id, collection_id, id, data, created_at, updated_at
                """),
                {
                    "collection_id": collection_id,
                    "data": json.dumps(item.data),
                },
            )
            return dict(result.mappings().first())

    # ..............................
    @staticmethod
    def update_item(collection_id: int, item_id: int, item: CollectionItemUpdate) -> dict | None:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    UPDATE collection_items
                    SET data = CAST(:data AS jsonb), updated_at = CURRENT_TIMESTAMP
                    WHERE collection_id = :col_id AND id = :item_id
                    RETURNING global_id, collection_id, id, data
                """),
                {"col_id": collection_id, "item_id": item_id, "data": json.dumps(item.data)},
            )
            row = result.mappings().first()
            return dict(row) if row else None

    # ..............................
    @staticmethod
    def delete_item(collection_id: int, item_id: int) -> bool:
        with engine.begin() as connection:
            result = connection.execute(
                text("DELETE FROM collection_items WHERE collection_id = :col_id AND id = :item_id"),
                {"col_id": collection_id, "item_id": item_id},
            )
            return result.rowcount > 0
