"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
 * The catalogue's header: title, subtitle and the job filter pills.
 * The filter is owned by the page (kept in `?job=`).
 */
export function CatalogHeader({
  total,
  newCount,
  filters,
  active,
  onChoose,
}: {
  total: number;
  newCount: number;
  /** One per job; "All" and "New" are added here. */
  filters: CatalogFilter[];
  active: string;
  onChoose: (id: string) => void;
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

      <div className="mt-14 mb-5">
        <CatalogPills pills={pills} active={active} onChoose={onChoose} />
      </div>
    </header>
  );
}

/**
 * The filter pills, with each one's meaning in a tooltip. Shared by the
 * catalogue header and the home page's preview of the wall.
 */
export function CatalogPills({
  pills,
  active,
  onChoose,
  className,
}: {
  pills: CatalogFilter[];
  active: string;
  onChoose: (id: string) => void;
  className?: string;
}) {
  return (
    <div role="toolbar" aria-label="Filter patterns" className={cn("flex flex-wrap gap-2", className)}>
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
  );
}
