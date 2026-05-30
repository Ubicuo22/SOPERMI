<script lang="ts">
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
			window.location.href = '/finances';
		} else {
			error = 'PIN incorrecto';
			pin = '';
		}
		loading = false;
	}

	const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
</script>

<div class="flex flex-col items-center justify-center min-h-dvh bg-bg px-4">
	<h1 class="font-mono text-accent text-metric font-bold mb-2">SOPERMI</h1>
	<p class="text-t2 text-meta mb-8">ingresa tu PIN</p>

	<div class="flex gap-2 mb-8">
		{#each Array(6) as _, i}
			<div class="w-3 h-3 rounded-full {i < pin.length ? 'bg-accent' : 'bg-elevated border border-border'}"></div>
		{/each}
	</div>

	{#if error}
		<p class="text-danger text-meta mb-4">{error}</p>
	{/if}

	<div class="grid grid-cols-3 gap-3 w-full max-w-[240px]">
		{#each digits as d}
			{#if d === ''}
				<div></div>
			{:else if d === 'del'}
				<button
					onclick={removeDigit}
					class="h-14 rounded-xl bg-elevated text-t2 text-sub font-sans active:bg-border transition-colors"
				>
					&larr;
				</button>
			{:else}
				<button
					onclick={() => addDigit(d)}
					class="h-14 rounded-xl bg-surface border border-border text-t1 font-mono text-metric active:bg-elevated transition-colors"
				>
					{d}
				</button>
			{/if}
		{/each}
	</div>
</div>
