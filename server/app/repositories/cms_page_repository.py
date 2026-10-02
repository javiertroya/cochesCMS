import json
from sqlalchemy import text
from app.db import engine
from app.models.CmsPage import CmsPage, CmsPageUpdate


def _load_page_components(connection, page_id: int) -> list:
    """Load page_components and return them in the frontend format {id, type, props}."""
    result = connection.execute(
        text("""
            SELECT pc.id, ct.name AS type, pc.config, pc.order
            FROM page_components pc
            JOIN component_types ct ON ct.id = pc.component_type_id
            WHERE pc.page_id = :page_id
            ORDER BY pc.order ASC
        """),
        {"page_id": page_id},
    )
    components = []
    for row in result.mappings().all():
        config = row["config"] if isinstance(row["config"], dict) else (json.loads(row["config"]) if row["config"] else {})
        components.append({
            "id": f"{row['type']}-{row['id']}",
            "type": row["type"],
            "props": config,
        })
    return components


def _save_page_components(connection, page_id: int, components: list):
    """Persist components list → page_components table."""
    connection.execute(text("DELETE FROM page_components WHERE page_id = :id"), {"id": page_id})
    for order, comp in enumerate(components):
        comp_type = comp.get("type")
        props = comp.get("props", {})
        connection.execute(
            text("""
                INSERT INTO component_types (name, label, description, config_schema)
                SELECT CAST(:type AS varchar), CAST(:label AS varchar), '', CAST(:config_schema AS jsonb)
                WHERE NOT EXISTS (
                    SELECT 1 FROM component_types WHERE name = :type
                )
            """),
            {
                "type": comp_type,
                "label": "InfoCard" if comp_type == "info_card" else comp_type,
                "config_schema": "{}",
            },
        )
        connection.execute(
            text("""
                INSERT INTO page_components (page_id, component_type_id, "order", config)
                SELECT :page_id, id, :order, CAST(:config AS jsonb)
                FROM component_types WHERE name = :type
            """),
            {
                "page_id": page_id,
                "order": order,
                "config": json.dumps(props),
                "type": comp_type,
            },
        )


def _serialize(row, connection=None) -> dict | None:
    if not row:
        return None
    data = dict(row)
    # Backward-compatible fields derived from new schema
    data['is_published'] = data.get('status') == 'published'
    data['nav_visible'] = data.get('nav_item_id') is not None
    # header_slides still stored as JSONB on the page
    hs = data.get("header_slides")
    if isinstance(hs, str):
        data["header_slides"] = json.loads(hs)
    elif hs is None:
        data["header_slides"] = []
    # components come from page_components table (loaded separately if connection provided)
    if connection is not None and data.get("id"):
        data["components"] = _load_page_components(connection, data["id"])
    else:
        comp = data.get("components")
        if isinstance(comp, str):
            data["components"] = json.loads(comp)
        elif comp is None:
            data["components"] = []
    return data


def _nav_query_fragment() -> str:
    return """
        LEFT JOIN nav_items ni ON ni.page_id = p.id
        LEFT JOIN nav_items ni_parent ON ni_parent.id = ni.parent_id
        LEFT JOIN pages p_parent ON p_parent.id = ni_parent.page_id
    """


def _nav_select_fragment() -> str:
    return """
        ni.id AS nav_item_id,
        ni.icon AS nav_icon,
        ni.order AS nav_order,
        ni.parent_id AS nav_parent_id,
        p_parent.slug AS nav_parent_slug,
    """


