import type { Metadata } from "next";

import { getEntryHref, isNewEntry, registry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { GalleryGrid, type GalleryItem } from "./gallery-grid";

// A hidden page (not linked, not in the sitemap, disallowed in robots.ts):
// every pattern's live demo in one big masonry wall of rounded cards, filterable
// by job — modelled on bencho.dev's block grid.
export const metadata: Metadata = {
  title: "Gallery — AI Patterns",
  description: "Every pattern's live demo on one wall.",
  robots: { index: false, follow: false },
};

export default function GalleryPage() {
  const items: GalleryItem[] = registry.map((entry) => ({
    id: `${entry.category}/${entry.slug}`,
    category: entry.category,
    slug: entry.slug,
    title: entry.title,
    job: entry.job,
    href: getEntryHref(entry),
    isNew: isNewEntry(entry),
    demo: <entry.Demo />,
  }));
  const filters = JOBS.map((job) => ({ id: job.id, label: job.label }));

  return (
    <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-16 pb-24 sm:px-5">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">AI Patterns</h1>
        <p className="mt-4 text-muted-foreground">
          {registry.length} interactive patterns for AI products. Play with any of them, then open it for the code and the
          guardrails.
        </p>
      </div>
      <GalleryGrid items={items} filters={filters} />
    </main>
  );
}
