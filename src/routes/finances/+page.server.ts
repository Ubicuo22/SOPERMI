import type { PageServerLoad } from './$types';
import { getMonthBalance, getRecentTransactions, getBudgetUsage, getCategories, getQuickTransactions } from '$lib/db/queries/finances';

export const load: PageServerLoad = async ({ url }) => {
	const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
	return {
		month,
		balance: getMonthBalance(month),
		transactions: getRecentTransactions(month),
		budgets: getBudgetUsage(month),
		categories: getCategories(),
		quick: getQuickTransactions()
	};
};
