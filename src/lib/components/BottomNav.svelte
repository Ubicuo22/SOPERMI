<script lang="ts">
	import { page } from '$app/stores';
	import { IconUser, IconChartBar, IconClock, IconBarbell, IconSalad, IconCheck } from '@tabler/icons-svelte';

	const tabs = [
		{ href: '/yo', icon: IconUser, label: 'yo' },
		{ href: '/finances', icon: IconChartBar, label: 'finanzas' },
		{ href: '/time', icon: IconClock, label: 'tiempo' },
		{ href: '/gym', icon: IconBarbell, label: 'gym' },
		{ href: '/meals', icon: IconSalad, label: 'comidas' },
		{ href: '/habits', icon: IconCheck, label: 'hábitos' }
	];
</script>

<nav class="bg-surface border-t border-border flex items-stretch justify-around px-1 pb-safe-bottom flex-shrink-0">
	{#each tabs as tab}
		{@const active = $page.url.pathname.startsWith(tab.href)}
		<a
			href={tab.href}
			class="flex flex-1 flex-col items-center justify-center gap-1 h-14 my-1 rounded-control transition-colors
				{active ? 'bg-elevated' : 'active:bg-elevated/50'}"
		>
			<tab.icon size={20} class={active ? 'text-accent' : 'text-t2'} />
			<span class="text-micro tracking-[0.02em] {active ? 'text-accent' : 'text-t2'}">{tab.label}</span>
		</a>
	{/each}
</nav>
