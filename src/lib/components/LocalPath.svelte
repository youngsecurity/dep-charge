<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let { onsubmit }: { onsubmit: (path: string) => void } = $props();
	let localPath = $state('');
</script>

<div class="flex gap-3">
	<Input
		type="text"
		bind:value={localPath}
		placeholder="/path/to/project/package-lock.json"
		aria-label="Local filesystem path"
		class="flex-1 font-mono"
	/>
	<Button onclick={() => onsubmit(localPath)} disabled={!localPath.trim()}>
		Analyze
	</Button>
</div>
<p class="mt-2 text-sm text-muted-foreground">
	Path to a dependency file on the server's filesystem.
</p>
