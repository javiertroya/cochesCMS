# Plan — Web de venta de coches (catálogo + CMS)

> Documento de continuidad. Si se pierde la conversación con Claude, pásale este
> archivo y dile en qué fase estás. El estado actualizado de cada fase está en la
> sección **"Estado"** al final.

- **Proyecto nuevo:** `C:\Users\javic\Documents\Coches`
- **Plantilla de origen:** este proyecto (`webvinosCMS-main`), del que se reutiliza el panel CMS.
- **No hay venta online:** la web es un catálogo + formularios de contacto/solicitudes.

---

## 1. Decisiones tomadas

### Stack
| Capa | Elección |
|---|---|
| Frontend | React 19 + Vite + Tailwind v4 (igual que la plantilla) |
| Backend | Python + FastAPI + SQLAlchemy (SQL con `text()`, patrón routes → services → repositories) |
| Base de datos | PostgreSQL 16 en Docker |
| Migraciones | **Alembic** (sustituye al `migrations.py` hecho a mano) |
| Imágenes | **Cloudflare R2** (no Cloudflare Images): bucket público para fotos/banners, bucket privado para capturas de clientes. En desarrollo, almacenamiento local en `server/uploads` |
| Procesado de imágenes | Pillow al subir: WebP, sin EXIF (quita GPS), rotación correcta, variantes `sm` (480px), `md` (960px) y principal (1920px) |
| Hosting | OVH VPS-1 con Docker Compose: Caddy (HTTPS) + API + Postgres (5432 sin exponer) |
| DNS / CDN | Cloudflare (proxy activado) |
| Email | Proveedor transaccional (Brevo o Resend) por SMTP. Un **único correo destino** configurable en el panel |
| Antispam | Cloudflare Turnstile + rate limiting en formularios públicos |

### Usuarios del panel
- Solo dos roles: **admin** (todo) y **editor** (contenido: páginas, vehículos, multimedia, solicitudes; sin usuarios, estilos, redirecciones ni actividad).
- Se eliminan los roles `upct`/`external`, el campo `cif`, la dirección y el flujo de aprobación de la plantilla. El acceso se controla con `is_active`.

### Páginas: todo por CMS
- **Todas las páginas se crean desde el panel**, incluido el inicio (banners, bloques, etc.).
- Cada funcionalidad nueva es un **componente insertable** en cualquier página:

| Componente | Función |
|---|---|
| `hero` / carrusel de cabecera | Banners (ya existen) |
| `vehicle_grid` | Listado de stock con filtros (configurable: con/sin filtros, nº de coches, orden) |
| `featured_vehicles` | Coches marcados como destacados |
| `import_request_form` | Formulario de importación a la carta (opción 1, 2 o ambas) |
| `form` (contacto) | Formulario de contacto genérico |
| `finance_calculator` | Solo se pinta si el interruptor global está activo |
| Bloques de contenido | Texto, imagen+texto, cards, FAQ/acordeón, estadísticas, CTA… (ya existen) |

- **Excepción:** la ficha `/stock/:slug` es una plantilla automática con los datos del coche (con algunos textos configurables desde el panel).

### Funcionalidades
1. **Stock de coches**: tabla `vehicles` con campos tipados (marca, modelo, versión, año, km, precio, combustible, cambio, potencia, etiqueta DGT, color, puertas, plazas, equipamiento, descripción), estados *disponible / reservado / vendido / oculto*, "destacado", galería con subida múltiple, reordenar arrastrando y foto de portada.
2. **Importación a la carta** (`/importacion`, montada por CMS):
   - **Opción 1 — "Búscame un coche"**: marca/modelo, año desde-hasta, km máx., presupuesto máx., combustible, cambio, carrocería, color/extras, descripción libre.
   - **Opción 2 — "Ya lo he encontrado"**: enlace al anuncio (opcional), país, marca/modelo/año/km/precio, comentarios y **hasta 10 capturas** (JPG/PNG/WebP, 10 MB c/u) guardadas en el bucket **privado**; en el panel se ven con URLs firmadas temporales; en el email llegan como miniaturas con enlace.
   - Comunes: nombre, email, teléfono, preferencia de contacto (llamada/WhatsApp/email), aceptación RGPD, Turnstile.
   - Al enviar: se **guarda en BD** (tabla `requests`) + **email** al correo configurado + email de confirmación al cliente (desactivable).
