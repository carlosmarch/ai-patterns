"use client";

import * as React from "react";

import { ALL_FILTER, CatalogHeader, NEW_FILTER } from "@/components/catalog-header";
import { setCatalogJob } from "@/components/catalog-filter-store";

/** The non-job view of the most recently added patterns (`?job=new`). */
export const NEW_ID = NEW_FILTER;

export type JobFilterOption = { id: string; label: string; question: string; description: string; count: number };

// The Details view of the catalogue (/patterns): the shared catalogue header,
// then the cards, grouped by job. Every job view is rendered on the server and
// passed in, so this only picks one; the category filter then hides the cards
// (and any job section left empty) of other categories with CSS, keyed off
// data-category. Both choices live in the URL (?job=, ?category=) so they can
// be linked and carried to the Gallery view — read on the client, since the
// site is a static export. Old /patterns#<category> links map to ?category=.
export function JobFilter({
  jobs,
  total,
  newCount,
  views,
  categories,
  counts,
}: {
  jobs: JobFilterOption[];
  total: number;
  /** How many patterns carry the "New" tag (the `new` view). */
  newCount: number;
  /** One rendered view per job id, plus "all" and "new". */
  views: Record<string, React.ReactNode>;
  /** Every category, in catalogue order. */
  categories: string[];
  /** Pattern counts per view id ("all", "new" and each job), then per category. */
  counts: Record<string, Record<string, number>>;
}) {
  const [job, setJob] = React.useState(ALL_FILTER);
  const [category, setCategory] = React.useState(ALL_FILTER);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("job");
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const cat = params.get("category") ?? (categories.includes(hash) ? hash : null);
    // Syncing from the URL after hydration; the server always renders "all".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && (fromUrl === NEW_ID || jobs.some((j) => j.id === fromUrl))) setJob(fromUrl);
    if (cat && categories.includes(cat)) {
      setCategory(cat);
      if (hash === cat) {
        const url = new URL(window.location.href);
        url.hash = "";
        url.searchParams.set("category", cat);
        window.history.replaceState(null, "", url);
      }
    }
  }, [jobs, categories]);

  // Tell the patterns sidebar which job is in play, so it can fold the others.
  React.useEffect(() => {
    setCatalogJob(job === ALL_FILTER || job === NEW_ID ? null : job);
  }, [job]);

  function writeUrl(nextJob: string, nextCategory: string) {
    const url = new URL(window.location.href);
    url.hash = "";
    if (nextJob === ALL_FILTER) url.searchParams.delete("job");
    else url.searchParams.set("job", nextJob);
    if (nextCategory === ALL_FILTER) url.searchParams.delete("category");
    else url.searchParams.set("category", nextCategory);
    window.history.replaceState(null, "", url);
  }

  function chooseJob(id: string) {
    setJob(id);
    writeUrl(id, category);
  }

  function chooseCategory(id: string) {
    setCategory(id);
    writeUrl(job, id);
  }

  const viewCounts = counts[job] ?? counts.all;
  const matches = category === ALL_FILTER ? 1 : (viewCounts[category] ?? 0);

  return (
    <>
      <CatalogHeader
        view="details"
        total={total}
        newCount={newCount}
        filters={jobs}
        active={job}
        onChoose={chooseJob}
        categories={categories.map((id) => ({ id, count: viewCounts[id] ?? 0 }))}
        category={category}
        onCategory={chooseCategory}
      />
      {category !== ALL_FILTER && (
        <style>{`[data-category-filter="${category}"] [data-category]:not([data-category="${category}"]),[data-category-filter="${category}"] [data-job-section]:not(:has([data-category="${category}"])),[data-category-filter] [data-section-count]{display:none}`}</style>
      )}
      {matches === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No <span className="capitalize">{category}</span> patterns for this job.{" "}
          <button type="button" onClick={() => chooseCategory(ALL_FILTER)} className="font-medium text-foreground underline underline-offset-4">
            Show every category
          </button>
        </p>
      ) : (
        <div data-category-filter={category === ALL_FILTER ? undefined : category}>{views[job] ?? views.all}</div>
      )}
    </>
  );
}
