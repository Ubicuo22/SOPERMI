<script lang="ts">
	import { IconPlus, IconChartBar, IconClock, IconBarbell, IconSalad, IconCheck } from '@tabler/icons-svelte';

	let open = $state(false);

	const options = [
		{ label: 'transacción', icon: IconChartBar, href: '/finances?add=1' },
		{ label: 'tarea', icon: IconClock, href: '/time?add=1' },
		{ label: 'set', icon: IconBarbell, href: '/gym?add=1' },
		{ label: 'comida', icon: IconSalad, href: '/meals?add=1' },
		{ label: 'hábito', icon: IconCheck, href: '/habits?add=1' }
	];
</script>

<!-- FAB -->
<button
	onclick={() => open = !open}
	class="w-12 h-12 rounded-full bg-accent flex items-center justify-center active:scale-95 transition-transform shadow-lg"
>
	<IconPlus size={20} class="text-bg transition-transform duration-200 {open ? 'rotate-45' : ''}" />
</button>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-40"
		onclick={() => open = false}
		onkeydown={() => {}}
	></div>
	<!-- Menu -->
	<div
		class="fixed z-50 bg-surface border border-border rounded-card p-2 flex flex-col gap-0.5 min-w-[160px]"
		style="right: 1rem; bottom: calc(4.5rem + env(safe-area-inset-bottom) + 4rem)"
	>
		{#each options as opt}
			<a
				href={opt.href}
				onclick={() => open = false}
				class="flex items-center gap-3 px-3 py-2.5 rounded-control text-t1 text-body active:bg-elevated transition-colors"
			>
				<opt.icon size={16} class="text-t2 flex-shrink-0" />
				<span>{opt.label}</span>
			</a>
		{/each}
	</div>
{/if}
