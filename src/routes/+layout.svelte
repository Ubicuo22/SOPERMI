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
	<div class="flex flex-col h-dvh bg-bg" style="padding-top: env(safe-area-inset-top)">
		<main
			class="flex-1 overflow-y-auto"
			style="-webkit-overflow-scrolling: touch; overscroll-behavior-y: contain;"
		>
			{@render children()}
			<!-- espacio extra al final para que el contenido no quede debajo del nav -->
			<div class="h-4"></div>
		</main>
		<!-- FAB fixed — no se mueve al scrollear -->
		<div
			class="fixed z-50"
			style="right: 1rem; bottom: calc(4.5rem + env(safe-area-inset-bottom) + 0.5rem)"
		>
			<QuickAdd />
		</div>
		<BottomNav />
	</div>
{/if}
