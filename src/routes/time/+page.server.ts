import type { PageServerLoad } from './$types';
import { getTasksByDate, getDaySummary } from '$lib/db/queries/time';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	return {
		today,
		tasks: getTasksByDate(today),
		summary: getDaySummary(today)
	};
};
