<script lang="ts">
	interface Props {
		title: string;
	}

	let { title }: Props = $props();

	const today = new Date().toLocaleDateString('es-MX', {
		weekday: 'short',
		day: 'numeric',
		month: 'short'
	});
</script>

<header class="px-4 pt-5 pb-3">
	<div class="flex items-center gap-2">
		<div class="w-2 h-2 rounded-full bg-accent"></div>
		<span class="text-xs text-t2">{today}</span>
	</div>
	<h1 class="text-[13px] font-medium font-sans mt-1">{title}</h1>
</header>
