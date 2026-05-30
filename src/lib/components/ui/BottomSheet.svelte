<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		onclose?: () => void;
	}

	let { open = $bindable(), title, children, onclose }: Props = $props();

	function close() {
		open = false;
		onclose?.();
	}
</script>

{#if open}
	<!-- backdrop -->
	<div
		class="fixed inset-0 z-40 bg-black/60"
		transition:fade={{ duration: 150 }}
		onclick={close}
		role="presentation"
	></div>

	<!-- sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 flex justify-center"
		transition:fly={{ y: 320, duration: 250, easing: cubicOut }}
	>
		<div class="bg-surface border-t border-border rounded-t-sheet w-full max-w-md p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3 max-h-[85dvh] overflow-y-auto" style="-webkit-overflow-scrolling: touch; overscroll-behavior: contain;">
			<!-- drag handle -->
			<div class="flex justify-center -mt-1 mb-1">
				<div class="w-9 h-1 rounded-full bg-t3"></div>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-body font-medium">{title}</span>
				<button onclick={close} class="text-t2 text-meta active:text-t1">cerrar</button>
			</div>

			{@render children()}
		</div>
	</div>
{/if}
