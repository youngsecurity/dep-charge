const DEPENDENCY_FILES = [
	'package-lock.json',
	'package.json',
	'yarn.lock',
	'pnpm-lock.yaml',
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

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!match) return null;
	return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function fetchDependencyFile(
	gitUrl: string
): Promise<{ content: string; fileName: string }> {
	const parsed = parseGitHubUrl(gitUrl);
	if (!parsed) {
		throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo');
	}

	for (const branch of BRANCHES) {
		for (const fileName of DEPENDENCY_FILES) {
			const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${fileName}`;
			const response = await fetch(rawUrl);
			if (response.ok) {
				const content = await response.text();
				return { content, fileName };
			}
		}
	}

	throw new Error(
		`No dependency file found in ${parsed.owner}/${parsed.repo}. Searched for: ${DEPENDENCY_FILES.join(', ')}`
	);
}
