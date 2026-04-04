# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
