<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();

	const today = new Date().toLocaleDateString('es-MX', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});
</script>

<header class="px-4 pt-5 pb-3">
	<span class="text-micro text-t3 uppercase tracking-[0.08em] block">{today}</span>
	<h1 class="text-metric font-mono font-bold lowercase mt-0.5">{title}</h1>
</header>
