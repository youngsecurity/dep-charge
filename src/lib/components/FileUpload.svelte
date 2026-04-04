<script lang="ts">
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
	class="dropzone"
	class:drag-over={dragOver}
	ondragover={(e) => { e.preventDefault(); dragOver = true; }}
	ondragleave={() => (dragOver = false)}
	ondrop={handleDrop}
	role="button"
	tabindex="0"
>
	{#if file}
		<p class="file-name">{file.name}</p>
		<p class="file-size">{(file.size / 1024).toFixed(1)} KB</p>
	{:else}
		<p>Drop a dependency file here</p>
		<p class="hint">package-lock.json, requirements.txt, Cargo.lock, go.sum, etc.</p>
	{/if}
	<label class="browse-btn">
		Browse files
		<input type="file" onchange={handleSelect} hidden />
	</label>
</div>

{#if file}
	<button class="submit-btn" onclick={submit}>Analyze</button>
{/if}

<style>
	.dropzone {
		border: 2px dashed var(--border);
		border-radius: var(--radius-lg);
		padding: 2rem;
		text-align: center;
		transition: border-color 0.2s, background 0.2s;
	}
	.dropzone:hover,
	.drag-over {
		border-color: var(--primary);
		background: var(--accent);
	}
	.file-name {
		font-weight: 600;
		font-family: var(--font-mono);
	}
	.file-size {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
	.hint {
		color: var(--muted-foreground);
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}
	.browse-btn {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: var(--accent);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--foreground);
		cursor: pointer;
		transition: background 0.2s;
	}
	.browse-btn:hover {
		background: var(--primary);
	}
	.submit-btn {
		margin-top: 1rem;
		width: 100%;
		padding: 0.75rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-weight: 600;
		transition: background 0.2s;
	}
	.submit-btn:hover {
		background: color-mix(in srgb, var(--primary) 80%, white);
	}
</style>
