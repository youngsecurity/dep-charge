<script lang="ts">
	let { message, onretry }: { message: string; onretry?: (() => void) | undefined } = $props();
	let dismissed = $state(false);

	// Reset dismissed state when a new error arrives
	$effect(() => {
		message;
		dismissed = false;
	});
</script>

{#if !dismissed}
	<div class="error-banner" role="alert">
		<div class="error-content">
			<svg class="error-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
					clip-rule="evenodd"
				/>
			</svg>
			<p class="error-message">{message}</p>
		</div>
		<div class="error-actions">
			{#if onretry}
				<button class="retry-btn" onclick={onretry}>Retry</button>
			{/if}
			<button class="dismiss-btn" onclick={() => (dismissed = true)} aria-label="Dismiss error">
				<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.error-banner {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding: 1rem 1.25rem;
		background: color-mix(in srgb, var(--color-critical) 10%, var(--card));
		border: 1px solid var(--color-critical);
		border-radius: var(--radius-lg);
		color: var(--color-critical);
	}

	.error-content {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.error-icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.1rem;
	}

	.error-message {
		font-size: 0.925rem;
		line-height: 1.5;
		word-break: break-word;
	}

	.error-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.retry-btn {
		padding: 0.35rem 0.85rem;
		background: var(--color-critical);
		color: white;
		border: none;
		border-radius: var(--radius-lg);
		font-size: 0.85rem;
		font-weight: 600;
		transition: background 0.2s;
	}

	.retry-btn:hover {
		background: color-mix(in srgb, var(--color-critical) 85%, white);
	}

	.dismiss-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		background: none;
		border: none;
		color: var(--color-critical);
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.dismiss-btn:hover {
		opacity: 1;
	}

	.dismiss-btn svg {
		width: 1rem;
		height: 1rem;
	}
</style>
