<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { invalidateAll } from '$app/navigation';
	import { addDaysLocal } from '$lib/date';

	let { data } = $props();

	async function toggle(habitId: number) {
		await fetch('/api/habits?action=toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ habitId, date: data.today })
		});
		invalidateAll();
	}

	function isCompletedToday(logs: { date: string }[]) {
		return logs.some(l => l.date === data.today);
	}

	function getLast28Days() {
		const days = [];
		for (let i = 27; i >= 0; i--) {
			days.push(addDaysLocal(data.today, -i));
		}
		return days;
	}

	const days28 = getLast28Days();
</script>

<TopBar title="hábitos" />

<div class="px-4 pb-4 space-y-4">
	{#if data.habits.length === 0}
		<EmptyState text="sin hábitos" hint />
	{/if}

	{#each data.habits as habit}
		{@const done = isCompletedToday(habit.logs)}
		<div class="bg-surface border border-border rounded-card p-3.5 space-y-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<button
						onclick={() => toggle(habit.id)}
						aria-label="marcar {habit.name}"
						class="w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
							{done ? 'bg-accent border-accent' : 'border-t3'}"
					>
						{#if done}
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none" transition:scale={{ duration: 200, easing: backOut }}>
								<path d="M2 6L5 9L10 3" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</button>
					<span class="text-body {done ? 'text-t1' : 'text-t2'}">{habit.name}</span>
				</div>
				<span class="font-mono text-label text-accent">{habit.streak}d</span>
			</div>

			<div class="grid grid-cols-7 gap-[3px]">
				{#each days28 as day}
					{@const logged = habit.logs.some((l: { date: string }) => l.date === day)}
					<div class="w-full aspect-square rounded-[3px] {logged ? 'bg-accent' : 'bg-elevated'}"></div>
				{/each}
			</div>
		</div>
	{/each}
</div>
