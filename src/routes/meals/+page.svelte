<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
	type MealType = typeof mealTypes[number];
	const mealLabels: Record<string, string> = { breakfast: 'desayuno', lunch: 'comida', dinner: 'cena', snack: 'snack' };

	// Sheet de agregar alimento
	let showSheet = $state(false);
	let activeMealType = $state<MealType>('breakfast');
	let query = $state('');
	let results = $state<Array<{ id: number; name: string; caloriesPer100g: number; proteinPer100g: number }>>([]);
	let selectedFood = $state<{ id: number; name: string; caloriesPer100g: number; proteinPer100g: number } | null>(null);
	let grams = $state('100');

	function getMealByType(type: string) {
		return data.meals.find(m => m.mealType === type);
	}

	function calcMealCals(meal: typeof data.meals[0]) {
		return Math.round(meal.foods.reduce((sum, f) => sum + (f.grams / 100) * (f.caloriesPer100g ?? 0), 0));
	}

	function openSheet(type: MealType) {
		activeMealType = type;
		query = '';
		results = [];
		selectedFood = null;
		grams = '100';
		showSheet = true;
	}

	async function search() {
		if (query.trim().length < 1) { results = []; return; }
		const res = await fetch(`/api/meals?action=search&q=${encodeURIComponent(query)}`);
		const json = await res.json();
		results = json.data;
	}

	function selectFood(food: typeof selectedFood) {
		selectedFood = food;
		grams = '100';
	}

	async function addFood() {
		if (!selectedFood || !grams) return;
		await fetch('/api/meals?action=add-to-type', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				date: data.today,
				mealType: activeMealType,
				foodId: selectedFood.id,
				grams: parseFloat(grams)
			})
		});
		// reset para seguir agregando al mismo meal
		selectedFood = null;
		query = '';
		results = [];
		invalidateAll();
	}

	async function removeFood(id: number) {
		await fetch('/api/meals?action=remove-food', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		invalidateAll();
	}

	async function repeatYesterday(type: MealType) {
		await fetch('/api/meals?action=repeat-yesterday', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: data.today, mealType: type })
		});
		invalidateAll();
	}

	// macros estimados del alimento seleccionado a los gramos elegidos
	const preview = $derived.by(() => {
		if (!selectedFood || !grams) return null;
		const g = parseFloat(grams);
		if (isNaN(g)) return null;
		return {
			kcal: Math.round((g / 100) * selectedFood.caloriesPer100g),
			prot: Math.round((g / 100) * selectedFood.proteinPer100g)
		};
	});
</script>

<TopBar title="comidas" />

<div class="px-4 pb-4 space-y-4">
	<div class="flex items-center justify-center py-3">
		<span class="font-mono text-hero font-bold text-accent tabular-nums">{data.macros.calories}</span>
		<span class="text-t2 text-meta ml-2">kcal</span>
	</div>

	<div class="grid grid-cols-3 gap-2">
		<MetricCard label="proteína" value={`${data.macros.protein}g`} accent />
		<MetricCard label="carbs" value={`${data.macros.carbs}g`} />
		<MetricCard label="grasa" value={`${data.macros.fat}g`} />
	</div>

	<div class="space-y-2">
		{#each mealTypes as type}
			{@const meal = getMealByType(type)}
			{@const hasYesterday = data.yesterdayTypes.includes(type)}
			<div class="bg-surface border border-border rounded-card p-3.5">
				<div class="flex items-center justify-between">
					<span class="text-label text-t2 uppercase tracking-[0.08em]">{mealLabels[type]}</span>
					{#if meal && meal.foods.length > 0}
						<span class="font-mono text-label text-t2 tabular-nums">{calcMealCals(meal)} kcal</span>
					{/if}
				</div>

				{#if meal && meal.foods.length > 0}
					<div class="mt-2 space-y-1">
						{#each meal.foods as f}
							<button onclick={() => removeFood(f.id)} class="w-full flex items-center justify-between text-body text-left active:opacity-50">
								<span>{f.foodName}</span>
								<span class="font-mono text-t2 text-label tabular-nums">{f.grams}g</span>
							</button>
						{/each}
					</div>
				{/if}

				<div class="flex gap-2 mt-2.5">
					<button onclick={() => openSheet(type)} class="flex-1 py-2 rounded-control border border-dashed border-t3 text-t3 text-meta active:bg-elevated transition-colors">
						+ agregar
					</button>
					{#if hasYesterday && (!meal || meal.foods.length === 0)}
						<button onclick={() => repeatYesterday(type)} class="px-3 py-2 rounded-control bg-elevated text-t2 text-meta active:bg-border transition-colors">
							repetir ayer
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<BottomSheet bind:open={showSheet} title="agregar a {mealLabels[activeMealType]}">
	{#if !selectedFood}
		<Input type="text" bind:value={query} placeholder="buscar alimento..." onchange={search} />
		<div class="flex">
			<Button size="sm" variant="ghost" onclick={search}>buscar</Button>
		</div>
		<div class="max-h-64 overflow-y-auto space-y-1">
			{#each results as food}
				<button onclick={() => selectFood(food)} class="w-full flex items-center justify-between py-2 px-3 rounded-control bg-elevated active:bg-border text-left">
					<span class="text-body">{food.name}</span>
					<span class="font-mono text-micro text-t3 tabular-nums">{food.proteinPer100g}p · {food.caloriesPer100g}kcal /100g</span>
				</button>
			{/each}
			{#if query && results.length === 0}
				<p class="text-t3 text-meta py-3 text-center">sin resultados</p>
			{/if}
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<span class="text-body">{selectedFood.name}</span>
			<button onclick={() => selectedFood = null} class="text-t2 text-meta">cambiar</button>
		</div>
		<Input type="number" bind:value={grams} label="gramos" mono />
		{#if preview}
			<div class="flex gap-4 text-label text-t2 font-mono">
				<span>{preview.kcal} kcal</span>
				<span class="text-accent">{preview.prot}g prot</span>
			</div>
		{/if}
		<Button full onclick={addFood}>agregar</Button>
	{/if}
</BottomSheet>
