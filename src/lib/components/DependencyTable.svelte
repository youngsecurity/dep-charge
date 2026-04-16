<script lang="ts">
	import type { DependencyRisk } from '$lib/types';
	import { riskLevelColor } from '$lib/utils';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

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

</script>

<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
	<span class="text-sm text-muted-foreground">{filtered.length} of {dependencies.length} dependencies</span>
	<div class="flex gap-1">
		{#each ['all', 'critical', 'high', 'medium', 'low'] as level}
			<Button
				variant={filterLevel === level ? 'default' : 'outline'}
				size="xs"
				onclick={() => (filterLevel = level)}
				aria-pressed={filterLevel === level}
			>
				{level}
			</Button>
		{/each}
	</div>
</div>

<Card.Root>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="cursor-pointer select-none" onclick={() => toggleSort('name')}>
					Name {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
				</Table.Head>
				<Table.Head>Version</Table.Head>
				<Table.Head class="cursor-pointer select-none" onclick={() => toggleSort('risk_score')}>
					Score {sortBy === 'risk_score' ? (sortAsc ? '↑' : '↓') : ''}
				</Table.Head>
				<Table.Head>Level</Table.Head>
				<Table.Head>Rationale</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each sorted as dep}
				<Table.Row>
					<Table.Cell class="font-mono font-medium whitespace-nowrap">{dep.name}</Table.Cell>
					<Table.Cell class="font-mono text-muted-foreground whitespace-nowrap">{dep.version}</Table.Cell>
					<Table.Cell class="text-center font-bold" style="color: {riskLevelColor(dep.risk_level)}">{dep.risk_score}</Table.Cell>
					<Table.Cell>
						<Badge variant="outline" class="text-xs uppercase" style="color: {riskLevelColor(dep.risk_level)}; border-color: {riskLevelColor(dep.risk_level)}">{dep.risk_level}</Badge>
					</Table.Cell>
					<Table.Cell class="max-w-sm text-muted-foreground">{dep.rationale}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</Card.Root>
