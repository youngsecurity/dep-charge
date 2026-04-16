<script lang="ts">
	let { streamLength }: { streamLength: number } = $props();

	let elapsed = $state(0);

	$effect(() => {
		const start = Date.now();
		const id = setInterval(() => {
			elapsed = Math.floor((Date.now() - start) / 1000);
		}, 1000);
		return () => clearInterval(id);
	});

	const minutes = $derived(Math.floor(elapsed / 60));
	const seconds = $derived(elapsed % 60);
	const timeDisplay = $derived(
		minutes > 0
			? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
			: `${seconds}s`
	);
</script>

<div class="flex flex-col items-center gap-4 py-8 text-center">
	<div class="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary"></div>

	<div class="space-y-1">
		<p class="font-medium">Analyzing dependencies...</p>
		<p class="text-sm text-muted-foreground">{timeDisplay} elapsed</p>
		{#if streamLength > 0}
			<p class="text-sm text-muted-foreground">{streamLength.toLocaleString()} characters received</p>
		{/if}
	</div>
</div>
