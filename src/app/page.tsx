import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Sparkles } from "lucide-react";

import { getCategories, registry, type RegistryEntry } from "@/registry";
import { GithubMark } from "@/components/github-mark";
import { IntroHero, type HeroEntry } from "./intro-hero/intro-hero";
import { HomeConnect } from "./home-connect";
import { HomeHero } from "./home-hero";
import { Card, DemoCard, Section, href } from "./home-parts";
import { AskVariant, StatsVariant, TabsVariant, TerminalVariant, type SectionItem } from "./sections/variants";
import { CompareVariant, ComparisonVariant, IndexVariant } from "./sections/variants-more";

// The home page, assembled from the blocks explored on /sections. The story
// runs pitch → proof → how it works → try it → what's new → the catalogue →
// how your agent uses it → how to connect it → why not a library → numbers and CTA.

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";
const FEATURED = "prompt-bar-pro";
const HIDDEN = new Set([FEATURED, "shiny-button"]);
const NEW = ["natural-language-query", "ai-fill-drawer", "describe-filters"];
const SEARCH_THUMBS = ["tool-approval", "streaming-text", "inline-citation", "stop-generation-button", "generation-error", "sources-stack"];

const bySlug = new Map(registry.map((entry) => [entry.slug, entry]));
const pick = (slugs: string[]) =>
  slugs.map((slug) => bySlug.get(slug)).filter((e): e is RegistryEntry => Boolean(e));

const toHeroEntry = ({ slug, category, title, description }: RegistryEntry): HeroEntry => ({
  slug,
  category,
  title,
  description,
});

export default function Home() {
  const visible = registry.filter((e) => !HIDDEN.has(e.slug));
  const heroEntries = registry.filter((e) => !HIDDEN.has(e.slug) || e.slug === FEATURED).map(toHeroEntry);
  const featured = bySlug.get(FEATURED);
  const newEntries = pick(NEW);
  const items: SectionItem[] = visible.map(({ slug, category, title, Thumbnail }) => ({
    slug,
    category,
    title,
    thumb: <Thumbnail />,
  }));
  const searchThumbs = pick(SEARCH_THUMBS).map(({ slug, Thumbnail }) => (
    <div key={slug} className="rounded-md border bg-card p-1.5 dark:bg-background">
      <Thumbnail />
    </div>
  ));

  return (
    <main>
      <IntroHero entries={heroEntries} latest={newEntries[0] && toHeroEntry(newEntries[0])} />

      <Band>
        <AskVariant items={items} />
      </Band>

      <Band>
        <CompareVariant />
      </Band>

      <Band>
        <TabsVariant thumbnails={searchThumbs} />
      </Band>

      {featured && (
        <Band narrow>
          <Section title="Try it" action={{ label: "View details", href: href(featured) }}>
            <Card title={featured.title} description={featured.description} href={href(featured)} seenIn={featured.seenIn}>
              <div className="flex justify-center px-4 py-10 sm:px-10">
                <HomeHero />
              </div>
            </Card>
          </Section>
        </Band>
      )}

      {newEntries.length > 0 && (
        <Band narrow>
          <Section id="first-demo" title="New" action={{ label: "View all", href: "/patterns" }}>
            <div className="space-y-4">
              {newEntries.map((entry) => (
                <DemoCard key={entry.slug} entry={entry} badge="New" />
              ))}
            </div>
          </Section>
        </Band>
      )}

      <Band>
        <IndexVariant items={items} total={registry.length} />
      </Band>

      <Band>
        <TerminalVariant />
      </Band>

      <Band narrow>
        <HomeConnect />
      </Band>

      <Band narrow>
        <ComparisonVariant />
      </Band>

      <Band narrow>
        <StatsVariant patternCount={registry.length} categoryCount={getCategories().length} />
      </Band>

      <section className="px-6 py-24 text-center sm:py-32">
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">Let&apos;s build agents people can trust.</h2>
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
    </main>
  );
}

// One horizontal band of the page: wide blocks get the 5xl column, list-like
// and card blocks keep the current home page's 3xl column.
function Band({ narrow, children }: { narrow?: boolean; children: ReactNode }) {
  return (
    <div className={narrow ? "mx-auto w-full max-w-3xl px-6 py-10 sm:py-14" : "mx-auto w-full max-w-5xl px-6 py-14 sm:py-20"}>
      {children}
    </div>
  );
}
