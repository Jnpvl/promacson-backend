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