3. **Solicitudes en el panel**: listado filtrable por tipo (importación-búsqueda, importación-encontrado, interés en coche, contacto) con estados *nueva / en curso / presupuestada / cerrada*.
4. **Notificaciones**: en Ajustes → *Notificaciones*: un único "correo de notificaciones" y **asuntos editables por tipo** con variables (ej. `[Importación] {marca} {modelo} – {nombre}`).
5. **Calculadora de financiación**: interruptor global **desactivado por defecto**; mientras esté apagado no aparece en ninguna parte (ni menú, ni fichas; la URL da 404). Parámetros editables: TIN, TAE, comisión de apertura, plazos mín./máx., entrada mínima %, texto legal. (Ley 16/2011: si se muestran cuotas hay que mostrar TAE y ejemplo representativo.)
6. **Ficha de coche**: galería a pantalla completa, especificaciones, botón WhatsApp con mensaje prellenado, formulario "Me interesa este coche".

---

## 2. Fases

### Fase 0 — Base y limpieza ✅
- [x] Copiar plantilla a `C:\Users\javic\Documents\Coches` (git inicializado, sin commits).
- [x] Quitar catas (`TastingRequest`, `TastingForm`, rutas y servicio), colección `vinos`, endpoints `/api/vinos` y `/api/noticias/{id}` (no se usaban), textos "Wine CMS", iconos y mocks de vino.
- [x] Quitar dependencias no usadas (`@schedule-x/*`, `uvloop`, `passlib`) y hooks muertos (`useUser`, `useUserExternal`).
- [x] Usuarios: roles `admin`/`editor`, sin `cif`, `address` ni aprobación. Login y token comprueban `is_active`. No se puede eliminar/degradar al último admin ni borrarse a uno mismo.
- [x] Permisos: `require_staff` (admin+editor) para contenido; `require_admin` para usuarios, ajustes, estilos, redirecciones, actividad. En el panel, secciones `adminOnly` ocultas al editor y rutas protegidas con `<AdminOnly>`.
- [x] Alembic: `0001_initial_schema` (SQL limpio + semilla: páginas Inicio y Contacto, colección Noticias con los campos que usa el frontend). La API ejecuta `alembic upgrade head` al arrancar.
- [x] Script `python -m app.scripts.create_admin` (crea o reactiva un admin).
- [x] `docker-compose.yml` de desarrollo: `db` (Postgres 16, **puerto 5433** en el host porque el 5432 lo ocupa un Postgres local) + `api` (recarga en caliente).
- [x] README y `CLAUDE.md` nuevos.

### Fase 1 — Almacenamiento de imágenes (R2) ✅ (falta conectar la cuenta real)
- [x] `server/app/services/storage_service.py` con drivers `local` y `r2` (boto3), elegido con `STORAGE_DRIVER`.
- [x] Zona pública y privada. Local: `server/uploads` (servida en `/uploads`) y `server/private_uploads` (solo con URL firmada HMAC en `/api/files/private/...`). R2: bucket público + bucket privado con URLs prefirmadas.
- [x] `server/app/utils/image_utils.py`: WebP, sin EXIF/GPS, orientación corregida, principal 1920 px + variantes `sm` 480 px y `md` 960 px. HEIC de iPhone soportado (`pillow-heif`). Logo, favicon (`.ico` incluido), SVG y vídeo sin convertir.
- [x] Migración `0002_media_storage`: `media.storage_key`, `width`, `height`, `variants` (JSONB).
- [x] Subida, borrado (con variantes) y sincronización vía `server/app/services/media_service.py`. Pillow y R2 se ejecutan fuera del event loop.
- [x] Límites `MAX_IMAGE_MB` (25) y `MAX_VIDEO_MB` (200).
- [x] Frontend: `src/utils/media.js` (`resolveMediaUrl`, `getThumbnailUrl`, `IMAGE_ACCEPT`); la biblioteca usa miniaturas `sm`, acepta HEIC y copia URLs absolutas.
- [x] Probado: subida/rotación/EXIF/variantes/borrado/sync en local; URLs firmadas (firma alterada, caducada u otra clave → 403); driver R2 contra un simulador S3 (moto).
- [ ] **Pendiente (tú):** crear los buckets en Cloudflare R2, dominio público y token, y rellenar las variables `R2_*` (pasos en el README del proyecto).

