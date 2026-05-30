import { db, schema } from './index';

function seedExercises() {
	const existing = db.select().from(schema.exercises).limit(1).all();
	if (existing.length > 0) return;

	db.insert(schema.exercises).values([
		// Pecho
		{ name: 'bench press', muscleGroup: 'chest', type: 'strength' },
		{ name: 'incline bench press', muscleGroup: 'chest', type: 'strength' },
		{ name: 'dumbbell press', muscleGroup: 'chest', type: 'strength' },
		{ name: 'incline dumbbell press', muscleGroup: 'chest', type: 'strength' },
		{ name: 'cable fly', muscleGroup: 'chest', type: 'strength' },
		{ name: 'dips', muscleGroup: 'chest', type: 'strength' },
		{ name: 'push ups', muscleGroup: 'chest', type: 'strength' },
		// Espalda
		{ name: 'deadlift', muscleGroup: 'back', type: 'strength' },
		{ name: 'barbell row', muscleGroup: 'back', type: 'strength' },
		{ name: 'dumbbell row', muscleGroup: 'back', type: 'strength' },
		{ name: 'pull ups', muscleGroup: 'back', type: 'strength' },
		{ name: 'lat pulldown', muscleGroup: 'back', type: 'strength' },
		{ name: 'cable row', muscleGroup: 'back', type: 'strength' },
		{ name: 'face pull', muscleGroup: 'back', type: 'strength' },
		{ name: 't-bar row', muscleGroup: 'back', type: 'strength' },
		// Piernas
		{ name: 'squat', muscleGroup: 'legs', type: 'strength' },
		{ name: 'front squat', muscleGroup: 'legs', type: 'strength' },
		{ name: 'leg press', muscleGroup: 'legs', type: 'strength' },
		{ name: 'romanian deadlift', muscleGroup: 'legs', type: 'strength' },
		{ name: 'leg curl', muscleGroup: 'legs', type: 'strength' },
		{ name: 'leg extension', muscleGroup: 'legs', type: 'strength' },
		{ name: 'bulgarian split squat', muscleGroup: 'legs', type: 'strength' },
		{ name: 'hip thrust', muscleGroup: 'legs', type: 'strength' },
		{ name: 'calf raise', muscleGroup: 'legs', type: 'strength' },
		{ name: 'hack squat', muscleGroup: 'legs', type: 'strength' },
		// Hombros
		{ name: 'overhead press', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'dumbbell shoulder press', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'lateral raise', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'front raise', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'reverse fly', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'arnold press', muscleGroup: 'shoulders', type: 'strength' },
		{ name: 'upright row', muscleGroup: 'shoulders', type: 'strength' },
		// Brazos
		{ name: 'barbell curl', muscleGroup: 'arms', type: 'strength' },
		{ name: 'dumbbell curl', muscleGroup: 'arms', type: 'strength' },
		{ name: 'hammer curl', muscleGroup: 'arms', type: 'strength' },
		{ name: 'preacher curl', muscleGroup: 'arms', type: 'strength' },
		{ name: 'tricep pushdown', muscleGroup: 'arms', type: 'strength' },
		{ name: 'skull crusher', muscleGroup: 'arms', type: 'strength' },
		{ name: 'overhead tricep extension', muscleGroup: 'arms', type: 'strength' },
		{ name: 'close grip bench press', muscleGroup: 'arms', type: 'strength' },
		// Core
		{ name: 'plank', muscleGroup: 'core', type: 'strength' },
		{ name: 'hanging leg raise', muscleGroup: 'core', type: 'strength' },
		{ name: 'cable crunch', muscleGroup: 'core', type: 'strength' },
		{ name: 'ab wheel', muscleGroup: 'core', type: 'strength' },
		{ name: 'russian twist', muscleGroup: 'core', type: 'strength' },
		// Cardio
		{ name: 'correr', muscleGroup: null, type: 'cardio' },
		{ name: 'bicicleta', muscleGroup: null, type: 'cardio' },
		{ name: 'eliptica', muscleGroup: null, type: 'cardio' },
		{ name: 'caminar inclinado', muscleGroup: null, type: 'cardio' },
		{ name: 'saltar cuerda', muscleGroup: null, type: 'cardio' }
	]).run();
}

