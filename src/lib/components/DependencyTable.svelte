<script lang="ts">
	import type { DependencyRisk } from '$lib/types';

	let { dependencies }: { dependencies: DependencyRisk[] } = $props();

	let sortBy = $state<'name' | 'risk_score'>('risk_score');
	let sortAsc = $state(false);
	let filterLevel = $state<string>('all');

	const filtered = $derived(
		filterLevel === 'all'
			? dependencies
			: dependencies.filter((d) => d.risk_level === filterLevel)
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			const mul = sortAsc ? 1 : -1;
			if (sortBy === 'name') return mul * a.name.localeCompare(b.name);
			return mul * (a.risk_score - b.risk_score);
		})
	);

	function toggleSort(col: 'name' | 'risk_score') {
		if (sortBy === col) {
			sortAsc = !sortAsc;
		} else {
			sortBy = col;
			sortAsc = col === 'name';
		}
	}

	function levelColor(level: string) {
		switch (level) {
			case 'critical': return 'var(--color-critical)';
			case 'high': return 'var(--color-high)';
			case 'medium': return 'var(--color-medium)';
			default: return 'var(--color-low)';
		}
	}
</script>

<div class="table-controls">
	<span class="count">{filtered.length} of {dependencies.length} dependencies</span>
	<div class="filters">
		{#each ['all', 'critical', 'high', 'medium', 'low'] as level}
			<button
				class="filter-btn"
				class:active={filterLevel === level}
				onclick={() => (filterLevel = level)}
			>
				{level}
			</button>
		{/each}
	</div>
</div>

<div class="table-wrapper">
	<table>
		<thead>
			<tr>
				<th class="sortable" onclick={() => toggleSort('name')}>
					Name {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
				</th>
				<th>Version</th>
				<th class="sortable" onclick={() => toggleSort('risk_score')}>
					Score {sortBy === 'risk_score' ? (sortAsc ? '↑' : '↓') : ''}
				</th>
				<th>Level</th>
				<th>Rationale</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted as dep}
				<tr>
					<td class="dep-name">{dep.name}</td>
					<td class="dep-version">{dep.version}</td>
					<td class="dep-score" style="color: {levelColor(dep.risk_level)}">{dep.risk_score}</td>
					<td>
						<span class="level-badge" style="color: {levelColor(dep.risk_level)}; border-color: {levelColor(dep.risk_level)}">
							{dep.risk_level}
						</span>
					</td>
					<td class="dep-rationale">{dep.rationale}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.count {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
	.filters {
		display: flex;
		gap: 0.25rem;
	}
	.filter-btn {
		padding: 0.25rem 0.75rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--muted-foreground);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		transition: all 0.2s;
	}
	.filter-btn.active {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
	}
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		text-align: left;
		padding: 0.75rem 1rem;
		background: var(--card);
		color: var(--muted-foreground);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	th.sortable {
		cursor: pointer;
		user-select: none;
	}
	th.sortable:hover {
		color: var(--foreground);
	}
	td {
		padding: 0.6rem 1rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.875rem;
	}
	tr:last-child td {
		border-bottom: none;
	}
	tr:hover td {
		background: var(--accent);
	}
	.dep-name {
		font-family: var(--font-mono);
		font-weight: 500;
		white-space: nowrap;
	}
	.dep-version {
		font-family: var(--font-mono);
		color: var(--muted-foreground);
		white-space: nowrap;
	}
	.dep-score {
		font-weight: 700;
		text-align: center;
	}
	.level-badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border: 1px solid;
		border-radius: 999px;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}
	.dep-rationale {
		max-width: 400px;
		color: var(--muted-foreground);
	}
</style>
