import type { PageServerLoad } from './$types';
import { todayLocal } from '$lib/date';
import { getProfile, getRules, getActiveGoals, getDailyScore, calculateDailyScore, getScoreHistory, getSleepLog, getDailyCockpit, getGlobalStreak, getCurrentWeekInfo } from '$lib/db/queries/yo';

export const load: PageServerLoad = async () => {
	const today = todayLocal();
	const profile = getProfile();
	const rules = getRules();
	const goals = getActiveGoals();
	const score = getDailyScore(today) || calculateDailyScore(today);
	const scoreHistory = getScoreHistory();
	const sleep = getSleepLog(today);
	const cockpit = getDailyCockpit(today);
	const streak = getGlobalStreak(today);
	const weekInfo = getCurrentWeekInfo(today);

	return { today, profile, rules, goals, score, scoreHistory, sleep, cockpit, streak, weekInfo };
};
