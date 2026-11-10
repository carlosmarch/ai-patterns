"use client";

import * as React from "react";

import { CatalogHeader, NEW_FILTER } from "@/components/catalog-header";

/** The non-job view of the most recently added patterns (`?job=new`). */
export const NEW_ID = NEW_FILTER;

export type JobFilterOption = { id: string; label: string; question: string; description: string; count: number };

// The Details view of the catalogue (/patterns): the shared catalogue header,
// then the patterns sidebar beside the cards. Every filtered view is rendered
// on the server and passed in, so this only picks one; the choice lives in
// ?job= so it can be linked and carried to the Gallery view (the site is a
// static export, so the param is read on the client).
export function JobFilter({
  jobs,
  total,
  newCount,
  views,
  sidebar,
}: {
  jobs: JobFilterOption[];
  total: number;
  /** How many patterns carry the "New" tag (the `new` view). */
  newCount: number;
  /** One rendered view per job id, plus "all" and "new". */
  views: Record<string, React.ReactNode>;
  /** The patterns sidebar, shown left of the cards. */
  sidebar?: React.ReactNode;
}) {
  const [job, setJob] = React.useState("all");

  React.useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("job");
    // Syncing from the URL after hydration; the server always renders "all".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && (fromUrl === NEW_ID || jobs.some((j) => j.id === fromUrl))) setJob(fromUrl);
  }, [jobs]);

  function choose(id: string) {
    setJob(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("job");
    else url.searchParams.set("job", id);
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <CatalogHeader
        view="details"
        total={total}
        newCount={newCount}
        filters={jobs}
        active={job}
        onChoose={choose}
      />
      <div className="flex gap-10">
        {sidebar}
        <div className="min-w-0 flex-1">{views[job] ?? views.all}</div>
      </div>
    </>
  );
}
