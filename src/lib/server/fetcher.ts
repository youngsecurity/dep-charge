export const DEPENDENCY_FILES = [
	'package-lock.json',
	'package.json',
	'yarn.lock',
	'pnpm-lock.yaml',
	'bun.lock',
	'bun.lockb',
	'requirements.txt',
	'Pipfile.lock',
	'poetry.lock',
	'pyproject.toml',
	'Cargo.lock',
	'Cargo.toml',
	'go.sum',
	'go.mod',
	'Gemfile.lock',
	'composer.lock',
	'pubspec.lock',
	'mix.lock'
];

const BRANCHES = ['main', 'master'];

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

const GITHUB_URL_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?$/;

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	if (!GITHUB_URL_RE.test(url)) return null;
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!match) return null;
	return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function fetchDependencyFile(
	gitUrl: string
): Promise<{ content: string; fileName: string }> {
	const parsed = parseGitHubUrl(gitUrl);
	if (!parsed) {
		throw new Error(
			'Invalid GitHub URL. Expected format: https://github.com/owner/repo'
		);
	}

	for (const branch of BRANCHES) {
		for (const fileName of DEPENDENCY_FILES) {
			const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${fileName}`;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

			try {
				const response = await fetch(rawUrl, { signal: controller.signal });
				if (response.ok) {
					const content = await response.text();
					return { content, fileName };
				}
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					throw new Error(
						`Request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds while fetching ${fileName}`
					);
				}
				// For non-timeout fetch errors (e.g. network), continue trying next file
			} finally {
				clearTimeout(timeoutId);
			}
		}
	}

	throw new Error(
		`No dependency file found in ${parsed.owner}/${parsed.repo}. Searched for: ${DEPENDENCY_FILES.join(', ')}`
	);
}
