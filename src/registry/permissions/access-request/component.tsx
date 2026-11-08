"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, LockKeyhole, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type AccessRequestDecision = "approve" | "deny";

export interface AccessChange {
  id: string;
  /** What changes, e.g. "Network access". */
  label: string;
  /** The current value. Omit when the change adds something new. */
  from?: string;
  /** The value after approval. */
  to: string;
  /** Marks a change that widens what the agent can reach. */
  widens?: boolean;
}

export interface AccessRequestProps {
  /** The question, e.g. "Update environment?". */
  title: string;
  /** The thing whose access changes. */
  target: { name: string; scope?: string };
  /** Who is asking — shown as the author of the reason. */
  requester: string;
  /** The agent's own words for why it needs the change. */
  reason: string;
  /** The exact change, rendered by the product, not paraphrased by the agent. */
  changes: AccessChange[];
  /** Who and what the change applies to beyond this moment. */
  impact: string;
  approveLabel?: string;
  denyLabel?: string;
  onDecision?: (decision: AccessRequestDecision) => void;
  className?: string;
}

export function AccessRequest({
  title,
  target,
  requester,
  reason,
  changes,
  impact,
  approveLabel = "Approve",
  denyLabel = "Deny",
  onDecision,
  className,
}: AccessRequestProps) {
  const [decision, setDecision] = React.useState<AccessRequestDecision | null>(null);
  const reduceMotion = useReducedMotion();
  const titleId = React.useId();

  function decide(next: AccessRequestDecision) {
    setDecision(next);
    onDecision?.(next);
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {decision ? (
          <motion.div
            key="resolved"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transition}
            role="status"
            className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                decision === "deny"
                  ? "bg-muted text-muted-foreground"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              )}
            >
              {decision === "deny" ? <X className="size-4" /> : <Check className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">
                {decision === "deny" ? "Request denied" : "Access updated"} · {target.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {decision === "deny"
                  ? `${requester} continues without it`
                  : changes.map((c) => `${c.label}: ${c.to}`).join(" · ")}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.section
            key="pending"
            role="alertdialog"
            aria-labelledby={titleId}
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={transition}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <header className="flex items-center gap-3 px-5 pt-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <LockKeyhole className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id={titleId} className="text-sm font-semibold">
                  {title}
                </h3>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">{target.name}</span>
                  {target.scope && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] font-medium">
                      {target.scope}
                    </span>
                  )}
                </p>
              </div>
            </header>

            <figure className="mx-5 mt-4 rounded-lg bg-muted px-3.5 py-2.5">
              <figcaption className="text-[11px] text-muted-foreground">{requester}&rsquo;s reason</figcaption>
              <blockquote className="mt-0.5 text-sm">{reason}</blockquote>
            </figure>

            <div className="mx-5 mt-4">
              <p className="text-xs font-medium text-muted-foreground">What changes</p>
              <table className="mt-1.5 w-full border-collapse text-sm">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Setting</th>
                    <th scope="col">Now</th>
                    <th scope="col">After approval</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change) => (
                    <tr key={change.id} className="border-t first:border-t-0">
                      <th scope="row" className="py-2 pr-4 text-left text-xs font-normal whitespace-nowrap text-muted-foreground">
                        {change.label}
                      </th>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">
                        {change.from ? (
                          <span className="line-through decoration-muted-foreground/50">{change.from}</span>
                        ) : (
                          <span aria-label="Not set">—</span>
                        )}
                      </td>
                      <td className="w-px py-2 pr-2" aria-hidden>
                        <ArrowRight className="size-3.5 text-muted-foreground" />
                      </td>
                      <td className="py-2">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <span className="font-medium">{change.to}</span>
                          {change.widens && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                              <TriangleAlert className="size-3" aria-hidden />
                              Widens access
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="mt-4 flex items-center gap-4 border-t bg-muted/40 px-5 py-3">
              <p className="min-w-0 flex-1 text-xs text-muted-foreground">{impact}</p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => decide("deny")}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {denyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => decide("approve")}
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {approveLabel}
                </button>
              </div>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
