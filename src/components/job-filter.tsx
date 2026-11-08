"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** The non-job view of the most recently added patterns (`?job=new`). */
export const NEW_ID = "new";

export type JobFilterOption = { id: string; label: string; question: string; description: string; count: number };

// The pill row on /patterns that switches between the full catalogue and
// one job's patterns. Every view is rendered on the server and passed in,
// so this only picks one; the choice lives in ?job= so it can be linked
// (the site is a static export, so the param is read on the client).
export function JobFilter({
  jobs,
  total,
  newCount,
  views,
}: {
  jobs: JobFilterOption[];
  total: number;
  /** How many patterns carry the "New" tag (the `new` view). */
  newCount: number;
  /** One rendered view per job id, plus "all" and "new". */
  views: Record<string, React.ReactNode>;
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

  const current = jobs.find((j) => j.id === job);

  return (
    <div className="mt-8">
      <div role="group" aria-label="Filter patterns" className="-mx-1 flex flex-wrap gap-1.5 px-1">
        <Pill active={job === "all"} onClick={() => choose("all")} label="All" count={total} />
        {newCount > 0 && (
          <Pill
            active={job === NEW_ID}
            onClick={() => choose(NEW_ID)}
            label={
              <>
                <span aria-hidden className="size-1.5 rounded-full bg-blue-500" />
                New
              </>
            }
            count={newCount}
            title="The most recently added patterns"
          />
        )}
        {jobs.map((j) => (
          <Pill key={j.id} active={job === j.id} onClick={() => choose(j.id)} label={j.label} count={j.count} title={j.question} />
        ))}
      </div>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-pretty text-muted-foreground">
        {job === NEW_ID ? (
          `The ${newCount} latest patterns added to the catalogue, newest first.`
        ) : current ? (
          <>
            <span className="font-medium text-foreground">“{/[?.!]$/.test(current.question) ? current.question : `${current.question}.`}”</span> {current.description}
          </>
        ) : (
          "Filter by the job a pattern does for the user, across categories."
        )}
      </p>

      <div className="mt-8">{views[job] ?? views.all}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  label,
  count,
  title,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  count: number;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {label}
      <span className={cn("font-mono text-[10px] tabular-nums", active ? "text-background/70" : "text-muted-foreground/70")}>
        {count}
      </span>
    </button>
  );
}