### Fase 2 — Stock de vehículos
- [ ] Tablas `brands`, `models`, `vehicles`, `vehicle_images` (migración Alembic).
- [ ] CRUD en el panel (sección "Vehículos"): formulario tipado, subida múltiple, reordenar, portada, estados, destacado.
- [ ] API pública: `GET /api/vehicles` (filtros, orden, paginación) y `GET /api/vehicles/{slug}`.
- [ ] Componentes CMS `vehicle_grid` y `featured_vehicles`; ficha `/stock/:slug`.

### Fase 3 — Formularios y solicitudes
- [ ] Tabla `requests` (tipo, estado, datos JSONB, vehículo opcional, adjuntos privados).
- [ ] Ajustes → Notificaciones: correo único, asuntos por tipo, confirmación al cliente on/off.
- [ ] Componentes `import_request_form` (opciones 1 y 2, capturas) y `form` (contacto); formulario "Me interesa" en la ficha.
- [ ] Envío por Brevo/Resend; Turnstile; rate limiting.
- [ ] Sección "Solicitudes" en el panel con estados.

### Fase 4 — Financiación (oculta)
- [ ] Ajustes: interruptor + parámetros + texto legal.
- [ ] Componente `finance_calculator` y bloque en la ficha, ocultos si está desactivado.

### Fase 5 — SEO
- [ ] Inyección de `<title>`, `description` y `og:image` en el HTML servido para fichas y páginas CMS (vista previa en WhatsApp).
- [ ] `sitemap.xml` y `robots.txt` dinámicos.
- [ ] JSON-LD `schema.org/Car` + `Offer` en fichas.

### Fase 6 — Despliegue en OVH VPS-1
- [ ] `docker-compose.prod.yml`: Caddy (HTTPS + estáticos del frontend) + API + Postgres.
- [ ] Cortafuegos (solo 22/80/443), usuario no root, claves SSH.
- [ ] Dominio en Cloudflare con proxy.
- [ ] Backups diarios `pg_dump` → bucket R2 aparte, con retención.
- [ ] Script de despliegue.

### Opcional futuro
- Feed XML para portales (coches.net, Wallapop…), comparador, favoritos.

---

## 3. Cómo continuar con Claude

1. Abre Claude Code en `C:\Users\javic\Documents\Coches`.
2. Dile: *"Lee `PLAN_WEB_COCHES.md` (está en `C:\Users\javic\Downloads\webvinosCMS-main\webvinosCMS-main`) y continúa por la siguiente fase pendiente"*.
3. El proyecto nuevo tiene también un `CLAUDE.md` con la estructura y comandos, y una copia de este plan (`PLAN_WEB_COCHES.md`).
4. Siguiente paso: **Fase 2 — Stock de vehículos**.

### Arrancar el entorno
```bash
cd C:\Users\javic\Documents\Coches
docker compose up -d          # Postgres + API (Docker Desktop debe estar abierto)
npm run dev                   # http://localhost:5173 · panel en /admin
docker compose exec api python -m app.scripts.create_admin --email tu@email.com --name "Tu nombre"
```

---

## 4. Estado

| Fase | Estado | Notas |
|---|---|---|
| 0 — Base y limpieza | ✅ Hecha (2026-10-02) | |
| 1 — Imágenes R2 | ✅ Hecha (2026-10-02) | Falta conectar la cuenta real de R2 |
| 2 — Stock | Pendiente | |
| 3 — Formularios | Pendiente | |
| 4 — Financiación | Pendiente | |
| 5 — SEO | Pendiente | |
| 6 — Despliegue | Pendiente | |
