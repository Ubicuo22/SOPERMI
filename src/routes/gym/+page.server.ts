import type { PageServerLoad } from './$types';
import { todayLocal } from '$lib/date';
import { getWorkoutByDate, getWorkoutSets, getExercises, getLastWorkout } from '$lib/db/queries/gym';

export const load: PageServerLoad = async () => {
	const today = todayLocal();
	const workout = getWorkoutByDate(today);
	const sets = workout ? getWorkoutSets(workout.id) : [];
	const exercises = getExercises();
	const lastWorkout = getLastWorkout(today);

	return { today, workout, sets, exercises, lastWorkout };
};
