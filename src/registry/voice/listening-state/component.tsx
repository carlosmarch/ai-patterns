"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Mic, Square } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ListeningStateProps {
  /** Whether the mic is actively capturing audio. Set false for a paused/muted variant with no ripple. */
  active?: boolean;
  label?: string;
  onStop?: () => void;
  className?: string;
}

export function ListeningState({
  active = true,
  label = "Listening…",
  onStop,
  className,
}: ListeningStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center rounded-full transition-colors",
          active ? "text-sky-500" : "text-muted-foreground"
        )}
      >
        {active && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-sky-500/20"
            animate={{ scale: [1, 1.4], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <Mic className="size-6" aria-hidden />
      </div>

      <div className="flex items-center gap-2">
        <span aria-live="polite" className="text-sm text-muted-foreground">
          {active ? label : "Paused"}
        </span>
        {onStop && (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop listening"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Square className="size-3" aria-hidden fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}
