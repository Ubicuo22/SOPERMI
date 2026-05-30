<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SectionLabel from '$lib/components/ui/SectionLabel.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
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

	async function quickAdd(q: typeof data.quick[0]) {
		await fetch('/api/finances', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				amount: q.amount,
				type: q.type,
				categoryId: q.categoryId,
				description: q.description,
				date: new Date().toISOString().split('T')[0]
			})
		});
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

	{#if data.quick.length > 0}
		<div class="space-y-2">
			<SectionLabel>rápidas</SectionLabel>
			<div class="flex flex-wrap gap-2">
				{#each data.quick as q}
					<button onclick={() => quickAdd(q)} class="flex items-center gap-1.5 bg-elevated border border-border rounded-control px-2.5 py-1.5 active:bg-border transition-colors">
						<span class="text-meta text-t1">{q.description}</span>
						<span class="font-mono text-micro tabular-nums {q.type === 'income' ? 'text-accent' : 'text-t2'}">{q.type === 'income' ? '+' : '-'}{formatMoney(q.amount)}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	{#if data.budgets.length > 0}
		<div class="space-y-2">
			<SectionLabel>presupuestos</SectionLabel>
			{#each data.budgets as b}
				{@const pct = b.budgetAmount > 0 ? (b.spent / b.budgetAmount) * 100 : 0}
				{@const color = pct >= 100 ? 'bg-danger' : pct >= 75 ? 'bg-warn' : 'bg-accent'}
				<div class="flex items-center gap-2">
					<span class="text-label text-t2 w-[60px] truncate">{b.categoryName}</span>
					<div class="flex-1 h-1 bg-elevated rounded-full overflow-hidden">
						<div class="{color} h-full rounded-full transition-all" style="width: {Math.min(pct, 100)}%"></div>
					</div>
					<span class="text-label font-mono text-t2 w-9 text-right">{Math.round(pct)}%</span>
				</div>
			{/each}
		</div>
	{/if}

	<div class="space-y-1">
		<SectionLabel>transacciones</SectionLabel>
		{#if data.transactions.length === 0}
			<EmptyState text="sin registros este mes" hint />
		{/if}
		{#each data.transactions as tx}
			<button onclick={() => remove(tx.id)} class="w-full flex items-center justify-between py-2 border-b border-border-soft text-left">
				<div class="flex flex-col">
					<span class="text-body">{tx.description || tx.categoryName || 'sin categoría'}</span>
					<span class="text-micro text-t3">{tx.date}</span>
				</div>
				<span class="font-mono text-body tabular-nums {tx.type === 'income' ? 'text-accent' : 'text-t1'}">
					{tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
				</span>
			</button>
		{/each}
	</div>
</div>

<BottomSheet bind:open={showForm} title="nueva transacción">
	<div class="flex gap-2">
		<button
			onclick={() => formType = 'expense'}
			class="flex-1 py-2 rounded-control text-meta {formType === 'expense' ? 'bg-elevated text-t1' : 'text-t2'}"
		>gasto</button>
		<button
			onclick={() => formType = 'income'}
			class="flex-1 py-2 rounded-control text-meta {formType === 'income' ? 'bg-elevated text-t1' : 'text-t2'}"
		>ingreso</button>
	</div>

	<Input type="number" bind:value={formAmount} placeholder="0.00" mono />

	<select bind:value={formCategory} class="w-full bg-elevated border border-border rounded-control px-3 py-2.5 text-body text-t1 outline-none">
		{#each data.categories as cat}
			<option value={cat.id}>{cat.name}</option>
		{/each}
	</select>

	<Input type="text" bind:value={formDesc} placeholder="descripción (opcional)" />

	<Button full onclick={submit}>guardar</Button>
</BottomSheet>
