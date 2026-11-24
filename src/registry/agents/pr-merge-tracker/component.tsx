"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleCheck, CircleDashed, CircleX, Eye, EyeOff, GitMerge, GitPullRequest, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type MergeConditionStatus = "pending" | "running" | "passed" | "failed";

export interface MergeCondition {
  id: string;
  /** What must be true before merging ("npm run build", "1 approving review"). */
  label: string;
  status: MergeConditionStatus;
  /** On failure: what broke, in one sentence. */
  detail?: string;
}

export type MergeTrackerStage = "watching" | "fixing" | "ready" | "merging" | "merged" | "stopped";

export interface PrMergeTrackerProps {
  /** Pull request number (267). */
  number: number;
  /** Pull request title ("Add PR Merge Tracker pattern"). */
  title: string;
  /** Head branch ("claude/kind-hawking-2v49zf"). */
  branch: string;
  /** Branch it merges into. */
  base?: string;
  /** Required checks and reviews, in the order the PR page lists them. */
  conditions: MergeCondition[];
  stage: MergeTrackerStage;
  /** One line on what the agent is doing right now ("Pushed a fix for the lint error"). */
  activity?: string;
  /** Merge automatically once every condition passes. */
  autoMerge: boolean;
  onAutoMergeChange: (value: boolean) => void;
  /** Merge now; only offered when ready and auto-merge is off. */
  onMerge?: () => void;
  /** Stop tracking the PR; the agent won't push or merge anything more. */
  onStop?: () => void;
  /** Resume tracking after a stop. */
  onResume?: () => void;
  className?: string;
}

const ICON = {
  pending: CircleDashed,
  running: LoaderCircle,
  passed: CircleCheck,
  failed: CircleX,
} as const;

const STATUS_TEXT = { pending: "Pending", running: "Running", passed: "Passed", failed: "Failed" } as const;

/**
 * An agent tracks the pull request it opened until it lands: required checks
 * and reviews tick over as they resolve, a failure turns into a pushed fix,
 * and the PR merges itself once everything is green — unless the person
 * turns auto-merge off or stops tracking.
 */
export function PrMergeTracker({
  number,
  title,
  branch,
  base = "main",
  conditions,
  stage,
  activity,
  autoMerge,
  onAutoMergeChange,
  onMerge,
  onStop,
  onResume,
  className,
}: PrMergeTrackerProps) {
  const reduce = useReducedMotion();
  const switchId = React.useId();
  const passed = conditions.filter((c) => c.status === "passed").length;
  const merged = stage === "merged";
  const stopped = stage === "stopped";
  const live = !merged && !stopped;

  const summary = merged
    ? `Merged into ${base}`
    : stopped
      ? "Not tracking · nothing more will be pushed or merged"
      : stage === "ready"
        ? autoMerge
          ? "All checks passed · merging"
          : "All checks passed · ready to merge"
        : `${passed} of ${conditions.length} passed${autoMerge ? " · merges when ready" : ""}`;

  return (
    <section
      aria-label={`Tracking pull request #${number}`}
      className={cn("flex w-full flex-col overflow-hidden rounded-2xl border bg-card", className)}
    >
      <header className="flex items-start gap-3 border-b px-4 py-3">
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
            merged ? "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "bg-muted text-muted-foreground",
          )}
        >
          {merged ? <GitMerge className="size-4" aria-hidden /> : <GitPullRequest className="size-4" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            <span className="text-muted-foreground">#{number}</span> {title}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {branch} → {base}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            merged
              ? "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400"
              : stopped
                ? "text-muted-foreground"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          )}
        >
          {merged ? "Merged" : stopped ? "Not tracking" : "Tracking"}
        </span>
      </header>

      <ul aria-label="Merge requirements" className={cn("flex flex-col py-1.5 transition-opacity", stopped && "opacity-60")}>
        {conditions.map((condition) => {
          const Icon = ICON[condition.status];
          return (
            <li key={condition.id} className="flex flex-col px-4 py-1.5">
              <div className="flex items-center gap-2.5">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={condition.status}
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex shrink-0"
                  >
                    <Icon
                      aria-hidden
                      className={cn(
                        "size-4",
                        condition.status === "passed" && "text-emerald-600 dark:text-emerald-400",
                        condition.status === "failed" && "text-red-600 dark:text-red-400",
                        condition.status === "running" && "animate-spin text-muted-foreground motion-reduce:animate-none",
                        condition.status === "pending" && "text-muted-foreground/50",
                      )}
                    />
                  </motion.span>
                </AnimatePresence>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{condition.label}</span>
                <span className="sr-only">{STATUS_TEXT[condition.status]}</span>
              </div>
              <AnimatePresence initial={false}>
                {condition.status === "failed" && condition.detail && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden pl-[26px] text-xs text-muted-foreground"
                  >
                    {condition.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="border-t px-4 py-2.5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${summary}|${activity ?? ""}`}
            initial={reduce ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              {(stage === "fixing" || stage === "merging") && (
                <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />
              )}
              {summary}
            </span>
            {activity && <span className="text-xs text-muted-foreground">{activity}</span>}
          </motion.p>
        </AnimatePresence>
      </div>

      {!merged && (
        <footer className="flex items-center gap-3 border-t px-4 py-2.5">
          <label htmlFor={switchId} className={cn("flex flex-1 items-center gap-2.5 text-xs", !live && "opacity-50")}>
            <button
              id={switchId}
              type="button"
              role="switch"
              aria-checked={autoMerge}
              disabled={!live || stage === "merging"}
              onClick={() => onAutoMergeChange(!autoMerge)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
                autoMerge ? "bg-foreground" : "bg-muted-foreground/30",
              )}
            >
              <motion.span
                layout
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
                className={cn("size-4 rounded-full border bg-background", autoMerge ? "ml-[18px]" : "ml-0.5")}
              />
            </button>
            <span className="text-foreground">Merge when ready</span>
          </label>

          {stage === "ready" && !autoMerge && onMerge && (
            <button
              type="button"
              onClick={onMerge}
              className="cursor-pointer rounded-full border border-foreground/30 bg-foreground px-3 py-1 text-xs font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Merge
            </button>
          )}

          {live && onStop && stage !== "merging" && (
            <button
              type="button"
              onClick={onStop}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EyeOff className="size-3.5" aria-hidden />
              Stop tracking
            </button>
          )}

          {stopped && onResume && (
            <button
              type="button"
              onClick={onResume}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye className="size-3.5" aria-hidden />
              Track again
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
