"use client";

import { cn } from "@/lib/utils";
import { PatternsViewSwitch, type PatternsView } from "@/components/patterns-view-switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";

/** The non-job filter for the most recently added patterns (`?job=new`). */
export const NEW_FILTER = "new";
export const ALL_FILTER = "all";

export interface CatalogCategory {
  id: string;
  /** Patterns in this category within the current job filter. */
  count: number;
}

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
  categories,
  category,
  onCategory,
}: {
  view: PatternsView;
  total: number;
  newCount: number;
  /** One per job; "All" and "New" are added here. */
  filters: CatalogFilter[];
  active: string;
  onChoose: (id: string) => void;
  /** The category filter's options, with counts for the current job filter. */
  categories: CatalogCategory[];
  /** The selected category, or ALL_FILTER. */
  category: string;
  onCategory: (id: string) => void;
}) {
  const pills: CatalogFilter[] = [
    { id: ALL_FILTER, label: "All", description: `Every pattern in the catalogue — ${total} of them.` },
    { id: NEW_FILTER, label: "New", description: `The ${newCount} latest patterns added to the catalogue, newest first.` },
    ...filters,
  ];

  return (
    <header>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">AI Patterns</h1>
        <p className="mt-4 text-muted-foreground">
          {total} interactive patterns for AI products. Play with any of them, then open it for the code and the
          guardrails.
        </p>
      </div>

      <div className="mt-14 mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div role="toolbar" aria-label="Filter patterns" className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            // What each filter means, on hover or keyboard focus (Radix wires it up as the pill's description).
            <Tooltip key={pill.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-pressed={active === pill.id}
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
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                sideOffset={8}
                className="max-w-72 rounded-xl bg-popover px-3.5 py-3 text-left text-sm text-pretty text-popover-foreground ring-1 ring-black/5 dark:ring-white/10"
              >
                {pill.question && (
                  <p className="font-medium">
                    “{/[?.!]$/.test(pill.question) ? pill.question : `${pill.question}.`}”
                  </p>
                )}
                {pill.description && (
                  <p className={cn("text-muted-foreground", pill.question && "mt-1")}>{pill.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Category is a filter on top of the job, not a grouping: 22 of them don't fit as pills. */}
          <label className="relative">
            <span className="sr-only">Category</span>
            <select
              value={category}
              onChange={(e) => onCategory(e.target.value)}
              className={cn(
                "h-9 cursor-pointer appearance-none rounded-full border py-0 pr-8 pl-4 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                category === ALL_FILTER ? "bg-background text-foreground/80 hover:bg-muted" : "border-foreground bg-foreground text-background",
              )}
            >
              <option value={ALL_FILTER}>All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} disabled={c.count === 0 && c.id !== category}>
                  {c.id} ({c.count})
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2",
                category === ALL_FILTER ? "text-muted-foreground" : "text-background",
              )}
            />
          </label>
          <PatternsViewSwitch current={view} />
        </div>
      </div>
    </header>
  );
}
