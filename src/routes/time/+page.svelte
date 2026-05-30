<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
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
		<span class="font-mono text-4xl text-accent font-bold">{formatTime(timeLeft)}</span>
		<span class="text-[11px] text-t2 mt-1">{timerRunning ? 'enfocado' : 'listo'}</span>
		<button
			onclick={toggleTimer}
			class="mt-4 px-6 py-2 rounded-lg text-sm font-medium transition-colors
				{timerRunning ? 'bg-danger/20 text-danger' : 'bg-accent text-bg'}"
		>
			{timerRunning ? 'detener' : 'iniciar'}
		</button>
	</div>

	<div class="grid grid-cols-2 gap-2">
		<MetricCard label="minutos" value="{data.summary.totalMinutes}" accent />
		<MetricCard label="pomodoros" value="{data.summary.pomodoros}" />
	</div>

	<div class="space-y-1">
		<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">tareas pendientes</span>
		{#if data.tasks.length === 0}
			<p class="text-t2 text-xs py-4">sin tareas — agrega una con +</p>
		{/if}
		{#each data.tasks as task}
			<div class="flex items-center gap-2 py-2 border-b border-border-soft">
				<button
					onclick={() => completeTask(task.id)}
					class="w-5 h-5 rounded border border-t3 flex-shrink-0 active:bg-accent/20"
				></button>
				<span class="text-[13px] flex-1">{task.title}</span>
				<span class="text-[10px] text-t3 font-mono">P{task.priority}</span>
			</div>
		{/each}
	</div>
</div>

{#if showForm}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50" role="dialog">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bg-surface border-t border-border rounded-t-2xl w-full max-w-md p-4 space-y-3" onkeydown={() => {}}>
			<div class="flex justify-between items-center">
				<span class="text-[13px] font-medium">nueva tarea</span>
				<button onclick={() => showForm = false} class="text-t2 text-sm">cerrar</button>
			</div>
			<input
				type="text"
				bind:value={formTitle}
				placeholder="título de la tarea"
				class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 placeholder:text-t3 outline-none focus:border-accent-dim"
			/>
			<select bind:value={formPriority} class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 outline-none">
				<option value={1}>alta</option>
				<option value={2}>media</option>
				<option value={3}>baja</option>
			</select>
			<button
				onclick={submitTask}
				class="w-full bg-accent text-bg font-medium text-sm py-3 rounded-lg active:scale-[0.98] transition-transform"
			>guardar</button>
		</div>
	</div>
{/if}
