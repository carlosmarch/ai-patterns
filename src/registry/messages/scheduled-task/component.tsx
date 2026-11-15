"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Check, Loader2, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

export type ScheduledTaskStatus = "scheduled" | "running" | "ran";

export interface ScheduledTaskProps {
  /** What the AI will do, as a short imperative ("Run the research scout"). */
  title: string;
  /** When it will run, in plain words ("Tomorrow, 9:00"). */
  when: string;
  /** Other times the user can pick from the edit menu. */
  whenOptions?: string[];
  status?: ScheduledTaskStatus;
  /** Label of the tag above the card. */
  label?: string;
  onWhenChange?: (when: string) => void;
  onRunNow?: () => void;
  className?: string;
}

export function ScheduledTask({
  title,
  when,
  whenOptions = [],
  status = "scheduled",
  label = "Scheduled task",
  onWhenChange,
  onRunNow,
  className,
}: ScheduledTaskProps) {
  const [editing, setEditing] = React.useState(false);
  const menuId = React.useId();
  const canEdit = status === "scheduled" && whenOptions.length > 0;

  const open = editing && canEdit;

  const subtitle = status === "running" ? "Running now…" : status === "ran" ? "Ran just now" : when;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex w-full max-w-sm flex-col items-start gap-2.5", className)}
    >
      <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        {label}
      </span>

      <div className="w-full rounded-2xl border bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={subtitle}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {status === "running" && <Loader2 className="size-3 animate-spin" aria-hidden />}
                {status === "ran" && <Check className="size-3" aria-hidden />}
                {subtitle}
              </motion.p>
            </AnimatePresence>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={`Change when “${title}” runs`}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-none"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={menuId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div role="radiogroup" aria-label="Run at" className="flex flex-wrap gap-1.5 border-t px-4 py-3">
                {[when, ...whenOptions.filter((o) => o !== when)].map((option) => {
                  const selected = option === when;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        onWhenChange?.(option);
                        setEditing(false);
                      }}
                      className={cn(
                        "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-foreground/30 bg-foreground text-background"
                          : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "scheduled" && onRunNow && (
        <button
          type="button"
          onClick={onRunNow}
          className="cursor-pointer rounded-full border bg-background px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Run now
        </button>
      )}
    </motion.div>
  );
}
