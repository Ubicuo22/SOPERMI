import type { PageServerLoad } from './$types';
import { getProfile, getRules, getActiveGoals, getDailyScore, calculateDailyScore, getScoreHistory, getSleepLog, getDailyCockpit, getGlobalStreak, getCurrentWeekInfo } from '$lib/db/queries/yo';

export const load: PageServerLoad = async () => {
	const today = new Date().toISOString().split('T')[0];
	const profile = getProfile();
	const rules = getRules();
	const goals = getActiveGoals();
	const score = getDailyScore(today) || calculateDailyScore(today);
	const scoreHistory = getScoreHistory();
	const sleep = getSleepLog(today);
	const cockpit = getDailyCockpit(today);
	const streak = getGlobalStreak();
	const weekInfo = getCurrentWeekInfo(today);

	return { today, profile, rules, goals, score, scoreHistory, sleep, cockpit, streak, weekInfo };
};
