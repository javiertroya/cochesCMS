# CLAUDE.md

Web de un concesionario de coches (catálogo + formularios, sin venta online) con
panel CMS. Basada en la plantilla `webvinosCMS`.

**Plan y estado por fases:** `PLAN_WEB_COCHES.md` en la raíz de este proyecto.
Léelo antes de empezar una fase y actualiza su tabla de "Estado" al terminar.

## Estructura

- `src/` — React 19 + Vite + Tailwind v4. Panel en `/admin` (`src/pages/admin`,
  `src/components/Admin`). Web pública renderizada por CMS (`src/pages/DynamicPage.jsx`,
  `src/components/Cms/CmsRenderer.jsx`).
- `server/app/` — FastAPI. Patrón `routes/ → services/ → repositories/`, SQL con
  `sqlalchemy.text()` (sin ORM). Modelos Pydantic en `models/`.
- `server/alembic/` — migraciones escritas a mano (`op.execute` / SQL). La 0001
  carga `alembic/sql/0001_initial_schema.sql`.
- Componentes CMS: catálogo en `server/app/services/cms_page_service.py`
  (`COMPONENT_TYPES`), formularios de edición en `src/mocks/admin/componentSchemas.js`,
  render en `CmsRenderer.jsx`.

## Comandos

```bash
docker compose up -d --build          # Postgres (host :5433) + API (:8000, recarga en caliente)
npm run dev                           # frontend :5173 (proxy /api y /uploads a :8000)
npx vite build && npx eslint src      # comprobar frontend
docker compose exec api alembic upgrade head
docker compose exec api python -m app.scripts.create_admin --email ... --name ...
```

## Convenciones

- Roles: `admin` y `editor`. En el backend, `require_admin` (usuarios, ajustes,
  estilos, redirecciones, actividad) y `require_staff` (resto del panel).
  En el frontend, secciones con `adminOnly` en `src/mocks/admin/adminSections.js`
  y rutas envueltas en `<AdminOnly>` en `App.jsx`.
- Archivos: siempre a través de `app/services/storage_service.py`
  (`get_storage()`; drivers `local` y `r2`) y `app/services/media_service.py`
  (`store_file`, `delete_stored_files`). Nunca escribir en disco directamente.
- URLs de imágenes en el frontend: usar `resolveMediaUrl` / `getThumbnailUrl`
  de `src/utils/media.js` (las de R2 son absolutas).
- Textos de la interfaz y mensajes de error en español.
- Cada cambio de esquema = nueva migración Alembic (no tocar la 0001).
