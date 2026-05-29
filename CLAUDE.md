# Personal Dashboard — instrucciones para Claude Code

## Qué es este proyecto

App web personal (uso exclusivo del dueño) para gestión de finanzas, tiempo, comidas, gym y hábitos. Mobile-first, PWA instalable, hosteada en Mac Mini M4 propio.

Lee todos los archivos de contexto antes de escribir cualquier código:
- `ARCHITECTURE.md` — stack, estructura de carpetas, decisiones técnicas
- `DESIGN_SYSTEM.md` — tokens, tipografía, paleta, patrones UI
- `SCHEMA.sql` — base de datos completa
- `MODULES.md` — spec funcional de cada módulo

---

## Stack

- **Framework:** SvelteKit con `@sveltejs/adapter-node`
- **Base de datos:** SQLite local vía `better-sqlite3` + Drizzle ORM
- **Estilos:** Tailwind CSS con config personalizada (tokens en `DESIGN_SYSTEM.md`)
- **PWA:** `@vite-pwa/sveltekit`
- **Iconos:** `@tabler/icons-svelte`
- **Tipografías:** JetBrains Mono (números/métricas) + DM Sans (UI/labels) — Google Fonts

## Reglas de código

- TypeScript estricto en todo el proyecto
- Cada módulo vive en `src/lib/modules/<nombre>/` con sus propios componentes, stores y tipos
- Las rutas de API van en `src/routes/api/<recurso>/+server.ts`
- No usar `any` — tipar todo con los tipos de `src/lib/types/`
- Queries de DB solo en `src/lib/db/queries/` — nunca inline en componentes o rutas
- Manejo de errores explícito en todas las rutas de API: siempre retornar `{ data, error }`

## Convenciones de nombrado

- Archivos de componentes: `PascalCase.svelte`
- Archivos de utilidades/queries: `camelCase.ts`
- Tablas de DB: `snake_case`
- Variables CSS: `--color-*`, `--font-*`, `--space-*`

## Lo que NO hacer

- No instalar Supabase, Firebase ni ningún backend externo — todo es local SQLite
- No usar shadcn, flowbite ni ningún component library — UI custom siguiendo `DESIGN_SYSTEM.md`
- No agregar auth compleja — un PIN de 6 dígitos hasheado en `.env` es suficiente
- No usar `position: fixed` en componentes — el layout maneja la navegación
- No gradientes, no sombras decorativas, no emojis en UI — ver `DESIGN_SYSTEM.md`
