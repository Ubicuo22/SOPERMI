import type { PageServerLoad } from './$types';
import { todayLocal } from '$lib/date';
import { getActiveHabits, getLogs28Days, getStreak } from '$lib/db/queries/habits';

export const load: PageServerLoad = async () => {
	const today = todayLocal();
	const habits = getActiveHabits();

	return {
		today,
		habits: habits.map(h => ({
			...h,
			streak: getStreak(h.id, today),
			logs: getLogs28Days(h.id, today)
		}))
	};
};
