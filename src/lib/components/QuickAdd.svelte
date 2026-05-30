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

<div class="absolute bottom-20 right-4 z-50">
	<button
		onclick={() => open = !open}
		class="w-12 h-12 rounded-full bg-accent flex items-center justify-center active:scale-95 transition-transform"
	>
		<IconPlus size={20} class="text-bg" />
	</button>
</div>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40" onclick={() => open = false} onkeydown={() => {}}></div>
	<div class="absolute bottom-[136px] right-4 z-50 bg-surface border border-border rounded-xl p-2 flex flex-col gap-1 min-w-[140px]">
		{#each options as opt}
			<a
				href={opt.href}
				onclick={() => open = false}
				class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-t1 text-[13px] hover:bg-elevated transition-colors"
			>
				<opt.icon size={16} class="text-t2" />
				{opt.label}
			</a>
		{/each}
	</div>
{/if}
