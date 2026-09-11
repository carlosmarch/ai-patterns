"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TraceStep {
  label: string;
  meta?: string;
}

export interface ExpandableTraceProps {
  durationSeconds?: number;
  steps: TraceStep[];
  defaultOpen?: boolean;
  className?: string;
}

export function ExpandableTrace({
  durationSeconds = 4,
  steps,
  defaultOpen = false,
  className,
}: ExpandableTraceProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium"
      >
        <Sparkles className="size-4 text-muted-foreground" />
        <span>Thought for {durationSeconds} seconds</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Check className="size-2.5 text-muted-foreground" />
                    </span>
                    {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                  </div>
                  <p className="pb-3 text-sm text-foreground/90">
                    {step.label}
                    {step.meta && (
                      <span className="ml-1.5 text-muted-foreground">{step.meta}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
