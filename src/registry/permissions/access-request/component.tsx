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
            className="overflow-hidden rounded-3xl border bg-card p-5"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
                <LockKeyhole className="size-5" />
              </span>
              <h3 id={titleId} className="text-base font-semibold">
                {title}
              </h3>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{target.name}</p>
              {target.scope && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {target.scope}
                </span>
              )}
            </div>

            <figure className="mt-3 rounded-xl bg-muted px-3.5 py-2.5">
              <figcaption className="text-[11px] text-muted-foreground">{requester}&rsquo;s reason</figcaption>
              <blockquote className="mt-0.5 text-sm">{reason}</blockquote>
            </figure>

            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">What changes</p>
              <ul className="mt-1.5 divide-y overflow-hidden rounded-xl border">
                {changes.map((change) => (
                  <li key={change.id} className="px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{change.label}</span>
                      {change.widens && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          <TriangleAlert className="size-3" aria-hidden />
                          Widens access
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                      {change.from && (
                        <>
                          <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                            <span className="sr-only">from </span>
                            {change.from}
                          </span>
                          <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                        </>
                      )}
                      <span className="font-medium">
                        <span className="sr-only">{change.from ? "to " : "add "}</span>
                        {change.to}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">{impact}</p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => decide("approve")}
                className="w-full rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {approveLabel}
              </button>
              <button
                type="button"
                onClick={() => decide("deny")}
                className="w-full rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                {denyLabel}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
