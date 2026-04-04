<script lang="ts">
	let { onsubmit }: { onsubmit: (path: string) => void } = $props();
	let localPath = $state('');
</script>

<div class="input-group">
	<input
		type="text"
		bind:value={localPath}
		placeholder="/path/to/project/package-lock.json"
	/>
	<button class="submit-btn" onclick={() => onsubmit(localPath)} disabled={!localPath.trim()}>
		Analyze
	</button>
</div>
<p class="hint">
	Path to a dependency file on the server's filesystem.
</p>

<style>
	.input-group {
		display: flex;
		gap: 0.75rem;
	}
	input {
		flex: 1;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: 0.9rem;
	}
	input:focus {
		outline: none;
		border-color: var(--color-accent);
	}
	.hint {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}
	.submit-btn {
		padding: 0.75rem 2rem;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius);
		font-size: 1rem;
		font-weight: 600;
		white-space: nowrap;
		transition: background 0.2s;
	}
	.submit-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
