# Promacson Backend

API REST para el panel de administración y el portal Promacson.

Stack: **Node.js**, **Express**, **TypeORM**, **PostgreSQL** (Supabase en producción).

## Requisitos

- Node.js 20+
- npm
- PostgreSQL (local o [Supabase](https://supabase.com))

## Configuración

```bash
cd promacson-backend
npm install
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP (default `4000`) |
| `DATABASE_URL` | Connection string Postgres (Supabase) |
| `DB_SSL` | `true` en Supabase |
| `DB_SYNC` | Solo desarrollo (`true`); **no** en producción |
| `JWT_SECRET` | Secreto para firmar tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin inicial (seed al arrancar) |
| `CORS_ORIGIN` | URL del frontend (Vercel) |

## Base de datos (Supabase)

1. Crea un proyecto en Supabase.
2. **SQL Editor** → ejecuta `docs/sql/postgres/001-schema.sql` (esquema completo).
3. En `.env` pega `DATABASE_URL` desde **Settings → Database** (URI, puerto 5432 para migraciones; pooler 6543 para el API en producción).
4. `DB_SYNC=false` en producción.

Guía detallada: `docs/sql/postgres/README.md`.

Los scripts `docs/sql/001-010` son legado **MSSQL**; no usarlos en Supabase.

### Desarrollo local

```bash
npm run db:sync   # opcional si no ejecutaste el SQL
npm run seed      # opcional; el arranque también crea admin
npm run dev
```

## Ejecutar

```bash
npm run dev
npm run build && npm start
```

## Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Despliegue

Recomendación principal: **[Render](https://render.com)** (Web Service Node, `render.yaml` en esta carpeta, health check nativo, plan free). Alternativa: **[Railway](https://railway.app)** — ver `railway.md`. También puedes usar el `Dockerfile` en cualquier PaaS que soporte contenedores.

### Requisitos previos

1. Esquema Postgres aplicado en Supabase (`docs/sql/postgres/001-schema.sql`).
2. Misma conexión que en local: **Session pooler** (puerto `5432`), no Transaction pooler (`6543`) salvo que cambies la config.
3. Repo en GitHub conectado al PaaS.

### Variables de entorno (producción)

| Variable | Valor / notas |
|----------|----------------|
| `NODE_ENV` | `production` |
| `DB_SYNC` | `false` (o omitir; con `NODE_ENV=production` TypeORM no sincroniza) |
| `PORT` | Lo asigna el PaaS (Render/Railway); no hace falta fijarlo a mano |
| `JWT_SECRET` | Secreto largo y aleatorio; **obligatorio** en producción |
| `JWT_EXPIRES_IN` | Opcional (ej. `7d`) |
| `DB_HOST` | `aws-1-us-east-1.pooler.supabase.com` |
| `DB_PORT` | `5432` |
| `DB_USER` | `postgres.ezongixuraxivexhiqjt` |
| `DB_PASSWORD` | Contraseña de **Database** en Supabase (Settings → Database) |
| `DB_NAME` | `postgres` |
| `DB_SSL` | `true` |
| `CORS_ORIGIN` | URL del front en Vercel, sin barra final (ej. `https://promacson.vercel.app`). Varias URLs separadas por coma |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin inicial; el seed corre al arrancar si no existe |
| `SITE_*` | Opcionales (contacto en `GET /api/v1/site/contact`) |

No subas `.env` al repositorio. En Render, los secretos con `sync: false` en `render.yaml` se configuran en el dashboard al crear el servicio.

### Render (pasos)

1. Dashboard → **New** → **Blueprint** → repo Promacson → aplicar `promacson-backend/render.yaml`,  
   **o** **New Web Service** → Node, **Root Directory** `promacson-backend`, Build `npm ci && npm run build`, Start `npm start`.
2. **Build Command:** `npm ci --include=dev && npm run build` (si `NODE_ENV=production` en Render, `npm ci` solo no instala TypeScript ni `@types/*`). El `.npmrc` del repo también fuerza `include=dev`.
3. Completar variables marcadas como secretas: `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_*`.
4. Tras el deploy, copia la URL pública (ej. `https://promacson-api.onrender.com`).

### Railway (resumen)

Root Directory `promacson-backend`, variables iguales que arriba, dominio HTTPS en Networking. Detalle: `railway.md`.

### Docker (local o PaaS)

```bash
cd promacson-backend
docker build -t promacson-api .
docker run --rm -p 4000:4000 --env-file .env promacson-api
```

En producción usa las mismas variables que la tabla (no el `.env` de desarrollo tal cual).

### Verificación post-deploy

```bash
curl -s https://TU-API.onrender.com/api/v1/health
# {"status":"ok","service":"promacson-backend"}

curl -s https://TU-API.onrender.com/
# {"status":"OK"}
```

Si falla la conexión a Supabase, revisa `DB_PASSWORD`, `DB_SSL=true` y que el pooler sea **Session** en puerto `5432`.

### Imágenes subidas

En **desarrollo local** el API guarda en `public/uploads/` (`/uploads/...`).

En **Render/Railway (plan free)** el disco es **efímero**: cada redeploy, reinicio o spin-down borra archivos subidos. La BD conserva rutas rotas (`404`).

**Solución recomendada:** Supabase Storage.

1. SQL Editor → ejecuta `docs/sql/postgres/002-storage.sql` (bucket público `promacson`).
2. En Render, añade variables:
   - `SUPABASE_URL` = Project URL (Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role (secreto; no el anon key)
   - `SUPABASE_STORAGE_BUCKET` = `promacson` (opcional si usas ese nombre)
3. Redeploy del API.
4. En el admin, **vuelve a subir** sliders, categorías, productos y servicios (las URLs antiguas `/uploads/...` ya no tienen archivo).

Las nuevas URLs serán absolutas (`https://….supabase.co/storage/v1/object/public/promacson/...`) y el front las muestra sin proxy.

Alternativa de pago en Render: [Persistent Disk](https://render.com/docs/disks) montado en `public/uploads` (solo planes de pago).

### Frontend (Vercel)

Tras conocer la URL del API:

1. Vercel → proyecto `promacson-frontend` → **Settings → Environment Variables**.
2. Producción (y Preview si quieres):

   ```env
   NEXT_PUBLIC_API_URL=https://TU-API.onrender.com
   API_URL=https://TU-API.onrender.com
   ```

   Sin barra final. El cliente usa `NEXT_PUBLIC_API_URL`; el servidor usa `API_URL` o `NEXT_PUBLIC_API_URL` (ver `src/lib/api/config.ts`).

3. **Redeploy** del front para que Next embeba la variable pública.
4. Confirma que `CORS_ORIGIN` en el API coincide con `https://tu-dominio.vercel.app` (o `NEXT_PUBLIC_SITE_URL`).
