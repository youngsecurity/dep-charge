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
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Card from '$lib/components/ui/card';

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
					const errorBody = await response.json();
					errorMessage = errorBody.error || errorMessage;
				} catch {
					// Response body wasn't valid JSON; use default message
				}
				throw new Error(errorMessage);
			}

			if (!response.body) throw new Error('No response body');
			const reader = response.body.getReader();
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

						let sseEvent: { type: string; text?: string; error?: string };
						try {
							sseEvent = JSON.parse(line.slice(6));
						} catch {
							continue;
						}

						if (sseEvent.type === 'delta') {
							streamText += sseEvent.text;
						} else if (sseEvent.type === 'done') {
							try {
								result = JSON.parse(streamText);
							} catch {
								error = 'Failed to parse analysis result';
							}
						} else if (sseEvent.type === 'error') {
							error = sseEvent.error ?? 'Analysis failed';
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

	function handleJson(body: Record<string, string>) {
		analyze(() =>
			fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
		);
	}
</script>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
	<div class="mb-8 text-center">
		<h1 class="text-4xl font-extrabold tracking-tight">dep-charge</h1>
		<p class="mt-1 text-muted-foreground">Dependency security analysis powered by AI</p>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="w-full">
					{#each tabs as tab}
						<Tabs.Trigger value={tab.id} class="flex-1">{tab.label}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				<div class="p-6">
					<Tabs.Content value="upload">
						<FileUpload onsubmit={handleFileUpload} />
					</Tabs.Content>
					<Tabs.Content value="paste">
						<PasteText onsubmit={(content) => handleJson({ method: 'paste', content })} />
					</Tabs.Content>
					<Tabs.Content value="git-url">
						<GitRepoUrl onsubmit={(gitUrl) => handleJson({ method: 'git-url', gitUrl })} />
					</Tabs.Content>
					{#if data.allowLocalPath}
						<Tabs.Content value="local-path">
							<LocalPath onsubmit={(localPath) => handleJson({ method: 'local-path', localPath })} />
						</Tabs.Content>
					{/if}
				</div>
			</Tabs.Root>
		</Card.Content>
	</Card.Root>

	{#if loading}
		<div class="mt-6">
			<LoadingState streamLength={streamText.length} />
		</div>
	{/if}

	{#if error}
		<div class="mt-6">
			<ErrorBanner message={error} onretry={lastFetchFn ? retryLastAnalysis : undefined} />
		</div>
	{/if}

	{#if result}
		<div class="mt-8 space-y-6">
			<h2 class="text-2xl font-bold">Analysis Results</h2>
			<ScoreDisplay {result} />

			{#if result.dependencies.length > 0}
				<div>
					<h3 class="mb-3 text-lg font-semibold">Dependency Breakdown</h3>
					<DependencyTable dependencies={result.dependencies} />
				</div>
			{/if}

			{#if result.recommendations.length > 0}
				<div>
					<h3 class="mb-3 text-lg font-semibold">Recommendations</h3>
					<div class="space-y-2">
						{#each result.recommendations as rec}
							<Card.Root>
								<Card.Content class="text-sm">{rec}</Card.Content>
							</Card.Root>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
