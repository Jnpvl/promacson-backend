# Scripts SQL — Promacson

> **Producción (Supabase):** usa `postgres/001-schema.sql`. Este directorio es legado **SQL Server**.

Scripts manuales para SQL Server, alineados con las entidades TypeORM en `src/entities/`.
Convención similar a `MOVIVIG-Back/docs/sql/`.

## Orden de ejecución

| # | Archivo | Contexto | Descripción |
|---|---------|----------|-------------|
| 1 | `001-create-database.sql` | `master` | Crea la BD `promacson` si no existe |
| 2 | `002-create-users.sql` | `promacson` | Crea la tabla `users` |
| 3 | `003-create-sliders.sql` | `promacson` | Crea la tabla `sliders` |

## Ejemplo con sqlcmd

Desde la raíz de `promacson-backend/`:

```bash
# 1. Base de datos
sqlcmd -S localhost -U sa -P "<password>" -i docs/sql/001-create-database.sql

# 2. Tablas
sqlcmd -S localhost -U sa -P "<password>" -d promacson -i docs/sql/002-create-users.sql
```

En Azure Data Studio o SSMS: abrir cada archivo en el orden indicado y ejecutar.

## Alternativa en desarrollo

Si prefieres que TypeORM genere el esquema automáticamente:

```bash
npm run db:sync
```

Los scripts SQL son la opción recomendada para entornos donde `synchronize` está desactivado (producción, DBA).

## Entidades cubiertas

| Entidad | Tabla | Script |
|---------|-------|--------|
| `User` | `users` | `002-create-users.sql` |
| `Slider` | `sliders` | `003-create-sliders.sql` |

Al agregar entidades en `src/entities/`, añade un script numerado aquí y actualiza esta tabla.
