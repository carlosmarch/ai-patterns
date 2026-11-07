import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnimatedOrigami } from "@/components/animated-origami";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { SeenIn } from "@/components/seen-in";
import { readComponentSource } from "@/lib/agent";
import { PatternPager } from "@/components/pattern-pager";
import { getAdjacentEntries, getEntryHref, getRegistryEntry, registry } from "@/registry";

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
        <SeenIn items={entry.seenIn} linked className="pt-2" />
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

      <PatternPager prev={toLink(prev)} next={toLink(next)} />
    </main>
  );
}
