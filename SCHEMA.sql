-- Personal Dashboard — SQLite Schema
-- Usar con better-sqlite3 + Drizzle ORM
-- Ejecutar en orden (foreign keys habilitadas)

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────
-- FINANZAS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT '#888888', -- hex
  type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
  icon        TEXT,                               -- tabler icon name
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  amount      REAL    NOT NULL,                   -- siempre positivo
  type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  date        TEXT    NOT NULL,                   -- ISO 8601: YYYY-MM-DD
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      REAL    NOT NULL,
  month       TEXT    NOT NULL,                   -- YYYY-MM
  UNIQUE(category_id, month)
);

-- ─────────────────────────────────────────
-- TIEMPO / TAREAS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT '#888888',
  client      TEXT,
  active      INTEGER NOT NULL DEFAULT 1,         -- boolean
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  title               TEXT    NOT NULL,
  project_id          INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  status              TEXT    NOT NULL DEFAULT 'pending'
                              CHECK(status IN ('pending', 'in_progress', 'done', 'cancelled')),
  priority            INTEGER NOT NULL DEFAULT 2  -- 1=alta 2=media 3=baja
                              CHECK(priority IN (1, 2, 3)),
  due_date            TEXT,                       -- YYYY-MM-DD
  estimated_minutes   INTEGER,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at        TEXT
);

