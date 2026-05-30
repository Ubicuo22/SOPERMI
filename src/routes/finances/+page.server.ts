import type { PageServerLoad } from './$types';
import { monthLocal } from '$lib/date';
import { getMonthBalance, getRecentTransactions, getBudgetUsage, getCategories, getQuickTransactions } from '$lib/db/queries/finances';

export const load: PageServerLoad = async ({ url }) => {
	const month = url.searchParams.get('month') || monthLocal();
	return {
		month,
		balance: getMonthBalance(month),
		transactions: getRecentTransactions(month),
		budgets: getBudgetUsage(month),
		categories: getCategories(),
		quick: getQuickTransactions()
	};
};
