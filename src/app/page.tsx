import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";

import { registry, type RegistryEntry } from "@/registry";
import { GithubMark } from "@/components/github-mark";
import { HeroHeadline } from "./hero-headline";
import { HomeHero } from "./home-hero";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

// Curated groups for the home page, walking through the life of a turn — the
// agent working, answering, taking input — before builder, error and team
// patterns. The first slug of each group is shown as a live demo; the rest
// render as thumbnail cards. Anything not listed is appended to a final group.
const NEW = ["procedure-builder", "instruction-tools", "refinement-controls"];

const GROUPS: { title: string; blurb: string; slugs: string[] }[] = [
  {
    title: "The agent at work",
    blurb: "Show what the agent is doing, and let people step in before it matters.",
    slugs: [
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
    ],
  },
  {
    title: "Answers you can trust",
    blurb: "Cite, compare and steer — so a response earns belief instead of assuming it.",
    slugs: [
      "inline-citation",
      "sources-stack",
      "source-trust-card",
      "confidence-indicator",
      "response-compare",
      "chat-bubble",
      "selection-actions",
      "follow-up-list",
    ],
  },
  {
    title: "Input",
    blurb: "Compose, attach and interrupt without losing the thread.",
    slugs: ["prompt-bar", "stop-generation-button", "attachment-chip", "command-palette", "image-peek"],
  },
  {
    title: "Voice",
    blurb: "Listening, speaking and transcribing as first-class states.",
    slugs: ["listening-state", "voice-waveform", "live-transcript"],
  },
  {
    title: "Building agents",
    blurb: "Give people the controls to define when and how an agent runs.",
    slugs: ["create-agent", "agent-triggers", "trigger-condition", "connector-panel"],
  },
  {
    title: "When things go wrong",
    blurb: "Fail honestly, keep the partial work, and offer the next step.",
    slugs: [
      "generation-error",
      "partial-response",
      "rate-limit",
      "connectivity-error",
      "console-error-card",
    ],
  },
  {
    title: "Onboarding & teams",
    blurb: "Get people to a first good prompt, then bring their team along.",
    slugs: ["prompt-onboarding", "setup-checklist", "collaborative-presence", "invite-members"],
  },
];

const FEATURED = "prompt-bar-pro";
const HIDDEN = new Set([FEATURED, "shiny-button"]);

const bySlug = new Map(registry.map((entry) => [entry.slug, entry]));
const pick = (slugs: string[]) =>
  slugs.map((slug) => bySlug.get(slug)).filter((e): e is RegistryEntry => Boolean(e));

const href = (entry: RegistryEntry) => `/patterns/${entry.category}/${entry.slug}`;

export default function Home() {
  const featured = bySlug.get(FEATURED);
  const newEntries = pick(NEW);

  const listed = new Set([...NEW, ...GROUPS.flatMap((g) => g.slugs)]);
  const unlisted = registry.filter((e) => !listed.has(e.slug) && !HIDDEN.has(e.slug));
  const groups = [
    ...GROUPS.map((g) => ({ ...g, entries: pick(g.slugs) })),
    ...(unlisted.length
      ? [{ title: "More patterns", blurb: "Everything else in the catalogue.", entries: unlisted }]
      : []),
  ].filter((g) => g.entries.length > 0);

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
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 pt-6">
        {/* Featured — the composer, live */}
        {featured && (
          <Section title="Try it" action={{ label: "View details", href: href(featured) }}>
            <Card
              title={featured.title}
              description={featured.description}
              href={href(featured)}
            >
              <div className="flex justify-center px-4 py-10 sm:px-10">
                <HomeHero />
              </div>
            </Card>
          </Section>
        )}

        {/* New */}
        {newEntries.length > 0 && (
          <Section id="first-demo" title="New" action={{ label: "View all", href: "/patterns" }}>
            <div className="space-y-4">
              {newEntries.map((entry) => (
                <DemoCard key={entry.slug} entry={entry} badge="New" />
              ))}
            </div>
          </Section>
        )}

        {/* Groups — one live demo, then a grid of prints */}
        {groups.map((group) => {
          const [lead, ...rest] = group.entries;
          return (
            <Section
              key={group.title}
              title={group.title}
              blurb={group.blurb}
              meta={`${group.entries.length} ${group.entries.length === 1 ? "pattern" : "patterns"}`}
            >
              <DemoCard entry={lead} />
              {rest.length > 0 && (
                <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {rest.map((entry) => (
                    <li key={entry.slug}>
                      <ThumbnailCard entry={entry} />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          );
        })}

        {/* Closing */}
        <section className="py-24 text-center sm:py-32">
          <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Let&apos;s build agents people can trust.
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/patterns" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <BookOpen className="size-3.5" />
              Patterns
            </Link>
            <Link href="/skill" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <Sparkles className="size-3.5" />
              Claude Code skill
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubMark className="size-3.5" />
              GitHub
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  blurb,
  meta,
  action,
  children,
}: {
  id?: string;
  title: string;
  blurb?: string;
  meta?: string;
  action?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 py-10 sm:py-12">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          {blurb && <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {action.label} →
          </Link>
        ) : (
          meta && <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{meta}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Card({
  title,
  description,
  href,
  badge,
  className,
  children,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={"rounded-xl border bg-muted/40 p-1.5 " + (className ?? "")}>
      <div className="overflow-hidden rounded-lg border bg-card dark:bg-background">{children}</div>
      <div className="flex items-end justify-between gap-4 px-3 pt-3 pb-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            {title}
            {badge && (
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-blue-600 dark:text-blue-400">
                {badge}
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <Link
          href={href}
          aria-label={`View ${title} details`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

function DemoCard({ entry, badge }: { entry: RegistryEntry; badge?: string }) {
  const Demo = entry.Demo;
  return (
    <Card title={entry.title} description={entry.description} href={href(entry)} badge={badge}>
      <div className="flex min-h-[260px] items-center justify-center p-4 sm:p-10">
        <Demo />
      </div>
    </Card>
  );
}

function ThumbnailCard({ entry }: { entry: RegistryEntry }) {
  const { Thumbnail } = entry;
  return (
    <Link
      href={href(entry)}
      className="group block h-full rounded-xl border bg-muted/40 p-1.5 transition-colors hover:bg-muted/70"
    >
      <div className="aspect-[5/3] rounded-lg border bg-card p-2 dark:bg-background transition-transform duration-300 group-hover:-translate-y-0.5">
        <Thumbnail />
      </div>
      <div className="px-1.5 pt-2.5 pb-1.5">
        <p className="text-sm font-medium">{entry.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{entry.description}</p>
      </div>
    </Link>
  );
}
