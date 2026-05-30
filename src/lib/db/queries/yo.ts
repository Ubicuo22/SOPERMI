import { db, schema } from '../index';
import { eq, and, desc, gte, lte, like, sql } from 'drizzle-orm';

// ─── LEVEL SYSTEM ───
// XP por nivel: nivel N requiere N * 100 XP acumulado
// Score 80+ = 30 XP, 60-79 = 20 XP, 40-59 = 10 XP, <40 = 5 XP
function xpFromScore(score: number): number {
	if (score >= 80) return 30;
	if (score >= 60) return 20;
	if (score >= 40) return 10;
	return 5;
}

function levelFromXp(xp: number): number {
	let level = 1;
	let required = 100;
	while (xp >= required) {
		level++;
		required += level * 100;
	}
	return level;
}

function xpForNextLevel(currentXp: number): { current: number; needed: number; progress: number } {
	let accumulated = 0;
	let level = 1;
	while (true) {
		const needed = level * 100;
		if (currentXp < accumulated + needed) {
			const current = currentXp - accumulated;
			return { current, needed, progress: Math.round((current / needed) * 100) };
		}
		accumulated += needed;
		level++;
	}
}

// ─── PROFILE ───

export function getProfile() {
	let profile = db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get();
	if (!profile) {
		db.insert(schema.profile).values({ id: 1 }).run();
		profile = db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get()!;
	}
	const xpInfo = xpForNextLevel(profile.totalXp);
	return { ...profile, xpInfo };
}

export function updateProfile(data: Partial<{
	name: string;
	identity: string;
	sleepTarget: string;
	wakeTarget: string;
	focusHoursTarget: number;
	caloriesTarget: number;
	proteinTarget: number;
	waterLiters: number;
	gymDaysWeek: number;
}>) {
	return db.update(schema.profile).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(schema.profile.id, 1)).run();
}

// ─── RULES ───

export function getRules() {
	return db.select().from(schema.rules).where(eq(schema.rules.active, 1)).orderBy(schema.rules.sortOrder).all();
}

export function createRule(data: { text: string; category?: string }) {
	return db.insert(schema.rules).values(data).returning({ id: schema.rules.id }).get();
}

export function deleteRule(id: number) {
	return db.update(schema.rules).set({ active: 0 }).where(eq(schema.rules.id, id)).run();
}

// ─── GOALS ───

export function getActiveGoals() {
	return db.select().from(schema.goals).where(eq(schema.goals.status, 'active')).orderBy(schema.goals.deadline).all();
}

export function createGoal(data: { title: string; category?: string; metric?: string; targetValue?: number; deadline?: string }) {
	return db.insert(schema.goals).values(data).returning({ id: schema.goals.id }).get();
}

export function updateGoalProgress(id: number, currentValue: number) {
	const goal = db.select().from(schema.goals).where(eq(schema.goals.id, id)).get();
	if (!goal) return;

	const updates: Record<string, unknown> = { currentValue };
	if (goal.targetValue && currentValue >= goal.targetValue) {
		updates.status = 'completed';
		updates.completedAt = new Date().toISOString();
	}
	return db.update(schema.goals).set(updates).where(eq(schema.goals.id, id)).run();
}

// ─── SLEEP ───

export function logSleep(date: string, sleptAt: string, wokeAt: string, quality?: number) {
	const hours = calculateSleepHours(sleptAt, wokeAt);
	const existing = db.select().from(schema.sleepLogs).where(eq(schema.sleepLogs.date, date)).get();
	if (existing) {
		return db.update(schema.sleepLogs).set({ sleptAt, wokeAt, quality, hours }).where(eq(schema.sleepLogs.id, existing.id)).run();
	}
	return db.insert(schema.sleepLogs).values({ date, sleptAt, wokeAt, quality, hours }).run();
}

function calculateSleepHours(sleptAt: string, wokeAt: string): number {
	const [sh, sm] = sleptAt.split(':').map(Number);
	const [wh, wm] = wokeAt.split(':').map(Number);
	let sleptMinutes = sh * 60 + sm;
	let wokeMinutes = wh * 60 + wm;
	if (wokeMinutes <= sleptMinutes) wokeMinutes += 24 * 60;
	return Math.round(((wokeMinutes - sleptMinutes) / 60) * 10) / 10;
}

export function getSleepLog(date: string) {
	return db.select().from(schema.sleepLogs).where(eq(schema.sleepLogs.date, date)).get();
}

export function getRecentSleep(days = 7) {
	return db.select().from(schema.sleepLogs).orderBy(desc(schema.sleepLogs.date)).limit(days).all();
}

