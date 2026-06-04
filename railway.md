# Despliegue en Railway (alternativa)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → repo Promacson.
2. Añade un servicio y en **Settings → Root Directory** pon `promacson-backend`.
3. **Build**: Nixpacks detecta Node, o usa **Dockerfile** en esta carpeta.
4. **Start command**: `npm run build && npm start` (Nixpacks) o imagen Docker con `CMD` del Dockerfile.
5. **Networking** → genera dominio público HTTPS.
6. **Variables** (mismas que `.env.example`; `PORT` la inyecta Railway automáticamente):

   | Variable | Valor |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `DB_SYNC` | `false` |
   | `DB_SSL` | `true` |
   | `DB_HOST` | `aws-1-us-east-1.pooler.supabase.com` |
   | `DB_PORT` | `5432` |
   | `DB_USER` | `postgres.ezongixuraxivexhiqjt` |
   | `DB_NAME` | `postgres` |
   | `DB_PASSWORD` | *(Supabase → Database password)* |
   | `JWT_SECRET` | *(generar, ≥32 caracteres)* |
   | `CORS_ORIGIN` | `https://tu-app.vercel.app` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | solo primer arranque / seed |

7. **Health check** (opcional): path `/api/v1/health`.

Ver sección **Despliegue** en `README.md` para CORS, Vercel y uploads.
