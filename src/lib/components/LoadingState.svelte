<script lang="ts">
	let { streamLength }: { streamLength: number } = $props();

	let elapsed = $state(0);
	let intervalId: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		const start = Date.now();
		intervalId = setInterval(() => {
			elapsed = Math.floor((Date.now() - start) / 1000);
		}, 1000);

		return () => {
			if (intervalId !== undefined) {
				clearInterval(intervalId);
			}
		};
	});

	const minutes = $derived(Math.floor(elapsed / 60));
	const seconds = $derived(elapsed % 60);
	const timeDisplay = $derived(
		minutes > 0
			? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
			: `${seconds}s`
	);
</script>

<section class="loading-section">
	<div class="spinner-container">
		<svg class="spinner" viewBox="0 0 50 50" width="48" height="48">
			<circle
				cx="25"
				cy="25"
				r="20"
				fill="none"
				stroke="var(--color-border)"
				stroke-width="4"
			/>
			<circle
				class="spinner-arc"
				cx="25"
				cy="25"
				r="20"
				fill="none"
				stroke="var(--color-accent)"
				stroke-width="4"
				stroke-linecap="round"
				stroke-dasharray="80, 200"
			/>
		</svg>
	</div>

	<p class="loading-label">Analyzing dependencies<span class="dots"></span></p>

	<div class="meta">
		<span class="meta-item">
			<span class="meta-icon">&#9202;</span>
			{timeDisplay}
		</span>
		{#if streamLength > 0}
			<span class="meta-separator">|</span>
			<span class="meta-item">
				<span class="meta-icon">&#9660;</span>
				{streamLength.toLocaleString()} chars
			</span>
		{/if}
	</div>

	{#if streamLength > 0}
		<div class="progress-bar-track">
			<div class="progress-bar-fill"></div>
		</div>
	{/if}
</section>

<style>
	.loading-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 3rem 1rem;
		margin-top: 1.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
	}

	.spinner-container {
		position: relative;
	}

	.spinner {
		animation: spin 1.4s linear infinite;
	}

	.spinner-arc {
		animation: dash 1.4s ease-in-out infinite;
		transform-origin: center;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 80, 200;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 80, 200;
			stroke-dashoffset: -125;
		}
	}

	.loading-label {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.dots::after {
		content: '';
		animation: dots 1.5s steps(4, end) infinite;
	}

	@keyframes dots {
		0% {
			content: '';
		}
		25% {
			content: '.';
		}
		50% {
			content: '..';
		}
		75% {
			content: '...';
		}
		100% {
			content: '';
		}
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.meta-icon {
		font-size: 0.75rem;
	}

	.meta-separator {
		opacity: 0.4;
	}

	.progress-bar-track {
		width: 200px;
		height: 3px;
		background: var(--color-border);
		border-radius: 2px;
		overflow: hidden;
		margin-top: 0.25rem;
	}

	.progress-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		animation: indeterminate 1.5s ease-in-out infinite;
	}

	@keyframes indeterminate {
		0% {
			width: 0%;
			margin-left: 0%;
		}
		50% {
			width: 60%;
			margin-left: 20%;
		}
		100% {
			width: 0%;
			margin-left: 100%;
		}
	}
</style>
