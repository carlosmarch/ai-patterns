import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { getCategories, registry } from "@/registry";
import { INSTALL_COMMAND, SKILL_MODES, SKILL_PILLARS, SKILL_STATS_BODY, SKILL_STEPS, SKILL_TAGLINE, SkillPitch } from "./content";
import { SkillCta } from "./skill-cta";
import { SkillExamples } from "./skill-examples";

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
        <p className="max-w-xl text-lg text-muted-foreground">{SKILL_TAGLINE}</p>
        <p className="max-w-xl text-muted-foreground">
          <SkillPitch />
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
        {SKILL_PILLARS.map((pillar) => (
          <div key={pillar.title} className="rounded-lg border p-5">
            <h3 className="font-medium">{pillar.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{pillar.body}</p>
          </div>
        ))}
      </div>

      {/* Commands */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Three modes, one command</h2>
        <p className="mt-2 text-muted-foreground">
          Everything runs through <span className="inline-flex items-center rounded bg-foreground px-1.5 py-0.5 font-mono text-xs text-background">/ai-patterns</span> — describe what you need and it routes itself, or name a mode directly.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {SKILL_MODES.map((command) => (
            <div key={command.mode} className="rounded-lg border p-5">
              <h3 className="font-mono text-sm font-medium">{command.mode}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{command.body}</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">{command.trigger}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Try it on a real request</h2>
        <p className="mt-2 text-muted-foreground">
          Pick a request, copy the prompt, and paste it into your agent in any project. Each one
          says what the skill should land on, so you can check its judgment.
        </p>
        <SkillExamples />
      </div>

      {/* How it works */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">How &ldquo;patterns apply&rdquo; works</h2>
        <ol className="mt-6 space-y-6">
          {SKILL_STEPS.map((step, i) => (
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
        <p className="mt-2 text-muted-foreground">{SKILL_STATS_BODY}</p>
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
