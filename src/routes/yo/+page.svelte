<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { invalidateAll, goto } from '$app/navigation';

	let { data } = $props();

	let activeTab = $state<'hoy' | 'score' | 'goals' | 'rules' | 'config'>('hoy');

	// Sleep form
	let sleepSleptAt = $state(data.sleep?.sleptAt || '');
	let sleepWokeAt = $state(data.sleep?.wokeAt || '');
	let sleepQuality = $state(data.sleep?.quality || 3);

	// Goal form
	let showGoalForm = $state(false);
	let goalTitle = $state('');
	let goalCategory = $state<string>('body');
	let goalMetric = $state('');
	let goalTarget = $state('');
	let goalDeadline = $state('');

	// Rule form
	let showRuleForm = $state(false);
	let ruleText = $state('');
	let ruleCategory = $state<string>('discipline');

	// Weekly review form
	let reviewWins = $state(data.weekInfo.review?.wins || '');
	let reviewLessons = $state(data.weekInfo.review?.lessons || '');
	let reviewFocus = $state(data.weekInfo.review?.focusNext || '');
	let reviewSaved = $state(false);

	// Config form
	let configName = $state(data.profile.name);
	let configIdentity = $state(data.profile.identity || '');
	let configSleepTarget = $state(data.profile.sleepTarget);
	let configWakeTarget = $state(data.profile.wakeTarget);
	let configFocusHours = $state(data.profile.focusHoursTarget);
	let configCalories = $state(data.profile.caloriesTarget);
	let configProtein = $state(data.profile.proteinTarget);
	let configGymDays = $state(data.profile.gymDaysWeek);

	// Módulos activos para el score (opt-in)
	const allModules = [
		{ key: 'sleep', label: 'sueño' },
		{ key: 'habits', label: 'hábitos' },
		{ key: 'focus', label: 'foco' },
		{ key: 'gym', label: 'gym' },
		{ key: 'nutrition', label: 'nutrición' }
	];
	let enabledModules = $state(new Set(data.profile.enabledModules.split(',').map(s => s.trim()).filter(Boolean)));

	function toggleModule(key: string) {
		const next = new Set(enabledModules);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		enabledModules = next;
	}

	// Breakdown del score: solo módulos guardados como activos, con pesos renormalizados
	const baseWeights: Record<string, number> = { sleep: 20, habits: 25, focus: 25, gym: 15, nutrition: 15 };
	const scoreBreakdown = $derived.by(() => {
		const saved = data.profile.enabledModules.split(',').map(s => s.trim()).filter(Boolean);
		const sum = saved.reduce((a, k) => a + (baseWeights[k] ?? 0), 0) || 1;
		const vals: Record<string, number> = {
			sleep: data.score?.sleepScore ?? 0,
			habits: data.score?.habitsScore ?? 0,
			focus: data.score?.focusScore ?? 0,
			gym: data.score?.gymScore ?? 0,
			nutrition: data.score?.nutritionScore ?? 0
		};
		const labels: Record<string, string> = { sleep: 'sueño', habits: 'hábitos', focus: 'foco', gym: 'gym', nutrition: 'nutrición' };
		return saved.map(k => ({ label: labels[k], value: vals[k], weight: `${Math.round((baseWeights[k] / sum) * 100)}%` }));
	});

	async function logSleep() {
		if (!sleepSleptAt || !sleepWokeAt) return;
		await fetch('/api/yo?action=sleep', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ date: data.today, sleptAt: sleepSleptAt, wokeAt: sleepWokeAt, quality: sleepQuality })
		});
		await fetch(`/api/yo?action=calculate&date=${data.today}`);
		invalidateAll();
	}

	async function toggleHabit(habitId: number) {
		const id = parseInt(String(habitId));
		await fetch('/api/habits?action=toggle', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ habitId: id, date: data.today })
		});
		await fetch(`/api/yo?action=calculate&date=${data.today}`);
		invalidateAll();
	}

	async function addGoal() {
		if (!goalTitle) return;
		await fetch('/api/yo?action=goal', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: goalTitle, category: goalCategory,
				metric: goalMetric || null, targetValue: goalTarget ? parseFloat(goalTarget) : null,
				deadline: goalDeadline || null
			})
		});
		showGoalForm = false;
		goalTitle = '';
		goalMetric = '';
		goalTarget = '';
		goalDeadline = '';
		invalidateAll();
	}

	async function updateGoalProgress(id: number, value: string) {
		const num = parseFloat(value);
		if (isNaN(num)) return;
		await fetch('/api/yo?action=goal-progress', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, currentValue: num })
		});
		invalidateAll();
	}

	async function addRule() {
		if (!ruleText) return;
		await fetch('/api/yo?action=rule', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: ruleText, category: ruleCategory })
		});
		showRuleForm = false;
		ruleText = '';
		invalidateAll();
	}

	async function removeRule(id: number) {
		await fetch('/api/yo?action=delete-rule', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		invalidateAll();
	}

	async function saveConfig() {
		await fetch('/api/yo?action=profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: configName, identity: configIdentity || null,
				sleepTarget: configSleepTarget, wakeTarget: configWakeTarget,
				focusHoursTarget: configFocusHours, caloriesTarget: configCalories,
				proteinTarget: configProtein, gymDaysWeek: configGymDays,
				enabledModules: [...enabledModules].join(',')
			})
		});
		// recalcular el score con los módulos nuevos
		await fetch(`/api/yo?action=calculate&date=${data.today}`);
		invalidateAll();
	}

	async function saveReview() {
		await fetch('/api/yo?action=review', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				week: data.weekInfo.week,
				wins: reviewWins || null,
				lessons: reviewLessons || null,
				focusNext: reviewFocus || null,
				avgScore: data.weekInfo.avgScore
			})
		});
		reviewSaved = true;
		setTimeout(() => reviewSaved = false, 2000);
		invalidateAll();
	}

	function scoreColor(score: number): string {
		if (score >= 80) return 'text-accent';
		if (score >= 60) return 'text-t1';
		if (score >= 40) return 'text-warn';
		return 'text-danger';
	}

	function scoreBg(score: number): string {
		if (score >= 80) return 'bg-accent';
		if (score >= 60) return 'bg-t1';
		if (score >= 40) return 'bg-warn';
		return 'bg-danger';
	}

	function completionColor(pct: number): string {
		if (pct >= 80) return 'text-accent';
		if (pct >= 50) return 'text-t1';
		return 'text-t2';
	}

	const categoryIcons: Record<string, string> = {
		discipline: '///', health: '+', money: '$', growth: '^', general: '*',
		body: '+', mind: '^', craft: '/', money2: '$'
	};
