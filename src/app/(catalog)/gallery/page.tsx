import type { Metadata } from "next";

import { getCatalogOrder, getCategories, getEntryHref, isNewEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { GalleryGrid, type GalleryItem } from "./gallery-grid";

// A hidden page (not linked, not in the sitemap, disallowed in robots.ts):
// every pattern's live demo on a masonry wall of rounded cards, in one section
// per job and filterable by job and category — modelled on bencho.dev's block grid.
export const metadata: Metadata = {
  title: "Gallery — AI Patterns",
  description: "Every pattern's live demo on one wall.",
  robots: { index: false, follow: false },
};

export default function GalleryPage() {
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
    <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-16 pb-24 sm:px-5">
      {/* Title, filters and the view switch come from the shared CatalogHeader, inside the grid. */}
      <GalleryGrid items={items} filters={filters} categories={getCategories()} />
    </main>
  );
}