function seedFoods() {
	const existing = db.select().from(schema.foods).limit(1).all();
	if (existing.length > 0) return;

	db.insert(schema.foods).values([
		// Proteinas
		{ name: 'pechuga de pollo', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
		{ name: 'huevo entero', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
		{ name: 'claras de huevo', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2 },
		{ name: 'carne molida 90/10', caloriesPer100g: 176, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10 },
		{ name: 'bistec de res', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
		{ name: 'atun en agua (lata)', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1 },
		{ name: 'salmon', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
		{ name: 'whey protein (scoop 30g)', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 10, fatPer100g: 3 },
		{ name: 'yogurt griego natural', caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 3.6, fatPer100g: 5 },
		{ name: 'queso panela', caloriesPer100g: 206, proteinPer100g: 20, carbsPer100g: 3, fatPer100g: 13 },
		{ name: 'queso oaxaca', caloriesPer100g: 274, proteinPer100g: 21, carbsPer100g: 2, fatPer100g: 21 },
		// Carbohidratos
		{ name: 'arroz blanco cocido', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
		{ name: 'arroz integral cocido', caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1 },
		{ name: 'tortilla de maiz', caloriesPer100g: 218, proteinPer100g: 5.7, carbsPer100g: 44, fatPer100g: 2.8 },
		{ name: 'tortilla de harina', caloriesPer100g: 312, proteinPer100g: 8, carbsPer100g: 51, fatPer100g: 8 },
		{ name: 'avena', caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7 },
		{ name: 'papa cocida', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1 },
		{ name: 'camote cocido', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.1 },
		{ name: 'pan integral', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
		{ name: 'pasta cocida', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
		{ name: 'frijoles cocidos', caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22, fatPer100g: 0.5 },
		{ name: 'platano', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
		// Grasas
		{ name: 'aguacate', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
		{ name: 'aceite de oliva', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
		{ name: 'crema de cacahuate', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
		{ name: 'almendras', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
		{ name: 'nueces', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65 },
		// Verduras
		{ name: 'brocoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
		{ name: 'espinaca', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
		{ name: 'nopal', caloriesPer100g: 16, proteinPer100g: 1.3, carbsPer100g: 3.3, fatPer100g: 0.1 },
		{ name: 'tomate', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
		{ name: 'cebolla', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1 },
		{ name: 'chile serrano', caloriesPer100g: 32, proteinPer100g: 1.7, carbsPer100g: 7, fatPer100g: 0.4 },
		// Frutas
		{ name: 'manzana', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
		{ name: 'fresa', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3 },
		{ name: 'mango', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4 },
		{ name: 'papaya', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3 },
		// Lacteos / bebidas
		{ name: 'leche entera', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3 },
		{ name: 'leche deslactosada', caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1 },
		{ name: 'cafe negro', caloriesPer100g: 2, proteinPer100g: 0.3, carbsPer100g: 0, fatPer100g: 0 },
		// Comida preparada comun
		{ name: 'taco de carne asada (est.)', caloriesPer100g: 226, proteinPer100g: 14, carbsPer100g: 20, fatPer100g: 10 },
		{ name: 'burrito (est.)', caloriesPer100g: 206, proteinPer100g: 9, carbsPer100g: 25, fatPer100g: 8 }
	]).run();
}

function seedProfile() {
	const existing = db.select().from(schema.profile).limit(1).all();
	if (existing.length > 0) return;
	db.insert(schema.profile).values({ id: 1 }).run();
}

export function seed() {
	// Always try to seed exercises, foods, and profile (idempotent)
	seedExercises();
	seedFoods();
	seedProfile();

	// Categories, projects, habits only on fresh DB (SCHEMA.sql already seeds categories via INSERT OR IGNORE)
	const existingHabits = db.select().from(schema.habits).limit(1).all();
	if (existingHabits.length > 0) return;

	db.insert(schema.habits).values([
		{ id: 1, name: 'agua 2L', frequency: 'daily', color: '#b8f240', icon: 'ti-droplet' },
		{ id: 2, name: 'leer 30min', frequency: 'daily', color: '#b8f240', icon: 'ti-book' },
		{ id: 3, name: 'no azúcar', frequency: 'daily', color: '#f0a500', icon: 'ti-x' },
		{ id: 4, name: 'dormir 23:00', frequency: 'daily', color: '#888888', icon: 'ti-moon' },
		{ id: 5, name: 'meditar', frequency: 'daily', color: '#7aab1a', icon: 'ti-brain' },
		{ id: 6, name: 'caminar 30min', frequency: 'daily', color: '#b8f240', icon: 'ti-walk' },
		{ id: 7, name: 'no redes antes 12', frequency: 'daily', color: '#f0a500', icon: 'ti-device-mobile-off' }
	]).run();
}
