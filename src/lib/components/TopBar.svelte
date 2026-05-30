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

<!--
	sticky top-0: se queda pegado al inicio del scroll container (main).
	El main ya tiene el spacer de safe-area-top arriba, así que top:0 es correcto.
	bg-bg cubre el contenido que pasa por debajo al scrollear.
-->
<header class="sticky top-0 z-30 bg-bg px-4 pt-4 pb-3 border-b border-border-soft">
	<span class="text-micro text-t3 uppercase tracking-[0.08em] block">{today}</span>
	<h1 class="text-metric font-mono font-bold lowercase mt-0.5">{title}</h1>
</header>
