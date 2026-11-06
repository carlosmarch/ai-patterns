import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { DownloadButton } from "@/components/download-button";
import { SeenIn } from "@/components/seen-in";
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

  const source = await fs.readFile(
    path.join(process.cwd(), "src/registry", category, slug, "component.tsx"),
    "utf-8"
  );
  const Demo = entry.Demo;
  const { prev, next } = getAdjacentEntries(category, slug);
  const toLink = (e: typeof prev) => e && { href: getEntryHref(e), title: e.title, category: e.category };

  return (
    <main className="mx-auto w-full max-w-3xl py-16">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Patterns", href: "/patterns" },
          { label: entry.category.charAt(0).toUpperCase() + entry.category.slice(1), href: `/patterns#${entry.category}` },
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
        prev={toLink(prev)}
        next={toLink(next)}
        preview={<Demo />}
        code={<CodeBlock code={source} trackAs="component" />}
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
            <CodeBlock code={entry.uxDoc} lang="markdown" wrap trackAs="spec" />
          </div>
        }
      />

      <PatternPager prev={toLink(prev)} next={toLink(next)} />
    </main>
  );
}
