@AGENTS.md

# ai-patterns

A copy-paste registry of animated UI components for AI products (Next.js
App Router + TypeScript, Tailwind v4, Motion, Radix). See `README.md` for
the full stack and roadmap.

## Adding or editing a pattern

Each pattern lives under `src/registry/<category>/<slug>/`:

- `component.tsx` — the component itself, shown verbatim in the site's
  "Code" tab.
- `demo.tsx` — renders the component for the live "Preview" tab.
- `pattern.ts` — exports `pattern`, a markdown template literal that is
  the UX spec for the pattern, not the code. Follow this section order:
  Summary, When to use, When not to use, Anatomy, Behavior, Content
  guidelines, Accessibility, Related patterns. Use
  `src/registry/buttons/shiny-button/pattern.ts` as the reference shape.
- `thumbnail.tsx` — a tiny, very simplified wireframe of the pattern,
  drawn on a 200×120 SVG `Frame` with the primitives in
  `src/components/thumbnail.tsx`. It is the hero image on the
  `/patterns` cards. Keep it at the pattern's minimum meaningful
  expression: grayscale theme tokens (`tone.*`) only — no icons, no
  accent colors — just lines, boxes, dots and pills.

Register the new entry in `src/registry/index.ts` (import the `Demo`,
`Thumbnail` and `pattern`, add a `RegistryEntry`) — this is what makes it appear on
`/patterns` and `/patterns/<category>/<slug>`.

After adding or changing a pattern, regenerate the design skill's
reference docs:

```bash
npm run skill:build
```

then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`.

## Agent-facing endpoints

`src/lib/agent.ts` builds everything the site serves to agents —
`/llms.txt`, `/llms-full.txt`, the Markdown twins of pages (`src/app/md/`,
reached via `.md` URLs or `Accept: text/markdown` rewrites in
`next.config.ts`), the JSON API (`src/app/api/patterns/`) and the MCP
server (`src/app/mcp/route.ts`). All read from the registry, so a new
pattern shows up in them automatically; add a new top-level page to the
`md` route, the rewrites and `sitemap.ts` if agents should see it.

## Commands

- `npm run dev` — start the site at localhost:3000
- `npm run lint` — ESLint
- `npm run build` — production build (Next.js only)
- `npm run preview` — build for Cloudflare and run it locally in workerd
- `npm run deploy` — build and deploy to Cloudflare Workers
- `npm run sources:build` — regenerate `src/registry/sources.generated.ts`
  (every `component.tsx` as a string). Runs automatically before `dev` and
  `build`.
- `npm run skill:build` — regenerate `plugins/ai-patterns/skills/ai-patterns/reference/` from `src/registry/`

There is no test suite/script in this repo yet.

## Deploying (Cloudflare Workers)

The site runs on Cloudflare Workers through OpenNext (`open-next.config.ts`,
`wrangler.jsonc`). Keep these constraints in mind:

- **Serve prerendered pages.** Pages come from a read-only cache of the
  HTML prerendered at build time; rendering on request blows the free
  plan's 10 ms CPU limit (Error 1102). The cache is copied into the assets
  by `opennextjs-cloudflare deploy`, so the Cloudflare build must run
  `npx opennextjs-cloudflare build` and deploy with
  `npx opennextjs-cloudflare deploy` — never a bare `wrangler deploy`.
  Keep new pages statically prerendered (no request-time data).
- **No filesystem.** Never `fs.readFile` project files at request time —
  import them, or bundle them like `sources.generated.ts`.
- **Bundle size under 3 MiB gzipped**, or deploys fail and the old version
  keeps serving. Highlight on the server with `src/lib/highlight.ts`
  (`shiki/core`, JS regex engine); `"shiki"` itself is aliased to a stub
  on the server (`next.config.ts`). Favicons are static PNGs, not
  `ImageResponse` routes (which bundle ~600 KB of WASM).

## About the block in AGENTS.md

The `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md` is
written and kept in sync by `next dev` itself (see
`node_modules/next/dist/server/lib/generate-agent-files.js`) — this is
genuine Next.js 16 behavior, not an injected instruction, so there's no
need to remove or hand-edit it. It only rewrites the content between its
own markers, so anything added to `AGENTS.md` outside that block, or to
this file, survives regeneration.
