import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEPENDENCY_FILES, fetchDependencyFile } from './fetcher';

beforeEach(() => {
	vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// DEPENDENCY_FILES
// ---------------------------------------------------------------------------
describe('DEPENDENCY_FILES', () => {
	it('contains expected dependency file names', () => {
		const expected = [
			'package.json',
			'package-lock.json',
			'requirements.txt',
			'Cargo.lock',
			'go.sum',
			'Gemfile.lock'
		];
		for (const name of expected) {
			expect(DEPENDENCY_FILES).toContain(name);
		}
	});

	it('contains both bun.lock and bun.lockb', () => {
		expect(DEPENDENCY_FILES).toContain('bun.lock');
		expect(DEPENDENCY_FILES).toContain('bun.lockb');
	});

	it('does not contain random / unrelated names', () => {
		expect(DEPENDENCY_FILES).not.toContain('README.md');
		expect(DEPENDENCY_FILES).not.toContain('index.ts');
		expect(DEPENDENCY_FILES).not.toContain('.env');
		expect(DEPENDENCY_FILES).not.toContain('node_modules');
	});
});

// ---------------------------------------------------------------------------
// fetchDependencyFile — URL validation
// ---------------------------------------------------------------------------
describe('fetchDependencyFile — URL validation', () => {
	it('throws for non-GitHub URLs', async () => {
		await expect(
			fetchDependencyFile('https://gitlab.com/owner/repo')
		).rejects.toThrow('Invalid GitHub URL');
	});

	it('throws for a GitHub URL missing the repo segment', async () => {
		await expect(
			fetchDependencyFile('https://github.com/owner')
		).rejects.toThrow('Invalid GitHub URL');
	});

	it('throws for a GitHub URL with a trailing slash and no path', async () => {
		await expect(
			fetchDependencyFile('https://github.com/')
		).rejects.toThrow('Invalid GitHub URL');
	});

	it('throws for http (non-https) GitHub URLs', async () => {
		await expect(
			fetchDependencyFile('http://github.com/owner/repo')
		).rejects.toThrow('Invalid GitHub URL');
	});

	it('throws for URLs with path traversal in owner/repo', async () => {
		await expect(
			fetchDependencyFile('https://github.com/owner/../repo')
		).rejects.toThrow('Invalid GitHub URL');
	});

	it('accepts a valid https://github.com/owner/repo URL', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => '{"name":"my-pkg"}'
		});
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchDependencyFile('https://github.com/owner/repo');
		expect(result.content).toBe('{"name":"my-pkg"}');
		expect(result.fileName).toBe(DEPENDENCY_FILES[0]); // first match wins
		expect(mockFetch).toHaveBeenCalledOnce();
		// Verify the raw URL was constructed correctly
		expect(mockFetch.mock.calls[0][0]).toBe(
			`https://raw.githubusercontent.com/owner/repo/main/${DEPENDENCY_FILES[0]}`
		);
	});

	it('accepts a URL with a .git suffix', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => '{"name":"my-pkg"}'
		});
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchDependencyFile(
			'https://github.com/owner/repo.git'
		);
		expect(result.content).toBe('{"name":"my-pkg"}');
		// .git should be stripped from the repo name in the raw URL
		expect(mockFetch.mock.calls[0][0]).toContain('/owner/repo/main/');
		expect(mockFetch.mock.calls[0][0]).not.toContain('/repo.git/');
	});
});

// ---------------------------------------------------------------------------
// fetchDependencyFile — timeout behaviour
// ---------------------------------------------------------------------------
describe('fetchDependencyFile — timeout', () => {
	it('passes an AbortSignal to fetch for timeout support', async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: false });
		vi.stubGlobal('fetch', mockFetch);

		try {
			await fetchDependencyFile('https://github.com/owner/repo');
		} catch {
			// Will throw "No dependency file found" — expected
		}

		// Verify every fetch call received an AbortSignal
		for (const call of mockFetch.mock.calls) {
			expect(call[1]).toHaveProperty('signal');
			expect(call[1].signal).toBeInstanceOf(AbortSignal);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchDependencyFile — fallback across branches and files
// ---------------------------------------------------------------------------
describe('fetchDependencyFile — fallback behaviour', () => {
	it('throws "No dependency file found" when every fetch returns 404', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404
		});
		vi.stubGlobal('fetch', mockFetch);

		await expect(
			fetchDependencyFile('https://github.com/owner/repo')
		).rejects.toThrow(/No dependency file found/);

		// Should have tried every file on every branch (2 branches x N files)
		expect(mockFetch).toHaveBeenCalledTimes(
			2 * DEPENDENCY_FILES.length
		);
	});

	it('returns content when requirements.txt is found on master after 404s on main', async () => {
		const requirementsTxtIndex = DEPENDENCY_FILES.indexOf('requirements.txt');

		// Total calls before the successful one:
		//   all DEPENDENCY_FILES.length files on "main" (all 404)
		//   + files on "master" up to and including requirements.txt
		const callsBeforeSuccess =
			DEPENDENCY_FILES.length + requirementsTxtIndex;

		const mockFetch = vi.fn().mockImplementation((url: string) => {
			// Only succeed for requirements.txt on the master branch
			if (
				url ===
				`https://raw.githubusercontent.com/owner/repo/master/requirements.txt`
			) {
				return Promise.resolve({
					ok: true,
					text: async () => 'flask==2.3.0\nrequests==2.31.0'
				});
			}
			return Promise.resolve({ ok: false, status: 404 });
		});
		vi.stubGlobal('fetch', mockFetch);

		const result = await fetchDependencyFile(
			'https://github.com/owner/repo'
		);

		expect(result.fileName).toBe('requirements.txt');
		expect(result.content).toBe('flask==2.3.0\nrequests==2.31.0');
		// Verify total number of fetch calls (all 404s + the one success)
		expect(mockFetch).toHaveBeenCalledTimes(callsBeforeSuccess + 1);
	});
});
