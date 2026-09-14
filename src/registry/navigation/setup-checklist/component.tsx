"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type SetupStepStatus = "pending" | "done";

export interface AppIcon {
  label: string;
  /** Tailwind-compatible hex or CSS color string for the icon background. */
  color: string;
  initial: string;
}

export interface SetupStep {
  id: string;
  label: string;
  status: SetupStepStatus;
  /** Optional small app icons shown to the right of the label row. */
  icons?: AppIcon[];
  onClick?: () => void;
}

export interface SetupChecklistProps {
  title: string;
  steps: SetupStep[];
  className?: string;
}

export function SetupChecklist({ title, steps, className }: SetupChecklistProps) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;

  return (
    <div className={cn("rounded-2xl bg-muted/70 p-3", className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {doneCount}/{total}
          </span>
          <CircularProgress done={doneCount} total={total} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && <div className="mx-4 h-px bg-border/50" />}
            <SetupRow step={step} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function CircularProgress({ done, total }: { done: number; total: number }) {
  const size = 22;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : done / total;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={false}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-foreground"
      />
    </svg>
  );
}

function SetupRow({ step }: { step: SetupStep }) {
  const done = step.status === "done";

  return (
    <button
      type="button"
      onClick={done ? undefined : step.onClick}
      disabled={done}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
        !done && "cursor-pointer hover:bg-muted/50",
        done && "cursor-default"
      )}
    >
      <StepIcon status={step.status} />

      <span
        className={cn(
          "flex-1 text-xs font-medium",
          done ? "text-muted-foreground line-through decoration-muted-foreground/60" : "text-foreground"
        )}
      >
        {step.label}
      </span>

      {step.icons && step.icons.length > 0 && !done && (
        <div className="flex items-center gap-0.5" aria-hidden>
          {step.icons.map((icon) => (
            <span
              key={icon.label}
              title={icon.label}
              className="flex size-[18px] items-center justify-center rounded-md text-[9px] font-bold text-white"
              style={{ backgroundColor: icon.color }}
            >
              {icon.initial}
            </span>
          ))}
        </div>
      )}

      {!done && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
    </button>
  );
}

function StepIcon({ status }: { status: SetupStepStatus }) {
  if (status === "done") {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25"
        aria-label="Completed"
      >
        <Check className="size-3 text-muted-foreground" strokeWidth={2.5} aria-hidden />
      </motion.span>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-label="Pending"
      className="shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.8 2.2"
        strokeLinecap="round"
        className="text-muted-foreground/40"
      />
    </svg>
  );
}
