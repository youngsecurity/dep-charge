<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { onsubmit }: { onsubmit: (file: File) => void } = $props();
	let file = $state<File | null>(null);
	let dragOver = $state(false);

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const dropped = e.dataTransfer?.files[0];
		if (dropped) file = dropped;
	}

	function handleSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) file = input.files[0];
	}

	function submit() {
		if (file) onsubmit(file);
	}
</script>

<div
	class="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary {dragOver ? 'border-primary bg-accent/50' : ''}"
	ondragover={(e) => { e.preventDefault(); dragOver = true; }}
	ondragleave={() => (dragOver = false)}
	ondrop={handleDrop}
	role="region"
	aria-label="File drop zone"
>
	{#if file}
		<p class="font-mono font-semibold">{file.name}</p>
		<p class="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
	{:else}
		<p>Drop a dependency file here</p>
		<p class="text-sm text-muted-foreground">package-lock.json, requirements.txt, Cargo.lock, go.sum, etc.</p>
	{/if}
	<label>
		<Button variant="outline" class="cursor-pointer">Browse files</Button>
		<input type="file" onchange={handleSelect} hidden />
	</label>
</div>

{#if file}
	<Button class="mt-4 w-full" onclick={submit}>Analyze</Button>
{/if}
