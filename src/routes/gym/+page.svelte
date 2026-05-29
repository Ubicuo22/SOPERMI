<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let showForm = $state(false);
	let formExercise = $state(0);
	let formReps = $state('');
	let formWeight = $state('');
	let formRpe = $state('');

	$effect(() => {
		if ($page.url.searchParams.get('add') === '1') showForm = true;
	});

	async function startWorkout() {
		await fetch('/api/gym?action=workout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: data.today, name: null })
		});
		invalidateAll();
	}

	async function submitSet() {
		if (!formExercise || !formReps) return;
		const setsForExercise = data.sets.filter(s => s.exerciseId === formExercise);
		await fetch('/api/gym?action=set', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				workoutId: data.workout!.id,
				exerciseId: formExercise,
				setNumber: setsForExercise.length + 1,
				reps: parseInt(formReps),
				weightKg: formWeight ? parseFloat(formWeight) : null,
				rpe: formRpe ? parseFloat(formRpe) : null
			})
		});
		showForm = false;
		formReps = '';
		formWeight = '';
		formRpe = '';
		invalidateAll();
	}

	type SetGroup = { exerciseName: string; sets: typeof data.sets };
	function groupByExercise(sets: typeof data.sets): SetGroup[] {
		const map = new Map<string, typeof data.sets>();
		for (const s of sets) {
			const name = s.exerciseName || 'desconocido';
			if (!map.has(name)) map.set(name, []);
			map.get(name)!.push(s);
		}
		return Array.from(map.entries()).map(([exerciseName, sets]) => ({ exerciseName, sets }));
	}
</script>

<TopBar title="gym" />

<div class="px-4 pb-4 space-y-4">
	{#if !data.workout}
		<div class="flex flex-col items-center py-8">
			<p class="text-t2 text-xs mb-4">sin workout hoy</p>
			<button
				onclick={startWorkout}
				class="px-6 py-2.5 bg-accent text-bg text-sm font-medium rounded-lg active:scale-[0.98] transition-transform"
			>iniciar workout</button>
		</div>
	{:else}
		<div class="text-[11px] text-t2 uppercase tracking-[0.08em]">
			{data.workout.name || 'workout'} — {data.sets.length} sets
		</div>

		{#each groupByExercise(data.sets) as group}
			<div class="bg-surface border border-border rounded-[14px] p-3">
				<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">{group.exerciseName}</span>
				<div class="mt-2 space-y-1">
					{#each group.sets as s}
						<div class="flex items-center gap-2 text-[13px]">
							<span class="text-t3 font-mono w-4">{s.setNumber}</span>
							<span class="font-mono">{s.weightKg ?? '-'}kg x {s.reps ?? '-'}</span>
							{#if s.rpe}<span class="text-t3 text-[10px]">@{s.rpe}</span>{/if}
							{#if s.isPr}
								<span class="text-[10px] bg-accent-bg text-accent px-1.5 py-0.5 rounded">PR</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

{#if showForm && data.workout}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50" role="dialog">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bg-surface border-t border-border rounded-t-2xl w-full max-w-md p-4 space-y-3" onkeydown={() => {}}>
			<div class="flex justify-between items-center">
				<span class="text-[13px] font-medium">nuevo set</span>
				<button onclick={() => showForm = false} class="text-t2 text-sm">cerrar</button>
			</div>
			<select bind:value={formExercise} class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 outline-none">
				<option value={0} disabled>ejercicio</option>
				{#each data.exercises as ex}
					<option value={ex.id}>{ex.name}</option>
				{/each}
			</select>
			<div class="grid grid-cols-3 gap-2">
				<input type="number" bind:value={formWeight} placeholder="kg" class="bg-elevated border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-t1 placeholder:text-t3 outline-none" />
				<input type="number" bind:value={formReps} placeholder="reps" class="bg-elevated border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-t1 placeholder:text-t3 outline-none" />
				<input type="number" bind:value={formRpe} placeholder="rpe" class="bg-elevated border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-t1 placeholder:text-t3 outline-none" />
			</div>
			<button
				onclick={submitSet}
				class="w-full bg-accent text-bg font-medium text-sm py-3 rounded-lg active:scale-[0.98] transition-transform"
			>guardar set</button>
		</div>
	</div>
{/if}
