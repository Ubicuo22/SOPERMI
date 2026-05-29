# Design System

## Concepto

**Utilitarian dark / cockpit personal.** Sin decoración, todo es dato. Inspiración: Strong app, Whoop, Raycast, Linear.

## Paleta de color

```css
/* app.css — variables globales */
:root {
  --bg:           #0a0a0a;   /* fondo base */
  --surface:      #141414;   /* cards, módulos */
  --elevated:     #1e1e1e;   /* inputs, hover states */
  --border:       #222222;   /* bordes de cards */
  --border-soft:  #1a1a1a;   /* bordes muy sutiles */

  --accent:       #b8f240;   /* verde lima — números clave, CTAs, streaks */
  --accent-dim:   #7aab1a;   /* accent secundario, borders activos */
  --accent-bg:    #b8f24015; /* fondo tint para badges */

  --t1:           #f0f0f0;   /* texto principal */
  --t2:           #888888;   /* labels, metadata */
  --t3:           #444444;   /* placeholders, separadores */

  --danger:       #ff4545;   /* presupuesto excedido, errores */
  --danger-bg:    #ff454515;
  --warn:         #f0a500;   /* alertas suaves */
  --warn-bg:      #f0a50015;
  --success:      #b8f240;   /* mismo que accent */
}
```

Tailwind config — extender con estos tokens en `tailwind.config.ts`:
```ts
colors: {
  bg: '#0a0a0a',
  surface: '#141414',
  elevated: '#1e1e1e',
  accent: '#b8f240',
  'accent-dim': '#7aab1a',
  't1': '#f0f0f0',
  't2': '#888888',
  't3': '#444444',
  danger: '#ff4545',
  warn: '#f0a500',
}
```

## Tipografía

Dos familias solamente:

| Familia | Uso | Variable CSS |
|---|---|---|
| JetBrains Mono | Números, métricas, timers, pesos, montos | `--font-mono` |
| DM Sans | Labels, texto UI, descripciones | `--font-sans` |

Cargar en `app.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Escala tipográfica:
```
10px / t3  — micro labels, timestamps
11px / t2  — section labels (uppercase + letter-spacing: 0.08em)
12px / t2  — metadata secundaria
13px / t1  — texto de listas, contenido de cards
14px / t2  — subtítulos
16px / t1  — body / texto base
22px / t1 / mono — métricas medianas
36px / accent / mono — balance principal, timer
```

## Componentes base

### MetricCard
```svelte
<!-- Uso: <MetricCard label="pomodoros" value="7" /> -->
background: var(--surface)
border: 1px solid var(--border)
border-radius: 14px
padding: 12px 14px
label: 11px, t2
value: 22px, 700, mono, t1 (o accent si es positivo)
```

### Card estándar
```svelte
background: var(--surface)
border: 1px solid var(--border)
border-radius: 14px
padding: 14px 16px
```

### BudgetBar
```svelte
<!-- track: 4px altura, elevated bg -->
<!-- fill: accent si <75%, warn si 75-99%, danger si >=100% -->
label: 11px DM Sans, t2, 60px ancho fijo
value: 11px mono, t2, 36px ancho fijo, text-right
```

### BottomNav
```svelte
height: 64px
background: var(--surface)
border-top: 1px solid var(--border)
5 tabs: finances, time, gym, meals, habits
icon activo: accent (20px Tabler outline)
icon inactivo: t2
label: 9px, letter-spacing: 0.03em
tab activo: background elevated, border-radius 10px
touch target mínimo: 48px × 48px
```

### TopBar
```svelte
height: auto
padding: 20px 16px 0
date: 12px, t2
title: 13px, 500, DM Sans
dot de estado: 8px × 8px, border-radius 50%, accent
```

### PRBadge
```svelte
font-size: 10px
background: var(--accent-bg)
color: var(--accent)
padding: 2px 6px
border-radius: 4px
texto: "PR"
```

### QuickAdd (FAB)
```svelte
<!-- Botón flotante esquina inferior derecha, sobre el BottomNav -->
width: 48px, height: 48px
border-radius: 50%
background: var(--accent)
color: #0a0a0a  /* texto oscuro sobre accent claro */
icon: ti-plus 20px
bottom: 80px (sobre el nav)
right: 16px
position: absolute (dentro del layout, no fixed)
Al tap → bottom sheet con 5 opciones de log rápido
```

## Reglas de UI

1. **Solo un color de acento** — verde lima para todo lo positivo/activo. Nunca usar para decoración.
2. **Números siempre en mono**, alineados a la derecha cuando están en tabla o lista.
3. **Sin sombras decorativas** — la elevación se logra con diferencia de color de fondo.
4. **Sin gradientes** — fondos planos solamente.
5. **Sin emojis en UI** — solo iconos Tabler outline.
6. **Section labels** en uppercase con `letter-spacing: 0.08em`, color t2, tamaño 11px.
7. **Touch targets** mínimo 48px — todos los botones interactivos.
8. **Estados vacíos** con microcopy en t2, sin ilustraciones. Ej: "sin registros hoy — agrega uno con +"
9. **Bordes de cards**: `1px solid var(--border)` — nunca más grueso excepto en elemento activo/seleccionado (`var(--accent-dim)`).
10. **Animaciones** solo funcionales: `transition: background 150ms ease` en hovers, slide de página en navegación entre módulos.

## Iconos Tabler (tab icons)

```
finances  → ti-chart-bar
time      → ti-clock
gym       → ti-barbell
meals     → ti-salad
habits    → ti-check
```

Usar `@tabler/icons-svelte` — siempre outline, nunca filled.