// ─── DAILY COCKPIT — the real magic ───

export function getDailyCockpit(date: string) {
	const profile = getProfile();

	// Sleep
	const sleep = getSleepLog(date);
	const sleepDone = !!sleep?.sleptAt;

	// Habits
	const allHabits = db.select().from(schema.habits).where(eq(schema.habits.active, 1)).all();
	const completedHabits = db.select().from(schema.habitLogs).where(and(
		eq(schema.habitLogs.date, date),
		eq(schema.habitLogs.completed, 1)
	)).all();
	const completedHabitIds = new Set(completedHabits.map(l => l.habitId));

	// Focus
	const focusResult = db.select({
		totalMin: sql<number>`COALESCE(SUM((julianday(end_at) - julianday(start_at)) * 1440), 0)`
	}).from(schema.timeBlocks).where(and(
		like(schema.timeBlocks.startAt, `${date}%`),
		eq(schema.timeBlocks.type, 'focus'),
		sql`${schema.timeBlocks.endAt} IS NOT NULL`
	)).get();
	const focusMinutes = Math.round(focusResult?.totalMin ?? 0);
	const focusTarget = profile.focusHoursTarget * 60;

	// Gym
	const workout = db.select().from(schema.workouts).where(eq(schema.workouts.date, date)).get();
	const workoutDone = !!workout;

	// Nutrition
	const nutritionResult = db.select({
		protein: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.proteinPer100g}), 0)`,
		calories: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.caloriesPer100g}), 0)`
	}).from(schema.meals)
		.innerJoin(schema.mealFoods, eq(schema.meals.id, schema.mealFoods.mealId))
		.innerJoin(schema.foods, eq(schema.mealFoods.foodId, schema.foods.id))
		.where(eq(schema.meals.date, date))
		.get();
	const protein = Math.round(nutritionResult?.protein ?? 0);
	const calories = Math.round(nutritionResult?.calories ?? 0);

	// Pending tasks
	const pendingTasks = db.select().from(schema.tasks)
		.where(eq(schema.tasks.status, 'pending'))
		.orderBy(schema.tasks.priority)
		.limit(5)
		.all();

	// Build checklist items
	const checklist = [
		{
			id: 'sleep',
			label: 'registrar sueño',
			done: sleepDone,
			detail: sleep ? `${sleep.hours}h (${sleep.sleptAt} → ${sleep.wokeAt})` : null
		},
		...allHabits.map(h => ({
			id: `habit-${h.id}`,
			label: h.name,
			done: completedHabitIds.has(h.id),
			detail: null
		})),
		{
			id: 'focus',
			label: `foco (${focusMinutes}/${focusTarget} min)`,
			done: focusMinutes >= focusTarget,
			detail: focusMinutes > 0 ? `${Math.round(focusMinutes / 25)} pomodoros` : null
		},
		{
			id: 'gym',
			label: 'entrenar',
			done: workoutDone,
			detail: workout ? `workout activo` : null
		},
		{
			id: 'protein',
			label: `proteína (${protein}/${profile.proteinTarget}g)`,
			done: protein >= profile.proteinTarget,
			detail: `${calories} kcal`
		}
	];

	const totalItems = checklist.length;
	const doneItems = checklist.filter(c => c.done).length;
	const completionPct = Math.round((doneItems / totalItems) * 100);

	return {
		checklist,
		completionPct,
		doneItems,
		totalItems,
		pendingTasks,
		focusMinutes,
		protein,
		calories
	};
}

// ─── DAILY SCORE ───

