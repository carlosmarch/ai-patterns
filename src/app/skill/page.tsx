import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { getCategories, registry } from "@/registry";
import { SkillCta } from "./skill-cta";

const INSTALL_COMMAND = `/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns`;

export default async function SkillPage() {
  const pluginJson = JSON.parse(
    await fs.readFile(
      path.join(process.cwd(), "plugins/ai-patterns/.claude-plugin/plugin.json"),
      "utf-8"
    )
  ) as { version: string };

  const categories = getCategories();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      {/* Hero */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Claude Code skill · v{pluginJson.version}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">ai-patterns</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          A design-engineering expert for AI product prototypes, installed straight into your
          coding agent.
        </p>
        <p className="max-w-xl text-muted-foreground">
          Point it at a screen or flow you&apos;re building — a composer, a loading state, an
          agent trace, a diff review — and it shortlists from this catalogue, weighs each
          pattern&apos;s <em>when to use</em> against its <em>when not to use</em>, and scaffolds
          the one that actually fits. Not a component picker: a second opinion with taste.
        </p>
      </div>

      {/* Install */}
      <div className="mt-10 space-y-3">
        <CodeBlock code={INSTALL_COMMAND} lang="bash" trackAs="install_command" />
        <p className="text-sm text-muted-foreground">
          Then invoke <span className="font-mono text-foreground">/ai-patterns</span> in any project — or just describe what you need and it routes itself.
        </p>
      </div>

      {/* What it does */}
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-5">
          <h3 className="font-medium">Recommends</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Shortlists candidates and justifies each pick against the pattern&apos;s own design
            rules — never forces a close-but-wrong fit.
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="font-medium">Adapts</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Defaults to this catalogue&apos;s look. Already have a design system? It keeps the UX
            contract and re-expresses it in yours.
          </p>
        </div>
        <div className="rounded-lg border p-5">
          <h3 className="font-medium">Grows</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every pattern added to this catalogue is generated straight into the skill&apos;s
            reference material — nothing hand-duplicated, nothing to forget.
          </p>
        </div>
      </div>

      {/* Commands */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Three modes, one command</h2>
        <p className="mt-2 text-muted-foreground">
          Everything runs through <span className="inline-flex items-center rounded bg-foreground px-1.5 py-0.5 font-mono text-xs text-background">/ai-patterns</span> — describe what you need and it routes itself, or name a mode directly.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              mode: "list",
              body: "Lists every pattern in the catalogue as a numbered inventory, grouped by category.",
              trigger: "/ai-patterns list all patterns",
            },
            {
              mode: "review",
              body: "Scans your project for hand-rolled UI a catalogue pattern could replace. Read-only — nothing gets edited.",
              trigger: "/ai-patterns review my project",
            },
            {
              mode: "apply",
              body: "Auto-detects the best-fit pattern, proposes it with a rationale, then scaffolds it once you confirm.",
              trigger: "/ai-patterns add a loading state while the agent is working",
            },
          ].map((command) => (
            <div key={command.mode} className="rounded-lg border p-5">
              <h3 className="font-mono text-sm font-medium">{command.mode}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{command.body}</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">{command.trigger}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">How "patterns apply" works</h2>
        <ol className="mt-6 space-y-6">
          {[
            {
              title: "Understand the task, not just the component named",
              body: '“Add a loading state” is really “what does the user need to know while this is happening” — that’s what points at a Thinking Loader instead of a progress bar, or vice versa.',
            },
            {
              title: "Shortlist, then read the full spec",
              body: "Every pattern has a Summary, When to use, When not to use, Anatomy, Behavior, Content guidelines, and Accessibility section. The index alone is never enough to recommend from.",
            },
            {
              title: "Check what your project already looks like",
              body: "No established design system yet? It uses this catalogue's own Tailwind + Radix + Motion implementation as-is.",
            },
            {
              title: "Scaffold with the contract intact",
              body: "Already on shadcn, MUI, Chakra, or your own system? The behavior, content, and accessibility rules carry over — only the markup, styling, and motion API change.",
            },
            {
              title: "Say so when nothing fits",
              body: "If the catalogue doesn't have an answer, it says that plainly instead of stretching the nearest pattern to cover a case it wasn't designed for.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Catalogue stats */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          {registry.length} patterns, {categories.length} categories — and growing
        </h2>
        <p className="mt-2 text-muted-foreground">
          The skill never ships stale docs: its reference material is generated straight from
          this catalogue, so a new pattern here is a new capability there the moment it&apos;s
          regenerated and pushed.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href="/patterns"
                className="inline-block rounded-full border px-3 py-1 text-sm capitalize text-muted-foreground transition-colors hover:text-foreground"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <SkillCta />
    </main>
  );
}
