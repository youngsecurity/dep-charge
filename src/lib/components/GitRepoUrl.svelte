<script lang="ts">
	let { onsubmit }: { onsubmit: (url: string) => void } = $props();
	let url = $state('');

	const isValid = $derived(/^https?:\/\/github\.com\/[^/]+\/[^/]+/.test(url));
</script>

<div class="input-group">
	<input
		type="url"
		bind:value={url}
		placeholder="https://github.com/owner/repo"
	/>
	<button class="submit-btn" onclick={() => onsubmit(url)} disabled={!isValid}>
		Analyze
	</button>
</div>
<p class="hint">
	We'll search for common dependency files (package.json, requirements.txt, Cargo.lock, etc.) in the repo.
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
		font-size: 1rem;
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
