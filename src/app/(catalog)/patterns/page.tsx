import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SITE_SHARE_IMAGE } from "@/lib/share";
import { getCatalogOrder, getCategories, getEntriesByJob, newEntries, registry, type RegistryEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { JobFilter } from "@/components/job-filter";
import { PatternCard } from "@/components/pattern-card";

export const metadata: Metadata = {
  title: "Patterns — AI Patterns",
  description: "Every pattern in the catalogue, grouped by the job it does for the user and filterable by category.",
  openGraph: { siteName: "AI Patterns", title: "Patterns — AI Patterns", description: "Every pattern in the catalogue, grouped by the job it does for the user and filterable by category.", url: "/patterns", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/patterns.md", "text/plain": "/llms.txt" } },
};

const GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4";

// The catalogue grouped by job — the six questions — each section headed by its
// question, cards in catalogue order (clustered by category) and tagged with
// their category. data-job-section / data-category let JobFilter's category
// filter hide cards and emptied sections with CSS.
function JobSections({ entries }: { entries: RegistryEntry[] }) {
  return (
    <div className="space-y-14">
      {JOBS.map((job) => {
        const group = entries.filter((entry) => entry.job === job.id);
        if (group.length === 0) return null;
        return (
          <section key={job.id} id={job.id} data-job-section className="scroll-mt-20">
            <div className="mb-5 flex items-end justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{job.label}</h2>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  <span className="font-medium text-foreground">
                    “{/[?.!]$/.test(job.question) ? job.question : `${job.question}.`}”
                  </span>{" "}
                  {job.description}
                </p>
              </div>
              <span data-section-count className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {group.length} {group.length === 1 ? "pattern" : "patterns"}
              </span>
            </div>
            <ul className={GRID}>
              {group.map((entry) => (
                <li key={`${entry.category}/${entry.slug}`} data-category={entry.category}>
                  <PatternCard entry={entry} showCategory />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function countByCategory(entries: RegistryEntry[]) {
  const counts: Record<string, number> = {};
  for (const entry of entries) counts[entry.category] = (counts[entry.category] ?? 0) + 1;
  return counts;
}

export default function PatternsIndexPage() {
  const order = getCatalogOrder();
  const jobs = JOBS.map((job) => ({ ...job, count: getEntriesByJob(job.id).length }));
  const views: Record<string, ReactNode> = { all: <JobSections entries={order} /> };
  const counts: Record<string, Record<string, number>> = { all: countByCategory(order), new: countByCategory(newEntries) };
  for (const job of JOBS) {
    const entries = order.filter((entry) => entry.job === job.id);
    views[job.id] = <JobSections entries={entries} />;
    counts[job.id] = countByCategory(entries);
  }
  // `NEW_ID` in job-filter.tsx — a literal here, since values exported from a
  // client module aren't readable in a server component. Newest first, not by job.
  views.new = (
    <ul className={GRID}>
      {newEntries.map((entry) => (
        <li key={`${entry.category}/${entry.slug}`} data-category={entry.category}>
          <PatternCard entry={entry} showCategory />
        </li>
      ))}
    </ul>
  );

  return (
    // The patterns sidebar is beside this, from patterns/layout.tsx.
    <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-16 pb-24 sm:px-5">
      <JobFilter
        jobs={jobs}
        total={registry.length}
        newCount={newEntries.length}
        views={views}
        categories={getCategories()}
        counts={counts}
      />
    </main>
  );
}
