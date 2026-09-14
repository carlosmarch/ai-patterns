"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type AnalysisItemStatus = "pending" | "loading" | "done";

export interface AnalysisItem {
  id: string;
  /** Revealed once status is "done". Ignored (skeleton shown instead) otherwise. */
  imageUrl?: string;
  title?: string;
  info?: string;
  status: AnalysisItemStatus;
}

export interface AnalysisListProps {
  items: AnalysisItem[];
  /** Drives the indeterminate bar at top. Set to false once every item is done. */
  analyzing: boolean;
  className?: string;
}

export function AnalysisList({ items, analyzing, className }: AnalysisListProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card", className)}>
      <IndeterminateBar active={analyzing} />
      <ul aria-live="polite" className="divide-y divide-border/70">
        {items.map((item) => (
          <AnalysisRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function IndeterminateBar({ active }: { active: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label="Analyzing"
      aria-valuetext={active ? "In progress" : "Complete"}
      className="relative h-1 w-full shrink-0 overflow-hidden bg-muted"
    >
      <AnimatePresence>
        {active && (
          <motion.div
            key="sweep"
            className="absolute inset-y-0 w-1/3 rounded-full bg-foreground/70"
            initial={{ x: "-100%" }}
            animate={{ x: ["-100%", "300%"] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalysisRow({ item }: { item: AnalysisItem }) {
  const revealed = item.status === "done";
  const loading = item.status === "loading";

  return (
    <li
      aria-busy={loading}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-opacity duration-300",
        item.status === "pending" && "opacity-50"
      )}
    >
      <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
        {revealed && item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <Skeleton className="size-full" active={loading} />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        {revealed && item.title ? (
          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        ) : (
          <Skeleton className="h-3.5 w-2/3 rounded" active={loading} />
        )}
        {revealed && item.info ? (
          <p className="truncate text-xs text-muted-foreground">{item.info}</p>
        ) : (
          <Skeleton className="h-3 w-2/5 rounded" active={loading} />
        )}
      </div>

      <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
        {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        {revealed && <Check className="size-4 text-emerald-600 dark:text-emerald-400" />}
      </span>
    </li>
  );
}

function Skeleton({ className, active }: { className?: string; active: boolean }) {
  return (
    <span className={cn("block bg-muted-foreground/15", active && "animate-pulse", className)} />
  );
}
