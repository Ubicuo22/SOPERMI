import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMonthBalance, getRecentTransactions, getBudgetUsage, createTransaction, deleteTransaction, getCategories } from '$lib/db/queries/finances';

export const GET: RequestHandler = async ({ url }) => {
	const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
	const action = url.searchParams.get('action');

	if (action === 'categories') {
		return json({ data: getCategories() });
	}

	const balance = getMonthBalance(month);
	const transactions = getRecentTransactions(month);
	const budgets = getBudgetUsage(month);

	return json({ data: { balance, transactions, budgets } });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const result = createTransaction(body);
	return json({ data: result });
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = parseInt(url.searchParams.get('id') || '0');
	if (!id) return json({ error: 'id requerido' }, { status: 400 });
	deleteTransaction(id);
	return json({ data: { ok: true } });
};
