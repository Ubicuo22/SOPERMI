<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
	const mealLabels: Record<string, string> = { breakfast: 'desayuno', lunch: 'comida', dinner: 'cena', snack: 'snack' };

	function getMealByType(type: string) {
		return data.meals.find(m => m.mealType === type);
	}

	function calcMealCals(meal: typeof data.meals[0]) {
		return Math.round(meal.foods.reduce((sum, f) => sum + (f.grams / 100) * (f.caloriesPer100g ?? 0), 0));
	}
</script>

<TopBar title="comidas" />

<div class="px-4 pb-4 space-y-4">
	<div class="flex items-center justify-center py-3">
		<span class="font-mono text-hero font-bold text-accent">{data.macros.calories}</span>
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
			<div class="bg-surface border border-border rounded-card p-3.5">
				<div class="flex items-center justify-between">
					<span class="text-label text-t2 uppercase tracking-[0.08em]">{mealLabels[type]}</span>
					{#if meal}
						<span class="font-mono text-label text-t2">{calcMealCals(meal)} kcal</span>
					{/if}
				</div>
				{#if meal && meal.foods.length > 0}
					<div class="mt-2 space-y-1">
						{#each meal.foods as f}
							<div class="flex items-center justify-between text-body">
								<span>{f.foodName}</span>
								<span class="font-mono text-t2 text-label">{f.grams}g</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-t3 text-label mt-1">sin registros</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
