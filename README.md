# Web de coches — catálogo + CMS

Web de un concesionario: catálogo de stock, importación a la carta y páginas
editables desde un panel CMS. **No hay venta online.**

- Frontend: React 19 + Vite + Tailwind v4 (`src/`)
- Backend: FastAPI + SQLAlchemy + Alembic (`server/`)
- Base de datos: PostgreSQL 16 (Docker)
- Archivos: local en desarrollo, Cloudflare R2 en producción

El plan completo por fases está en `PLAN_WEB_COCHES.md` (copia en
`C:\Users\javic\Downloads\webvinosCMS-main\webvinosCMS-main`).

## Arranque en desarrollo

Requisitos: Docker Desktop y Node 22.

```bash
# 1. Variables de entorno (solo la primera vez)
cp server/.env.example server/.env      # y pon un JWT_SECRET_KEY largo
cp .env.example .env

# 2. Base de datos + API (aplica las migraciones automáticamente)
docker compose up -d --build

# 3. Crear el primer administrador (pide la contraseña)
docker compose exec api python -m app.scripts.create_admin --email tu@email.com --name "Tu nombre"

# 4. Frontend
npm install
npm run dev
```

- Web: http://localhost:5173
- Panel: http://localhost:5173/admin
- API: http://localhost:8000/docs
- PostgreSQL desde tu PC: `localhost:5433` (usuario/contraseña en `server/.env`)

## Comandos útiles

```bash
docker compose logs -f api                         # logs de la API
docker compose exec api alembic upgrade head       # aplicar migraciones
docker compose exec api alembic revision -m "..."  # nueva migración (editar a mano)
docker compose exec db psql -U coches_user -d coches_cms
docker compose down                                # parar (los datos se conservan)
docker compose down -v                             # parar y BORRAR la base de datos
```

## Usuarios del panel

| Rol | Acceso |
|---|---|
| `admin` | Todo el panel |
| `editor` | Páginas, componentes, carrusel, colecciones, menú, SEO, multimedia, analíticas |

Solo un `admin` gestiona usuarios, estilos, redirecciones y el registro de actividad.
Siempre debe quedar al menos un administrador activo.

## Imágenes

Al subir una imagen (JPG, PNG, WebP o HEIC de iPhone) el backend:

1. corrige la orientación y **elimina los metadatos EXIF** (incluida la ubicación GPS),
2. la convierte a **WebP** (máx. 1920 px),
3. genera variantes `-sm` (480 px) y `-md` (960 px) para listados.

Logo, favicon, SVG y vídeos se guardan tal cual.

### Pasar a Cloudflare R2

1. En Cloudflare → R2, crea dos buckets: uno **público** (p. ej. `coches-public`)
   y otro **privado** (`coches-private`).
2. En el bucket público, conecta un dominio propio (p. ej. `img.tudominio.com`).
   El privado no se expone nunca.
3. Crea un token de API de R2 con permiso de lectura/escritura en ambos buckets.
4. En `server/.env`:
   ```
   STORAGE_DRIVER=r2
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_PUBLIC_BUCKET=coches-public
   R2_PRIVATE_BUCKET=coches-private
   R2_PUBLIC_URL=https://img.tudominio.com
   ```
5. Reinicia la API: `docker compose restart api`.

Los archivos privados (capturas de clientes, fase 3) solo se ven con URLs
firmadas que caducan.
