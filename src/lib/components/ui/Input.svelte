<script lang="ts">
	interface Props {
		value: string | number;
		type?: 'text' | 'number' | 'time' | 'date';
		placeholder?: string;
		label?: string;
		mono?: boolean;
		onchange?: (e: Event) => void;
	}

	let {
		value = $bindable(),
		type = 'text',
		placeholder = '',
		label,
		mono = false,
		onchange
	}: Props = $props();
</script>

<div class={label ? 'space-y-1' : ''}>
	{#if label}
		<span class="text-micro text-t3 block">{label}</span>
	{/if}
	<input
		{type}
		{placeholder}
		{onchange}
		bind:value
		class="w-full bg-elevated border border-border rounded-control px-3 py-2.5 text-body text-t1
			placeholder:text-t3 outline-none focus:border-accent-dim transition-colors
			{mono ? 'font-mono' : ''}"
	/>
</div>
