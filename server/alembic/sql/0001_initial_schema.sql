-- ============================================================================
-- Esquema inicial del CMS (fase 0). Basado en la plantilla webvinosCMS, sin
-- catas, sin colección de vinos y con usuarios simplificados (admin/editor).
-- ============================================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL
);

INSERT INTO roles (name, label) VALUES
    ('admin', 'Administrador'),
    ('editor', 'Editor');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    "order" INTEGER NOT NULL DEFAULT 100,
    requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_og_image TEXT,
    seo_canonical TEXT,
    page_color VARCHAR(50),
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    header_slides JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nav_items (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL UNIQUE REFERENCES pages(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES nav_items(id) ON DELETE SET NULL,
    icon VARCHAR(100),
    "order" INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE component_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(150) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    config_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE page_components (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    component_type_id INTEGER NOT NULL REFERENCES component_types(id),
    "order" INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX page_components_page_id_idx ON page_components (page_id);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    fields_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_items (
    global_id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    id INTEGER NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (collection_id, id)
);

CREATE OR REPLACE FUNCTION set_collection_item_local_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id IS NULL THEN
        SELECT COALESCE(MAX(id), 0) + 1
        INTO NEW.id
        FROM collection_items
        WHERE collection_id = NEW.collection_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_items_local_id_trigger
BEFORE INSERT ON collection_items
FOR EACH ROW
EXECUTE FUNCTION set_collection_item_local_id();

CREATE TABLE media_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER REFERENCES media_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(255) NOT NULL DEFAULT 'Concesionario',
    site_description TEXT NOT NULL DEFAULT 'Coches de ocasión e importación a la carta.',
    favicon_url TEXT,
    logo_url TEXT,
    header_phone VARCHAR(80),
    header_email VARCHAR(255),
    primary_color VARCHAR(50) NOT NULL DEFAULT '#1d4ed8',
    secondary_color VARCHAR(50) NOT NULL DEFAULT '#0f172a',
    accent_color VARCHAR(50) NOT NULL DEFAULT '#f59e0b',
    background_color VARCHAR(50) NOT NULL DEFAULT '#ffffff',
    text_color VARCHAR(50) NOT NULL DEFAULT '#111827',
    heading_color VARCHAR(50) NOT NULL DEFAULT '#0f172a',
    link_color VARCHAR(50) NOT NULL DEFAULT '#1d4ed8',
    font_family_heading VARCHAR(120) NOT NULL DEFAULT 'Inter',
    font_family_body VARCHAR(120) NOT NULL DEFAULT 'Inter',
    font_size_base VARCHAR(20) NOT NULL DEFAULT '16px',
    border_radius VARCHAR(20) NOT NULL DEFAULT '8px',
    footer_text TEXT,
    footer_address TEXT,
    footer_map_embed TEXT,
    footer_copyright TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT site_settings_singleton CHECK (id = 1)
);

INSERT INTO site_settings (id, footer_text, footer_copyright)
VALUES (
    1,
    'Coches de ocasión revisados e importación a la carta.',
    'Todos los derechos reservados.'
);

CREATE TABLE redirects (
    id SERIAL PRIMARY KEY,
    from_path VARCHAR(255) NOT NULL UNIQUE,
    to_path VARCHAR(255) NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 301,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    resource_label TEXT NOT NULL,
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at DESC);

-- ── Datos iniciales ─────────────────────────────────────────────────────────

INSERT INTO collections (name, slug, description, fields_schema, is_locked)
VALUES (
    'Noticias',
    'noticias',
    'Noticias y novedades.',
    '[
        {"name":"titular","label":"Titular","type":"text","required":true},
        {"name":"fecha_publicacion","label":"Fecha de publicación","type":"date"},
        {"name":"photo","label":"Imágenes","type":"image"},
        {"name":"descripcion_photo","label":"Pie de foto","type":"text"},
        {"name":"entrada","label":"Entradilla","type":"textarea"},
        {"name":"cuerpo","label":"Cuerpo","type":"textarea"}
    ]'::jsonb,
    TRUE
);

INSERT INTO component_types (name, label, description) VALUES
    ('hero', 'Hero', 'Bloque principal con titulo y llamada a la accion.'),
    ('form', 'Formulario', 'Formulario de contacto.');

INSERT INTO pages (title, slug, status, "order", seo_title, seo_description) VALUES
    ('Inicio', 'home', 'published', 1, 'Concesionario', 'Coches de ocasión e importación a la carta.'),
    ('Contacto', 'contacto', 'published', 90, 'Contacto', 'Contacta con nosotros.');

INSERT INTO page_components (page_id, component_type_id, "order", config)
SELECT p.id, ct.id, v.component_order, v.config
FROM (
    VALUES
        ('home', 'hero', 0, '{"title":"Tu próximo coche te está esperando","subtitle":"Vehículos revisados e importación a la carta.","buttonText":"Contactar","buttonUrl":"/contacto"}'::jsonb),
        ('contacto', 'form', 0, '{"form":"contacto"}'::jsonb)
) AS v(page_slug, component_name, component_order, config)
JOIN pages p ON p.slug = v.page_slug
JOIN component_types ct ON ct.name = v.component_name;

INSERT INTO nav_items (page_id, "order")
SELECT id, "order" FROM pages WHERE slug IN ('home', 'contacto');
