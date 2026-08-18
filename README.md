# Promacson Backend

API REST para el panel de administración y el portal Promacson.

Stack: **Node.js**, **Express**, **TypeORM**, **PostgreSQL**.

## Requisitos

- Node.js 20+
- npm
- PostgreSQL en el mismo servidor (o accesible en red)

## Configuración

```bash
cd promacson-backend
npm install
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP (default `4000`) |
| `DB_HOST` | Host de Postgres (`localhost` en el servidor) |
| `DB_PORT` | Puerto (`5432`) |
| `DB_USER` | Usuario de Postgres |
| `DB_PASSWORD` | Contraseña |
| `DB_NAME` | Base de datos (`promacson`) |
| `DB_SSL` | `true` solo si Postgres exige SSL |
| `DB_SYNC` | Solo desarrollo; **no** en el servidor |
| `JWT_SECRET` | Secreto para firmar tokens |
| `CORS_ORIGIN` | URL del frontend |

El teléfono, correo, WhatsApp y dirección **no van en el `.env`**: se editan en el panel (`/admin`).

El primer usuario admin **tampoco va en el `.env`**. Tras aplicar el esquema:

```bash
npm run seed -- admin@promacson.local "tu-password"
```

## Base de datos

1. Crea la base: `CREATE DATABASE promacson;`
2. Ejecuta `docs/sql/001-schema.sql`.
3. Completa `DB_*` en `.env`.
4. Crea el admin con `npm run seed`.

Guía: `docs/sql/README.md`.

### Desarrollo local

```bash
npm run db:sync   # opcional si no ejecutaste el SQL
npm run seed -- admin@promacson.local "tu-password"
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

## Imágenes

El API guarda archivos en `public/uploads/` (`sliders`, `products`, `categories`, `services`) y en la BD solo la ruta (`/uploads/...`).

## Verificación

```bash
curl -s http://localhost:4000/api/v1/health
# {"status":"ok","service":"promacson-backend"}
```
