import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimatedOrigami } from "@/components/animated-origami";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { DosAndDonts } from "@/components/dos-and-donts";
import { NewBadge } from "@/components/new-badge";
import { SeenIn } from "@/components/seen-in";
import { readComponentSource } from "@/lib/agent";
import { PatternPager } from "@/components/pattern-pager";
import { RelatedPatterns } from "@/components/related-patterns";
import { getAdjacentEntries, getEntryHref, getRegistryEntry, getRelatedEntries, isNewEntry, registry } from "@/registry";
import { getJob } from "@/registry/jobs";

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);
  if (!entry) return {};
  const href = getEntryHref(entry);
  return {
    title: `${entry.title} — AI Patterns`,
    description: entry.description,
    alternates: {
      canonical: href,
      types: { "text/markdown": `${href}.md`, "application/json": `/api/patterns/${category}/${slug}` },
    },
    openGraph: {
      type: "article",
      siteName: "AI Patterns",
      title: entry.title,
      description: entry.description,
      url: href,
    },
  };
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);

  if (!entry) {
    notFound();
  }

  const source = await readComponentSource(entry);
  const Demo = entry.Demo;
  const job = getJob(entry.job);
  const { prev, next } = getAdjacentEntries(category, slug);
  const toLink = (e: typeof prev) => e && { href: getEntryHref(e), title: e.title, category: e.category };

  const spec = (
    <CodeBlock code={entry.uxDoc} lang="markdown" wrap trackAs="spec" download={`${entry.slug}.pattern.md`} />
  );

  // The catalogue is grouped by job, so the breadcrumb goes through the job (the
  // URL keeps the category: it's the pattern's permanent address).
  const categoryCrumb = job
    ? { label: job.label, href: `/patterns?job=${job.id}` }
    : { label: entry.category.charAt(0).toUpperCase() + entry.category.slice(1), href: `/patterns?category=${entry.category}` };

  const related = getRelatedEntries(entry);
  // The intro (title, description, job, "Seen in"), Do's and don'ts and Related
  // patterns, exactly as this page shows them. The expanded view's Context tab
  // reuses them, so the expanded view is this page's large-screen layout. The
  // card grids follow their own width (container queries), so they're two
  // columns here and in a wide panel, stacked in a narrow one.
  const intro = (level: "h1" | "h2") => <PatternIntro entry={entry} job={job} headingLevel={level} />;
  const context = (
    <div>
      {intro("h2")}
      <DosAndDonts entry={entry} headingId="context-dos-and-donts" />
      <RelatedPatterns items={related} headingId="context-related-patterns" />
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl py-16">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "AI Patterns home", href: "/", icon: <AnimatedOrigami className="size-4" /> },
          { label: "Patterns", href: "/patterns" },
          categoryCrumb,
          { label: entry.title },
        ]}
      />

      <div className="mb-8">{intro("h1")}</div>

      <ComponentPreview
        title={entry.title}
        category={categoryCrumb}
        prev={toLink(prev)}
        next={toLink(next)}
        preview={<Demo />}
        code={<CodeBlock code={source} trackAs="component" download={`${entry.slug}.tsx`} />}
        pattern={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A UX spec for this pattern — written for agents implementing or reusing it, not the code.
            </p>
            {spec}
          </div>
        }
        patternPanel={spec}
        context={context}
      />

      <DosAndDonts entry={entry} />

      <RelatedPatterns items={related} />

      <PatternPager prev={toLink(prev)} next={toLink(next)} />
    </main>
  );
}

/** Title, description, and the Job and "Seen in" row — the top of the pattern page and of the Context tab. */
function PatternIntro({
  entry,
  job,
  headingLevel,
}: {
  entry: NonNullable<ReturnType<typeof getRegistryEntry>>;
  job: ReturnType<typeof getJob>;
  headingLevel: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div className="space-y-2">
      <Heading className="flex flex-wrap items-center gap-x-3 gap-y-1 text-3xl font-semibold tracking-tight">
        {entry.title}
        {isNewEntry(entry) && <NewBadge className="px-2 py-1 text-xs" />}
      </Heading>
      <p className="text-muted-foreground">{entry.description}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
        {job && (
          <Link
            href={`/patterns?job=${job.id}`}
            title={job.description}
            className="inline-flex items-center gap-2.5 text-xs text-muted-foreground"
          >
            Job
            <span className="rounded-full border bg-background px-2.5 py-0.5 font-medium text-foreground transition-colors hover:bg-accent">
              {job.label}
            </span>
          </Link>
        )}
        <SeenIn items={entry.seenIn} linked />
      </div>
    </div>
  );
}
