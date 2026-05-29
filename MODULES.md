# Especificación de módulos

## Convenciones generales

- Cada página carga datos en el `+page.server.ts` correspondiente (SSR)
- Los stores de Svelte manejan estado local/optimistic updates
- Todas las mutaciones van por API routes (`/api/<módulo>`)
- Formato de fechas: siempre `YYYY-MM-DD` en DB, display localizado en UI

---

## 1. Finanzas (`/finances`)

### Vista principal
- **Balance card** — saldo del mes actual (ingresos − gastos), con sub-row de totales
- **Budget bars** — una barra por categoría de gasto con % de uso del presupuesto mensual
  - Verde (`accent`) si < 75%
  - Amarillo (`warn`) si 75–99%
  - Rojo (`danger`) si ≥ 100%
- **Lista de transacciones** — últimas 10 del mes, ordenadas por fecha desc

### Acciones
- Agregar transacción: bottom sheet con campos amount, type, category, description, date
- Editar/eliminar: swipe left en item de lista → botones inline
- Ver historial: scroll infinito o paginación simple

### API endpoints
```
GET    /api/finances?month=YYYY-MM        → { balance, transactions, budgets }
POST   /api/finances/transactions         → { id }
PATCH  /api/finances/transactions/:id     → { ok }
DELETE /api/finances/transactions/:id     → { ok }
GET    /api/finances/categories           → category[]
POST   /api/finances/budgets              → { id }
```

### Queries clave
- `getMonthBalance(month)` — SUM de income y expense del mes
- `getBudgetUsage(month)` — JOIN transactions + budgets por categoría
- `getRecentTransactions(month, limit)` — últimas N del mes

---

## 2. Tiempo (`/time`)

### Vista principal
- **Timer Pomodoro** — display grande mono con el tiempo restante, estado (foco/descanso)
- **Selector de tarea activa** — tap en el timer abre picker de tasks pendientes
- **Lista de tareas del día** — filtradas por `due_date = hoy` o sin fecha, ordenadas por prioridad
- **Métricas del día** — total minutos enfocados + número de pomodoros completados

### Comportamiento del timer
- Duración foco: 25 min (configurable en `.env` o hardcoded en store)
- Duración descanso: 5 min
- Al completar un bloque, insertar `time_block` con `start_at` y `end_at`
- Timer persiste en store (no reinicia si navegas a otro módulo)

### Acciones
- Agregar tarea: bottom sheet con title, project, priority, due_date, estimated_minutes
- Completar tarea: tap en checkbox → `status = 'done'`, `completed_at = now()`
- Iniciar/pausar timer: botón central

### API endpoints
```
GET    /api/time/tasks?date=YYYY-MM-DD    → task[]
POST   /api/time/tasks                    → { id }
PATCH  /api/time/tasks/:id                → { ok }
POST   /api/time/blocks                   → { id }
PATCH  /api/time/blocks/:id               → { ok }  (para cerrar bloque activo)
GET    /api/time/summary?date=YYYY-MM-DD  → { total_minutes, pomodoros }
```

---

## 3. Gym (`/gym`)

### Vista principal
- **Header del workout** — nombre del entrenamiento de hoy + duración transcurrida si hay sesión activa
- **Lista de sets** — agrupada por ejercicio, con peso × reps, badge PR si aplica
- **Historial** — tab o scroll para ver últimas 7 sesiones

### Lógica de PR
Al insertar un set, comparar `weight_kg` contra el máximo histórico del mismo ejercicio:
```sql
SELECT MAX(weight_kg) FROM sets
WHERE exercise_id = ? AND reps >= ?
```
Si el nuevo set supera el máximo → `is_pr = 1`

### Acciones
- Iniciar workout: crea registro en `workouts` con `date = hoy`
- Agregar set: bottom sheet con exercise (autocomplete), set_number, reps, weight_kg, rpe
- Finalizar workout: guarda `duration_minutes`

### API endpoints
```
GET    /api/gym/workouts?date=YYYY-MM-DD  → workout con sets
POST   /api/gym/workouts                  → { id }
PATCH  /api/gym/workouts/:id              → { ok }
POST   /api/gym/sets                      → { id, is_pr }
DELETE /api/gym/sets/:id                  → { ok }
GET    /api/gym/exercises                 → exercise[]
GET    /api/gym/prs                       → { exercise_id, max_weight, date }[]
```

---

## 4. Comidas (`/meals`)

### Vista principal
- **4 bloques de comida** — desayuno, comida, cena, snack — cada uno colapsable
- **Resumen de macros del día** — proteína / carbs / grasa en barras horizontales
- **Total calórico** — número grande mono

### Acciones
- Agregar alimento a comida: bottom sheet con buscador de `foods`, campo de gramos
- Agregar alimento nuevo a catálogo: form rápido con nombre + macros por 100g
- El cálculo de macros es automático: `(grams / 100) × macro_per_100g`

### API endpoints
```
GET    /api/meals?date=YYYY-MM-DD         → { meals, macros_summary }
POST   /api/meals                         → { id }
POST   /api/meals/:id/foods               → { id }
DELETE /api/meals/foods/:id               → { ok }
GET    /api/meals/foods/search?q=         → food[]
POST   /api/meals/foods                   → { id }  (crear alimento en catálogo)
```

---

## 5. Hábitos (`/habits`)

### Vista principal
- **Lista de hábitos** — cada uno con nombre, streak actual y checkbox de hoy
- **Mini calendar** — últimos 28 días en grid, estilo GitHub contributions
  - Celda vacía (`elevated`) = no completado
  - Celda llena (`accent`) = completado

### Cálculo de streak
Streak = días consecutivos completados hacia atrás desde hoy. Query:
```sql
-- Obtener logs ordenados DESC, contar días consecutivos hasta romper la cadena
SELECT date FROM habit_logs
WHERE habit_id = ? AND completed = 1
ORDER BY date DESC
```
Calcular en JS contando días contiguos desde hoy.

### Acciones
- Marcar/desmarcar hábito del día: tap en checkbox → upsert en `habit_logs`
- Agregar hábito: bottom sheet con name, frequency, color, icon
- Archivar hábito: `active = 0` (no eliminar, preserva historial)

### API endpoints
```
GET    /api/habits?date=YYYY-MM-DD        → { habits, logs_28_days }
POST   /api/habits/log                    → { ok }   (upsert de hoy)
DELETE /api/habits/log                    → { ok }   (desmarcar)
POST   /api/habits                        → { id }
PATCH  /api/habits/:id                    → { ok }
```

---

## QuickAdd (FAB global)

Botón flotante en todas las vistas. Al tap muestra bottom sheet con 5 opciones:
1. **+ transacción** → abre form de finanzas
2. **+ tarea** → abre form de tiempo
3. **+ set** → abre form de gym (requiere workout activo)
4. **+ comida** → abre form de meals
5. **✓ hábito** → muestra checkboxes de todos los hábitos del día

Implementar como componente global en `+layout.svelte`.
