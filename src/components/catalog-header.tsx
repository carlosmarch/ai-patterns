"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    {
      id: ALL_FILTER,
      label: "All",
      description: `Every pattern in the catalogue — ${total} of them.`,
    },
    {
      id: NEW_FILTER,
      label: "New",
      description: `The ${newCount} latest patterns added to the catalogue, newest first.`,
    },
    ...filters,
  ];

  return (
    <header>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AI Patterns
        </h1>
        <p className="mt-4 text-muted-foreground">
          {total} interactive patterns for AI products. Play with any of them,
          then open it for the code and the guardrails.
        </p>
      </div>

      <div className="mt-14 mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div
          role="toolbar"
          aria-label="Filter patterns"
          className="flex flex-wrap gap-2"
        >
          {pills.map((pill) => {
            // A selected filter (other than "All") shows an X: clicking it again clears back to "All".
            const clearable = active === pill.id && pill.id !== ALL_FILTER;
            return (
              // What each filter means, on hover or keyboard focus (Radix wires it up as the pill's description).
              <Tooltip key={pill.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={active === pill.id}
                    aria-label={
                      clearable
                        ? `${pill.label} (selected) — clear filter`
                        : undefined
                    }
                    onClick={() => onChoose(clearable ? ALL_FILTER : pill.id)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
                      clearable && "pr-3",
                      active === pill.id
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground/80 hover:bg-muted-foreground/15 hover:text-foreground",
                    )}
                  >
                    {pill.id === NEW_FILTER && (
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-blue-500"
                      />
                    )}
                    {pill.label}
                    {clearable && (
                      <X
                        aria-hidden
                        className="size-3.5 opacity-70"
                        strokeWidth={2.5}
                      />
                    )}
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
                      “
                      {/[?.!]$/.test(pill.question)
                        ? pill.question
                        : `${pill.question}.`}
                      ”
                    </p>
                  )}
                  {pill.description && (
                    <p
                      className={cn(
                        "text-muted-foreground",
                        pill.question && "mt-1",
                      )}
                    >
                      {pill.description}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </header>
  );
}
