<script lang="ts">
	import TopBar from '$lib/components/TopBar.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let activeTab = $state<'score' | 'goals' | 'rules' | 'config'>('score');

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

	// Config form
	let configName = $state(data.profile.name);
	let configIdentity = $state(data.profile.identity || '');
	let configSleepTarget = $state(data.profile.sleepTarget);
	let configWakeTarget = $state(data.profile.wakeTarget);
	let configFocusHours = $state(data.profile.focusHoursTarget);
	let configCalories = $state(data.profile.caloriesTarget);
	let configProtein = $state(data.profile.proteinTarget);
	let configGymDays = $state(data.profile.gymDaysWeek);

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

	async function addGoal() {
		if (!goalTitle) return;
		await fetch('/api/yo?action=goal', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: goalTitle,
				category: goalCategory,
				metric: goalMetric || null,
				targetValue: goalTarget ? parseFloat(goalTarget) : null,
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
				name: configName,
				identity: configIdentity || null,
				sleepTarget: configSleepTarget,
				wakeTarget: configWakeTarget,
				focusHoursTarget: configFocusHours,
				caloriesTarget: configCalories,
				proteinTarget: configProtein,
				gymDaysWeek: configGymDays
			})
		});
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

	const categoryIcons: Record<string, string> = {
		discipline: '///', health: '+', money: '$', growth: '^', general: '*',
		body: '+', mind: '^', craft: '/',
	};
</script>

<TopBar title="yo" />

