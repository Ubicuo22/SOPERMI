import type { PageServerLoad } from './$types';
import { todayLocal } from '$lib/date';
import { getTasksByDate, getDaySummary } from '$lib/db/queries/time';

export const load: PageServerLoad = async () => {
	const today = todayLocal();
	return {
		today,
		tasks: getTasksByDate(today),
		summary: getDaySummary(today)
	};
};
