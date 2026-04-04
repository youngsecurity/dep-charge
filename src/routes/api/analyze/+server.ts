import { anthropic } from '$lib/server/anthropic';
import { systemPrompt } from '$lib/server/prompt';
import { fetchDependencyFile, DEPENDENCY_FILES } from '$lib/server/fetcher';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { resolve } from 'node:path';
import type { RequestHandler } from './$types';

const MAX_CONTENT_LENGTH = 2 * 1024 * 1024; // 2MB
const encoder = new TextEncoder();
const ALLOWED_FILE_NAMES = new Set(DEPENDENCY_FILES);

function isAllowedFileName(name: string): boolean {
	const base = name.split('/').pop()?.split('\\').pop() ?? '';
	return ALLOWED_FILE_NAMES.has(base);
}

function contentTooLargeError(bytes: number, context: string): string {
	return `${context} too large: ${(bytes / 1024 / 1024).toFixed(1)}MB exceeds the 2MB limit.`;
}

// Cached at module level — env vars don't change at runtime
let _allowedLocalDirs: string[] | null = null;
function getAllowedLocalDirs(): string[] {
	if (_allowedLocalDirs === null) {
		const raw = env.ALLOWED_LOCAL_DIRS ?? '';
		_allowedLocalDirs = raw.trim()
			? raw.split(',').map((d) => resolve(d.trim())).filter(Boolean)
			: [];
	}
	return _allowedLocalDirs;
}

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

			if (file.size > MAX_CONTENT_LENGTH) {
				return json({ error: contentTooLargeError(file.size, 'File') }, { status: 413 });
			}

			if (!isAllowedFileName(file.name)) {
				return json(
					{
						error: `Unsupported file: "${file.name}". Accepted dependency files: ${DEPENDENCY_FILES.join(', ')}`
					},
					{ status: 400 }
				);
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
				// Validation delegated to fetchDependencyFile which uses GITHUB_URL_RE
				const result = await fetchDependencyFile(body.gitUrl.trim());
				dependencyContent = result.content;
				fileName = result.fileName;
			} else if (body.method === 'local-path') {
				if (env.ALLOW_LOCAL_PATH !== 'true') {
					return json({ error: 'Local path access is disabled' }, { status: 403 });
				}
				if (!body.localPath?.trim()) {
					return json({ error: 'No path provided' }, { status: 400 });
				}

				// Reject suspicious input before resolving
				if (body.localPath.includes('..')) {
					return json({ error: 'Path traversal not allowed' }, { status: 400 });
				}

				const resolvedPath = resolve(body.localPath);

				const allowedDirs = getAllowedLocalDirs();
				if (allowedDirs.length > 0) {
					const isWithinAllowed = allowedDirs.some(
						(dir) => resolvedPath === dir || resolvedPath.startsWith(dir + '/')
					);
					if (!isWithinAllowed) {
						return json(
							{ error: 'Path not allowed. Must be within a configured ALLOWED_LOCAL_DIRS.' },
							{ status: 403 }
						);
					}
				}

				dependencyContent = await Bun.file(resolvedPath).text();
				fileName = resolvedPath.split('/').pop() || 'unknown';
			} else {
				return json({ error: 'Invalid method' }, { status: 400 });
			}
		}

		if (!dependencyContent?.trim()) {
			return json({ error: 'Empty dependency content' }, { status: 400 });
		}

		if (dependencyContent.length > MAX_CONTENT_LENGTH) {
			return json(
				{ error: contentTooLargeError(dependencyContent.length, 'Content') },
				{ status: 413 }
			);
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to read dependency file';
		return json({ error: message }, { status: 400 });
	}

	const stream = new ReadableStream({
		async start(controller) {
			try {
				const model = env.CLAUDE_MODEL || 'claude-sonnet-4-6-20250514';

				const response = anthropic.messages.stream({
					model,
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
