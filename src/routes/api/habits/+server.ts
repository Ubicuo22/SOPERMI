import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { todayLocal } from '$lib/date';
import { getActiveHabits, getLogs28Days, getStreak, toggleHabitLog, createHabit } from '$lib/db/queries/habits';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date') || todayLocal();
	const habits = getActiveHabits();

	const habitsWithData = habits.map(h => ({
		...h,
		streak: getStreak(h.id, date),
		logs: getLogs28Days(h.id, date)
	}));

	return json({ data: habitsWithData });
};

export const POST: RequestHandler = async ({ request, url }) => {
	const action = url.searchParams.get('action');

	if (action === 'toggle') {
		const { habitId, date } = await request.json();
		const result = toggleHabitLog(habitId, date);
		return json({ data: result });
	}

	const body = await request.json();
	const result = createHabit(body);
	return json({ data: result });
};
