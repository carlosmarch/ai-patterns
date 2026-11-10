import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SITE_SHARE_IMAGE } from "@/lib/share";
import { getEntriesByJob, getSidebarGroups, newEntries, registry, type RegistryEntry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { JobFilter } from "@/components/job-filter";
import { PatternCard } from "@/components/pattern-card";
import { PatternsSidebar } from "@/components/patterns-sidebar";

export const metadata: Metadata = {
  title: "Patterns — AI Patterns",
  description: "Every pattern in the catalogue, grouped by category and filterable by the job it does for the user.",
  openGraph: { siteName: "AI Patterns", title: "Patterns — AI Patterns", description: "Every pattern in the catalogue, grouped by category and filterable by the job it does for the user.", url: "/patterns", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/patterns.md", "text/plain": "/llms.txt" } },
};

function PatternGroups({ entries }: { entries: RegistryEntry[] }) {
  const byCategory: Record<string, RegistryEntry[]> = {};
  for (const entry of entries) {
    (byCategory[entry.category] ??= []).push(entry);
  }

  return (
    <div className="space-y-10">
      {Object.entries(byCategory).map(([category, group]) => (
        <section key={category} id={category} className="scroll-mt-20">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-medium capitalize">{category}</h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {group.length} {group.length === 1 ? "pattern" : "patterns"}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
            {group.map((entry) => (
              <li key={entry.slug}>
                <PatternCard entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function PatternsIndexPage() {
  const jobs = JOBS.map((job) => ({ ...job, count: getEntriesByJob(job.id).length }));
  const views: Record<string, ReactNode> = { all: <PatternGroups entries={registry} /> };
  for (const job of JOBS) views[job.id] = <PatternGroups entries={getEntriesByJob(job.id)} />;
  // `NEW_ID` in job-filter.tsx — a literal here, since values exported from a
  // client module aren't readable in a server component.
  views.new = (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
      {newEntries.map((entry) => (
        <li key={`${entry.category}/${entry.slug}`}>
          <PatternCard entry={entry} />
        </li>
      ))}
    </ul>
  );

  return (
    // Same container as /gallery, so the shared header doesn't move when switching views.
    <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 pt-16 pb-24 sm:px-5">
      <JobFilter
        jobs={jobs}
        total={registry.length}
        newCount={newEntries.length}
        views={views}
        // Sticks a little below the site header; the first group lines up with the first card row.
        sidebar={<PatternsSidebar groups={getSidebarGroups()} className="top-20 h-[calc(100dvh-5rem)] pt-0 pb-10" />}
      />
    </main>
  );
}
