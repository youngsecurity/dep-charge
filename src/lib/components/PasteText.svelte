<script lang="ts">
	let { onsubmit }: { onsubmit: (content: string) => void } = $props();
	let content = $state('');
</script>

<textarea
	bind:value={content}
	placeholder="Paste your dependency file contents here (package.json, requirements.txt, Cargo.toml, etc.)"
	rows="12"
></textarea>
<div class="footer">
	<span class="char-count">{content.length.toLocaleString()} characters</span>
	<button class="submit-btn" onclick={() => onsubmit(content)} disabled={!content.trim()}>
		Analyze
	</button>
</div>

<style>
	textarea {
		width: 100%;
		padding: 1rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--foreground);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		resize: vertical;
		line-height: 1.5;
	}
	textarea:focus {
		outline: none;
		border-color: var(--primary);
	}
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
	}
	.char-count {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
	.submit-btn {
		padding: 0.75rem 2rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 1rem;
		font-weight: 600;
		transition: background 0.2s;
	}
	.submit-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--primary) 80%, white);
	}
	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
