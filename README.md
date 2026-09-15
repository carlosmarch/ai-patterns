# ai-patterns

A pattern library for AI product UI — the interactions that don't have established conventions yet: tool approval, confidence indicators, agent handoff, error recovery, streaming answers, and more.

Each pattern ships as a portable UX contract: anatomy, behavior, accessibility rules, and content guidelines, kept separate from the Tailwind/Radix implementation shown in the "Code" tab. The contract survives transplanting into any design system; only the markup re-expresses.

**[Browse the catalogue](https://ai-patterns.vercel.app/patterns)** or install the Claude Code skill that scaffolds patterns straight into your own project.

---

## The catalogue

Patterns are organized into categories that map to the surfaces and states of a typical AI product:

| Category | What it covers |
|---|---|
| **buttons** | Primary/secondary call-to-action affordances |
| **loaders** | In-progress status while an agent or job is working |
| **traces** | The completed record of what an agent did |
| **text** | Streamed/generated answer content and its inline affordances |
| **composer** | The input surface for starting or continuing a conversation |
| **code** | Representations of code changes (diffs, edits) an agent made |
| **flowcharts** | Visualizing multi-step or conditional agent/automation workflows |
| **errors** | Generation errors and console-level failure states |
| **permissions** | Tool approval and access-grant interactions |
| **indicators** | Confidence, status, and progress signals |
| + more | New categories added as the catalogue grows |

Each pattern detail page has three tabs:

- **Preview** — live render of the component
- **Code** — verbatim `component.tsx`, ready to copy
- **Pattern** — the full UX spec (when to use, anatomy, behavior, accessibility)

---

## The skill

The catalogue ships as an installable Claude Code skill. Once installed, your agent becomes a design-engineering expert that can recommend, validate, and scaffold patterns from the catalogue directly into your project — adapting to whatever design system you're already using.

### Install

```
/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns
```

### How it works

The skill reads two layers of reference material, both generated from `src/registry/`:

- `reference/index.md` — a compact table of every pattern (slug, title, one-line description)
- `reference/<category>/<slug>.md` — the full spec for one pattern, including a default implementation

**The agent always opens the full spec before recommending anything.** The index table is only for shortlisting — the actual design contract (especially the "When not to use" and Accessibility sections) lives in the spec file.

### Commands

**`/ai-patterns list`** — enumerate every pattern in the catalogue, grouped by category. Useful before starting a new screen to see what's already available.

**`/ai-patterns review`** — scan your project for hand-rolled UI that a catalogue pattern could replace. Outputs a per-file report citing the spec section that justifies each swap. Read-only; nothing is edited.

**`/ai-patterns apply`** (or just describe what you need) — the main workflow:
1. Understand the task in context, not just the component named
2. Shortlist candidates from `reference/index.md`
3. Open the full spec for each real candidate and weigh "When to use" vs. "When not to use"
4. Check the host project's existing design system
5. Scaffold the pattern, carrying forward every Behavior, Content, and Accessibility rule — using the bundled Tailwind v4 + Radix + Motion implementation as-is, or re-expressing it in the project's own system

If nothing in the catalogue fits, the skill says so plainly and describes the gap rather than stretching a close match.

### Design system adaptation

The bundled default is Tailwind v4 + Radix UI + Motion. When a project already has an established system (shadcn/ui, MUI, Chakra, Ant Design, CSS modules, etc.), the skill uses that instead:

- Anatomy re-expressed with the project's components
- Motion re-expressed with whatever animation the project already uses
- Styling re-expressed with the project's tokens
- Accessibility and content rules preserved regardless — they are the contract, not Tailwind

### Example prompts

```
/ai-patterns list all patterns
/ai-patterns review my project for UI a catalogue pattern could replace
/ai-patterns add a loading state while the agent is working
/ai-patterns apply shiny-button to this submit action
```

Or without naming the skill: "add a thinking state while the agent runs", "design a composer for my chat interface", "show the agent's steps."

---

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animation
- [Radix UI](https://www.radix-ui.com) primitives
- [Shiki](https://shiki.style) for syntax-highlighted code panels

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Adding a pattern

Each pattern lives under `src/registry/<category>/<slug>/`:

```
src/registry/<category>/<slug>/
  component.tsx   # the component (shown verbatim in the "Code" tab)
  demo.tsx        # renders it for the live "Preview" tab
  pattern.ts      # the UX spec as a markdown template literal ("Pattern" tab)
```

Register the entry in `src/registry/index.ts` — that's what makes it appear on `/patterns` and `/patterns/<category>/<slug>`.

After adding or editing a pattern, regenerate the skill's reference docs:

```bash
npm run skill:build
```

Then bump `version` in both `plugins/ai-patterns/.claude-plugin/plugin.json` and the plugin entry in `.claude-plugin/marketplace.json`. Anyone with the plugin installed picks up the new pattern via `/plugin marketplace update` + `/plugin update ai-patterns@ai-patterns`.

The reference material in `plugins/ai-patterns/skills/ai-patterns/reference/` is generated — never edit it directly.

---

## Versioning

The plugin version is the compatibility contract for anyone whose agent depends on this catalogue. Until 1.0, semver in spirit:

- **Patch** — new pattern, docs/copy fixes, non-breaking implementation tweaks
- **Minor** — a pattern's contract grows in a backward-compatible way (new optional prop, added "When to use" case)
- **Major** — a breaking change to a pattern's contract (prop renamed/removed, required anatomy changed, behavior that previously held no longer does)
