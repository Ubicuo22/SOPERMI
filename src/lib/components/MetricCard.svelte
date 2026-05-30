<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		accent?: boolean;
	}

	let { label, value, accent = false }: Props = $props();
</script>

<div class="bg-surface border border-border rounded-card px-3.5 py-3">
	<span class="text-label text-t2 uppercase tracking-[0.08em] block">{label}</span>
	<span class="text-metric font-bold font-mono mt-0.5 block {accent ? 'text-accent' : 'text-t1'}">{value}</span>
</div>
