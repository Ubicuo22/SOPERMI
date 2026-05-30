import type { PageServerLoad } from './$types';
import { getMealsByDate, getDayMacros, getYesterdayMealTypes } from '$lib/db/queries/meals';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	return {
		today,
		meals: getMealsByDate(today),
		macros: getDayMacros(today),
		yesterdayTypes: getYesterdayMealTypes(today)
	};
};
