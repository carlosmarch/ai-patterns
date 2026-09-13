# ai-patterns

A copy-paste library of animated UI components, in the spirit of
[beautifui.dev](https://www.beautifului.dev/), [shadcn/ui](https://ui.shadcn.com/),
and similar registries: own the source, don't install a dependency.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) (Framer Motion) for animation
- [Radix UI](https://www.radix-ui.com) primitives + [shadcn/ui](https://ui.shadcn.com)-style conventions for accessible base components
- [Shiki](https://shiki.style) for syntax-highlighted code panels

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a component

Components live under `src/registry/<category>/<slug>/`:

```
src/registry/buttons/shiny-button/
  component.tsx   # the component itself (this is what's shown in the "Code" tab)
  demo.tsx         # renders the component for the live "Preview" tab
```

Register it in `src/registry/index.ts` and it's automatically picked up by:

- `/patterns` — the gallery, grouped by category
- `/patterns/<category>/<slug>` — the detail page (live preview + syntax-highlighted, copyable source)

## Design skill

This catalogue ships as an installable Claude Code skill/plugin, `ai-patterns`,
under `plugins/ai-patterns/`. It's a design-engineering expert for AI product
prototypes, with three entry points:

- **list** — list every pattern in the catalogue as a numbered inventory
  ("list all patterns", "what patterns are available").
- **review** — scan a project for hand-rolled UI that duplicates a catalogue
  pattern and report where each would slot in. Read-only; nothing gets
  edited ("review my project", "audit my UI for reusable patterns").
- **apply** — the main flow: given a screen or flow to build, shortlist
  candidates from the catalogue, check each one's `When to use` / `When not
  to use` boundary, and scaffold it — defaulting to this repo's own
  Tailwind v4 + Radix + Motion look, or adapting the same UX contract
  (anatomy, behavior, accessibility) to whatever design system the target
  project already uses. Name a pattern directly to skip detection, or just
  describe the feature and let it auto-detect the best fit.

See `plugins/ai-patterns/skills/design/SKILL.md` for the full spec of each.

Install it in any project:

```
/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns
```

Then ask your agent something like "Use ai-patterns to add a loading state
while the agent is working," "review my project for reusable ai-patterns,"
or "list all patterns in the ai-patterns catalogue."

**It grows with the catalogue, not by hand.** The skill's reference material
(`plugins/ai-patterns/skills/design/reference/`) is generated from
`src/registry/` — never edited directly. After adding a new component to the
registry:

```bash
npm run skill:build          # regenerates reference/ from src/registry/
```

Then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`, and push. Anyone
with the plugin installed picks up the new pattern via `/plugin marketplace
update` + `/plugin update ai-patterns@ai-patterns`.

**Each pattern is versioned too.** Every catalogue entry carries its own
semver (`RegistryEntry.version`) for the exported props/types in its
`component.tsx` — the part a project that scaffolded the pattern actually
depends on. `npm run check:patterns` fails the build if that surface
changes in a breaking way without a matching major-version bump, so a
breaking prop change can't merge silently and become invisible to every
project that already installed the skill. See "Versioning a pattern's
props" in `CLAUDE.md` for the mechanics.

## Roadmap

- [x] Registry convention + Preview/Code doc template
- [x] First component (Shiny Button)
- [ ] More components across more categories
- [ ] Site chrome: sidebar nav, search
- [ ] Dark/light theme toggle
- [ ] Installable CLI (`npx <tool> add <slug>`), shadcn-registry style
