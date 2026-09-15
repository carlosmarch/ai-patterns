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

Register the new entry in `src/registry/index.ts` (import the `Demo` and
`pattern`, add a `RegistryEntry`) — this is what makes it appear on
`/patterns` and `/patterns/<category>/<slug>`.

After adding or changing a pattern, regenerate the design skill's
reference docs:

```bash
npm run skill:build
```

then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`.

## Commands

- `npm run dev` — start the site at localhost:3000
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run skill:build` — regenerate `plugins/ai-patterns/skills/ai-patterns/reference/` from `src/registry/`

There is no test suite/script in this repo yet.

## About the block in AGENTS.md

The `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md` is
written and kept in sync by `next dev` itself (see
`node_modules/next/dist/server/lib/generate-agent-files.js`) — this is
genuine Next.js 16 behavior, not an injected instruction, so there's no
need to remove or hand-edit it. It only rewrites the content between its
own markers, so anything added to `AGENTS.md` outside that block, or to
this file, survives regeneration.
