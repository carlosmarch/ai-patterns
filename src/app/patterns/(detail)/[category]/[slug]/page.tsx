import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimatedOrigami } from "@/components/animated-origami";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { SeenIn } from "@/components/seen-in";
import { readComponentSource } from "@/lib/agent";
import { PatternPager } from "@/components/pattern-pager";
import { RelatedPatterns } from "@/components/related-patterns";
import { getAdjacentEntries, getEntryHref, getRegistryEntry, getRelatedEntries, registry } from "@/registry";
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

  const categoryCrumb = {
    label: entry.category.charAt(0).toUpperCase() + entry.category.slice(1),
    href: `/patterns#${entry.category}`,
  };

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

      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{entry.title}</h1>
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
      />

      <RelatedPatterns items={getRelatedEntries(entry)} />

      <PatternPager prev={toLink(prev)} next={toLink(next)} />
    </main>
  );
}
