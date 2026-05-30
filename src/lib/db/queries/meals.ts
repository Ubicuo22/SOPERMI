import { db, schema } from '../index';
import { eq, and, like, desc, sql } from 'drizzle-orm';

export function getMealsByDate(date: string) {
	const meals = db.select().from(schema.meals)
		.where(eq(schema.meals.date, date))
		.all();

	return meals.map(meal => {
		const foods = db.select({
			id: schema.mealFoods.id,
			foodId: schema.mealFoods.foodId,
			foodName: schema.foods.name,
			grams: schema.mealFoods.grams,
			caloriesPer100g: schema.foods.caloriesPer100g,
			proteinPer100g: schema.foods.proteinPer100g,
			carbsPer100g: schema.foods.carbsPer100g,
			fatPer100g: schema.foods.fatPer100g
		}).from(schema.mealFoods)
			.leftJoin(schema.foods, eq(schema.mealFoods.foodId, schema.foods.id))
			.where(eq(schema.mealFoods.mealId, meal.id))
			.all();

		return { ...meal, foods };
	});
}

export function getDayMacros(date: string) {
	const result = db.select({
		calories: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.caloriesPer100g}), 0)`,
		protein: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.proteinPer100g}), 0)`,
		carbs: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.carbsPer100g}), 0)`,
		fat: sql<number>`COALESCE(SUM(${schema.mealFoods.grams} / 100.0 * ${schema.foods.fatPer100g}), 0)`
	}).from(schema.meals)
		.innerJoin(schema.mealFoods, eq(schema.meals.id, schema.mealFoods.mealId))
		.innerJoin(schema.foods, eq(schema.mealFoods.foodId, schema.foods.id))
		.where(eq(schema.meals.date, date))
		.get();

	return {
		calories: Math.round(result?.calories ?? 0),
		protein: Math.round(result?.protein ?? 0),
		carbs: Math.round(result?.carbs ?? 0),
		fat: Math.round(result?.fat ?? 0)
	};
}

export function createMeal(date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
	return db.insert(schema.meals).values({ date, mealType }).returning({ id: schema.meals.id }).get();
}

export function addFoodToMeal(mealId: number, foodId: number, grams: number) {
	return db.insert(schema.mealFoods).values({ mealId, foodId, grams }).returning({ id: schema.mealFoods.id }).get();
}

export function searchFoods(query: string) {
	return db.select().from(schema.foods)
		.where(like(schema.foods.name, `%${query}%`))
		.limit(20)
		.all();
}

export function createFood(data: { name: string; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }) {
	return db.insert(schema.foods).values(data).returning({ id: schema.foods.id }).get();
}