<div class="px-4 pb-4 space-y-4">
	<!-- Character header -->
	<div class="bg-surface border border-border rounded-[14px] p-4">
		<div class="flex items-center justify-between">
			<div>
				<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">nivel {data.profile.level}</span>
				<h2 class="font-mono text-xl font-bold text-accent">{data.profile.name}</h2>
				{#if data.profile.identity}
					<p class="text-[11px] text-t2 mt-0.5 italic">"{data.profile.identity}"</p>
				{/if}
			</div>
			<div class="text-right">
				<span class="font-mono text-2xl font-bold {scoreColor(data.score?.totalScore ?? 0)}">{data.score?.totalScore ?? 0}</span>
				<span class="text-[10px] text-t3 block">score hoy</span>
			</div>
		</div>

		<!-- XP bar -->
		<div class="mt-3">
			<div class="flex justify-between text-[10px] text-t3 mb-1">
				<span>XP {data.profile.xpInfo.current}/{data.profile.xpInfo.needed}</span>
				<span>LVL {data.profile.level + 1}</span>
			</div>
			<div class="h-1.5 bg-elevated rounded-full overflow-hidden">
				<div class="h-full bg-accent rounded-full transition-all" style="width: {data.profile.xpInfo.progress}%"></div>
			</div>
		</div>
	</div>

	<!-- Tab selector -->
	<div class="flex gap-1 bg-surface rounded-lg p-1">
		{#each ['score', 'goals', 'rules', 'config'] as tab}
			<button
				onclick={() => activeTab = tab as typeof activeTab}
				class="flex-1 py-2 rounded-md text-[11px] uppercase tracking-[0.06em] transition-colors
					{activeTab === tab ? 'bg-elevated text-t1' : 'text-t3'}"
			>{tab}</button>
		{/each}
	</div>

	<!-- SCORE TAB -->
	{#if activeTab === 'score'}
		<!-- Score breakdown -->
		<div class="space-y-2">
			<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">breakdown de hoy</span>
			{#each [
				{ label: 'sueno', value: data.score?.sleepScore ?? 0, weight: '20%' },
				{ label: 'habitos', value: data.score?.habitsScore ?? 0, weight: '25%' },
				{ label: 'foco', value: data.score?.focusScore ?? 0, weight: '25%' },
				{ label: 'gym', value: data.score?.gymScore ?? 0, weight: '15%' },
				{ label: 'nutricion', value: data.score?.nutritionScore ?? 0, weight: '15%' }
			] as item}
				<div class="flex items-center gap-2">
					<span class="text-[11px] text-t2 w-16">{item.label}</span>
					<div class="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
						<div class="{scoreBg(item.value)} h-full rounded-full transition-all" style="width: {item.value}%"></div>
					</div>
					<span class="font-mono text-[11px] text-t2 w-8 text-right">{item.value}</span>
					<span class="text-[9px] text-t3 w-6">{item.weight}</span>
				</div>
			{/each}
		</div>

		<!-- Sleep log -->
		<div class="bg-surface border border-border rounded-[14px] p-3.5 space-y-2">
			<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">registro de sueno</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-[10px] text-t3 block mb-1">me dormi</label>
					<input type="time" bind:value={sleepSleptAt} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
				<div>
					<label class="text-[10px] text-t3 block mb-1">desperte</label>
					<input type="time" bind:value={sleepWokeAt} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
			</div>
			<div>
				<label class="text-[10px] text-t3 block mb-1">calidad (1-5)</label>
				<div class="flex gap-1">
					{#each [1,2,3,4,5] as q}
						<button
							onclick={() => sleepQuality = q}
							class="w-8 h-8 rounded-md text-[11px] font-mono transition-colors
								{sleepQuality === q ? 'bg-accent text-bg' : 'bg-elevated text-t2'}"
						>{q}</button>
					{/each}
				</div>
			</div>
			<button onclick={logSleep} class="w-full bg-accent text-bg font-medium text-xs py-2.5 rounded-lg active:scale-[0.98] transition-transform">guardar sueno</button>
		</div>

		<!-- Score history mini chart -->
		{#if data.scoreHistory.length > 0}
			<div class="space-y-2">
				<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">ultimos 14 dias</span>
				<div class="flex items-end gap-[3px] h-12">
					{#each data.scoreHistory.slice().reverse() as day}
						<div class="flex-1 rounded-sm {scoreBg(day.totalScore)}" style="height: {Math.max(4, day.totalScore)}%; opacity: 0.8"></div>
					{/each}
				</div>
			</div>
		{/if}

	<!-- GOALS TAB -->
	{:else if activeTab === 'goals'}
		<div class="space-y-2">
			{#if data.goals.length === 0}
				<p class="text-t2 text-xs py-4 text-center">sin metas activas</p>
			{/if}
			{#each data.goals as goal}
				{@const pct = goal.targetValue ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0}
				<div class="bg-surface border border-border rounded-[14px] p-3.5">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="font-mono text-[10px] text-accent bg-accent-bg px-1.5 py-0.5 rounded">{categoryIcons[goal.category] || '*'}</span>
							<span class="text-[13px]">{goal.title}</span>
						</div>
						{#if goal.deadline}
							<span class="text-[10px] text-t3">{goal.deadline}</span>
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
								class="w-14 bg-elevated border border-border rounded px-1.5 py-1 font-mono text-[11px] text-t1 outline-none text-right"
							/>
							<span class="text-[10px] text-t3">/ {goal.targetValue} {goal.metric || ''}</span>
						</div>
					{/if}
				</div>
			{/each}

			<button onclick={() => showGoalForm = true} class="w-full py-2 border border-dashed border-t3 rounded-lg text-t3 text-xs active:bg-elevated transition-colors">
				+ nueva meta
			</button>
		</div>

		{#if showGoalForm}
			<div class="bg-surface border border-border rounded-[14px] p-3.5 space-y-2">
				<input type="text" bind:value={goalTitle} placeholder="titulo de la meta" class="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] text-t1 placeholder:text-t3 outline-none" />
				<div class="grid grid-cols-2 gap-2">
					<select bind:value={goalCategory} class="bg-elevated border border-border rounded-lg px-2 py-2 text-[11px] text-t1 outline-none">
						<option value="body">body</option>
						<option value="mind">mind</option>
						<option value="money">money</option>
						<option value="craft">craft</option>
						<option value="general">general</option>
					</select>
					<input type="text" bind:value={goalMetric} placeholder="unidad (kg, $...)" class="bg-elevated border border-border rounded-lg px-2 py-2 text-[11px] text-t1 placeholder:text-t3 outline-none" />
				</div>
				<div class="grid grid-cols-2 gap-2">
					<input type="number" bind:value={goalTarget} placeholder="valor objetivo" class="bg-elevated border border-border rounded-lg px-2 py-2 text-[11px] text-t1 placeholder:text-t3 outline-none font-mono" />
					<input type="date" bind:value={goalDeadline} class="bg-elevated border border-border rounded-lg px-2 py-2 text-[11px] text-t1 outline-none" />
				</div>
				<button onclick={addGoal} class="w-full bg-accent text-bg font-medium text-xs py-2.5 rounded-lg active:scale-[0.98]">guardar meta</button>
			</div>
		{/if}

	<!-- RULES TAB -->
	{:else if activeTab === 'rules'}
		<div class="space-y-2">
			<p class="text-[11px] text-t3">principios no negociables que guian tus decisiones</p>
			{#if data.rules.length === 0}
				<p class="text-t2 text-xs py-4 text-center">sin reglas definidas</p>
			{/if}
			{#each data.rules as rule, i}
				<div class="flex items-center gap-2 py-2 border-b border-border-soft">
					<span class="font-mono text-[10px] text-accent w-5">{String(i + 1).padStart(2, '0')}</span>
					<span class="text-[13px] flex-1">{rule.text}</span>
					<span class="text-[9px] text-t3 bg-elevated px-1.5 py-0.5 rounded">{rule.category}</span>
					<button onclick={() => removeRule(rule.id)} class="text-t3 text-[11px] hover:text-danger">x</button>
				</div>
			{/each}

			{#if showRuleForm}
				<div class="flex gap-2">
					<input type="text" bind:value={ruleText} placeholder="nueva regla..." class="flex-1 bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] text-t1 placeholder:text-t3 outline-none" />
					<select bind:value={ruleCategory} class="bg-elevated border border-border rounded-lg px-2 py-2 text-[10px] text-t1 outline-none">
						<option value="discipline">discipline</option>
						<option value="health">health</option>
						<option value="money">money</option>
						<option value="growth">growth</option>
						<option value="general">general</option>
					</select>
				</div>
				<button onclick={addRule} class="w-full bg-accent text-bg font-medium text-xs py-2.5 rounded-lg active:scale-[0.98]">guardar regla</button>
			{:else}
				<button onclick={() => showRuleForm = true} class="w-full py-2 border border-dashed border-t3 rounded-lg text-t3 text-xs active:bg-elevated transition-colors">
					+ nueva regla
				</button>
			{/if}
		</div>

	<!-- CONFIG TAB -->
	{:else if activeTab === 'config'}
		<div class="space-y-3">
			<span class="text-[11px] text-t2 uppercase tracking-[0.08em]">identidad</span>
			<input type="text" bind:value={configName} placeholder="tu nombre" class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 placeholder:text-t3 outline-none" />
			<input type="text" bind:value={configIdentity} placeholder="soy alguien que..." class="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-[13px] text-t1 placeholder:text-t3 outline-none italic" />

			<span class="text-[11px] text-t2 uppercase tracking-[0.08em] block pt-2">arquitectura de sueno</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-[10px] text-t3 block mb-1">dormir a las</label>
					<input type="time" bind:value={configSleepTarget} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
				<div>
					<label class="text-[10px] text-t3 block mb-1">despertar a las</label>
					<input type="time" bind:value={configWakeTarget} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
			</div>

			<span class="text-[11px] text-t2 uppercase tracking-[0.08em] block pt-2">targets diarios</span>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-[10px] text-t3 block mb-1">horas de foco</label>
					<input type="number" bind:value={configFocusHours} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
				<div>
					<label class="text-[10px] text-t3 block mb-1">dias gym / semana</label>
					<input type="number" bind:value={configGymDays} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
			</div>
			<div class="grid grid-cols-2 gap-2">
				<div>
					<label class="text-[10px] text-t3 block mb-1">calorias target</label>
					<input type="number" bind:value={configCalories} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
				<div>
					<label class="text-[10px] text-t3 block mb-1">proteina (g)</label>
					<input type="number" bind:value={configProtein} class="w-full bg-elevated border border-border rounded-lg px-2 py-2 font-mono text-sm text-t1 outline-none" />
				</div>
			</div>

			<button onclick={saveConfig} class="w-full bg-accent text-bg font-medium text-sm py-3 rounded-lg active:scale-[0.98] transition-transform mt-2">guardar config</button>
		</div>
	{/if}
</div>
