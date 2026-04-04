import { anthropic } from '$lib/server/anthropic';
import { systemPrompt, analysisSchema } from '$lib/server/prompt';
import { fetchDependencyFile } from '$lib/server/fetcher';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB

export const POST: RequestHandler = async ({ request }) => {
	let dependencyContent: string;
	let fileName: string;

	try {
		const contentType = request.headers.get('content-type') || '';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') as File | null;
			if (!file) {
				return json({ error: 'No file uploaded' }, { status: 400 });
			}
			dependencyContent = await file.text();
			fileName = file.name;
		} else {
			const body = await request.json();

			if (body.method === 'paste') {
				if (!body.content?.trim()) {
					return json({ error: 'No content provided' }, { status: 400 });
				}
				dependencyContent = body.content;
				fileName = 'pasted-content';
			} else if (body.method === 'git-url') {
				if (!body.gitUrl?.trim()) {
					return json({ error: 'No URL provided' }, { status: 400 });
				}
				const result = await fetchDependencyFile(body.gitUrl);
				dependencyContent = result.content;
				fileName = result.fileName;
			} else if (body.method === 'local-path') {
				if (env.ALLOW_LOCAL_PATH !== 'true') {
					return json({ error: 'Local path access is disabled' }, { status: 403 });
				}
				if (!body.localPath?.trim()) {
					return json({ error: 'No path provided' }, { status: 400 });
				}
				const localPath = body.localPath;
				if (localPath.includes('..')) {
					return json({ error: 'Path traversal not allowed' }, { status: 400 });
				}
				dependencyContent = await Bun.file(localPath).text();
				fileName = localPath.split('/').pop() || 'unknown';
			} else {
				return json({ error: 'Invalid method' }, { status: 400 });
			}
		}

		if (!dependencyContent?.trim()) {
			return json({ error: 'Empty dependency content' }, { status: 400 });
		}

		if (dependencyContent.length > MAX_CONTENT_LENGTH) {
			return json({ error: 'File too large (max 2MB)' }, { status: 413 });
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to read dependency file';
		return json({ error: message }, { status: 400 });
	}

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			try {
				const response = anthropic.messages.stream({
					model: 'claude-sonnet-4-6-20250514',
					max_tokens: 16000,
					system: systemPrompt,
					messages: [
						{
							role: 'user',
							content: `Analyze the following dependency file (${fileName}):\n\n${dependencyContent}`
						}
					]
				});

				for await (const event of response) {
					if (
						event.type === 'content_block_delta' &&
						event.delta.type === 'text_delta'
					) {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`
							)
						);
					}
				}

				controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Analysis failed';
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`)
				);
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
