<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		action?: Snippet;
	}

	let { children, action }: Props = $props();
</script>

<div class="flex items-center justify-between">
	<span class="text-label text-t2 uppercase tracking-[0.08em]">{@render children()}</span>
	{#if action}
		{@render action()}
	{/if}
</div>
