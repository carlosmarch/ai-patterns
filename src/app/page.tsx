import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { registry } from "@/registry";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { DownloadButton } from "@/components/download-button";
import { HeroHeadline } from "./hero-headline";
import { HomeHero } from "./home-hero";

// Curated order for the home page: lead with the most distinctly agentic
// patterns, then walk through the life of a turn — the agent working,
// answering, taking input — before builder, error and team patterns.
// Anything not listed here is appended in registry order.
const HOME_ORDER = [
  // Newest first, tagged "New"
  "procedure-builder",
  "instruction-tools",
  "refinement-controls",
  // The agent at work
  "multi-agent-trace",
  "human-in-the-loop",
  "tool-approval",
  "streaming-text",
  "expandable-trace",
  "tool-call-chip",
  "thinking-loader",
  "analysis-list",
  "background-tasks",
  "terminal-stream",
  "diff-summary",
  "diff-tabs",
  // Answers you can trust and steer
  "inline-citation",
  "sources-stack",
  "source-trust-card",
  "confidence-indicator",
  "response-compare",
  "chat-bubble",
  "selection-actions",
  "follow-up-list",
  // Input
  "prompt-bar",
  "stop-generation-button",
  "attachment-chip",
  "command-palette",
  "image-peek",
  // Voice
  "listening-state",
  "voice-waveform",
  "live-transcript",
  // Building agents
  "create-agent",
  "agent-triggers",
  "trigger-condition",
  "connector-panel",
  // When things go wrong
  "generation-error",
  "partial-response",
  "rate-limit",
  "connectivity-error",
  "console-error-card",
  // Onboarding & teams
  "prompt-onboarding",
  "setup-checklist",
  "collaborative-presence",
  "invite-members",
];

const NEW = new Set(["procedure-builder", "instruction-tools", "refinement-controls"]);

export default async function Home() {
  const featured = registry.find((entry) => entry.slug === "prompt-bar-pro");
  const HIDDEN = new Set(["shiny-button"]);
  const rank = (slug: string) => {
    const i = HOME_ORDER.indexOf(slug);
    return i === -1 ? HOME_ORDER.length : i;
  };
  const rest = registry
    .filter((entry) => entry.slug !== featured?.slug && !HIDDEN.has(entry.slug))
    .sort((a, b) => rank(a.slug) - rank(b.slug));

  const sources = await Promise.all(
    rest.map((entry) =>
      fs.readFile(
        path.join(process.cwd(), "src/registry", entry.category, entry.slug, "component.tsx"),
        "utf-8"
      )
    )
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-3xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            A portable UX contract, not a skin
          </div>

          <HeroHeadline />
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">
            Distilled from the teams pioneering AI workflows. Agentic patterns with
            machine-readable specs. Each pattern ships with a UX spec the
            harness can read, not just markup — guardrails for what to render, when, and why.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#first-demo"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Browse the catalogue →
            </Link>
            <Link
              href="/skill"
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Install as a Claude Code skill
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {featured && (
            <div className="mx-auto mt-10 max-w-lg text-left">
              <HomeHero />
              <Link
                href={`/patterns/${featured.category}/${featured.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {featured.title}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="space-y-16">
          {rest.map((entry, i) => {
            const Demo = entry.Demo;
            const source = sources[i];
            return (
              <section
                key={entry.slug}
                id={i === 0 ? "first-demo" : undefined}
                className="space-y-3 scroll-mt-6"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-medium">
                      {entry.title}
                      {NEW.has(entry.slug) && (
                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium leading-none text-blue-600 dark:text-blue-400">
                          New
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                  <Link
                    href={`/patterns/${entry.category}/${entry.slug}`}
                    className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View details →
                  </Link>
                </div>
                <ComponentPreview
                  preview={<Demo />}
                  code={<CodeBlock code={source} />}
                  pattern={
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                          A UX spec for this pattern — written for agents implementing or reusing it, not the code.
                        </p>
                        <DownloadButton
                          filename={`${entry.slug}.pattern.md`}
                          content={entry.uxDoc}
                          className="shrink-0"
                        />
                      </div>
                      <CodeBlock code={entry.uxDoc} lang="markdown" wrap />
                    </div>
                  }
                />
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
