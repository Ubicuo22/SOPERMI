import { db, schema } from '../index';
import { eq, and, desc, sql, gte } from 'drizzle-orm';

export function getWorkoutByDate(date: string) {
	return db.select().from(schema.workouts)
		.where(eq(schema.workouts.date, date))
		.get();
}

export function getWorkoutSets(workoutId: number) {
	return db.select({
		id: schema.sets.id,
		exerciseId: schema.sets.exerciseId,
		exerciseName: schema.exercises.name,
		setNumber: schema.sets.setNumber,
		reps: schema.sets.reps,
		weightKg: schema.sets.weightKg,
		rpe: schema.sets.rpe,
		isPr: schema.sets.isPr
	}).from(schema.sets)
		.leftJoin(schema.exercises, eq(schema.sets.exerciseId, schema.exercises.id))
		.where(eq(schema.sets.workoutId, workoutId))
		.orderBy(schema.sets.exerciseId, schema.sets.setNumber)
		.all();
}

export function createWorkout(date: string, name?: string) {
	return db.insert(schema.workouts).values({ date, name }).returning({ id: schema.workouts.id }).get();
}

export function addSet(data: { workoutId: number; exerciseId: number; setNumber: number; reps?: number; weightKg?: number; rpe?: number }) {
	let isPr = 0;
	if (data.weightKg && data.reps) {
		const maxResult = db.select({
			maxWeight: sql<number>`MAX(weight_kg)`
		}).from(schema.sets)
			.where(and(
				eq(schema.sets.exerciseId, data.exerciseId),
				gte(schema.sets.reps, data.reps)
			))
			.get();

		if (!maxResult?.maxWeight || data.weightKg > maxResult.maxWeight) {
			isPr = 1;
		}
	}

	return db.insert(schema.sets).values({ ...data, isPr }).returning({ id: schema.sets.id, isPr: schema.sets.isPr }).get();
}

export function getExercises() {
	return db.select().from(schema.exercises).orderBy(schema.exercises.name).all();
}

export function createExercise(data: { name: string; muscleGroup?: string; type?: 'strength' | 'cardio' | 'mobility' }) {
	return db.insert(schema.exercises).values(data).returning({ id: schema.exercises.id }).get();
}

export function getRecentWorkouts(limit = 7) {
	return db.select().from(schema.workouts)
		.orderBy(desc(schema.workouts.date))
		.limit(limit)
		.all();
}
