<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'ghost' | 'danger' | 'dashed';
		size?: 'sm' | 'md';
		full?: boolean;
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		full = false,
		type = 'button',
		disabled = false,
		onclick,
		children
	}: Props = $props();

	const variants = {
		primary: 'bg-accent text-bg font-medium active:scale-[0.98]',
		ghost: 'bg-elevated text-t1 active:bg-border',
		danger: 'bg-danger-bg text-danger active:scale-[0.98]',
		dashed: 'border border-dashed border-t3 text-t3 active:bg-elevated'
	};

	const sizes = {
		sm: 'text-meta py-2 px-3',
		md: 'text-sub py-3 px-4'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="rounded-control transition-transform disabled:opacity-40 disabled:active:scale-100
		{variants[variant]} {sizes[size]} {full ? 'w-full' : ''}"
>
	{@render children()}
</button>
