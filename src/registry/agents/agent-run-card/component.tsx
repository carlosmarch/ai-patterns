"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Check,
  FileSearch,
  FlaskConical,
  GitBranch,
  PencilLine,
  SquareTerminal,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type RunStepKind = "read" | "edit" | "test" | "command" | "push";
export type RunStepStatus = "pending" | "running" | "done" | "failed";

export interface RunStep {
  id: string;
  kind: RunStepKind;
  /** Past-tense label shown once the step is finished, e.g. "Read checkout.ts". */
  label: string;
  /** Present-continuous label shown while the step runs, e.g. "Reading checkout.ts". */
  activeLabel?: string;
  /** A short result fact, e.g. "+12 −4", "24 passed", "1 failed". */
  detail?: string;
  status: RunStepStatus;
  /** How long the step took, once finished. */
  durationSeconds?: number;
}

export interface AgentRunCardProps {
  /** What the run is for, e.g. "Fix flaky checkout test". */
  title: string;
  steps: RunStep[];
  /** Total elapsed time of the run, ticked by the caller. */
  elapsedSeconds: number;
  /** Shown as the headline once every step is finished. */
  doneLabel?: string;
  /** How many finished steps to show before collapsing older ones. */
  maxVisible?: number;
  className?: string;
}

const KIND_ICON: Record<RunStepKind, LucideIcon> = {
  read: FileSearch,
  edit: PencilLine,
  test: FlaskConical,
  command: SquareTerminal,
  push: GitBranch,
};

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AgentRunCard({
  title,
  steps,
  elapsedSeconds,
  doneLabel = "Run complete",
  maxVisible = 4,
  className,
}: AgentRunCardProps) {
  const reduceMotion = useReducedMotion();
  const [showAll, setShowAll] = React.useState(false);

  const current = steps.find((s) => s.status === "running");
  const finished = steps.filter((s) => s.status === "done" || s.status === "failed");
  const complete = !current && steps.length > 0 && steps.every((s) => s.status !== "pending");

  // Newest first, so the list stacks up from the top as the agent works.
  const history = [...finished].reverse();
  const visible = showAll ? history : history.slice(0, maxVisible);
  const hidden = history.length - visible.length;

  const headline = current
    ? current.activeLabel ?? current.label
    : complete
      ? doneLabel
      : "Waiting to start";

  return (
    <section
      aria-label={`Agent run: ${title}`}
      className={cn("w-full overflow-hidden rounded-2xl border bg-card text-card-foreground", className)}
    >
      <div className="px-4 pb-3 pt-3.5">
        {/* Title + timer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RunGlyph complete={complete} running={Boolean(current)} />
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <span className="font-mono tabular-nums" aria-hidden>
            {formatTimer(elapsedSeconds)}
          </span>
          <span className="sr-only">Elapsed {formatTimer(elapsedSeconds)}</span>
        </div>

        {/* Current step — the only live region, so the ticking timer stays quiet */}
        <div className="relative mt-1.5 h-5 overflow-hidden" aria-live="polite" aria-atomic>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.p
              key={current?.id ?? (complete ? "done" : "idle")}
              initial={reduceMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="truncate text-sm font-medium leading-5"
            >
              {headline}
            </motion.p>
          </AnimatePresence>
        </div>

        <SegmentedProgress steps={steps} />
      </div>

      {/* Finished steps */}
      {history.length > 0 && (
        <div className="border-t px-2 py-1.5">
          <ol aria-label={`Finished steps, ${finished.length} of ${steps.length}`} className="flex flex-col">
            <AnimatePresence initial={false}>
              {visible.map((step) => (
                <motion.li
                  key={step.id}
                  layout={reduceMotion ? false : "position"}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="overflow-hidden"
                >
                  <StepRow step={step} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {history.length > maxVisible && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="mt-0.5 w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showAll ? "Show fewer" : `${hidden} earlier ${hidden === 1 ? "step" : "steps"}`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function StepRow({ step }: { step: RunStep }) {
  const Icon = KIND_ICON[step.kind];
  const failed = step.status === "failed";

  return (
    <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm">
      <span className="relative flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-1 flex size-2.5 items-center justify-center rounded-full ring-2 ring-card",
            failed ? "bg-destructive" : "bg-muted-foreground"
          )}
          aria-hidden
        >
          {failed ? (
            <X className="size-2 text-background" strokeWidth={4} />
          ) : (
            <Check className="size-2 text-background" strokeWidth={4} />
          )}
        </span>
      </span>
      <span className="sr-only">{failed ? "Failed: " : "Done: "}</span>
      <span className="min-w-0 flex-1 truncate text-foreground/80">{step.label}</span>
      {step.detail && (
        <span
          className={cn(
            "shrink-0 font-mono text-xs tabular-nums",
            failed ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {step.detail}
        </span>
      )}
      {step.durationSeconds !== undefined && (
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground/70">
          {step.durationSeconds < 60 ? `${step.durationSeconds}s` : formatTimer(step.durationSeconds)}
        </span>
      )}
    </div>
  );
}

function SegmentedProgress({ steps }: { steps: RunStep[] }) {
  const reduceMotion = useReducedMotion();
  const done = steps.filter((s) => s.status === "done" || s.status === "failed").length;

  return (
    <div
      role="progressbar"
      aria-label="Run progress"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${steps.length} steps finished`}
      className="mt-3 flex h-1.5 gap-1"
    >
      <AnimatePresence initial={false}>
        {steps.map((step) => (
          <motion.span
            key={step.id}
            layout={!reduceMotion}
            initial={{ opacity: 0, flexGrow: 0 }}
            animate={{ opacity: 1, flexGrow: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative h-full basis-0 overflow-hidden rounded-full bg-muted"
          >
            <motion.span
              className={cn(
                "absolute inset-0 origin-left rounded-full",
                step.status === "failed" ? "bg-destructive/80" : "bg-foreground/80"
              )}
              initial={false}
              animate={{ scaleX: step.status === "done" || step.status === "failed" ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
            {step.status === "running" &&
              (reduceMotion ? (
                <span className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-foreground/35" />
              ) : (
                <motion.span
                  className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-foreground/50 to-transparent"
                  initial={{ left: "-50%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                />
              ))}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RunGlyph({ running, complete }: { running: boolean; complete: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className="relative flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
      <AnimatePresence initial={false} mode="popLayout">
        {complete ? (
          <motion.span
            key="done"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex size-3.5 items-center justify-center rounded-full bg-foreground"
          >
            <Check className="size-2.5 text-background" strokeWidth={3.5} />
          </motion.span>
        ) : (
          <motion.svg
            key="spin"
            viewBox="0 0 16 16"
            fill="none"
            className="size-3.5 text-foreground"
            initial={{ opacity: 0 }}
            animate={running && !reduceMotion ? { opacity: 1, rotate: 360 } : { opacity: running ? 1 : 0.4 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={
              running && !reduceMotion
                ? { rotate: { duration: 0.9, ease: "linear", repeat: Infinity }, opacity: { duration: 0.2 } }
                : { duration: 0.2 }
            }
          >
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity={0.18} strokeWidth="2" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}
