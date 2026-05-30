import { db, schema } from '../index';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { addDaysLocal } from '../../date';

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

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function createMeal(date: string, mealType: MealType) {
	return db.insert(schema.meals).values({ date, mealType }).returning({ id: schema.meals.id }).get();
}

export function addFoodToMeal(mealId: number, foodId: number, grams: number) {
	return db.insert(schema.mealFoods).values({ mealId, foodId, grams }).returning({ id: schema.mealFoods.id }).get();
}

// Busca el meal del día+tipo; lo crea si no existe. Devuelve el id.
function getOrCreateMeal(date: string, mealType: MealType): number {
	const existing = db.select().from(schema.meals)
		.where(and(eq(schema.meals.date, date), eq(schema.meals.mealType, mealType)))
		.get();
	if (existing) return existing.id;
	return createMeal(date, mealType).id;
}

// Agrega un alimento a un tipo de comida del día (crea el meal si hace falta)
export function addFoodToMealType(date: string, mealType: MealType, foodId: number, grams: number) {
	const mealId = getOrCreateMeal(date, mealType);
	return addFoodToMeal(mealId, foodId, grams);
}

export function removeMealFood(id: number) {
	return db.delete(schema.mealFoods).where(eq(schema.mealFoods.id, id)).run();
}

function previousDay(date: string): string {
	return addDaysLocal(date, -1);
}

// Qué tipos de comida tuvo ayer con alimentos registrados
export function getYesterdayMealTypes(date: string): MealType[] {
	const yesterday = previousDay(date);
	const rows = db.select({ mealType: schema.meals.mealType })
		.from(schema.meals)
		.innerJoin(schema.mealFoods, eq(schema.meals.id, schema.mealFoods.mealId))
		.where(eq(schema.meals.date, yesterday))
		.all();
	return [...new Set(rows.map(r => r.mealType))] as MealType[];
}

// Copia los alimentos de ayer (de ese tipo) a hoy
export function repeatYesterdayMeal(date: string, mealType: MealType) {
	const yesterday = previousDay(date);
	const yMeal = db.select().from(schema.meals)
		.where(and(eq(schema.meals.date, yesterday), eq(schema.meals.mealType, mealType)))
		.get();
	if (!yMeal) return { copied: 0 };

	const yFoods = db.select().from(schema.mealFoods)
		.where(eq(schema.mealFoods.mealId, yMeal.id))
		.all();
	if (yFoods.length === 0) return { copied: 0 };

	const todayMealId = getOrCreateMeal(date, mealType);
	for (const f of yFoods) {
		addFoodToMeal(todayMealId, f.foodId, f.grams);
	}
	return { copied: yFoods.length };
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
