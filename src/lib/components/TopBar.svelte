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

<!-- sticky: siempre visible al scrollear, fondo del mismo color que la app -->
<header class="sticky top-0 z-30 bg-bg px-4 pt-4 pb-3 border-b border-border-soft">
	<span class="text-micro text-t3 uppercase tracking-[0.08em] block">{today}</span>
	<h1 class="text-metric font-mono font-bold lowercase mt-0.5">{title}</h1>
</header>
