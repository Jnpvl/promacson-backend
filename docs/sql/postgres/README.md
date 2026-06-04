# PostgreSQL / Supabase

El backend usa **PostgreSQL** (Supabase). Los scripts en `docs/sql/` (001–010) son históricos de **MSSQL**; no los uses en Supabase.

## Esquema inicial

1. Abre tu proyecto en [Supabase](https://supabase.com) → **SQL Editor**.
2. Pega y ejecuta todo `001-schema.sql`.
3. El usuario admin se crea al arrancar el API (`ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env`).

## Variables de entorno

En **Settings → Database** copia la connection string (modo **URI**).

Recomendado en local y producción (**Session pooler**, puerto **5432**):

```env
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_USER=postgres.[PROJECT-REF]
DB_PASSWORD="tu-password"
DB_NAME=postgres
DB_SSL=true
```

Copia host y usuario exactos desde **Dashboard → Database → Connect → Session pooler**.

La URL `db.[REF].supabase.co` (Direct) a veces falla por IPv6; el pooler suele ser más estable.

## Notas

- `DB_SYNC=true` solo en desarrollo; en producción usa el SQL de este folder.
- Las imágenes subidas siguen en `public/uploads/` del servidor; para producción considera Supabase Storage más adelante.
