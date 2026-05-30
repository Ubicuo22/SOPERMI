<script lang="ts">
	import { page } from '$app/stores';
	import { IconUser, IconChartBar, IconClock, IconBarbell, IconSalad, IconCheck } from '@tabler/icons-svelte';

	const tabs = [
		{ href: '/yo', icon: IconUser, label: 'yo' },
		{ href: '/finances', icon: IconChartBar, label: 'finanzas' },
		{ href: '/time', icon: IconClock, label: 'tiempo' },
		{ href: '/gym', icon: IconBarbell, label: 'gym' },
		{ href: '/meals', icon: IconSalad, label: 'comidas' },
		{ href: '/habits', icon: IconCheck, label: 'habitos' }
	];
</script>

<nav class="h-16 bg-surface border-t border-border flex items-center justify-around px-1">
	{#each tabs as tab}
		{@const active = $page.url.pathname.startsWith(tab.href)}
		<a
			href={tab.href}
			class="flex flex-col items-center justify-center gap-0.5 w-12 h-11 rounded-[10px] transition-colors
				{active ? 'bg-elevated' : ''}"
		>
			<tab.icon size={18} class={active ? 'text-accent' : 'text-t2'} />
			<span class="text-[8px] tracking-[0.03em] {active ? 'text-accent' : 'text-t2'}">{tab.label}</span>
		</a>
	{/each}
</nav>
