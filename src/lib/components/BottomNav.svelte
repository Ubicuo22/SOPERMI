<script lang="ts">
	import { page } from '$app/stores';
	import { IconChartBar, IconClock, IconBarbell, IconSalad, IconCheck } from '@tabler/icons-svelte';

	const tabs = [
		{ href: '/finances', icon: IconChartBar, label: 'finanzas' },
		{ href: '/time', icon: IconClock, label: 'tiempo' },
		{ href: '/gym', icon: IconBarbell, label: 'gym' },
		{ href: '/meals', icon: IconSalad, label: 'comidas' },
		{ href: '/habits', icon: IconCheck, label: 'habitos' }
	];
</script>

<nav class="h-16 bg-surface border-t border-border flex items-center justify-around px-2">
	{#each tabs as tab}
		{@const active = $page.url.pathname.startsWith(tab.href)}
		<a
			href={tab.href}
			class="flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-[10px] transition-colors
				{active ? 'bg-elevated' : ''}"
		>
			<tab.icon size={20} class={active ? 'text-accent' : 'text-t2'} />
			<span class="text-[9px] tracking-[0.03em] {active ? 'text-accent' : 'text-t2'}">{tab.label}</span>
		</a>
	{/each}
</nav>
