import type { PageServerLoad } from './$types';
import { getWorkoutByDate, getWorkoutSets, getExercises, getLastWorkout } from '$lib/db/queries/gym';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	const workout = getWorkoutByDate(today);
	const sets = workout ? getWorkoutSets(workout.id) : [];
	const exercises = getExercises();
	const lastWorkout = getLastWorkout(today);

	return { today, workout, sets, exercises, lastWorkout };
};
