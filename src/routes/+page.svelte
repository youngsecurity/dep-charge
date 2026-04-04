<script lang="ts">
	import type { AnalysisResult, InputMethod } from '$lib/types';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import PasteText from '$lib/components/PasteText.svelte';
	import GitRepoUrl from '$lib/components/GitRepoUrl.svelte';
	import LocalPath from '$lib/components/LocalPath.svelte';
	import ScoreDisplay from '$lib/components/ScoreDisplay.svelte';
	import DependencyTable from '$lib/components/DependencyTable.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';

	let { data } = $props();

	let activeTab = $state<InputMethod>('upload');
	let loading = $state(false);
	let error = $state('');
	let result = $state<AnalysisResult | null>(null);
	let streamText = $state('');
	let lastFetchFn = $state<(() => Promise<Response>) | null>(null);

	const tabs = $derived(
		[
			{ id: 'upload' as InputMethod, label: 'Upload' },
			{ id: 'paste' as InputMethod, label: 'Paste' },
			{ id: 'git-url' as InputMethod, label: 'Git URL' },
			...(data.allowLocalPath
				? [{ id: 'local-path' as InputMethod, label: 'Local Path' }]
				: [])
		]
	);

	async function analyze(fetchFn: () => Promise<Response>) {
		lastFetchFn = fetchFn;
		loading = true;
		error = '';
		result = null;
		streamText = '';

		try {
			const response = await fetchFn();

			if (!response.ok) {
				let errorMessage = 'Analysis failed';
				try {
					const data = await response.json();
					errorMessage = data.error || errorMessage;
				} catch {
					// Response body wasn't valid JSON; use default message
				}
				throw new Error(errorMessage);
			}

			const reader = response.body!.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n\n');
					buffer = lines.pop() || '';

					for (const line of lines) {
						if (!line.startsWith('data: ')) continue;

						let data: { type: string; text?: string; error?: string };
						try {
							data = JSON.parse(line.slice(6));
						} catch {
							// Malformed SSE data; skip this chunk
							continue;
						}

						if (data.type === 'delta') {
							streamText += data.text;
						} else if (data.type === 'done') {
							try {
								result = JSON.parse(streamText);
							} catch {
								error = 'Failed to parse analysis result';
							}
						} else if (data.type === 'error') {
							error = data.error ?? 'Analysis failed';
						}
					}
				}
			} catch (readErr) {
				// Network disconnection or stream read failure
				if (!error) {
					error =
						readErr instanceof Error
							? `Connection lost: ${readErr.message}`
							: 'Connection lost during analysis';
				}
			}

			if (!result && !error) {
				try {
					result = JSON.parse(streamText);
				} catch {
					error = 'Failed to parse analysis result';
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function retryLastAnalysis() {
		if (lastFetchFn) {
			analyze(lastFetchFn);
		}
	}

	function handleFileUpload(file: File) {
		const formData = new FormData();
		formData.append('file', file);
		analyze(() => fetch('/api/analyze', { method: 'POST', body: formData }));
	}

	function handlePaste(content: string) {
		analyze(() =>
			fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ method: 'paste', content })
			})
		);
	}

	function handleGitUrl(gitUrl: string) {
		analyze(() =>
			fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ method: 'git-url', gitUrl })
			})
		);
	}

	function handleLocalPath(localPath: string) {
		analyze(() =>
			fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ method: 'local-path', localPath })
			})
		);
	}
</script>

<div class="container">
	<header>
		<h1>dep-charge</h1>
		<p class="tagline">Dependency security analysis powered by AI</p>
	</header>

	<section class="input-section">
		<nav class="tabs">
			{#each tabs as tab}
				<button
					class="tab"
					class:active={activeTab === tab.id}
					onclick={() => (activeTab = tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>

		<div class="tab-content">
			{#if activeTab === 'upload'}
				<FileUpload onsubmit={handleFileUpload} />
			{:else if activeTab === 'paste'}
				<PasteText onsubmit={handlePaste} />
			{:else if activeTab === 'git-url'}
				<GitRepoUrl onsubmit={handleGitUrl} />
			{:else if activeTab === 'local-path'}
				<LocalPath onsubmit={handleLocalPath} />
			{/if}
		</div>
	</section>

	{#if loading}
		<LoadingState streamLength={streamText.length} />
	{/if}

	{#if error}
		<ErrorBanner message={error} onretry={lastFetchFn ? retryLastAnalysis : undefined} />
	{/if}

	{#if result}
		<section class="results-section">
			<h2>Analysis Results</h2>
			<ScoreDisplay {result} />

			{#if result.dependencies.length > 0}
				<h3>Dependency Breakdown</h3>
				<DependencyTable dependencies={result.dependencies} />
			{/if}

			{#if result.recommendations.length > 0}
				<div class="recommendations">
					<h3>Recommendations</h3>
					<ul>
						{#each result.recommendations as rec}
							<li>{rec}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
	}
	header {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	h1 {
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.tagline {
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}
	.input-section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
	}
	.tab {
		flex: 1;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
		border-bottom: 2px solid transparent;
	}
	.tab:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}
	.tab.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}
	.tab-content {
		padding: 1.5rem;
	}

	.results-section {
		margin-top: 2rem;
	}
	h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}
	h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}
	.recommendations {
		margin-top: 2rem;
	}
	.recommendations ul {
		list-style: none;
		padding: 0;
	}
	.recommendations li {
		padding: 0.6rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.5;
	}
</style>
