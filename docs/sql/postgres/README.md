# PostgreSQL / Supabase

El backend usa **PostgreSQL** (Supabase). Los scripts en `docs/sql/` (001–010) son históricos de **MSSQL**; no los uses en Supabase.

## Esquema inicial

1. Abre tu proyecto en [Supabase](https://supabase.com) → **SQL Editor**.
2. Pega y ejecuta todo `001-schema.sql`.
3. El usuario admin se crea al arrancar el API (`ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env`).

## Variables de entorno

En **Settings → Database** copia la connection string (modo **URI**).

Recomendado para el API en producción (pooler, puerto 6543):

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
DB_SSL=true
DB_SYNC=false
NODE_ENV=production
```

Para migraciones o `db:sync` local, usa la conexión **directa** (puerto 5432) sin pooler.

## Notas

- `DB_SYNC=true` solo en desarrollo; en producción usa el SQL de este folder.
- Las imágenes subidas siguen en `public/uploads/` del servidor; para producción considera Supabase Storage más adelante.
