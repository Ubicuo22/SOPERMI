<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SectionLabel from '$lib/components/ui/SectionLabel.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let timerRunning = $state(false);
	let timeLeft = $state(25 * 60);
	let interval: ReturnType<typeof setInterval> | null = null;

	let showForm = $state(false);
	let formTitle = $state('');
	let formPriority = $state(2);

	$effect(() => {
		if ($page.url.searchParams.get('add') === '1') showForm = true;
	});

	function startTimer() {
		timerRunning = true;
		interval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				stopTimer();
			}
		}, 1000);
	}

	function stopTimer() {
		timerRunning = false;
		if (interval) clearInterval(interval);
		interval = null;
		timeLeft = 25 * 60;
	}

	function toggleTimer() {
		if (timerRunning) stopTimer();
		else startTimer();
	}

	function formatTime(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	async function completeTask(id: number) {
		await fetch('/api/time?action=complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		invalidateAll();
	}

	async function submitTask() {
		if (!formTitle) return;
		await fetch('/api/time', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title: formTitle, priority: formPriority })
		});
		showForm = false;
		formTitle = '';
		invalidateAll();
	}
</script>

<TopBar title="tiempo" />

<div class="px-4 pb-4 space-y-4">
	<div class="flex flex-col items-center py-6">
		<span class="font-mono text-hero text-accent font-bold">{formatTime(timeLeft)}</span>
		<span class="text-label text-t2 mt-1">{timerRunning ? 'enfocado' : 'listo'}</span>
		<button
			onclick={toggleTimer}
			class="mt-4 px-6 py-2 rounded-lg text-sub font-medium transition-colors
				{timerRunning ? 'bg-danger/20 text-danger' : 'bg-accent text-bg'}"
		>
			{timerRunning ? 'detener' : 'iniciar'}
		</button>
	</div>

	<div class="grid grid-cols-2 gap-2">
		<MetricCard label="minutos" value={data.summary.totalMinutes} accent />
		<MetricCard label="pomodoros" value={data.summary.pomodoros} />
	</div>

	<div class="space-y-1">
		<SectionLabel>tareas pendientes</SectionLabel>
		{#if data.tasks.length === 0}
			<EmptyState text="sin tareas" hint />
		{/if}
		{#each data.tasks as task}
			<div class="flex items-center gap-2 py-2 border-b border-border-soft">
				<button
					onclick={() => completeTask(task.id)}
					class="w-5 h-5 rounded border border-t3 flex-shrink-0 active:bg-accent/20"
					aria-label="completar tarea"
				></button>
				<span class="text-body flex-1">{task.title}</span>
				<span class="text-micro text-t3 font-mono">P{task.priority}</span>
			</div>
		{/each}
	</div>
</div>

<BottomSheet bind:open={showForm} title="nueva tarea">
	<Input type="text" bind:value={formTitle} placeholder="título de la tarea" />
	<select bind:value={formPriority} class="w-full bg-elevated border border-border rounded-control px-3 py-2.5 text-body text-t1 outline-none">
		<option value={1}>alta</option>
		<option value={2}>media</option>
		<option value={3}>baja</option>
	</select>
	<Button full onclick={submitTask}>guardar</Button>
</BottomSheet>
