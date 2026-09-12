"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowUp, Square } from "lucide-react";

import { cn } from "@/lib/utils";

export type GenerationState = "idle" | "generating";

export interface StopGenerationButtonProps {
  state: GenerationState;
  /** Disables the idle/send state (e.g. empty input). Ignored while generating — stopping is never blocked. */
  disabled?: boolean;
  onSubmit?: () => void;
  onStop?: () => void;
  className?: string;
}

export function StopGenerationButton({
  state,
  disabled = false,
  onSubmit,
  onStop,
  className,
}: StopGenerationButtonProps) {
  const generating = state === "generating";

  return (
    <motion.button
      type="button"
      layout
      disabled={!generating && disabled}
      onClick={generating ? onStop : onSubmit}
      aria-label={generating ? "Stop generating" : "Send message"}
      whileTap={{ scale: 0.92 }}
      transition={{ layout: { duration: 0.18, ease: "easeOut" } }}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors disabled:bg-muted disabled:text-muted-foreground",
        className
      )}
    >
      <motion.span
        key={generating ? "stop" : "send"}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="flex items-center justify-center"
      >
        {generating ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-4" />}
      </motion.span>
    </motion.button>
  );
}
