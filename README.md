# ai-patterns

The pattern language agents use to design agentic experiences — tool
approval, confidence, handoff, recovery, and the other interactions that
don't have established conventions yet.

Each pattern ships as a portable UX contract, not just markup: anatomy,
behavior, accessibility, and content rules, kept separate from the
Tailwind/Radix implementation shown in the "Code" tab. Browse the live
catalogue, or install it as a Claude Code skill that scaffolds a pattern
straight into your own design system — the contract survives, only the
markup re-expresses.

- **Browse the catalogue** — every pattern rendered live, with its full UX
  spec next to the code (`/patterns`, Preview / Code / Pattern tabs).
- **Install the skill** — `/plugin marketplace add carlosmarch/ai-patterns`,
  then ask your agent to design a screen with it (`/skill` has the full
  walkthrough).

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

## Adding a pattern

Each pattern lives under `src/registry/<category>/<slug>/`:

```
src/registry/buttons/shiny-button/
  component.tsx   # the component itself (shown verbatim in the "Code" tab)
  demo.tsx         # renders the component for the live "Preview" tab
  pattern.ts       # the UX contract (shown in the "Pattern" tab) — not the code
```

Register it in `src/registry/index.ts` and it's automatically picked up by:

- `/patterns` — the gallery, grouped by category
- `/patterns/<category>/<slug>` — the detail page (Preview / Code / Pattern)

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

See `plugins/ai-patterns/skills/design/SKILL.md` for the full spec of each,
or `/skill` on the site for the install walkthrough.

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
`src/registry/` — never edited directly. After adding a new pattern to the
registry:

```bash
npm run skill:build          # regenerates reference/ from src/registry/
```

Then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json`
and the plugin entry in `.claude-plugin/marketplace.json`, and push. Anyone
with the plugin installed picks up the new pattern via `/plugin marketplace
update` + `/plugin update ai-patterns@ai-patterns`.

## Versioning

The plugin version (`plugins/ai-patterns/.claude-plugin/plugin.json`,
mirrored in `.claude-plugin/marketplace.json`) is the compatibility contract
for anyone whose agent depends on this catalogue. Until 1.0, treat it as
semver in spirit:

- **Patch** — new pattern added, docs/copy fixes, non-breaking implementation
  tweaks (styling, internal refactors).
- **Minor** — a pattern's contract grows in a backward-compatible way (a new
  optional prop, an added `When to use` case).
- **Major** — a breaking change to a pattern's contract: a prop renamed or
  removed, required markup/anatomy changed, or behavior that previously held
  no longer does.

If a pattern's `component.tsx` props or `pattern.ts` anatomy/behavior change
in a way that would break an existing scaffold, bump accordingly — don't
ship it as a patch.

## Roadmap

- [x] Registry convention + Preview/Code/Pattern doc template
- [x] First component (Shiny Button)
- [ ] More components across more categories
- [ ] Site chrome: sidebar nav, search
- [ ] Dark/light theme toggle
- [ ] Installable CLI (`npx <tool> add <slug>`), shadcn-registry style
