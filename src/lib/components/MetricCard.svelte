<script lang="ts">
	interface Props {
		label: string;
		value: string;
		accent?: boolean;
	}

	let { label, value, accent = false }: Props = $props();
</script>

<div class="bg-surface border border-border rounded-[14px] px-3.5 py-3">
	<span class="text-[11px] text-t2 uppercase tracking-[0.08em] block">{label}</span>
	<span class="text-[22px] font-bold font-mono mt-0.5 block {accent ? 'text-accent' : 'text-t1'}">{value}</span>
</div>