</script>

<TopBar title="yo" />

<div class="px-4 pb-4 space-y-4">
	<!-- Character header — siempre visible -->
	<div class="bg-surface border border-border rounded-card p-4">
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-2">
					<span class="font-mono text-micro text-bg bg-accent px-1.5 py-0.5 rounded font-bold">LV{data.profile.level}</span>
					<h2 class="font-mono text-metric font-bold text-t1">{data.profile.name}</h2>
				</div>
				{#if data.profile.identity}
					<p class="text-label text-t2 mt-0.5 italic">"{data.profile.identity}"</p>
				{/if}
			</div>
			<div class="text-right">
				<span class="font-mono text-hero font-bold {scoreColor(data.score?.totalScore ?? 0)}">{data.score?.totalScore ?? 0}</span>
				<div class="flex items-center justify-end gap-1 mt-0.5">
					{#if data.streak > 0}
						<span class="font-mono text-micro text-accent">{data.streak}d streak</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- XP bar -->
		<div class="mt-2.5">
			<div class="flex justify-between text-micro text-t3 mb-0.5">
				<span>{data.profile.xpInfo.current} / {data.profile.xpInfo.needed} XP</span>
				<span>LV{data.profile.level + 1}</span>
			</div>
			<div class="h-1 bg-elevated rounded-full overflow-hidden">
				<div class="h-full bg-accent rounded-full transition-all" style="width: {data.profile.xpInfo.progress}%"></div>
			</div>
		</div>
	</div>

	<!-- Tab selector -->
	<div class="flex gap-0.5 bg-surface rounded-lg p-1">
		{#each ['hoy', 'score', 'goals', 'rules', 'config'] as tab}
			<button
				onclick={() => activeTab = tab as typeof activeTab}
				class="flex-1 py-1.5 rounded-md text-micro uppercase tracking-[0.06em] transition-colors
					{activeTab === tab ? 'bg-elevated text-t1' : 'text-t3'}"
			>{tab}</button>
		{/each}
	</div>

	<!-- ═══════ HOY TAB — COCKPIT DIARIO ═══════ -->
	{#if activeTab === 'hoy'}

		<!-- Progreso del día (lenguaje de barra, consistente con XP/score/budgets) -->
		<div class="space-y-1.5">
			<div class="flex items-baseline justify-between">
				<span class="text-label text-t2 uppercase tracking-[0.08em]">progreso del día</span>
				<span class="text-meta text-t3 font-mono">{data.cockpit.doneItems}/{data.cockpit.totalItems}</span>
			</div>
			<div class="flex items-center gap-3">
				<div class="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
					<div class="h-full rounded-full transition-all duration-500
						{data.cockpit.completionPct >= 80 ? 'bg-accent' : data.cockpit.completionPct >= 50 ? 'bg-t1' : 'bg-t3'}"
						style="width: {data.cockpit.completionPct}%"></div>
				</div>
				<span class="font-mono text-metric font-bold {completionColor(data.cockpit.completionPct)} tabular-nums w-12 text-right">{data.cockpit.completionPct}%</span>
			</div>
		</div>

		<!-- Checklist del día -->
		<div class="space-y-1">
			<span class="text-label text-t2 uppercase tracking-[0.08em]">checklist del día</span>
			{#each data.cockpit.checklist as item}
				{@const isHabit = item.id.startsWith('habit-')}
				<button
					onclick={() => {
						if (isHabit) {
							const habitId = parseInt(item.id.split('-')[1]);
							toggleHabit(habitId);
						} else if (item.id === 'sleep' && !item.done) {
							activeTab = 'score';
						} else if (item.id === 'gym') {
							goto('/gym');
						} else if (item.id === 'focus') {
							goto('/time');
						} else if (item.id === 'protein') {
							goto('/meals');
						}
					}}
					class="w-full flex items-center gap-3 py-2.5 px-3 rounded-control transition-colors
						{item.done ? 'bg-surface' : 'bg-elevated border border-border'}"
				>
					<div class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
						{item.done ? 'bg-accent border-accent' : 'border-t3'}">
						{#if item.done}
							<svg width="10" height="10" viewBox="0 0 12 12" fill="none" transition:scale={{ duration: 200, easing: backOut }}>
								<path d="M2 6L5 9L10 3" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{/if}
					</div>
					<span class="text-body flex-1 text-left {item.done ? 'text-t2 line-through' : 'text-t1'}">{item.label}</span>
					{#if item.detail}
						<span class="text-micro text-t3 font-mono">{item.detail}</span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Tareas pendientes -->
		{#if data.cockpit.pendingTasks.length > 0}
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="text-label text-t2 uppercase tracking-[0.08em]">tareas pendientes</span>
					<a href="/time" class="text-micro text-accent">ver todas</a>
				</div>
				{#each data.cockpit.pendingTasks as task}
					<div class="flex items-center gap-2 py-1.5">
						<span class="text-micro text-t3 font-mono w-4">P{task.priority}</span>
						<span class="text-body text-t1">{task.title}</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Goals activos (resumen) -->
		{#if data.goals.length > 0}
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="text-label text-t2 uppercase tracking-[0.08em]">metas activas</span>
					<button onclick={() => activeTab = 'goals'} class="text-micro text-accent">ver todas</button>
				</div>
				{#each data.goals.slice(0, 3) as goal}
					{@const pct = goal.targetValue ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0}
					<div class="flex items-center gap-2">
						<span class="text-body flex-1 truncate">{goal.title}</span>
						{#if goal.targetValue}
							<div class="w-16 h-1 bg-elevated rounded-full overflow-hidden">
								<div class="h-full bg-accent rounded-full" style="width: {Math.min(pct, 100)}%"></div>
							</div>
							<span class="font-mono text-micro text-t3">{pct}%</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

	<!-- ═══════ SCORE TAB ═══════ -->
	{:else if activeTab === 'score'}
		<div class="space-y-2">
			<span class="text-label text-t2 uppercase tracking-[0.08em]">breakdown de hoy</span>
			{#each scoreBreakdown as item}
				<div class="flex items-center gap-2">
					<span class="text-label text-t2 w-16">{item.label}</span>
					<div class="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
						<div class="{scoreBg(item.value)} h-full rounded-full transition-all" style="width: {item.value}%"></div>
					</div>
					<span class="font-mono text-label {scoreColor(item.value)} w-8 text-right">{item.value}</span>
					<span class="text-micro text-t3 w-6">{item.weight}</span>
				</div>
			{/each}
		</div>

		<!-- Sleep log -->
		<div class="bg-surface border border-border rounded-card p-3.5 space-y-2">
			<span class="text-label text-t2 uppercase tracking-[0.08em]">registro de sueño</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-micro text-t3 block mb-1">me dormí</label>
					<input type="time" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={sleepSleptAt} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none focus:border-accent-dim" />
				</div>
				<div>
					<label class="text-micro text-t3 block mb-1">desperté</label>
					<input type="time" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={sleepWokeAt} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none focus:border-accent-dim" />
				</div>
			</div>
			<div>
				<label class="text-micro text-t3 block mb-1">calidad</label>
				<div class="flex gap-1">
					{#each [1,2,3,4,5] as q}
						<button
							onclick={() => sleepQuality = q}
							class="w-8 h-8 rounded-md text-label font-mono transition-colors
								{sleepQuality === q ? 'bg-accent text-bg' : 'bg-elevated text-t2'}"
						>{q}</button>
					{/each}
				</div>
			</div>
			<button onclick={logSleep} class="w-full bg-accent text-bg font-medium text-meta py-2.5 rounded-lg active:scale-[0.98] transition-transform">guardar sueño</button>
		</div>

		<!-- Score history -->
		{#if data.scoreHistory.length > 0}
			{@const hist = data.scoreHistory.slice().reverse()}
			{@const avg = Math.round(hist.reduce((s, d) => s + d.totalScore, 0) / hist.length)}
			<div class="space-y-1.5">
				<div class="flex items-baseline justify-between">
					<span class="text-label text-t2 uppercase tracking-[0.08em]">últimos 14 días</span>
					<span class="text-meta text-t3 font-mono">prom {avg}</span>
				</div>
				<div class="flex items-end gap-[3px] h-14">
					{#each hist as day}
						<div class="flex-1 rounded-sm {scoreBg(day.totalScore)} transition-all" style="height: {Math.max(6, day.totalScore)}%"></div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Weekly review -->
		<div class="bg-surface border border-border rounded-card p-3.5 space-y-2.5">
			<div class="flex items-baseline justify-between">
				<span class="text-label text-t2 uppercase tracking-[0.08em]">review · {data.weekInfo.week}</span>
				<span class="font-mono text-meta {scoreColor(data.weekInfo.avgScore)}">prom {data.weekInfo.avgScore}</span>
			</div>
			<div class="space-y-1">
				<span class="text-micro text-t3 block">qué salió bien</span>
				<textarea bind:value={reviewWins} rows="2" placeholder="wins de la semana..." class="w-full bg-elevated border border-border rounded-control px-3 py-2 text-body text-t1 placeholder:text-t3 outline-none focus:border-accent-dim resize-none"></textarea>
			</div>
			<div class="space-y-1">
				<span class="text-micro text-t3 block">qué ajustar</span>
				<textarea bind:value={reviewLessons} rows="2" placeholder="lecciones..." class="w-full bg-elevated border border-border rounded-control px-3 py-2 text-body text-t1 placeholder:text-t3 outline-none focus:border-accent-dim resize-none"></textarea>
			</div>
			<div class="space-y-1">
				<span class="text-micro text-t3 block">foco la próxima semana</span>
				<textarea bind:value={reviewFocus} rows="2" placeholder="prioridad..." class="w-full bg-elevated border border-border rounded-control px-3 py-2 text-body text-t1 placeholder:text-t3 outline-none focus:border-accent-dim resize-none"></textarea>
			</div>
			<button onclick={saveReview} class="w-full bg-accent text-bg font-medium text-meta py-2.5 rounded-control active:scale-[0.98] transition-transform">
				{reviewSaved ? 'guardado ✓' : 'guardar review'}
			</button>
		</div>

	<!-- ═══════ GOALS TAB ═══════ -->
	{:else if activeTab === 'goals'}
		<div class="space-y-2">
			{#if data.goals.length === 0}
				<EmptyState text="sin metas activas" hint />
			{/if}
			{#each data.goals as goal}
				{@const pct = goal.targetValue ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0}
				<div class="bg-surface border border-border rounded-card p-3.5">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="font-mono text-micro text-accent bg-accent-bg px-1.5 py-0.5 rounded">{goal.category}</span>
							<span class="text-body">{goal.title}</span>
						</div>
						{#if goal.deadline}
							<span class="text-micro text-t3">{goal.deadline}</span>
						{/if}
					</div>
					{#if goal.targetValue}
						<div class="mt-2 flex items-center gap-2">
							<div class="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
								<div class="h-full bg-accent rounded-full transition-all" style="width: {Math.min(pct, 100)}%"></div>
							</div>
							<input
								type="number"
								value={goal.currentValue}
								onchange={(e) => updateGoalProgress(goal.id, (e.target as HTMLInputElement).value)}
								class="w-14 bg-elevated border border-border rounded px-1.5 py-1 font-mono text-label text-t1 outline-none text-right"
							/>
							<span class="text-micro text-t3">/ {goal.targetValue} {goal.metric || ''}</span>
						</div>
					{/if}
				</div>
			{/each}

			<button onclick={() => showGoalForm = true} class="w-full py-2 border border-dashed border-t3 rounded-lg text-t3 text-meta active:bg-elevated transition-colors">+ nueva meta</button>
		</div>

		{#if showGoalForm}
			<div class="bg-surface border border-border rounded-card p-3.5 space-y-2">
				<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={goalTitle} placeholder="título de la meta" class="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-body text-t1 placeholder:text-t3 outline-none" />
				<div class="grid grid-cols-2 gap-2">
					<select bind:value={goalCategory} class="bg-elevated border border-border rounded-lg px-2 py-2 text-label text-t1 outline-none">
						<option value="body">body</option>
						<option value="mind">mind</option>
						<option value="money">money</option>
						<option value="craft">craft</option>
						<option value="general">general</option>
					</select>
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={goalMetric} placeholder="unidad (kg, $...)" class="bg-elevated border border-border rounded-lg px-2 py-2 text-label text-t1 placeholder:text-t3 outline-none" />
				</div>
				<div class="grid grid-cols-2 gap-2">
					<input type="number" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={goalTarget} placeholder="valor objetivo" class="bg-elevated border border-border rounded-lg px-2 py-2 text-label text-t1 placeholder:text-t3 outline-none font-mono" />
					<input type="date" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={goalDeadline} class="bg-elevated border border-border rounded-lg px-2 py-2 text-label text-t1 outline-none" />
				</div>
				<button onclick={addGoal} class="w-full bg-accent text-bg font-medium text-meta py-2.5 rounded-lg active:scale-[0.98]">guardar meta</button>
			</div>
		{/if}

	<!-- ═══════ RULES TAB ═══════ -->
	{:else if activeTab === 'rules'}
		<div class="space-y-2">
			<p class="text-label text-t3">principios no negociables</p>
			{#if data.rules.length === 0}
				<EmptyState text="sin reglas definidas" hint />
			{/if}
			{#each data.rules as rule, i}
				<div class="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-lg">
					<span class="font-mono text-micro text-accent w-5">{String(i + 1).padStart(2, '0')}</span>
					<span class="text-body flex-1">{rule.text}</span>
					<span class="text-micro text-t3 bg-elevated px-1.5 py-0.5 rounded">{rule.category}</span>
					<button onclick={() => removeRule(rule.id)} class="text-t3 text-label hover:text-danger">x</button>
				</div>
			{/each}

			{#if showRuleForm}
				<div class="space-y-2">
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={ruleText} placeholder="nueva regla..." class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-body text-t1 placeholder:text-t3 outline-none" />
					<select bind:value={ruleCategory} class="w-full bg-elevated border border-border rounded-lg px-2 py-2.5 text-label text-t1 outline-none">
						<option value="discipline">discipline</option>
						<option value="health">health</option>
						<option value="money">money</option>
						<option value="growth">growth</option>
						<option value="general">general</option>
					</select>
					<button onclick={addRule} class="w-full bg-accent text-bg font-medium text-meta py-2.5 rounded-lg active:scale-[0.98]">guardar regla</button>
				</div>
			{:else}
				<button onclick={() => showRuleForm = true} class="w-full py-2 border border-dashed border-t3 rounded-lg text-t3 text-meta active:bg-elevated transition-colors">+ nueva regla</button>
			{/if}
		</div>

	<!-- ═══════ CONFIG TAB ═══════ -->
	{:else if activeTab === 'config'}
		<div class="space-y-3">
			<span class="text-label text-t2 uppercase tracking-[0.08em]">identidad</span>
			<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configName} placeholder="tu nombre" class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-body text-t1 placeholder:text-t3 outline-none" />
			<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configIdentity} placeholder="soy alguien que..." class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-body text-t1 placeholder:text-t3 outline-none italic" />

			<span class="text-label text-t2 uppercase tracking-[0.08em] block pt-2">arquitectura de sueño</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-micro text-t3 block mb-1">dormir a las</label>
					<input type="time" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configSleepTarget} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
				<div>
					<label class="text-micro text-t3 block mb-1">despertar a las</label>
					<input type="time" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configWakeTarget} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
			</div>

			<span class="text-label text-t2 uppercase tracking-[0.08em] block pt-2">targets diarios</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-micro text-t3 block mb-1">horas de foco</label>
					<input type="number" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configFocusHours} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
				<div>
					<label class="text-micro text-t3 block mb-1">dias gym / semana</label>
					<input type="number" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configGymDays} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-micro text-t3 block mb-1">calorias target</label>
					<input type="number" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configCalories} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
				<div>
					<label class="text-micro text-t3 block mb-1">proteína (g)</label>
					<input type="number" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" bind:value={configProtein} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sub text-t1 outline-none" />
				</div>
			</div>

			<span class="text-label text-t2 uppercase tracking-[0.08em] block pt-2">módulos del score</span>
			<p class="text-micro text-t3 -mt-1">solo los activos cuentan. el score se reparte entre ellos — un día perfecto en lo que llevas no se hunde por lo que no.</p>
			<div class="flex flex-wrap gap-2">
				{#each allModules as m}
					{@const on = enabledModules.has(m.key)}
					<button
						onclick={() => toggleModule(m.key)}
						class="px-3 py-1.5 rounded-control text-meta transition-colors border
							{on ? 'bg-accent-bg border-accent-dim text-accent' : 'bg-elevated border-border text-t3'}"
					>{m.label}</button>
				{/each}
			</div>

			<button onclick={saveConfig} class="w-full bg-accent text-bg font-medium text-sub py-3 rounded-control active:scale-[0.98] transition-transform mt-2">guardar config</button>
		</div>
	{/if}
</div>
