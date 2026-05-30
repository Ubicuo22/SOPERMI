import type { PageServerLoad } from './$types';
import { todayLocal } from '$lib/date';
import { getMealsByDate, getDayMacros, getYesterdayMealTypes } from '$lib/db/queries/meals';

export const load: PageServerLoad = async () => {
	const today = todayLocal();
	return {
		today,
		meals: getMealsByDate(today),
		macros: getDayMacros(today),
		yesterdayTypes: getYesterdayMealTypes(today)
	};
};
