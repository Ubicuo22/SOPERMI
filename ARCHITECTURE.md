# Arquitectura

## Infraestructura

```
Mac Mini M4 (host)
├── SvelteKit app         → puerto 3000 (PM2)
├── SQLite                → /data/dashboard.db
└── cloudflared tunnel    → dash.ubicuo.icu (HTTPS automático)
```

No hay VPS, no hay Docker en primera iteración. Todo corre directo en macOS con PM2.

## Estructura de carpetas

```
dashboard/
├── CLAUDE.md
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md
├── MODULES.md
├── SCHEMA.sql
│
├── src/
│   ├── app.html
│   ├── app.css                      # Tailwind base + CSS variables
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts             # Conexión better-sqlite3
│   │   │   ├── schema.ts            # Drizzle schema (refleja SCHEMA.sql)
│   │   │   └── queries/
│   │   │       ├── finances.ts
│   │   │       ├── habits.ts
│   │   │       ├── gym.ts
│   │   │       ├── meals.ts
│   │   │       └── time.ts
│   │   │
│   │   ├── types/
│   │   │   ├── finances.ts
│   │   │   ├── habits.ts
│   │   │   ├── gym.ts
│   │   │   ├── meals.ts
│   │   │   └── time.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── finances/
│   │   │   │   ├── BalanceCard.svelte
│   │   │   │   ├── BudgetBar.svelte
│   │   │   │   ├── TransactionList.svelte
│   │   │   │   └── store.ts
│   │   │   ├── habits/
│   │   │   │   ├── HabitRow.svelte
│   │   │   │   ├── StreakBadge.svelte
│   │   │   │   └── store.ts
│   │   │   ├── gym/
│   │   │   │   ├── WorkoutLogger.svelte
│   │   │   │   ├── SetRow.svelte
│   │   │   │   ├── PRBadge.svelte
│   │   │   │   └── store.ts
│   │   │   ├── meals/
│   │   │   │   ├── MealLog.svelte
│   │   │   │   ├── MacroSummary.svelte
│   │   │   │   └── store.ts
│   │   │   └── time/
│   │   │       ├── PomodoroTimer.svelte
│   │   │       ├── TaskList.svelte
│   │   │       └── store.ts
│   │   │
│   │   └── components/
│   │       ├── BottomNav.svelte     # Navegación principal 5 tabs
│   │       ├── MetricCard.svelte    # Card genérica de métrica
│   │       ├── TopBar.svelte        # Header por módulo
│   │       └── QuickAdd.svelte      # FAB + bottom sheet log rápido
│   │
│   └── routes/
│       ├── +layout.svelte           # Shell: BottomNav + TopBar
│       ├── +layout.server.ts        # Auth check global
│       ├── +page.svelte             # Redirect a /finances
│       │
│       ├── login/
│       │   └── +page.svelte
│       │
│       ├── finances/
│       │   └── +page.svelte
│       ├── time/
│       │   └── +page.svelte
│       ├── gym/
│       │   └── +page.svelte
│       ├── meals/
│       │   └── +page.svelte
│       ├── habits/
│       │   └── +page.svelte
│       │
│       └── api/
│           ├── auth/
│           │   └── +server.ts
│           ├── finances/
│           │   └── +server.ts
│           ├── habits/
│           │   └── +server.ts
│           ├── gym/
│           │   └── +server.ts
│           ├── meals/
│           │   └── +server.ts
│           └── time/
│               └── +server.ts
│
├── data/                            # Creada en runtime, gitignoreada
│   └── dashboard.db
│
├── static/
│   ├── manifest.webmanifest
│   └── icons/                       # PWA icons 192 y 512
│
├── drizzle/
│   └── migrations/                  # Auto-generadas por drizzle-kit
│
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── .env.example
```

## Auth

PIN de 6 dígitos. Flujo:
1. `/login` muestra keypad numérico
2. POST a `/api/auth` — compara bcrypt hash del PIN contra `AUTH_PIN_HASH` en `.env`
3. Si correcto, setea cookie `session` httpOnly con JWT firmado (`JWT_SECRET` en `.env`)
4. `+layout.server.ts` valida cookie en cada request — redirige a `/login` si inválida

Variables de entorno requeridas en `.env`:
```
AUTH_PIN_HASH=       # bcrypt hash del PIN
JWT_SECRET=          # string random 32+ chars
DB_PATH=./data/dashboard.db
```

## Deploy en Mac Mini

```bash
# Instalar dependencias y build
npm install
npm run build

# Arrancar con PM2
pm2 start build/index.js --name dashboard
pm2 save
pm2 startup    # auto-start al reiniciar el Mac Mini

# Cloudflare Tunnel (ya configurado en la cuenta)
cloudflared tunnel route dns <tunnel-name> dash.ubicuo.icu
cloudflared tunnel run <tunnel-name>
```
