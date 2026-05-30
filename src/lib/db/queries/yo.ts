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

// ─── DAILY SCORE ───

export function calculateDailyScore(date: string) {
	const profile = getProfile();

	// 1. Sleep score (0-100): basado en si durmió a la hora target ± 30min
	const sleep = getSleepLog(date);
	let sleepScore = 0;
	if (sleep?.sleptAt) {
		const [targetH, targetM] = profile.sleepTarget.split(':').map(Number);
		const [actualH, actualM] = sleep.sleptAt.split(':').map(Number);
		const targetMin = targetH * 60 + targetM;
		let actualMin = actualH * 60 + actualM;
		if (actualMin < 12 * 60) actualMin += 24 * 60; // después de medianoche
		if (targetMin < 12 * 60) {} // target después de medianoche — no ajustar
		const diff = Math.abs(actualMin - (targetMin < 12 * 60 ? targetMin + 24 * 60 : targetMin));
		if (diff <= 15) sleepScore = 100;
		else if (diff <= 30) sleepScore = 80;
		else if (diff <= 60) sleepScore = 50;
		else sleepScore = 20;
	}

	// 2. Habits score: % completados hoy
	const habits = db.select().from(schema.habits).where(eq(schema.habits.active, 1)).all();
	const habitLogs = db.select().from(schema.habitLogs).where(and(
		eq(schema.habitLogs.date, date),
		eq(schema.habitLogs.completed, 1)
	)).all();
	const habitsScore = habits.length > 0 ? Math.round((habitLogs.length / habits.length) * 100) : 0;

	// 3. Focus score: minutos enfocados vs target
	const focusResult = db.select({
		totalMin: sql<number>`COALESCE(SUM((julianday(end_at) - julianday(start_at)) * 1440), 0)`
	}).from(schema.timeBlocks).where(and(
		like(schema.timeBlocks.startAt, `${date}%`),
		eq(schema.timeBlocks.type, 'focus'),
		sql`${schema.timeBlocks.endAt} IS NOT NULL`
	)).get();
	const focusMin = focusResult?.totalMin ?? 0;
	const focusTarget = profile.focusHoursTarget * 60;
	const focusScore = Math.min(100, Math.round((focusMin / focusTarget) * 100));

	// 4. Gym score: ¿entrenaste hoy? (binary 0 o 100)
	const workout = db.select().from(schema.workouts).where(eq(schema.workouts.date, date)).get();
	const gymScore = workout ? 100 : 0;

	// 5. Nutrition score: proteína vs target (lo más importante)
	const nutritionResult = db.select({
		protein: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.proteinPer100g}), 0)`,
		calories: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.caloriesPer100g}), 0)`
	}).from(schema.meals)
		.innerJoin(schema.mealFoods, eq(schema.meals.id, schema.mealFoods.mealId))
		.innerJoin(schema.foods, eq(schema.mealFoods.foodId, schema.foods.id))
		.where(eq(schema.meals.date, date))
		.get();
	const protein = nutritionResult?.protein ?? 0;
	const proteinPct = Math.min(100, Math.round((protein / profile.proteinTarget) * 100));
	const nutritionScore = proteinPct;

	// Total ponderado: sleep 20%, habits 25%, focus 25%, gym 15%, nutrition 15%
	const totalScore = Math.round(
		sleepScore * 0.20 +
		habitsScore * 0.25 +
		focusScore * 0.25 +
		gymScore * 0.15 +
		nutritionScore * 0.15
	);

	const xpEarned = xpFromScore(totalScore);

	// Upsert daily score
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
