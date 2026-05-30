# Base de datos — SOPERMI

## Stack actual

SQLite local via `better-sqlite3` + Drizzle ORM. La DB vive en `./data/dashboard.db` y se crea automáticamente al iniciar la app.

## Cómo funciona la conexión

```
src/lib/db/index.ts    → conexión SQLite + auto-creación de tablas
src/lib/db/schema.ts   → schema Drizzle (source of truth para tipos en TS)
src/lib/db/seed.ts     → datos iniciales (categorías, ejercicios, alimentos)
src/lib/db/queries/    → queries organizadas por módulo
SCHEMA.sql             → DDL completo (se ejecuta si la DB está vacía)
```

Al arrancar la app:
1. `index.ts` abre (o crea) el archivo SQLite
2. Si no existe la tabla `categories`, ejecuta `SCHEMA.sql` completo
3. `seed.ts` inserta datos iniciales (idempotente — no duplica)

## Configuración

La ruta de la DB se controla con la variable de entorno `DB_PATH`:

```bash
# .env
DB_PATH=./data/dashboard.db
```

Para desarrollo no necesitas hacer nada — la DB se crea sola en `./data/`.

## Cómo conectar una DB existente

Si ya tienes un archivo SQLite con el schema correcto:

```bash
# Apuntar a una DB en otra ubicación
DB_PATH=/ruta/a/mi/base.db npm run dev
```

## Cómo inspeccionar la DB

```bash
# Drizzle Studio (UI web para explorar datos)
npm run db:studio

# SQLite CLI directo
sqlite3 data/dashboard.db
.tables
.schema transactions
SELECT * FROM transactions LIMIT 5;
```

## Cómo resetear la DB

```bash
rm data/dashboard.db
npm run dev   # se recrea con schema + seed
```

## Cómo hacer backup

```bash
cp data/dashboard.db data/backup-$(date +%Y%m%d).db
```

O en caliente (sin detener la app):

```bash
sqlite3 data/dashboard.db ".backup data/backup-$(date +%Y%m%d).db"
```

## Migraciones con Drizzle

Si modificas `src/lib/db/schema.ts`:

```bash
# Generar migración
npm run db:generate

# Aplicar migraciones pendientes
npm run db:migrate
```

Las migraciones se guardan en `drizzle/migrations/`.

**Nota:** en esta etapa del proyecto, la forma más rápida de aplicar cambios de schema es borrar la DB y dejar que se recree. Las migraciones formales son para cuando haya datos reales que preservar.

## Schema completo

Ver `SCHEMA.sql` para el DDL completo. Las tablas principales:

| Módulo    | Tablas                                          |
|-----------|------------------------------------------------|
| Finanzas  | `categories`, `transactions`, `budgets`         |
| Tiempo    | `projects`, `tasks`, `time_blocks`              |
| Gym       | `exercises`, `workouts`, `sets`                 |
| Comidas   | `foods`, `meals`, `meal_foods`                  |
| Hábitos   | `habits`, `habit_logs`                          |
| YO        | `profile`, `rules`, `goals`, `daily_scores`, `sleep_logs`, `weekly_reviews` |

## Deploy en Mac Mini

En producción la DB vive en una ruta absoluta fuera del proyecto:

```bash
# .env en producción
DB_PATH=/data/sopermi.db
```

Asegúrate de que el directorio `/data/` exista y tenga permisos de escritura para el usuario que corre PM2.

## WAL mode

La DB usa WAL (Write-Ahead Logging) para mejor rendimiento en lecturas concurrentes. Esto genera dos archivos extra junto a la DB:

```
data/dashboard.db       ← base de datos principal
data/dashboard.db-wal   ← write-ahead log
data/dashboard.db-shm   ← shared memory
```

Los tres archivos son necesarios. Al hacer backup, copia los tres o usa el comando `.backup` de SQLite que los consolida.
