<script lang="ts">
	import type { AnalysisResult } from '$lib/types';

	let { result }: { result: AnalysisResult } = $props();

	const scoreColor = $derived(
		result.overall_score <= 3
			? 'var(--color-low)'
			: result.overall_score <= 6
				? 'var(--color-medium)'
				: result.overall_score <= 8
					? 'var(--color-high)'
					: 'var(--color-critical)'
	);

	const scoreLabel = $derived(
		result.overall_score <= 3
			? 'Low Risk'
			: result.overall_score <= 6
				? 'Moderate Risk'
				: result.overall_score <= 8
					? 'High Risk'
					: 'Critical Risk'
	);

	// SVG ring: circumference = 2 * PI * r, where r = 54
	const circumference = 2 * Math.PI * 54;
	const offset = $derived(circumference - (result.overall_score / 10) * circumference);
</script>

<div class="score-section">
	<div class="score-ring">
		<svg viewBox="0 0 120 120" width="160" height="160">
			<circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="8" />
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
		<div class="score-value" style="color: {scoreColor}">
			<span class="number">{result.overall_score}</span>
			<span class="out-of">/10</span>
		</div>
	</div>
	<div class="score-meta">
		<span class="score-label" style="color: {scoreColor}">{scoreLabel}</span>
		<span class="ecosystem-badge">{result.ecosystem}</span>
		<span class="dep-count">{result.total_dependencies} dependencies analyzed</span>
	</div>
</div>

<div class="risk-bars">
	{#each [
		{ label: 'Critical', count: result.risk_summary.critical, color: 'var(--color-critical)' },
		{ label: 'High', count: result.risk_summary.high, color: 'var(--color-high)' },
		{ label: 'Medium', count: result.risk_summary.medium, color: 'var(--color-medium)' },
		{ label: 'Low', count: result.risk_summary.low, color: 'var(--color-low)' }
	] as item}
		<div class="risk-bar-row">
			<span class="risk-bar-label">{item.label}</span>
			<span class="risk-bar-count" style="color: {item.color}">{item.count}</span>
		</div>
	{/each}
</div>

<div class="explanation">
	<p>{result.overall_explanation}</p>
</div>

<style>
	.score-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem 0;
	}
	.score-ring {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.score-value {
		position: absolute;
		display: flex;
		align-items: baseline;
		gap: 2px;
	}
	.number {
		font-size: 3rem;
		font-weight: 800;
		line-height: 1;
	}
	.out-of {
		font-size: 1.25rem;
		opacity: 0.6;
	}
	.score-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}
	.score-label {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.ecosystem-badge {
		background: var(--accent);
		border: 1px solid var(--border);
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.dep-count {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
	.risk-bars {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		padding: 1rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		margin-top: 1rem;
	}
	.risk-bar-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}
	.risk-bar-label {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.risk-bar-count {
		font-size: 1.5rem;
		font-weight: 700;
	}
	.explanation {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		line-height: 1.7;
	}
</style>
