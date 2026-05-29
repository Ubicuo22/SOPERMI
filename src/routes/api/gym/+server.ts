import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getWorkoutByDate, getWorkoutSets, createWorkout, addSet, getExercises, createExercise, getRecentWorkouts } from '$lib/db/queries/gym';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
	const action = url.searchParams.get('action');

	if (action === 'exercises') {
		return json({ data: getExercises() });
	}

	if (action === 'history') {
		return json({ data: getRecentWorkouts() });
	}

	const workout = getWorkoutByDate(date);
	const sets = workout ? getWorkoutSets(workout.id) : [];
	return json({ data: { workout, sets } });
};

export const POST: RequestHandler = async ({ request, url }) => {
	const action = url.searchParams.get('action');
	const body = await request.json();

	if (action === 'workout') {
		const result = createWorkout(body.date, body.name);
		return json({ data: result });
	}

	if (action === 'set') {
		const result = addSet(body);
		return json({ data: result });
	}

	if (action === 'exercise') {
		const result = createExercise(body);
		return json({ data: result });
	}

	return json({ error: 'action requerida' }, { status: 400 });
};
