import { db, schema } from '../index';
import { eq, and, desc, sql, gte, lt } from 'drizzle-orm';

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

export function deleteSet(id: number) {
	return db.delete(schema.sets).where(eq(schema.sets.id, id)).run();
}

// El workout más reciente ANTES de la fecha dada (para "repetir último")
export function getLastWorkout(beforeDate: string) {
	return db.select().from(schema.workouts)
		.where(lt(schema.workouts.date, beforeDate))
		.orderBy(desc(schema.workouts.date))
		.get();
}

// Crea el workout de hoy copiando la estructura (ejercicios + sets) del último.
// Los pesos/reps se copian como punto de partida; is_pr se recalcula al vuelo.
export function repeatLastWorkout(date: string) {
	const last = getLastWorkout(date);
	if (!last) return { created: false };

	const lastSets = db.select().from(schema.sets).where(eq(schema.sets.workoutId, last.id)).all();
	if (lastSets.length === 0) return { created: false };

	const newWorkout = createWorkout(date, last.name ?? undefined);
	for (const s of lastSets) {
		// copia sin marcar PR (es un punto de partida, no un logro nuevo)
		db.insert(schema.sets).values({
			workoutId: newWorkout.id,
			exerciseId: s.exerciseId,
			setNumber: s.setNumber,
			reps: s.reps,
			weightKg: s.weightKg,
			rpe: s.rpe,
			isPr: 0
		}).run();
	}
	return { created: true, workoutId: newWorkout.id, sets: lastSets.length };
}
