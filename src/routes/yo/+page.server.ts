import type { PageServerLoad } from './$types';
import { getProfile, getRules, getActiveGoals, getDailyScore, calculateDailyScore, getScoreHistory, getSleepLog } from '$lib/db/queries/yo';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	const profile = getProfile();
	const rules = getRules();
	const goals = getActiveGoals();
	const score = getDailyScore(today) || calculateDailyScore(today);
	const scoreHistory = getScoreHistory();
	const sleep = getSleepLog(today);

	return { today, profile, rules, goals, score, scoreHistory, sleep };
};
