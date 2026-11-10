import type { Metadata } from "next";

import { SITE_SHARE_IMAGE } from "@/lib/share";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { McpInstall } from "@/components/mcp-install";
import { getCategories, registry } from "@/registry";
import pluginJson from "../../../plugins/ai-patterns/.claude-plugin/plugin.json";
import { INSTALL_COMMAND, SKILL_MODES, SKILL_PILLARS, SKILL_STATS_BODY, SKILL_STEPS, SKILL_TAGLINE, SkillPitch } from "./content";
import { SkillCta } from "./skill-cta";
import { Showcase, ShowcaseLogo } from "@/components/showcase";
import { getShowcaseTiles } from "../showcase-tiles";
import { SkillExamples } from "./skill-examples";

export const metadata: Metadata = {
  title: "Skill — AI Patterns",
  description: "Install the ai-patterns Claude Code skill to recommend and scaffold patterns in your project.",
  openGraph: { siteName: "AI Patterns", title: "Skill — AI Patterns", description: "Install the ai-patterns Claude Code skill to recommend and scaffold patterns in your project.", url: "/skill", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/skill.md", "text/plain": "/llms.txt" } },
};

export default function SkillPage() {
  const categories = getCategories();

  return (
    <>
      <div className="mx-auto w-full max-w-[1480px] px-4 pt-6 sm:px-5">
        <Showcase tiles={getShowcaseTiles()} compact moving>
          <ShowcaseLogo className="size-16 rounded-[20px]" />
          <p className="mt-6 text-sm font-medium text-muted-foreground">Claude Code skill · v{pluginJson.version}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {registry.length} patterns, in your agent
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-muted-foreground sm:text-lg">{SKILL_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#install"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Install the skill
            </a>
            <Link
              href="/patterns"
              className="inline-flex h-11 items-center rounded-full border bg-background px-5 text-[15px] font-medium transition-colors hover:bg-muted"
            >
              Browse patterns
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Not on Claude Code?{" "}
            <a href="#mcp" className="text-foreground underline-offset-4 hover:underline">
              Use the MCP server
            </a>
            .
          </p>
        </Showcase>
      </div>

      <main className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
        {/* Install */}
        <div id="install" className="scroll-mt-20 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Install</h2>
          <p className="text-muted-foreground">
            <SkillPitch />
          </p>
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

        {/* MCP */}
        <div id="mcp" className="mt-16 scroll-mt-20">
          <h2 className="text-xl font-semibold tracking-tight">Not on Claude Code? Use the MCP server</h2>
          <p className="mt-2 text-muted-foreground">
            The same catalogue, for any MCP client. It gives your agent the specs and code, but not the
            skill&apos;s recommend, review and scaffold workflow.
          </p>
          <div className="mt-6">
            <McpInstall page="skill" />
          </div>
        </div>

        {/* CTA */}
        <SkillCta />
      </main>
    </>
  );
}
