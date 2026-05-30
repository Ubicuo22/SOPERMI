<script lang="ts">
	interface Props {
		text: string;
		hint?: boolean; // muestra la pista "agrega uno con +"
	}

	let { text, hint = false }: Props = $props();
</script>

<p class="text-t2 text-meta py-6 text-center">
	{text}{#if hint}<span class="text-t3"> — agrega con +</span>{/if}
</p>
