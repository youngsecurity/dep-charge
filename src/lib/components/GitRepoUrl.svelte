<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let { onsubmit }: { onsubmit: (url: string) => void } = $props();
	let url = $state('');

	const isValid = $derived(/^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(url));
</script>

<div class="flex gap-3">
	<Input
		type="url"
		bind:value={url}
		placeholder="https://github.com/owner/repo"
		aria-label="GitHub repository URL"
		class="flex-1"
	/>
	<Button onclick={() => onsubmit(url)} disabled={!isValid}>
		Analyze
	</Button>
</div>
<p class="mt-2 text-sm text-muted-foreground">
	We'll search for common dependency files (package.json, requirements.txt, Cargo.lock, etc.) in the repo.
</p>
