import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getProfile, updateProfile,
	getRules, createRule, deleteRule,
	getActiveGoals, createGoal, updateGoalProgress,
	logSleep, getSleepLog, getRecentSleep,
	calculateDailyScore, getDailyScore, getScoreHistory,
	getWeeklyReview, saveWeeklyReview
} from '$lib/db/queries/yo';

export const GET: RequestHandler = async ({ url }) => {
	const action = url.searchParams.get('action');
	const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

	if (action === 'profile') {
		return json({ data: getProfile() });
	}

	if (action === 'rules') {
		return json({ data: getRules() });
	}

	if (action === 'goals') {
		return json({ data: getActiveGoals() });
	}

	if (action === 'sleep') {
		return json({ data: { today: getSleepLog(date), recent: getRecentSleep() } });
	}

	if (action === 'score') {
		const score = getDailyScore(date);
		const history = getScoreHistory();
		return json({ data: { score, history } });
	}

	if (action === 'calculate') {
		const score = calculateDailyScore(date);
		const profile = getProfile();
		return json({ data: { score, profile } });
	}

	if (action === 'review') {
		const week = url.searchParams.get('week') || '';
		return json({ data: getWeeklyReview(week) });
	}

	// Default: everything for the YO page
	const profile = getProfile();
	const rules = getRules();
	const goals = getActiveGoals();
	const score = getDailyScore(date) || calculateDailyScore(date);
	const scoreHistory = getScoreHistory();
	const sleep = getSleepLog(date);

	return json({ data: { profile, rules, goals, score, scoreHistory, sleep, date } });
};

export const POST: RequestHandler = async ({ request, url }) => {
	const action = url.searchParams.get('action');
	const body = await request.json();

	if (action === 'profile') {
		updateProfile(body);
		return json({ data: { ok: true } });
	}

	if (action === 'rule') {
		const result = createRule(body);
		return json({ data: result });
	}

	if (action === 'delete-rule') {
		deleteRule(body.id);
		return json({ data: { ok: true } });
	}

	if (action === 'goal') {
		const result = createGoal(body);
		return json({ data: result });
	}

	if (action === 'goal-progress') {
		updateGoalProgress(body.id, body.currentValue);
		return json({ data: { ok: true } });
	}

	if (action === 'sleep') {
		logSleep(body.date, body.sleptAt, body.wokeAt, body.quality);
		return json({ data: { ok: true } });
	}

	if (action === 'review') {
		saveWeeklyReview(body);
		return json({ data: { ok: true } });
	}

	return json({ error: 'action requerida' }, { status: 400 });
};
