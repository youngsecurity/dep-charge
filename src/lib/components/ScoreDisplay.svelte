<script lang="ts">
	import type { AnalysisResult } from '$lib/types';
	import { riskLevelColor, scoreToRiskLevel } from '$lib/utils';
	import * as Card from '$lib/components/ui/card';

	let { result }: { result: AnalysisResult } = $props();

	const scoreColor = $derived(riskLevelColor(scoreToRiskLevel(result.overall_score)));

	const scoreLabel = $derived(
		result.overall_score <= 3
			? 'Low Risk'
			: result.overall_score <= 6
				? 'Moderate Risk'
				: result.overall_score <= 8
					? 'High Risk'
					: 'Critical Risk'
	);

	const circumference = 2 * Math.PI * 54;
	const offset = $derived(circumference - (result.overall_score / 10) * circumference);

	const riskItems = $derived([
		{ label: 'Critical', count: result.risk_summary.critical, level: 'critical' },
		{ label: 'High', count: result.risk_summary.high, level: 'high' },
		{ label: 'Medium', count: result.risk_summary.medium, level: 'medium' },
		{ label: 'Low', count: result.risk_summary.low, level: 'low' }
	]);
</script>

<div class="flex flex-col items-center gap-4 py-6">
	<div class="relative flex items-center justify-center">
		<svg viewBox="0 0 120 120" class="h-40 w-40" role="img" aria-label="Risk score {result.overall_score} out of 10">
			<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="8" class="text-border" />
			<circle
				cx="60"
				cy="60"
				r="54"
				fill="none"
				stroke={scoreColor}
				stroke-width="8"
				stroke-linecap="round"
				stroke-dasharray={circumference}
				stroke-dashoffset={offset}
				transform="rotate(-90 60 60)"
			/>
		</svg>
		<div class="absolute flex items-baseline gap-0.5" style="color: {scoreColor}">
			<span class="text-5xl font-extrabold leading-none">{result.overall_score}</span>
			<span class="text-xl opacity-60">/10</span>
		</div>
	</div>
	<div class="flex flex-col items-center gap-1">
		<span class="text-xl font-bold" style="color: {scoreColor}">{scoreLabel}</span>
		<span class="rounded-full border border-border bg-card px-3 py-0.5 font-mono text-xs uppercase tracking-wider">{result.ecosystem}</span>
		<span class="text-sm text-muted-foreground">{result.total_dependencies} dependencies analyzed</span>
	</div>
</div>

<Card.Root class="mt-4">
	<Card.Content>
		<div class="grid grid-cols-4 gap-3 text-center">
			{#each riskItems as item}
				<div class="flex flex-col items-center gap-1">
					<span class="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</span>
					<span class="text-2xl font-bold" style="color: {riskLevelColor(item.level)}">{item.count}</span>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<Card.Root class="mt-4">
	<Card.Content>
		<p class="leading-relaxed">{result.overall_explanation}</p>
	</Card.Content>
</Card.Root>
