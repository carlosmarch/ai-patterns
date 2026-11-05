import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import { registry, type RegistryEntry } from "@/registry";
import { GithubMark } from "@/components/github-mark";
import { PatternCard } from "@/components/pattern-card";
import { IntroHero, type HeroEntry } from "./intro-hero/intro-hero";
import { HomeFeatures } from "./home-features";
import { HomeHero } from "./home-hero";
import { Card, DemoCard, Section, href } from "./home-parts";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

// Curated groups for the home page, walking through the life of a turn — the
// agent working, answering, taking input — before builder, error and team
// patterns. The first slug of each group is shown as a live demo; the rest
// render as thumbnail cards. Anything not listed is appended to a final group.
const NEW = ["natural-language-query", "ai-fill-drawer", "describe-filters", "procedure-builder", "instruction-tools", "refinement-controls"];

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
// Faded behind the search vignette in the "why" bento.
const SEARCH_THUMBS = ["tool-approval", "streaming-text", "inline-citation", "stop-generation-button", "generation-error", "sources-stack"];
const HIDDEN = new Set([FEATURED, "shiny-button"]);

const bySlug = new Map(registry.map((entry) => [entry.slug, entry]));
const pick = (slugs: string[]) =>
  slugs.map((slug) => bySlug.get(slug)).filter((e): e is RegistryEntry => Boolean(e));

const toHeroEntry = ({ slug, category, title, description }: RegistryEntry): HeroEntry => ({
  slug,
  category,
  title,
  description,
});
const heroEntries = registry.filter((e) => !HIDDEN.has(e.slug) || e.slug === FEATURED).map(toHeroEntry);

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
      <IntroHero
        entries={heroEntries}
        latest={newEntries[0] && toHeroEntry(newEntries[0])}
      />

      <div className="mx-auto w-full max-w-3xl px-6 pt-6">
        {/* Why — the bento */}
        <HomeFeatures
          patternCount={registry.filter((e) => !HIDDEN.has(e.slug)).length}
          thumbnails={pick(SEARCH_THUMBS).map(({ slug, Thumbnail }) => (
            <div key={slug} className="rounded-md border bg-card p-1.5 dark:bg-background">
              <Thumbnail />
            </div>
          ))}
        />

        {/* Featured — the composer, live */}
        {featured && (
          <Section title="Try it" action={{ label: "View details", href: href(featured) }}>
            <Card
              title={featured.title}
              description={featured.description}
              href={href(featured)}
              seenIn={featured.seenIn}
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
                      <PatternCard entry={entry} />
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
