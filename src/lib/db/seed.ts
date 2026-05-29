import { db, schema } from './index';

export function seed() {
	const existingCategories = db.select().from(schema.categories).all();
	if (existingCategories.length > 0) return;

	db.insert(schema.categories).values([
		{ id: 1, name: 'comida', color: '#b8f240', type: 'expense', icon: 'ti-salad' },
		{ id: 2, name: 'transporte', color: '#f0a500', type: 'expense', icon: 'ti-car' },
		{ id: 3, name: 'ocio', color: '#ff4545', type: 'expense', icon: 'ti-music' },
		{ id: 4, name: 'gym', color: '#7aab1a', type: 'expense', icon: 'ti-barbell' },
		{ id: 5, name: 'servicios', color: '#888888', type: 'expense', icon: 'ti-bolt' },
		{ id: 6, name: 'salud', color: '#888888', type: 'expense', icon: 'ti-heart' },
		{ id: 7, name: 'freelance', color: '#b8f240', type: 'income', icon: 'ti-briefcase' },
		{ id: 8, name: 'otros', color: '#444444', type: 'expense', icon: 'ti-dots' }
	]).run();

	db.insert(schema.projects).values([
		{ id: 1, name: 'Ubicuo Studio', color: '#b8f240', client: null },
		{ id: 2, name: 'Kinatia', color: '#7aab1a', client: 'Tania Carbajal' },
		{ id: 3, name: 'No Date', color: '#f0a500', client: null },
		{ id: 4, name: 'Personal', color: '#888888', client: null }
	]).run();

	db.insert(schema.habits).values([
		{ id: 1, name: 'agua 2L', frequency: 'daily', color: '#b8f240', icon: 'ti-droplet' },
		{ id: 2, name: 'leer 30min', frequency: 'daily', color: '#b8f240', icon: 'ti-book' },
		{ id: 3, name: 'no azucar', frequency: 'daily', color: '#f0a500', icon: 'ti-x' },
		{ id: 4, name: 'dormir 23:00', frequency: 'daily', color: '#888888', icon: 'ti-moon' }
	]).run();
}
