import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

import { newEntries as latestEntries, registry, type RegistryEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { GithubMark } from "@/components/github-mark";
import { IntroHero, type HeroEntry } from "./intro-hero/intro-hero";
import { HomeConnect } from "./home-connect";
import { Showcase, ShowcaseLogo } from "@/components/showcase";
import { getShowcaseTiles } from "./showcase-tiles";
import { AskVariant, StatsVariant, TabsVariant, TerminalVariant, type SectionItem } from "./sections/variants";
import { CompareVariant, ComparisonVariant } from "./sections/variants-more";

// The home page, assembled from the blocks explored on /sections. The story
// runs pitch → a glimpse of the catalogue and the way in →
// how your agent uses it → proof → code and spec → how to connect it → why not
// a library → numbers and CTA.

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";
// Too plain to sell the catalogue from the home page.
const HIDDEN = new Set(["shiny-button"]);
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
  const heroEntries = visible.map(toHeroEntry);
  const newEntries = latestEntries.filter((e) => !HIDDEN.has(e.slug));
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
      <IntroHero entries={heroEntries} newEntries={newEntries.map(toHeroEntry)} />

      <Band wide>
        <Showcase id="patterns" tiles={getShowcaseTiles()}>
          <ShowcaseLogo />
          <h2 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Explore {registry.length} patterns</h2>
          <p className="mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg">
            Every one a live demo, with the code and the spec behind it. Sorted by the {JOBS.length} jobs they do for
            your user.
          </p>
          <Link
            href="/patterns"
            className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Browse patterns
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-10 text-sm text-muted-foreground">Open source, MIT licensed, readable by your coding agent.</p>
        </Showcase>
      </Band>

      <Band>
        <AskVariant items={items} />
      </Band>

      <Band>
        <CompareVariant />
      </Band>

      <Band>
        <TabsVariant thumbnails={searchThumbs} />
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
        <StatsVariant patternCount={registry.length} jobCount={JOBS.length} />
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

// One horizontal band of the page: most blocks get the 5xl column, list-like
// ones the 3xl column, and the wall of demos the /patterns page's own width.
function Band({ narrow, wide, children }: { narrow?: boolean; wide?: boolean; children: ReactNode }) {
  const width = wide
    ? "max-w-[1480px] px-4 py-14 sm:px-5 sm:py-20"
    : narrow
      ? "max-w-3xl px-6 py-10 sm:py-14"
      : "max-w-5xl px-6 py-14 sm:py-20";
  return (
    <div className={`mx-auto w-full ${width}`}>
      {children}
    </div>
  );
}