export function calculateDailyScore(date: string) {
	const profile = getProfile();

	// 1. Sleep score
	const sleep = getSleepLog(date);
	let sleepScore = 0;
	if (sleep?.sleptAt) {
		const [targetH, targetM] = profile.sleepTarget.split(':').map(Number);
		const [actualH, actualM] = sleep.sleptAt.split(':').map(Number);
		let targetMin = targetH * 60 + targetM;
		let actualMin = actualH * 60 + actualM;
		// Normalize for late-night times (after midnight)
		if (targetMin >= 12 * 60) targetMin -= 24 * 60;
		if (actualMin >= 12 * 60) actualMin -= 24 * 60;
		const diff = Math.abs(actualMin - targetMin);
		if (diff <= 15) sleepScore = 100;
		else if (diff <= 30) sleepScore = 80;
		else if (diff <= 60) sleepScore = 50;
		else sleepScore = 20;
	}

	// 2. Habits score
	const habits = db.select().from(schema.habits).where(eq(schema.habits.active, 1)).all();
	const habitLogs = db.select().from(schema.habitLogs).where(and(
		eq(schema.habitLogs.date, date),
		eq(schema.habitLogs.completed, 1)
	)).all();
	const habitsScore = habits.length > 0 ? Math.round((habitLogs.length / habits.length) * 100) : 0;

	// 3. Focus score
	const focusResult = db.select({
		totalMin: sql<number>`COALESCE(SUM((julianday(end_at) - julianday(start_at)) * 1440), 0)`
	}).from(schema.timeBlocks).where(and(
		like(schema.timeBlocks.startAt, `${date}%`),
		eq(schema.timeBlocks.type, 'focus'),
		sql`${schema.timeBlocks.endAt} IS NOT NULL`
	)).get();
	const focusMin = focusResult?.totalMin ?? 0;
	const focusTarget = profile.focusHoursTarget * 60;
	const focusScore = focusTarget > 0 ? Math.min(100, Math.round((focusMin / focusTarget) * 100)) : 0;

	// 4. Gym score
	const workout = db.select().from(schema.workouts).where(eq(schema.workouts.date, date)).get();
	const gymScore = workout ? 100 : 0;

	// 5. Nutrition score
	const nutritionResult = db.select({
		protein: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.proteinPer100g}), 0)`
	}).from(schema.meals)
		.innerJoin(schema.mealFoods, eq(schema.meals.id, schema.mealFoods.mealId))
		.innerJoin(schema.foods, eq(schema.mealFoods.foodId, schema.foods.id))
		.where(eq(schema.meals.date, date))
		.get();
	const protein = nutritionResult?.protein ?? 0;
	const nutritionScore = profile.proteinTarget > 0 ? Math.min(100, Math.round((protein / profile.proteinTarget) * 100)) : 0;

	// Total ponderado
	const totalScore = Math.round(
		sleepScore * 0.20 +
		habitsScore * 0.25 +
		focusScore * 0.25 +
		gymScore * 0.15 +
		nutritionScore * 0.15
	);

	const xpEarned = xpFromScore(totalScore);

	// Upsert
	const existing = db.select().from(schema.dailyScores).where(eq(schema.dailyScores.date, date)).get();
	if (existing) {
		db.update(schema.dailyScores).set({
			sleepScore, habitsScore, focusScore, gymScore, nutritionScore, totalScore, xpEarned
		}).where(eq(schema.dailyScores.id, existing.id)).run();
	} else {
		db.insert(schema.dailyScores).values({
			date, sleepScore, habitsScore, focusScore, gymScore, nutritionScore, totalScore, xpEarned
		}).run();
	}

	// Update XP and level
	const allXp = db.select({ total: sql<number>`COALESCE(SUM(xp_earned), 0)` }).from(schema.dailyScores).get();
	const totalXp = allXp?.total ?? 0;
	const newLevel = levelFromXp(totalXp);
	db.update(schema.profile).set({ totalXp, level: newLevel }).where(eq(schema.profile.id, 1)).run();

	return { sleepScore, habitsScore, focusScore, gymScore, nutritionScore, totalScore, xpEarned };
}

export function getDailyScore(date: string) {
	return db.select().from(schema.dailyScores).where(eq(schema.dailyScores.date, date)).get();
}

export function getScoreHistory(days = 14) {
	return db.select().from(schema.dailyScores).orderBy(desc(schema.dailyScores.date)).limit(days).all();
}

// ─── STREAKS GLOBALES ───

export function getGlobalStreak(): number {
	const scores = db.select({ date: schema.dailyScores.date, totalScore: schema.dailyScores.totalScore })
		.from(schema.dailyScores)
		.orderBy(desc(schema.dailyScores.date))
		.all();

	let streak = 0;
	const today = new Date();
	for (const s of scores) {
		const expected = new Date(today);
		expected.setDate(expected.getDate() - streak);
		const expectedStr = expected.toISOString().split('T')[0];
		if (s.date === expectedStr && s.totalScore >= 40) {
			streak++;
		} else {
			break;
		}
	}
	return streak;
}

// ─── WEEKLY REVIEW ───

export function getWeeklyReview(week: string) {
	return db.select().from(schema.weeklyReviews).where(eq(schema.weeklyReviews.week, week)).get();
}

export function saveWeeklyReview(data: { week: string; wins?: string; lessons?: string; focusNext?: string; avgScore?: number }) {
	const existing = db.select().from(schema.weeklyReviews).where(eq(schema.weeklyReviews.week, data.week)).get();
	if (existing) {
		return db.update(schema.weeklyReviews).set(data).where(eq(schema.weeklyReviews.id, existing.id)).run();
	}
	return db.insert(schema.weeklyReviews).values(data).run();
}

export { xpForNextLevel, levelFromXp };
