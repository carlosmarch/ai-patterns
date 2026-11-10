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

Demo conventions:

- No drop shadows (`shadow-*`) on demo or component surfaces — pills,
  cards and controls get a border (`border`) and flat background only.
- Demo copy is about this project's world: someone designing or building
  an AI product, talking about its UI and the patterns in this catalogue
  (name real patterns, e.g. "Thinking Loader", "Cost Estimate"). Avoid
  generic assistant errands (calendars, meetings with named people,
  reminders).

Register the new entry in `src/registry/index.ts` (import the `Demo`,
`Thumbnail` and `pattern`, add a `RegistryEntry`) — this is what makes it appear on
`/patterns` and `/patterns/<category>/<slug>`.

Every entry has an `added` timestamp — when it joined the catalogue, in
UTC ISO to the minute (e.g. `"2026-11-07T23:13Z"`); use the time you add
it. The `NEW_COUNT` (10) most recent get the "New" tag (`newEntries` /
`isNewEntry` in `src/registry/index.ts`): the home page's "New" block, the
badge on `/patterns` cards and the pattern page, and the sidebar dot.

Every entry also needs a `job` — what the pattern does for the user,
across categories: `start`, `ask`, `steer`, `oversee`, `trust` or
`recover` (defined, with descriptions, in `src/registry/jobs.ts`). It
drives the filter pills on `/patterns` (`?job=<id>`), the job chip on
the pattern page, the "Patterns by job" section in `llms.txt` and
`/patterns.md`, the JSON API and the MCP `list_patterns` `job` filter.
Pick the user's goal, not the UI element: a cost meter is `oversee`, an
error card is `recover`.

After adding or changing a pattern, regenerate the design skill's
reference docs:

```bash
npm run skill:build
```

then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`.

## Agent-facing endpoints

`src/lib/agent.ts` builds everything the site serves to agents —
`/llms.txt`, `/llms-full.txt`, the Markdown twins of pages (exported by
`src/app/md/[...path]/route.ts`, then moved to `<page>.md` by
`scripts/finalize-export.mjs`), the JSON API (`src/app/api/patterns/`) and
the data for the MCP server (`src/app/api/mcp-data.json/`). All read from
the registry, so a new pattern shows up in them automatically; add a new
top-level page to the `md` route and `sitemap.ts` if agents should see it.

The MCP server itself (`src/lib/mcp.ts`) runs in the Cloudflare Worker
(`worker/index.ts`), not in Next.js, so it must not import the registry or
React — it works from `/api/mcp-data.json` and the exported `.md` files.

## Commands

- `npm run dev` — start the site at localhost:3000 (`/mcp` isn't served
  here; use `npm run preview`)
- `npm run lint` — ESLint
- `npm run build` — static export to `out/` (runs `sources:build` before
  and `scripts/finalize-export.mjs` after)
- `npm run preview` — build, then serve `out/` + the Worker locally with
  `wrangler dev`
- `npm run deploy` — build and deploy to Cloudflare Workers
- `npm run sources:build` — regenerate `src/registry/sources.generated.ts`
  (every `component.tsx` as a string)
- `npm run scout` — the research scout (`scripts/scout.mjs`): searches the
  products in `research/sources.json` with Claude, codes findings against the
  registry and writes `research/scout/<date>.md` (needs `ANTHROPIC_API_KEY`;
  `-- --dry-run` prints instead). Runs on demand (manual dispatch only) in `.github/workflows/scout.yml`,
  which opens a PR with the report
- `npm run skill:build` — regenerate `plugins/ai-patterns/skills/ai-patterns/reference/` from `src/registry/`

There is no test suite/script in this repo yet.

## Deploying (Cloudflare Workers)

The site is a fully static export (`output: "export"` in `next.config.ts`)
served as Workers static assets (`wrangler.jsonc`). Static files are
served without running any Worker code, which is what keeps it inside the
Workers free plan's 10 ms CPU limit per request (a Next.js server can't
meet it — that was "Error 1102: Worker exceeded resource limits").
Cloudflare build settings: build `npm run build`, deploy
`npx wrangler deploy`.

- **PR previews.** Workers Builds runs `npx wrangler preview` for every
  non-`main` branch (needs the `previews` block in `wrangler.jsonc`). The
  preview URL is the branch name with `/` replaced by `-`, then
  `-ai-patterns.carlosmarchinfo.workers.dev` — e.g. branch
  `claude/happy-mendel-uo4z5p` →
  `https://claude-happy-mendel-uo4z5p-ai-patterns.carlosmarchinfo.workers.dev/`.
  When asked for a PR build, share this URL (a pattern lives at
  `/patterns/<category>/<slug>`). It only works once the "Workers Builds:
  ai-patterns" check on the PR has passed.
- **Everything must be static.** No request-time data: no
  `cookies()`/`headers()`, no dynamic route handlers, no middleware,
  rewrites or `next.config` headers. Every route handler and metadata file
  needs `export const dynamic = "force-static"`; dynamic segments need
  `generateStaticParams`. Response headers go in `public/_headers`.
- **No exported path may be both a file and a directory** (e.g. a route
  at `/a` and another at `/a/b`) — the export fails with `EISDIR`. Give
  leaf routes a file name, as the `md` and `api/patterns/index.json` routes do.
- **Keep the Worker tiny.** It only runs for `/mcp`, `/api/patterns` and
  404s; don't import the registry, React or Next into it.
- Highlight code on the server with `src/lib/highlight.ts`. Favicons are
  static files (`src/app/icon.svg`, `icon.png`, `favicon.ico`,
  `apple-icon.png`).
- Share images are `opengraph-image.tsx` routes (site root and each
  pattern) drawn by `src/lib/og.tsx` at build time; each pattern's card
  reuses its `thumbnail.tsx`. They export without a file extension, so
  `scripts/finalize-export.mjs` adds `image/png` rules to `out/_headers`.
  Pages that set their own `openGraph` must pass `images:
  SITE_SHARE_IMAGE` (`src/lib/share.ts`) or they lose the image.

## About the block in AGENTS.md

The `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md` is
written and kept in sync by `next dev` itself (see
`node_modules/next/dist/server/lib/generate-agent-files.js`) — this is
genuine Next.js 16 behavior, not an injected instruction, so there's no
need to remove or hand-edit it. It only rewrites the content between its
own markers, so anything added to `AGENTS.md` outside that block, or to
this file, survives regeneration.
