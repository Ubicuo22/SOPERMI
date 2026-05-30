<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onNavigate } from '$app/navigation';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickAdd from '$lib/components/QuickAdd.svelte';

	let { children } = $props();

	const isLogin = $derived($page.url.pathname === '/login');

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
	<!--
		Estructura PWA robusta para iOS:
		- div raíz ocupa 100% de la pantalla sin overflow
		- safe-area-top como spacer explícito (más fiable que padding en el container)
		- main con min-h-0 dentro de flex para evitar overflow
		- safe-area-bottom en el BottomNav (ya tiene pb-safe-bottom)
	-->
	<div class="flex flex-col bg-bg" style="height: 100svh; height: 100dvh;">
		<!-- Spacer del notch / status bar -->
		<div class="bg-bg flex-shrink-0" style="height: env(safe-area-inset-top, 0px);"></div>

		<!-- Área de contenido scrolleable — min-h-0 evita que flex desborde -->
		<main
			class="flex-1 overflow-y-auto bg-bg"
			style="min-height: 0; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain;"
		>
			{@render children()}
			<!-- Padding al final para que el último ítem no quede pegado al nav -->
			<div class="flex-shrink-0" style="height: 1.5rem;"></div>
		</main>

		<!-- Nav con safe-area-bottom incorporada -->
		<BottomNav />
	</div>

	<!-- FAB fuera del flujo — fixed sobre todo -->
	<div
		class="fixed z-50 pointer-events-none"
		style="inset: 0;"
		aria-hidden="true"
	>
		<div
			class="absolute pointer-events-auto"
			style="right: 1rem; bottom: calc(4.75rem + env(safe-area-inset-bottom, 0px));"
		>
			<QuickAdd />
		</div>
	</div>
{/if}
