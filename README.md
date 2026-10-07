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
| `MAIL_HOST` | SMTP Brevo (`smtp-relay.brevo.com`) |
| `MAIL_PORT` | Puerto SMTP (`2525` si el server bloquea `587`) |
| `MAIL_USER` | Login SMTP de Brevo |
| `MAIL_PASS` | SMTP key de Brevo |
| `MAIL_FROM` | Remitente verificado en Brevo |
| `MAIL_TO` | Destino de avisos de cotización y mayoreo |

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

## Despliegue

El despliegue de producción se ejecuta con GitHub Actions en `.github/workflows/deploy.yml` al hacer push a `main` o manualmente desde **Actions > Deploy Promacson Backend > Run workflow**.

El workflow primero valida el proyecto en Ubuntu con Node.js 22 (`npm ci` y `npm run build`). Luego entra por SSH al droplet de DigitalOcean, actualiza `/var/www/promacson` con `git pull --ff-only origin main`, instala dependencias con `npm ci` solo si cambió `package-lock.json` o falta `node_modules`, compila y reinicia PM2 con `pm2 restart promacson --update-env`.

Usa estos secretos del repositorio:

- `DROPLET_HOST`: host o IP del droplet.
- `DROPLET_USER`: usuario SSH del droplet.
- `DROPLET_SSH_KEY`: llave privada SSH para acceder al droplet.

El workflow no genera ni sobrescribe `/var/www/promacson/.env`; la configuración real vive en el servidor.

## Frontend

```env
NEXT_PUBLIC_API_URL=https://jp-enterprise.tail5cbc3e.ts.net
```

## Imágenes

El API guarda archivos en `public/uploads/` (`sliders`, `products`, `categories`, `services`) y en la BD solo la ruta (`/uploads/...`).

## Verificación

```bash
curl -s http://localhost:4000/api/v1/health
# {"status":"ok","service":"promacson-backend"}
```
