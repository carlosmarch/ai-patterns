import type { Metadata } from "next";

import { SITE_SHARE_IMAGE } from "@/lib/share";
import { getCatalogOrder, getEntryHref, isNewEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { GalleryGrid, type GalleryItem } from "./gallery-grid";

export const metadata: Metadata = {
  title: "Patterns — AI Patterns",
  description: "Every pattern in the catalogue as a live demo, filterable by the job it does for the user.",
  openGraph: { siteName: "AI Patterns", title: "Patterns — AI Patterns", description: "Every pattern in the catalogue as a live demo, filterable by the job it does for the user.", url: "/patterns", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/patterns.md", "text/plain": "/llms.txt" } },
};

// Every pattern's live demo on one masonry wall of rounded cards, in catalogue
// order (by job, clustered by category) and filterable by job — modelled on
// bencho.dev's block grid.
export default function PatternsIndexPage() {
  const items: GalleryItem[] = getCatalogOrder().map((entry) => ({
    id: `${entry.category}/${entry.slug}`,
    category: entry.category,
    slug: entry.slug,
    title: entry.title,
    job: entry.job,
    href: getEntryHref(entry),
    isNew: isNewEntry(entry),
    demo: <entry.Demo />,
  }));
  const filters = JOBS.map(({ id, label, question, description }) => ({ id, label, question, description }));

  return (
    // The patterns sidebar is beside this, from (catalog)/layout.tsx.
    <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-16 pb-24 sm:px-5">
      <GalleryGrid items={items} filters={filters} />
    </main>
  );
}
