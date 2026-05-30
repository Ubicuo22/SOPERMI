<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickAdd from '$lib/components/QuickAdd.svelte';

	let { children } = $props();

	const isLogin = $derived($page.url.pathname === '/login');

	// Transición de página entre módulos (View Transitions API)
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{#if isLogin}
	{@render children()}
{:else}
	<div class="flex flex-col h-dvh bg-bg relative pt-safe-top">
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
		<QuickAdd />
		<BottomNav />
	</div>
{/if}
