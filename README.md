# dep-charge

A tool that analyzes all the dependencies in a project and gives a rating from 1 to 10 on how likely it is to get breached.

Built with SvelteKit + Bun, powered by Claude for ecosystem-agnostic dependency analysis. Submit a lock or manifest file via upload, paste, Git URL, or local path, and dep-charge streams back a breach-likelihood score, a per-dependency breakdown, and remediation recommendations.

## Tech stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** SvelteKit 2 + Svelte 5 (runes mode)
- **Language:** TypeScript
- **AI:** Anthropic Claude via `@anthropic-ai/sdk`

## Getting started

Copy the example environment file and set your Anthropic API key:

```sh
cp env.example .env.local
# then edit .env.local and set ANTHROPIC_API_KEY
```

Optionally set `CLAUDE_MODEL` to override the default model.

Install dependencies:

```sh
bun install
```

## Developing

Start a development server on port 3000:

```sh
bun run dev
```

## Building

Create a production build:

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

Run TypeScript type checking:

```sh
bun run check
```

## License

MIT — owned by Young Security.
