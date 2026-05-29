import { db, schema } from '../index';
import { eq, and, like, desc, isNull, sql } from 'drizzle-orm';

export function getTasksByDate(date: string) {
	return db.select().from(schema.tasks)
		.where(and(
			eq(schema.tasks.status, 'pending'),
		))
		.orderBy(schema.tasks.priority, desc(schema.tasks.createdAt))
		.all();
}

export function createTask(data: { title: string; projectId?: number; priority?: number; dueDate?: string; estimatedMinutes?: number }) {
	return db.insert(schema.tasks).values(data).returning({ id: schema.tasks.id }).get();
}

export function completeTask(id: number) {
	return db.update(schema.tasks)
		.set({ status: 'done', completedAt: new Date().toISOString() })
		.where(eq(schema.tasks.id, id))
		.run();
}

export function startTimeBlock(taskId: number | null, label?: string) {
	return db.insert(schema.timeBlocks).values({
		taskId,
		label,
		type: 'focus',
		startAt: new Date().toISOString()
	}).returning({ id: schema.timeBlocks.id }).get();
}

export function endTimeBlock(id: number) {
	return db.update(schema.timeBlocks)
		.set({ endAt: new Date().toISOString() })
		.where(eq(schema.timeBlocks.id, id))
		.run();
}

export function getDaySummary(date: string) {
	const result = db.select({
		totalMinutes: sql<number>`COALESCE(SUM((julianday(end_at) - julianday(start_at)) * 1440), 0)`,
		blocks: sql<number>`COUNT(*)`
	}).from(schema.timeBlocks)
		.where(and(
			like(schema.timeBlocks.startAt, `${date}%`),
			eq(schema.timeBlocks.type, 'focus'),
			sql`${schema.timeBlocks.endAt} IS NOT NULL`
		))
		.get();

	return {
		totalMinutes: Math.round(result?.totalMinutes ?? 0),
		pomodoros: Math.floor((result?.totalMinutes ?? 0) / 25)
	};
}
