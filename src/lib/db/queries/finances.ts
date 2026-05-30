import { db, schema } from '../index';
import { eq, and, like, desc, sql } from 'drizzle-orm';

export function getMonthBalance(month: string) {
	const result = db.select({
		income: sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)`,
		expense: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)`
	}).from(schema.transactions)
		.where(like(schema.transactions.date, `${month}%`))
		.get();

	return {
		income: result?.income ?? 0,
		expense: result?.expense ?? 0,
		balance: (result?.income ?? 0) - (result?.expense ?? 0)
	};
}

export function getRecentTransactions(month: string, limit = 10) {
	return db.select({
		id: schema.transactions.id,
		amount: schema.transactions.amount,
		type: schema.transactions.type,
		description: schema.transactions.description,
		date: schema.transactions.date,
		categoryId: schema.transactions.categoryId,
		categoryName: schema.categories.name,
		categoryColor: schema.categories.color,
		categoryIcon: schema.categories.icon
	}).from(schema.transactions)
		.leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
		.where(like(schema.transactions.date, `${month}%`))
		.orderBy(desc(schema.transactions.date), desc(schema.transactions.id))
		.limit(limit)
		.all();
}

export function getBudgetUsage(month: string) {
	return db.select({
		categoryId: schema.budgets.categoryId,
		categoryName: schema.categories.name,
		categoryColor: schema.categories.color,
		budgetAmount: schema.budgets.amount,
		spent: sql<number>`COALESCE(SUM(${schema.transactions.amount}), 0)`
	}).from(schema.budgets)
		.leftJoin(schema.categories, eq(schema.budgets.categoryId, schema.categories.id))
		.leftJoin(schema.transactions, and(
			eq(schema.transactions.categoryId, schema.budgets.categoryId),
			like(schema.transactions.date, `${month}%`)
		))
		.where(eq(schema.budgets.month, month))
		.groupBy(schema.budgets.id)
		.all();
}

export function createTransaction(data: { amount: number; type: 'income' | 'expense'; categoryId?: number; description?: string; date: string }) {
	return db.insert(schema.transactions).values(data).returning({ id: schema.transactions.id }).get();
}

export function deleteTransaction(id: number) {
	return db.delete(schema.transactions).where(eq(schema.transactions.id, id)).run();
}

export function getCategories() {
	return db.select().from(schema.categories).all();
}

// Transacciones rápidas: las combinaciones (descripción + monto + categoría)
// más frecuentes del historial, para registrar con 1 tap.
export function getQuickTransactions(limit = 6) {
	return db.select({
		amount: schema.transactions.amount,
		type: schema.transactions.type,
		categoryId: schema.transactions.categoryId,
		description: schema.transactions.description,
		categoryName: schema.categories.name,
		count: sql<number>`COUNT(*)`
	}).from(schema.transactions)
		.leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
		.where(sql`${schema.transactions.description} IS NOT NULL AND ${schema.transactions.description} != ''`)
		.groupBy(schema.transactions.description, schema.transactions.amount, schema.transactions.categoryId, schema.transactions.type)
		.having(sql`COUNT(*) >= 2`)
		.orderBy(desc(sql`COUNT(*)`))
		.limit(limit)
		.all();
}
