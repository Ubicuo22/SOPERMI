import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { todayLocal } from '$lib/date';
import { getTasksByDate, createTask, completeTask, startTimeBlock, endTimeBlock, getDaySummary } from '$lib/db/queries/time';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date') || todayLocal();
	const action = url.searchParams.get('action');

	if (action === 'summary') {
		return json({ data: getDaySummary(date) });
	}

	const tasks = getTasksByDate(date);
	const summary = getDaySummary(date);
	return json({ data: { tasks, summary } });
};

export const POST: RequestHandler = async ({ request, url }) => {
	const action = url.searchParams.get('action');
	const body = await request.json();

	if (action === 'complete') {
		completeTask(body.id);
		return json({ data: { ok: true } });
	}

	if (action === 'start-block') {
		const result = startTimeBlock(body.taskId, body.label);
		return json({ data: result });
	}

	if (action === 'end-block') {
		endTimeBlock(body.id);
		return json({ data: { ok: true } });
	}

	const result = createTask(body);
	return json({ data: result });
};
