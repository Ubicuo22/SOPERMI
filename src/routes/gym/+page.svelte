<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SectionLabel from '$lib/components/ui/SectionLabel.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let showForm = $state(false);
	let formExercise = $state(0);
	let formReps = $state('');
	let formWeight = $state('');
	let formRpe = $state('');

	$effect(() => {
		// solo abrir el form si ya hay un workout activo (necesita workoutId)
		if ($page.url.searchParams.get('add') === '1' && data.workout) showForm = true;
	});

	async function startWorkout() {
		await fetch('/api/gym?action=workout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: data.today, name: null })
		});
		invalidateAll();
	}

	async function repeatLast() {
		await fetch('/api/gym?action=repeat-last', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: data.today })
		});
		invalidateAll();
	}

	async function deleteSet(id: number) {
		await fetch('/api/gym?action=delete-set', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
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
		<div class="flex flex-col items-center py-8 gap-3">
			<p class="text-t2 text-meta">sin workout hoy</p>
			<Button onclick={startWorkout}>iniciar workout</Button>
			{#if data.lastWorkout}
				<button onclick={repeatLast} class="text-meta text-accent active:opacity-60">
					repetir último{data.lastWorkout.name ? ` (${data.lastWorkout.name})` : ''}
				</button>
			{/if}
		</div>
	{:else}
		<SectionLabel>{data.workout.name || 'workout'} — {data.sets.length} sets</SectionLabel>

		{#each groupByExercise(data.sets) as group}
			<div class="bg-surface border border-border rounded-card p-3">
				<span class="text-label text-t2 uppercase tracking-[0.08em]">{group.exerciseName}</span>
				<div class="mt-2 space-y-1">
					{#each group.sets as s}
						<button onclick={() => deleteSet(s.id)} class="w-full flex items-center gap-2 text-body text-left active:opacity-50">
							<span class="text-t3 font-mono w-4">{s.setNumber}</span>
							<span class="font-mono tabular-nums">{s.weightKg ?? '-'}kg × {s.reps ?? '-'}</span>
							{#if s.rpe}<span class="text-t3 text-micro">@{s.rpe}</span>{/if}
							{#if s.isPr}
								<span class="text-micro bg-accent-bg text-accent px-1.5 py-0.5 rounded-chip">PR</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<BottomSheet bind:open={showForm} title="nuevo set">
	<select bind:value={formExercise} class="w-full bg-elevated border border-border rounded-control px-3 py-2.5 text-body text-t1 outline-none">
		<option value={0} disabled>ejercicio</option>
		{#each data.exercises as ex}
			<option value={ex.id}>{ex.name}</option>
		{/each}
	</select>
	<div class="grid grid-cols-3 gap-2">
		<Input type="number" bind:value={formWeight} placeholder="kg" mono />
		<Input type="number" bind:value={formReps} placeholder="reps" mono />
		<Input type="number" bind:value={formRpe} placeholder="rpe" mono />
	</div>
	<Button full onclick={submitSet}>guardar set</Button>
</BottomSheet>
