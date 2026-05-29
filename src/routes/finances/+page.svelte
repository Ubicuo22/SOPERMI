<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let showForm = $state(false);
	let formAmount = $state('');
	let formType = $state<'expense' | 'income'>('expense');
	let formCategory = $state(1);
	let formDesc = $state('');

	$effect(() => {
		if ($page.url.searchParams.get('add') === '1') showForm = true;
	});

	async function submit() {
		if (!formAmount) return;
		await fetch('/api/finances', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount: parseFloat(formAmount),
				type: formType,
				categoryId: formCategory,
				description: formDesc || null,
				date: new Date().toISOString().split('T')[0]
			})
		});
		showForm = false;
		formAmount = '';
		formDesc = '';
		invalidateAll();
	}

	async function remove(id: number) {
		await fetch(`/api/finances?id=${id}`, { method: 'DELETE' });
		invalidateAll();
	}

	function formatMoney(n: number) {
		return `$${Math.abs(n).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
	}
</script>

<TopBar title="finanzas" />

<div class="px-4 pb-4 space-y-4">
	<div class="grid grid-cols-3 gap-2">
		<MetricCard label="balance" value={formatMoney(data.balance.balance)} accent={data.balance.balance >= 0} />
		<MetricCard label="ingresos" value={formatMoney(data.balance.income)} accent />
		<MetricCard label="gastos" value={formatMoney(data.balance.expense)} />
	</div>

	{#if data.budgets.length > 0}
		<div class="space-y-2">
			<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">presupuestos</span>
			{#each data.budgets as b}
				{@const pct = b.budgetAmount > 0 ? (b.spent / b.budgetAmount) * 100 : 0}
				{@const color = pct >= 100 ? 'bg-danger' : pct >= 75 ? 'bg-warn' : 'bg-accent'}
				<div class="flex items-center gap-2">
					<span class="text-[11px] text-t2 w-[60px] truncate">{b.categoryName}</span>
					<div class="flex-1 h-1 bg-elevated rounded-full overflow-hidden">
						<div class="{color} h-full rounded-full transition-all" style="width: {Math.min(pct, 100)}%"></div>
					</div>
					<span class="text-[11px] font-mono text-t2 w-9 text-right">{Math.round(pct)}%</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="space-y-1">
		<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">transacciones</span>
		{#if data.transactions.length === 0}
			<p class="text-t2 text-xs py-4">sin registros este mes</p>
		{/if}
		{#each data.transactions as tx}
			<div class="flex items-center justify-between py-2 border-b border-border-soft">
				<div class="flex flex-col">
					<span class="text-[13px]">{tx.description || tx.categoryName || 'sin categoria'}</span>
					<span class="text-[10px] text-t3">{tx.date}</span>
				</div>
				<button onclick={() => remove(tx.id)} class="flex items-center gap-1">
					<span class="font-mono text-[13px] {tx.type === 'income' ? 'text-accent' : 'text-t1'}">
						{tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
					</span>
				</button>
			</div>
		{/each}
	</div>
</div>

{#if showForm}
	<div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50" role="dialog">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bg-surface border-t border-border rounded-t-2xl w-full max-w-md p-4 space-y-3" onkeydown={() => {}}>
			<div class="flex justify-between items-center">
				<span class="text-[13px] font-medium">nueva transaccion</span>
				<button onclick={() => showForm = false} class="text-t2 text-sm">cerrar</button>
			</div>

			<div class="flex gap-2">
				<button
					onclick={() => formType = 'expense'}
					class="flex-1 py-2 rounded-lg text-xs {formType === 'expense' ? 'bg-elevated text-t1' : 'text-t2'}"
				>gasto</button>
				<button
					onclick={() => formType = 'income'}
					class="flex-1 py-2 rounded-lg text-xs {formType === 'income' ? 'bg-elevated text-t1' : 'text-t2'}"
				>ingreso</button>
			</div>

			<input
				type="number"
				bind:value={formAmount}
				placeholder="0.00"
				class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 font-mono text-lg text-t1 placeholder:text-t3 outline-none focus:border-accent-dim"
			/>

			<select bind:value={formCategory} class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 outline-none">
				{#each data.categories as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>

			<input
				type="text"
				bind:value={formDesc}
				placeholder="descripcion (opcional)"
				class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 placeholder:text-t3 outline-none focus:border-accent-dim"
			/>

			<button
				onclick={submit}
				class="w-full bg-accent text-bg font-medium text-sm py-3 rounded-lg active:scale-[0.98] transition-transform"
			>guardar</button>
		</div>
	</div>
{/if}
