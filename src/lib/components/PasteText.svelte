<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	let { onsubmit }: { onsubmit: (content: string) => void } = $props();
	let content = $state('');
</script>

<Textarea
	bind:value={content}
	placeholder="Paste your dependency file contents here (package.json, requirements.txt, Cargo.toml, etc.)"
	rows={12}
	aria-label="Dependency file contents"
	class="font-mono min-h-[250px] resize-y"
/>
<div class="mt-3 flex items-center justify-between">
	<span class="text-sm text-muted-foreground">{content.length.toLocaleString()} characters</span>
	<Button onclick={() => onsubmit(content)} disabled={!content.trim()}>
		Analyze
	</Button>
</div>
