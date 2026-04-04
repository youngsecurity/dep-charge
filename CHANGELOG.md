# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-04-04

### Added
- Vitest test runner configured in `vite.config.ts`
- `test` and `test:watch` scripts in `package.json`
- Unit tests for GitHub fetcher: URL validation, DEPENDENCY_FILES list, AbortSignal timeout support, branch fallback (13 tests)
- Unit tests for API route input validation: file upload, paste, git URL, local path, size limits, SSE streaming, model config (35 tests)

## [0.2.0] - 2026-04-04

### Added
- shadcn-svelte component library with manual installation
- Tailwind CSS 4 with `@tailwindcss/vite` plugin
- shadcn-svelte dependencies: tailwind-variants, clsx, tailwind-merge, tw-animate-css
- Lucide Svelte icon library (`@lucide/svelte`)
- `cn()` class merge utility and `WithElementRef` type in `src/lib/utils.ts`
- `src/routes/layout.css` with full shadcn-svelte theme tokens (light + dark via OKLCH)
- `components.json` for shadcn-svelte CLI component installation
- Button component (`src/lib/components/ui/button/`) as initial shadcn-svelte component

### Changed
- `vite.config.ts` — added Tailwind CSS Vite plugin before SvelteKit plugin
- `+layout.svelte` — imports both `layout.css` (shadcn theme) and `app.css` (custom styles)

## [0.1.2] - 2026-04-04

### Added
- `LoadingState` component with spinner, elapsed time, and streaming character count
- `ErrorBanner` component with retry and dismiss actions
- `CLAUDE_MODEL` env var for configurable model selection (default: `claude-sonnet-4-6-20250514`)
- `ALLOWED_LOCAL_DIRS` env var for restricting local path reads to specific directories
- File upload validation against known dependency file names
- File size pre-check before reading upload content into memory
- Git URL strict format validation with 10-second fetch timeout
- Path traversal rejection before path resolution
- `bun.lock` added to recognized dependency files

### Changed
- Replaced inline loading UI with dedicated `LoadingState` component
- Replaced inline error display with `ErrorBanner` component (supports retry and dismiss)
- Deduplicated GitHub URL regex — single source in `fetcher.ts`, removed from API route
- Extracted `contentTooLargeError()` helper to eliminate 3x duplicated formatting
- Cached `getAllowedLocalDirs()` at module level instead of re-parsing per request
- Moved `TextEncoder` to module-level singleton
- ErrorBanner resets dismissed state when error message changes

### Removed
- Unused `analysisSchema` import from API route
- Redundant paste-specific content length check (catch-all already handles it)

## [0.1.1] - 2026-04-04

### Changed
- Local Path input method now gated behind `ALLOW_LOCAL_PATH=true` feature flag (disabled by default)
- Local Path tab hidden from UI when flag is off
- API returns 403 when local path access is attempted without the flag

## [0.1.0] - 2026-04-03

### Added
- SvelteKit 2 project scaffolding with Svelte 5 (runes mode) and TypeScript
- Anthropic SDK integration (`@anthropic-ai/sdk`) for Claude-powered dependency analysis
- API route (`/api/analyze`) with SSE streaming, supporting 4 input methods:
  - File upload (multipart/form-data)
  - Paste text (JSON body)
  - Git repo URL (fetches from raw.githubusercontent.com)
  - Local filesystem path (via `Bun.file()`)
- Ecosystem-agnostic analysis — Claude identifies the ecosystem and scores each dependency
- Structured output via JSON schema for consistent, parseable results
- System prompt with detailed scoring criteria (CVEs, maintenance, popularity, supply chain, scope)
- GitHub dependency file fetcher with auto-detection of common lock/manifest files
- Dark-themed single-page UI with tabbed input selection
- Score display with SVG ring gauge, color-coded by risk severity
- Sortable and filterable dependency breakdown table with risk badges
- Recommendations list from Claude's analysis
- Streaming progress indicator during analysis
- Global CSS with design tokens (custom properties)
- Bun as runtime and package manager
- Vite dev server configured on port 3000
