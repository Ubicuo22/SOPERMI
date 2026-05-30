import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getMealsByDate, getDayMacros, createMeal, addFoodToMeal, searchFoods, createFood,
	addFoodToMealType, removeMealFood, getYesterdayMealTypes, repeatYesterdayMeal
} from '$lib/db/queries/meals';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
	const action = url.searchParams.get('action');

	if (action === 'search') {
		const q = url.searchParams.get('q') || '';
		return json({ data: searchFoods(q) });
	}

	const meals = getMealsByDate(date);
	const macros = getDayMacros(date);
	return json({ data: { meals, macros } });
};

export const POST: RequestHandler = async ({ request, url }) => {
	const action = url.searchParams.get('action');
	const body = await request.json();

	if (action === 'meal') {
		const result = createMeal(body.date, body.mealType);
		return json({ data: result });
	}

	if (action === 'add-food') {
		const result = addFoodToMeal(body.mealId, body.foodId, body.grams);
		return json({ data: result });
	}

	// agrega alimento a un tipo de comida (crea el meal si hace falta)
	if (action === 'add-to-type') {
		const result = addFoodToMealType(body.date, body.mealType, body.foodId, body.grams);
		return json({ data: result });
	}

	if (action === 'remove-food') {
		removeMealFood(body.id);
		return json({ data: { ok: true } });
	}

	if (action === 'repeat-yesterday') {
		const result = repeatYesterdayMeal(body.date, body.mealType);
		return json({ data: result });
	}

	if (action === 'create-food') {
		const result = createFood(body);
		return json({ data: result });
	}

	return json({ error: 'action requerida' }, { status: 400 });
};