CREATE TABLE IF NOT EXISTS time_blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id     INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  label       TEXT,                               -- descripción libre si no hay task
  type        TEXT    NOT NULL DEFAULT 'focus'
                      CHECK(type IN ('focus', 'break', 'free')),
  start_at    TEXT    NOT NULL,                   -- ISO 8601 datetime
  end_at      TEXT,                               -- NULL si aún activo
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────
-- GYM / ENTRENAMIENTO
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercises (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL UNIQUE,
  muscle_group  TEXT,                             -- chest, back, legs, shoulders, arms, core
  type          TEXT    NOT NULL DEFAULT 'strength'
                        CHECK(type IN ('strength', 'cardio', 'mobility')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workouts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  date              TEXT    NOT NULL,             -- YYYY-MM-DD
  name              TEXT,                         -- ej: "Push A", "Pull B"
  notes             TEXT,
  duration_minutes  INTEGER,
  created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id  INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  set_number  INTEGER NOT NULL DEFAULT 1,
  reps        INTEGER,
  weight_kg   REAL,
  duration_s  INTEGER,                            -- para cardio/tiempo
  rpe         REAL,                               -- 1-10, opcional
  is_pr       INTEGER NOT NULL DEFAULT 0,         -- boolean, calculado al insertar
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────
-- COMIDAS / NUTRICIÓN
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS foods (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT    NOT NULL,
  calories_per_100g   REAL    NOT NULL DEFAULT 0,
  protein_per_100g    REAL    NOT NULL DEFAULT 0,
  carbs_per_100g      REAL    NOT NULL DEFAULT 0,
  fat_per_100g        REAL    NOT NULL DEFAULT 0,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL,                   -- YYYY-MM-DD
  meal_type   TEXT    NOT NULL
                      CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  notes       TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meal_foods (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  meal_id     INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id     INTEGER NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  grams       REAL    NOT NULL
);

-- ─────────────────────────────────────────
-- HÁBITOS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  frequency   TEXT    NOT NULL DEFAULT 'daily'
                      CHECK(frequency IN ('daily', 'weekly')),
  color       TEXT    NOT NULL DEFAULT '#b8f240',
  icon        TEXT,                               -- tabler icon name
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id    INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date        TEXT    NOT NULL,                   -- YYYY-MM-DD
  completed   INTEGER NOT NULL DEFAULT 1,         -- boolean
  UNIQUE(habit_id, date)
);

-- ─────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category   ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status            ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due               ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_time_blocks_start       ON time_blocks(start_at);
CREATE INDEX IF NOT EXISTS idx_workouts_date           ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_sets_workout            ON sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise           ON sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_meals_date              ON meals(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date         ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit        ON habit_logs(habit_id);

-- ─────────────────────────────────────────
-- YO / IDENTIDAD / SISTEMA DE VIDA
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile (
  id          INTEGER PRIMARY KEY DEFAULT 1,    -- singleton
  name        TEXT    NOT NULL DEFAULT 'player',
  identity    TEXT,                              -- "soy alguien que..." — identidad aspiracional
  sleep_target TEXT   NOT NULL DEFAULT '23:00', -- hora objetivo de dormir (HH:MM)
  wake_target  TEXT   NOT NULL DEFAULT '06:30', -- hora objetivo de despertar
  focus_hours_target INTEGER NOT NULL DEFAULT 6,-- horas de trabajo profundo / día
  calories_target    INTEGER NOT NULL DEFAULT 2200,
  protein_target     INTEGER NOT NULL DEFAULT 150,
  water_liters       REAL    NOT NULL DEFAULT 2.5,
  gym_days_week      INTEGER NOT NULL DEFAULT 5,
  level       INTEGER NOT NULL DEFAULT 1,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  text        TEXT    NOT NULL,                  -- "no pantallas después de 22:00"
  category    TEXT    NOT NULL DEFAULT 'general' -- discipline, health, money, growth
                      CHECK(category IN ('discipline', 'health', 'money', 'growth', 'general')),
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,                  -- "pesar 75kg"
  category    TEXT    NOT NULL DEFAULT 'general'
                      CHECK(category IN ('body', 'mind', 'money', 'craft', 'general')),
  metric      TEXT,                              -- "kg", "$", "min", etc
  target_value REAL,                             -- valor objetivo numérico
  current_value REAL   NOT NULL DEFAULT 0,
  deadline    TEXT,                              -- YYYY-MM-DD
  status      TEXT    NOT NULL DEFAULT 'active'
                      CHECK(status IN ('active', 'completed', 'failed', 'paused')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS daily_scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL UNIQUE,           -- YYYY-MM-DD
  -- componentes del score (0-100 cada uno)
  sleep_score     INTEGER NOT NULL DEFAULT 0,   -- ¿dormiste a la hora target?
  habits_score    INTEGER NOT NULL DEFAULT 0,   -- % de hábitos completados
  focus_score     INTEGER NOT NULL DEFAULT 0,   -- minutos enfocados vs target
  gym_score       INTEGER NOT NULL DEFAULT 0,   -- ¿entrenaste hoy?
  nutrition_score INTEGER NOT NULL DEFAULT 0,   -- calorías/proteína vs target
  -- total ponderado
  total_score     INTEGER NOT NULL DEFAULT 0,   -- promedio ponderado 0-100
  xp_earned       INTEGER NOT NULL DEFAULT 0,   -- XP ganado ese día
  notes           TEXT,                          -- reflexión opcional
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL UNIQUE,           -- la fecha del día (no la noche)
  slept_at    TEXT,                              -- HH:MM que se durmió
  woke_at     TEXT,                              -- HH:MM que despertó
  quality     INTEGER CHECK(quality BETWEEN 1 AND 5), -- 1=terrible 5=excelente
  hours       REAL,                              -- calculado: woke - slept
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  week        TEXT    NOT NULL UNIQUE,           -- YYYY-WXX
  wins        TEXT,                              -- texto libre: qué salió bien
  lessons     TEXT,                              -- qué aprendí / qué ajustar
  focus_next  TEXT,                              -- prioridad de la semana que viene
  avg_score   INTEGER,                           -- promedio del total_score de la semana
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_daily_scores_date  ON daily_scores(date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date    ON sleep_logs(date);
CREATE INDEX IF NOT EXISTS idx_goals_status       ON goals(status);

-- ─────────────────────────────────────────
-- SEED — categorías por defecto
-- ─────────────────────────────────────────

INSERT OR IGNORE INTO categories (id, name, color, type, icon) VALUES
  (1, 'comida',       '#b8f240', 'expense', 'ti-salad'),
  (2, 'transporte',   '#f0a500', 'expense', 'ti-car'),
  (3, 'ocio',         '#ff4545', 'expense', 'ti-music'),
  (4, 'gym',          '#7aab1a', 'expense', 'ti-barbell'),
  (5, 'servicios',    '#888888', 'expense', 'ti-bolt'),
  (6, 'salud',        '#888888', 'expense', 'ti-heart'),
  (7, 'freelance',    '#b8f240', 'income',  'ti-briefcase'),
  (8, 'otros',        '#444444', 'expense', 'ti-dots');

INSERT OR IGNORE INTO projects (id, name, color, client) VALUES
  (1, 'Ubicuo Studio', '#b8f240', NULL),
  (2, 'Kinatia',       '#7aab1a', 'Tania Carbajal'),
  (3, 'No Date',       '#f0a500', NULL),
  (4, 'Personal',      '#888888', NULL);

INSERT OR IGNORE INTO habits (id, name, frequency, color, icon) VALUES
  (1, 'agua 2L',      'daily', '#b8f240', 'ti-droplet'),
  (2, 'leer 30min',   'daily', '#b8f240', 'ti-book'),
  (3, 'no azúcar',    'daily', '#f0a500', 'ti-x'),
  (4, 'dormir 23:00', 'daily', '#888888', 'ti-moon');
