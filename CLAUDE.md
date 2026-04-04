# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dep-charge** is a security analysis tool that scans all dependencies in a project and produces a breach-likelihood rating (1-10). MIT licensed, owned by Young Security.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **Framework:** SvelteKit 2 + Svelte 5 (runes mode)
- **AI:** Anthropic API via `@anthropic-ai/sdk` (Claude Sonnet for analysis)
- **Environment:** Copy `env.example` to `.env.local` and set `ANTHROPIC_API_KEY`

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 3000)
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript type checking
```

## Architecture

### API Route: `src/routes/api/analyze/+server.ts`
Single POST endpoint handling 4 input methods via content-type detection:
- **File upload** (`multipart/form-data`) — accepts any dependency file
- **Paste** (`application/json`, `method: "paste"`) — raw text content
- **Git URL** (`application/json`, `method: "git-url"`) — fetches from GitHub raw content
- **Local path** (`application/json`, `method: "local-path"`) — reads via `Bun.file()`

Streams Claude's response back as Server-Sent Events (SSE). The client accumulates text deltas and parses the final JSON on stream completion.

### Server Modules (`src/lib/server/`)
- `anthropic.ts` — Anthropic client singleton using `$env/dynamic/private`
- `prompt.ts` — System prompt and JSON schema for structured output
- `fetcher.ts` — Fetches dependency files from `raw.githubusercontent.com`

### Frontend (`src/routes/+page.svelte`)
Single-page UI with tabbed input (Upload/Paste/Git URL/Local Path), streaming loading state, score display with SVG ring gauge, sortable/filterable dependency table, and recommendations list.

### Key Design Decisions
- **Ecosystem-agnostic:** No hardcoded parsers. Claude identifies the ecosystem and analyzes dependencies from any lock/manifest file
- **Structured output:** JSON schema enforced via the Anthropic API ensures parseable results
- **Bun-native:** Uses `Bun.file()` for filesystem access; `@types/bun` for TypeScript
- **Private env vars** use `$env/dynamic/private` (not `static`) to avoid build-time type generation issues
