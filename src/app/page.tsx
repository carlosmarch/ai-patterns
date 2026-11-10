import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, Sparkles } from "lucide-react";

import { getCatalogOrder, getEntryHref, isNewEntry, newEntries as latestEntries, registry, type RegistryEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import type { WallItem } from "@/components/demo-wall";
import { GithubMark } from "@/components/github-mark";
import { IntroHero, type HeroEntry } from "./intro-hero/intro-hero";
import { HomeConnect } from "./home-connect";
import { HomeWall, type HomeWallFilter } from "./home-wall";
import { AskVariant, StatsVariant, TabsVariant, TerminalVariant, type SectionItem } from "./sections/variants";
import { CompareVariant, ComparisonVariant } from "./sections/variants-more";

// The home page, assembled from the blocks explored on /sections. The story
// runs pitch → the catalogue itself (a slice of the /patterns wall, by job) →
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

const wallId = (entry: RegistryEntry) => `${entry.category}/${entry.slug}`;

/**
 * Catalogue order clusters a job's patterns by category; for a short preview,
 * take one from each category in turn so the first cards show its range.
 */
function roundRobinByCategory(entries: RegistryEntry[]) {
  const groups = new Map<string, RegistryEntry[]>();
  for (const entry of entries) groups.set(entry.category, [...(groups.get(entry.category) ?? []), entry]);
  const queues = [...groups.values()];
  const out: RegistryEntry[] = [];
  while (queues.some((q) => q.length > 0)) for (const q of queues) if (q.length > 0) out.push(q.shift()!);
  return out;
}

/** The home wall's filters: the newest patterns first, then one per job. */
function wallFilters(): { items: WallItem[]; filters: HomeWallFilter[] } {
  const catalog = getCatalogOrder();
  const PREVIEW = 6;
  const used = new Map<string, RegistryEntry>();
  const take = (entries: RegistryEntry[]) =>
    entries
      .filter((e) => !HIDDEN.has(e.slug))
      .slice(0, PREVIEW)
      .map((e) => {
        used.set(wallId(e), e);
        return wallId(e);
      });

  const filters: HomeWallFilter[] = [
    {
      id: "new",
      label: "New",
      description: `The ${latestEntries.length} latest additions to the catalogue, newest first.`,
      itemIds: take(latestEntries),
      total: latestEntries.length,
      href: "/patterns?job=new",
      noun: "new patterns",
    },
    ...JOBS.map((job) => {
      const entries = catalog.filter((e) => e.job === job.id);
      return {
        id: job.id,
        label: job.label,
        question: job.question,
        description: job.description,
        itemIds: take(roundRobinByCategory(entries)),
        total: entries.length,
        href: `/patterns?job=${job.id}`,
        noun: `${job.label} patterns`,
      };
    }),
  ];

  const items: WallItem[] = [...used.values()].map((entry) => ({
    id: wallId(entry),
    category: entry.category,
    slug: entry.slug,
    title: entry.title,
    job: entry.job,
    href: getEntryHref(entry),
    isNew: isNewEntry(entry),
    demo: <entry.Demo />,
  }));
  return { items, filters };
}

export default function Home() {
  const visible = registry.filter((e) => !HIDDEN.has(e.slug));
  const heroEntries = visible.map(toHeroEntry);
  const newEntries = latestEntries.filter((e) => !HIDDEN.has(e.slug));
  const wall = wallFilters();
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
        <HomeWall items={wall.items} filters={wall.filters} />
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
