<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import QuickAdd from '$lib/components/QuickAdd.svelte';

	let { children } = $props();

	const isLogin = $derived($page.url.pathname === '/login');
</script>

{#if isLogin}
	{@render children()}
{:else}
	<div class="flex flex-col h-dvh bg-bg relative">
		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
		<QuickAdd />
		<BottomNav />
	</div>
{/if}