class CmsPageRepository:

    # ..............................
    @staticmethod
    def _upsert_nav_item(connection, page_id: int, page: CmsPage | CmsPageUpdate):
        """Create/update/delete the nav_item for a page based on nav_visible."""
        nav_visible = getattr(page, 'nav_visible', False) or False

        if not nav_visible:
            connection.execute(
                text("DELETE FROM nav_items WHERE page_id = :page_id"),
                {"page_id": page_id},
            )
            return

        # Resolve parent_id from parent slug
        parent_slug = getattr(page, 'nav_parent_slug', None) or None
        parent_id = None
        if parent_slug:
            result = connection.execute(
                text("""
                    SELECT ni.id FROM nav_items ni
                    JOIN pages p ON p.id = ni.page_id
                    WHERE p.slug = :slug
                """),
                {"slug": parent_slug},
            )
            row = result.mappings().first()
            if row:
                parent_id = row["id"]

        nav_order = getattr(page, 'nav_order', 100) or 100
        nav_icon = getattr(page, 'nav_icon', None) or None

        connection.execute(
            text("""
                INSERT INTO nav_items (page_id, icon, "order", parent_id)
                VALUES (:page_id, :icon, :order, :parent_id)
                ON CONFLICT (page_id) DO UPDATE
                    SET icon = EXCLUDED.icon,
                        "order" = EXCLUDED."order",
                        parent_id = EXCLUDED.parent_id,
                        updated_at = CURRENT_TIMESTAMP
            """),
            {
                "page_id": page_id,
                "icon": nav_icon,
                "order": nav_order,
                "parent_id": parent_id,
            },
        )

    # ..............................
    @staticmethod
    def create(page: CmsPage) -> dict | None:
        # Convert is_published → status if provided
        status = 'published' if getattr(page, 'is_published', True) else 'draft'
        if page.status in ('published', 'draft'):
            status = page.status

        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO pages (
                        title, slug, status, "order", requires_auth,
                        seo_title, seo_description, seo_og_image, seo_canonical, page_color,
                        components, header_slides
                    )
                    VALUES (
                        :title, :slug, :status, :order, :requires_auth,
                        :seo_title, :seo_description, :seo_og_image, :seo_canonical, :page_color,
                        '[]'::jsonb, CAST(:header_slides AS jsonb)
                    )
                    RETURNING id
                """),
                {
                    "title": page.title,
                    "slug": page.slug,
                    "status": status,
                    "order": page.order,
                    "requires_auth": page.requires_auth,
                    "seo_title": page.seo_title,
                    "seo_description": page.seo_description,
                    "seo_og_image": page.seo_og_image,
                    "seo_canonical": page.seo_canonical,
                    "page_color": page.page_color,
                    "header_slides": json.dumps(page.header_slides),
                },
            )
            page_id = result.scalar()
            _save_page_components(connection, page_id, page.components)
            CmsPageRepository._upsert_nav_item(connection, page_id, page)

        return CmsPageRepository.find_by_id(page_id)

    # ..............................
    @staticmethod
    def find_all(include_unpublished: bool = False) -> list:
        where = "" if include_unpublished else "WHERE p.status = 'published'"
        with engine.connect() as connection:
            result = connection.execute(
                text(f"""
                    SELECT p.*,
                           {_nav_select_fragment()}
                           ni.id AS nav_item_id
                    FROM pages p
                    {_nav_query_fragment()}
                    {where}
                    ORDER BY p.updated_at DESC, p.id DESC
                """)
            )
            return [_serialize(row, connection) for row in result.mappings().all()]

    # ..............................
    @staticmethod
    def find_by_id(page_id: int) -> dict | None:
        with engine.connect() as connection:
            result = connection.execute(
                text(f"""
                    SELECT p.*,
                           {_nav_select_fragment()}
                           ni.id AS nav_item_id
                    FROM pages p
                    {_nav_query_fragment()}
                    WHERE p.id = :id
                """),
                {"id": page_id},
            )
            return _serialize(result.mappings().first(), connection)

    # ..............................
    @staticmethod
    def find_by_slug(slug: str, include_unpublished: bool = False) -> dict | None:
        extra = "" if include_unpublished else "AND p.status = 'published'"
        with engine.connect() as connection:
            result = connection.execute(
                text(f"""
                    SELECT p.*,
                           {_nav_select_fragment()}
                           ni.id AS nav_item_id
                    FROM pages p
                    {_nav_query_fragment()}
                    WHERE p.slug = :slug {extra}
                """),
                {"slug": slug},
            )
            return _serialize(result.mappings().first(), connection)

    # ..............................
    @staticmethod
    def find_nav_pages() -> list:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT p.id, p.title, p.slug, p.requires_auth,
                           ni.id AS nav_item_id,
                           ni.icon AS nav_icon, ni.order AS nav_order,
                           ni.parent_id AS nav_parent_id,
                           p_parent.slug AS nav_parent_slug
                    FROM nav_items ni
                    JOIN pages p ON p.id = ni.page_id
                    LEFT JOIN nav_items ni_parent ON ni_parent.id = ni.parent_id
                    LEFT JOIN pages p_parent ON p_parent.id = ni_parent.page_id
                    WHERE p.status = 'published'
                    ORDER BY ni.order ASC, p.title ASC
                """)
            )
            # Nav pages don't need components - lighter response
            return [_serialize(row) for row in result.mappings().all()]

    # ..............................
    @staticmethod
    def update(page_id: int, page: CmsPageUpdate) -> dict | None:
        fields = page.model_dump(exclude_unset=True)

        # Extract only nav fields that were explicitly provided in the payload
        nav_field_keys = ('nav_visible', 'nav_parent_slug', 'nav_order', 'nav_icon')
        nav_fields = {}
        for k in nav_field_keys:
            if k in fields:
                nav_fields[k] = fields.pop(k)

        has_nav_update = bool(nav_fields)

        # Convert is_published → status
        if 'is_published' in fields:
            is_pub = fields.pop('is_published')
            if 'status' not in fields:
                fields['status'] = 'published' if is_pub else 'draft'

        page_allowed = {
            "title", "slug", "status", "order", "requires_auth",
            "seo_title", "seo_description", "seo_og_image", "seo_canonical", "page_color",
            "components", "header_slides",
        }
        fields = {k: v for k, v in fields.items() if k in page_allowed}

        with engine.begin() as connection:
            # Handle components separately via page_components table
            components_to_save = fields.pop("components", None)

            if fields:
                params = {"id": page_id}
                set_parts = []
                for key, value in fields.items():
                    if key == "header_slides":
                        set_parts.append("header_slides = CAST(:header_slides AS jsonb)")
                        params["header_slides"] = json.dumps(value)
                    elif key == "order":
                        set_parts.append('"order" = :order')
                        params["order"] = value
                    else:
                        set_parts.append(f"{key} = :{key}")
                        params[key] = value

                if set_parts:
                    connection.execute(
                        text(f"""
                            UPDATE pages
                            SET {', '.join(set_parts)}, updated_at = CURRENT_TIMESTAMP
                            WHERE id = :id
                        """),
                        params,
                    )

            if components_to_save is not None:
                _save_page_components(connection, page_id, components_to_save)

            # Update nav_items if any nav field was sent
            if has_nav_update:
                # Build a temporary page-like object for the nav upsert helper
                class _NavProxy:
                    pass
                proxy = _NavProxy()
                current = CmsPageRepository.find_by_id.__func__ if False else None
                # Read current nav state as defaults
                existing = connection.execute(
                    text("""
                        SELECT ni.icon, ni."order", p_parent.slug AS parent_slug
                        FROM nav_items ni
                        LEFT JOIN nav_items np ON np.id = ni.parent_id
                        LEFT JOIN pages p_parent ON p_parent.id = np.page_id
                        WHERE ni.page_id = :id
                    """),
                    {"id": page_id},
                ).mappings().first()

                proxy.nav_visible = nav_fields['nav_visible'] if 'nav_visible' in nav_fields else (existing is not None)
                proxy.nav_icon = nav_fields['nav_icon'] if 'nav_icon' in nav_fields else (existing['icon'] if existing else None)
                proxy.nav_order = nav_fields['nav_order'] if 'nav_order' in nav_fields else (existing['order'] if existing else 100)
                proxy.nav_parent_slug = nav_fields['nav_parent_slug'] if 'nav_parent_slug' in nav_fields else (existing['parent_slug'] if existing else None)

                CmsPageRepository._upsert_nav_item(connection, page_id, proxy)

        return CmsPageRepository.find_by_id(page_id)

    # ..............................
    @staticmethod
    def delete(page_id: int) -> bool:
        with engine.begin() as connection:
            result = connection.execute(
                text("DELETE FROM pages WHERE id = :id"),
                {"id": page_id},
            )
            return result.rowcount > 0
