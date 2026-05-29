import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	color: text('color').notNull().default('#888888'),
	type: text('type', { enum: ['income', 'expense'] }).notNull(),
	icon: text('icon'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const transactions = sqliteTable('transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	amount: real('amount').notNull(),
	type: text('type', { enum: ['income', 'expense'] }).notNull(),
	categoryId: integer('category_id').references(() => categories.id),
	description: text('description'),
	date: text('date').notNull(),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const budgets = sqliteTable('budgets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	categoryId: integer('category_id').notNull().references(() => categories.id),
	amount: real('amount').notNull(),
	month: text('month').notNull()
});

export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	color: text('color').notNull().default('#888888'),
	client: text('client'),
	active: integer('active').notNull().default(1),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const tasks = sqliteTable('tasks', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	projectId: integer('project_id').references(() => projects.id),
	status: text('status', { enum: ['pending', 'in_progress', 'done', 'cancelled'] }).notNull().default('pending'),
	priority: integer('priority').notNull().default(2),
	dueDate: text('due_date'),
	estimatedMinutes: integer('estimated_minutes'),
	createdAt: text('created_at').notNull().default("(datetime('now'))"),
	completedAt: text('completed_at')
});

export const timeBlocks = sqliteTable('time_blocks', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	taskId: integer('task_id').references(() => tasks.id),
	label: text('label'),
	type: text('type', { enum: ['focus', 'break', 'free'] }).notNull().default('focus'),
	startAt: text('start_at').notNull(),
	endAt: text('end_at'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const exercises = sqliteTable('exercises', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	muscleGroup: text('muscle_group'),
	type: text('type', { enum: ['strength', 'cardio', 'mobility'] }).notNull().default('strength'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const workouts = sqliteTable('workouts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(),
	name: text('name'),
	notes: text('notes'),
	durationMinutes: integer('duration_minutes'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const sets = sqliteTable('sets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	workoutId: integer('workout_id').notNull().references(() => workouts.id),
	exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
	setNumber: integer('set_number').notNull().default(1),
	reps: integer('reps'),
	weightKg: real('weight_kg'),
	durationS: integer('duration_s'),
	rpe: real('rpe'),
	isPr: integer('is_pr').notNull().default(0),
	notes: text('notes'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const foods = sqliteTable('foods', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	caloriesPer100g: real('calories_per_100g').notNull().default(0),
	proteinPer100g: real('protein_per_100g').notNull().default(0),
	carbsPer100g: real('carbs_per_100g').notNull().default(0),
	fatPer100g: real('fat_per_100g').notNull().default(0),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const meals = sqliteTable('meals', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	date: text('date').notNull(),
	mealType: text('meal_type', { enum: ['breakfast', 'lunch', 'dinner', 'snack'] }).notNull(),
	notes: text('notes'),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const mealFoods = sqliteTable('meal_foods', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	mealId: integer('meal_id').notNull().references(() => meals.id),
	foodId: integer('food_id').notNull().references(() => foods.id),
	grams: real('grams').notNull()
});

export const habits = sqliteTable('habits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	frequency: text('frequency', { enum: ['daily', 'weekly'] }).notNull().default('daily'),
	color: text('color').notNull().default('#b8f240'),
	icon: text('icon'),
	active: integer('active').notNull().default(1),
	createdAt: text('created_at').notNull().default("(datetime('now'))")
});

export const habitLogs = sqliteTable('habit_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	habitId: integer('habit_id').notNull().references(() => habits.id),
	date: text('date').notNull(),
	completed: integer('completed').notNull().default(1)
});
