<script lang="ts">
	import { goto } from '$app/navigation';

	let pin = $state('');
	let error = $state('');
	let loading = $state(false);

	function addDigit(d: string) {
		if (pin.length < 6) pin += d;
		if (pin.length === 6) submit();
	}

	function removeDigit() {
		pin = pin.slice(0, -1);
		error = '';
	}

	async function submit() {
		loading = true;
		error = '';
		const res = await fetch('/api/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pin })
		});
		if (res.ok) {
			goto('/yo');
		} else {
			error = 'PIN incorrecto';
			pin = '';
		}
		loading = false;
	}

	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
</script>

<div
	class="flex flex-col items-center justify-center bg-bg px-4"
	style="height: 100svh; height: 100dvh; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); box-sizing: border-box;"
>
	<h1 class="font-mono text-accent text-metric font-bold mb-1">SOPERMI</h1>
	<p class="text-t2 text-meta mb-10">ingresa tu PIN</p>

	<!-- Puntos del PIN -->
	<div class="flex gap-3 mb-10">
		{#each Array(6) as _, i}
			<div class="w-3 h-3 rounded-full transition-colors duration-150
				{i < pin.length ? 'bg-accent scale-110' : 'bg-elevated border border-border'}">
			</div>
		{/each}
	</div>

	{#if error}
		<p class="text-danger text-meta mb-4">{error}</p>
	{/if}

	<!-- Teclado numérico -->
	<div class="grid grid-cols-3 gap-3 w-full max-w-[260px]">
		{#each digits as d}
			{#if d === ''}
				<div></div>
			{:else if d === 'del'}
				<button
					onclick={removeDigit}
					class="h-16 rounded-card bg-elevated text-t2 text-metric font-sans
						active:bg-border active:scale-95 transition-all duration-100"
				>
					⌫
				</button>
			{:else}
				<button
					onclick={() => addDigit(d)}
					class="h-16 rounded-card bg-surface border border-border text-t1 font-mono text-metric
						active:bg-elevated active:scale-95 transition-all duration-100
						{loading ? 'opacity-50 pointer-events-none' : ''}"
				>
					{d}
				</button>
			{/if}
		{/each}
	</div>
</div>
