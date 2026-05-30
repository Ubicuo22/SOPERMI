import { db, schema } from '../index';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { addDaysLocal } from '../../date';

export function getActiveHabits() {
	return db.select().from(schema.habits).where(eq(schema.habits.active, 1)).all();
}

export function getLogs28Days(habitId: number, today: string) {
	const startStr = addDaysLocal(today, -27);

	return db.select().from(schema.habitLogs)
		.where(and(
			eq(schema.habitLogs.habitId, habitId),
			gte(schema.habitLogs.date, startStr),
			lte(schema.habitLogs.date, today)
		))
		.all();
}

export function getStreak(habitId: number, today: string): number {
	const logs = db.select({ date: schema.habitLogs.date })
		.from(schema.habitLogs)
		.where(and(
			eq(schema.habitLogs.habitId, habitId),
			eq(schema.habitLogs.completed, 1)
		))
		.orderBy(desc(schema.habitLogs.date))
		.all();

	let streak = 0;
	let expected = today;

	for (const log of logs) {
		if (log.date === expected) {
			streak++;
			expected = addDaysLocal(expected, -1);
		} else {
			break;
		}
	}

	return streak;
}

export function toggleHabitLog(habitId: number, date: string) {
	const existing = db.select().from(schema.habitLogs)
		.where(and(
			eq(schema.habitLogs.habitId, habitId),
			eq(schema.habitLogs.date, date)
		)).get();

	if (existing) {
		db.delete(schema.habitLogs).where(eq(schema.habitLogs.id, existing.id)).run();
		return { completed: false };
	} else {
		db.insert(schema.habitLogs).values({ habitId, date, completed: 1 }).run();
		return { completed: true };
	}
}

export function createHabit(data: { name: string; frequency?: 'daily' | 'weekly'; color?: string; icon?: string }) {
	return db.insert(schema.habits).values(data).returning({ id: schema.habits.id }).get();
}
