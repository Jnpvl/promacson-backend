# PostgreSQL

Crea la base y aplica el esquema:

```sql
CREATE DATABASE promacson;
```

Luego ejecuta `001-schema.sql` contra `promacson`.

El contacto inicial queda en `site_settings`; se edita en el panel. El admin se crea con:

```bash
npm run seed -- admin@promacson.local "tu-password"
```
