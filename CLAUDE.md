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
`pattern`, add a `RegistryEntry` including a starting `version: "1.0.0"`) —
this is what makes it appear on `/patterns` and `/patterns/<category>/<slug>`.

After adding or changing a pattern, regenerate the design skill's
reference docs:

```bash
npm run skill:build
```

then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`.

### Versioning a pattern's props

Every pattern's `RegistryEntry.version` (in `src/registry/index.ts`) is a
semver for that pattern's exported API — the Props interface/type (and
anything exported alongside it) in its `component.tsx`. Projects that
installed the `ai-patterns` skill hold a copy of that API, so a change to it
isn't a private refactor.

If you change a pattern's exported types in a way that breaks existing
usage — removing or renaming an export, dropping a prop, making a
previously-optional prop required, changing a prop's type — bump that
pattern's major version. `npm run check:patterns` enforces this: it diffs
each pattern's current exports against a committed snapshot
(`scripts/pattern-api-snapshot.json`) and fails if it finds a breaking
change with no version bump. It runs automatically before `npm run build`
(via `prebuild`); run it directly after bumping a version to update the
snapshot, and commit the result alongside your change. Non-breaking
changes (a new optional prop, a new export) don't require a bump.

## Commands

- `npm run dev` — start the site at localhost:3000
- `npm run lint` — ESLint
- `npm run build` — production build (runs `check:patterns` first)
- `npm run skill:build` — regenerate `plugins/ai-patterns/skills/design/reference/` from `src/registry/`
- `npm run check:patterns` — guardrail: fails if a pattern's exported props/types changed breakingly without a version bump

There is no test suite/script in this repo yet.

## About the block in AGENTS.md

The `<!-- BEGIN/END:nextjs-agent-rules -->` block in `AGENTS.md` is
written and kept in sync by `next dev` itself (see
`node_modules/next/dist/server/lib/generate-agent-files.js`) — this is
genuine Next.js 16 behavior, not an injected instruction, so there's no
need to remove or hand-edit it. It only rewrites the content between its
own markers, so anything added to `AGENTS.md` outside that block, or to
this file, survives regeneration.
