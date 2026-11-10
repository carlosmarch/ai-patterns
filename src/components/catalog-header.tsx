"use client";

import { cn } from "@/lib/utils";
import { PatternsViewSwitch, type PatternsView } from "@/components/patterns-view-switch";

/** The non-job filter for the most recently added patterns (`?job=new`). */
export const NEW_FILTER = "new";
export const ALL_FILTER = "all";

export interface CatalogFilter {
  id: string;
  label: string;
  /** The job's question, e.g. "Can I believe it, and what does it keep?" */
  question?: string;
  description?: string;
}

/**
 * The header shared by both views of the catalogue — the live-demo gallery and
 * the detailed index — so switching between them only changes what's below:
 * title, subtitle, the job filter pills and the Gallery | Details switch.
 * The filter is owned by the page (both keep it in `?job=`).
 */
export function CatalogHeader({
  view,
  total,
  newCount,
  filters,
  active,
  onChoose,
}: {
  view: PatternsView;
  total: number;
  newCount: number;
  /** One per job; "All" and "New" are added here. */
  filters: CatalogFilter[];
  active: string;
  onChoose: (id: string) => void;
}) {
  const pills: CatalogFilter[] = [{ id: ALL_FILTER, label: "All" }, { id: NEW_FILTER, label: "New" }, ...filters];
  const current = filters.find((f) => f.id === active);

  return (
    <header>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">AI Patterns</h1>
        <p className="mt-4 text-muted-foreground">
          {total} interactive patterns for AI products. Play with any of them, then open it for the code and the
          guardrails.
        </p>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div role="toolbar" aria-label="Filter patterns" className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              aria-pressed={active === pill.id}
              title={pill.question}
              onClick={() => onChoose(pill.id)}
              className={cn(
                "h-9 rounded-full px-4 text-sm font-medium transition-colors",
                active === pill.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground/80 hover:bg-muted-foreground/15 hover:text-foreground",
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <PatternsViewSwitch current={view} />
      </div>

      {/* What the selected filter means; nothing for "All", so the header stays quiet by default. */}
      <p aria-live="polite" className="mt-3 mb-5 min-h-5 text-sm text-pretty text-muted-foreground">
        {active === NEW_FILTER ? (
          `The ${newCount} latest patterns added to the catalogue, newest first.`
        ) : current?.question ? (
          <>
            <span className="font-medium text-foreground">
              “{/[?.!]$/.test(current.question) ? current.question : `${current.question}.`}”
            </span>{" "}
            {current.description}
          </>
        ) : null}
      </p>
    </header>
  );
}
