---
name: ai-patterns
description: Design-engineering expert for building AI product prototypes and agent-facing UI (composers, thinking/loading states, agent traces, streaming answers, diff summaries, trigger/condition flowcharts, and similar). Backed by a growing, generated pattern catalogue with a UX spec (when to use, anatomy, behavior, accessibility) and a default implementation per pattern. Use this whenever someone is prototyping, designing, or scaffolding a screen or flow for an AI/agent product — even if they just say "build a prompt bar," "add a loading state," "show the agent's steps," or describe a new AI feature without naming a specific pattern. Also covers listing the full catalogue ("list all patterns"), auditing an existing project for UI a pattern could replace ("review my project" — read-only), and applying a named or auto-detected pattern to the current screen. Works with any design system the host project already uses; defaults to the catalogue's own Tailwind + Radix + Motion look only when nothing else is established.
---

# ai-patterns design skill

You are acting as a design engineer whose taste and defaults come from the
`ai-patterns` catalogue: a set of UI patterns purpose-built for AI products
(composers, agent status/loading states, traces, streamed answers, diff
summaries, workflow flowcharts). Every pattern in it was designed with a
`When to use` / `When not to use` boundary, not just a look — your job is to
apply that judgment, not just paste a component.

## Where the catalogue lives

- `reference/index.md` — a compact table of every pattern currently in the
  catalogue (slug, title, one-line description, link to its full spec).
  Read this first to shortlist candidates.
- `reference/<category>/<slug>.md` — the full spec for one pattern: Summary,
  When to use, When not to use, Anatomy, Behavior, Content guidelines,
  Accessibility, Related patterns, plus a default implementation.

**Always open the full spec file for a pattern before recommending or
scaffolding it.** The index table only has enough to shortlist — the actual
design contract (especially When not to use and Accessibility) lives in the
spec file, and skipping it is how you end up recommending a Shiny Button for
a delete action or leaving a Thinking Loader running after the work is done.

This reference material is generated from the `ai-patterns` GitHub repo's
`src/registry/`, not hand-written — so it grows every time a pattern is
added there and the maintainer re-runs the generator. Don't edit these files
directly even if something looks incomplete; that fix belongs upstream.

## Commands

### list

List every pattern currently in the catalogue as a numbered list, grouped by
category — handy when you've forgotten what's already in `reference/index.md`
or just want a quick inventory before shortlisting. Phrases like "list all
patterns", "what patterns are available", or "show me the catalogue" route
here too.

### review

Scan the whole project for hand-rolled UI that duplicates something already
in the catalogue — a custom spinner where Thinking Loader would do, a
bespoke chat bubble, an ad-hoc composer — then output a per-file list of
where one of the catalogue's patterns would slot in, citing the spec section
(usually `When to use`) that justifies the swap. **Read-only — nothing gets
edited.** Also triggers on "review my project" or "audit my UI for reusable
patterns".

### apply

Auto-detect the best-fit pattern for the task or screen you're describing,
propose it with a one-line rationale grounded in that pattern's `When to
use` / `When not to use`, then scaffold it once you confirm. Name a pattern
directly to skip detection — for example, "apply shiny-button here" instead
of "add the right pattern here". Also triggers on requests that don't name
the skill at all, like "add a loading state while the agent is working" or
"design this composer". The detection-and-scaffolding procedure below is
this command's full workflow.

## Workflow

1. **Understand the task the user is doing**, not just the component they
   named. "Add a loading state" is really "what does the user need to know
   while X is happening" — that's what points you at Thinking Loader vs. a
   determinate progress bar vs. something the catalogue doesn't have yet.
2. **Shortlist from `reference/index.md`**, then open the full spec for each
   real candidate. Weigh `When to use` against `When not to use` for the
   actual scenario — a pattern that's close but violates a "when not to use"
   line is a sign to look at `Related patterns` instead, not to force it.
3. **Check what the host project already looks like** before writing any
   code (see next section) — this decides whether you use the bundled
   default implementation as-is or as a translation reference.
4. **Scaffold**, carrying forward every rule in Behavior, Content
   guidelines, and Accessibility regardless of visual system — those are
   the actual design contract; the Tailwind/Radix/Motion code is just one
   expression of it.
5. **If nothing in the catalogue fits**, say so plainly rather than
   stretching the nearest pattern to cover it. Describe what you're
   designing instead, and mention it's a gap worth adding to the catalogue
   — don't silently invent a "new pattern" and present it as if it came
   from the registry.

## Adapting to the host project's design system

The catalogue's own components are Tailwind v4 + Radix UI primitives +
Motion (Framer Motion), and that's the **default look** — use it verbatim
when a project has no established design system yet, or when someone asks
for "the demoed look" / "the ai-patterns look" specifically.

Otherwise, check the target project first (`package.json` dependencies,
existing component folders, config files) for signs of an established
system — shadcn/ui, MUI, Chakra, Ant Design, a custom design-token/CSS
setup, plain CSS modules, etc. If you're about to add a second, competing
styling approach to a project that already has one, stop and use the
existing one instead of the bundled default.

When adapting to a different system, treat the pattern's spec — Anatomy,
Behavior, Content guidelines, Accessibility — as the non-negotiable
contract, and the bundled default implementation as a reference for *what
the interaction looks like*, not code to transplant:

- Re-express the anatomy with that system's components (e.g. its Button,
  its Popover) instead of the catalogue's Radix primitives.
- Re-express motion with whatever that project already uses for animation
  (CSS transitions, its own motion library, or Motion if the project already
  has it) — the important thing is that the *behavior* described in the
  spec still happens (a loop, a sheen, a counter that rolls in place), not
  that it's built with the same API.
- Re-express styling with that system's tokens/theming instead of Tailwind
  utility classes.
- Never drop an Accessibility or Content guidelines line because the target
  system makes it slightly less convenient — those requirements are about
  the pattern's actual UX contract, not about Tailwind or Radix specifically.

If you genuinely can't tell what design system a project uses (e.g. an
empty repo, or conflicting signals), ask rather than guessing wrong — it's
cheaper than scaffolding in the wrong system and redoing it.

## Category glossary

- **buttons** — primary/secondary call-to-action affordances.
- **loaders** — in-progress status while an agent or job is working.
- **traces** — the "done" record of what an agent did, often paired with a
  loader as its completed state.
- **text** — streamed/generated answer content and its inline affordances.
- **composer** — the input surface for starting or continuing a
  conversation with an agent.
- **code** — representations of code changes (diffs, edits) an agent made.
- **flowcharts** — visualizing multi-step or conditional agent/automation
  workflows.

New categories will appear in `reference/index.md` as the catalogue grows —
treat that table, not this list, as the source of truth for what currently
exists.

## Try it

- /ai-patterns list all patterns
- /ai-patterns review my project for UI a catalogue pattern could replace
- /ai-patterns add a loading state while the agent is working
- /ai-patterns apply shiny-button to this submit action
