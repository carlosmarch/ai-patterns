"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronRight, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export type PartialResponseReason = "interrupted" | "max-tokens" | "error";

export interface PartialResponseProps {
  content: string;
  reason?: PartialResponseReason;
  onResume?: () => void;
  onRetry?: () => void;
  resuming?: boolean;
  className?: string;
}

const reasonConfig: Record<PartialResponseReason, { label: string; hint: string; showResume: boolean }> = {
  interrupted: {
    label: "Stopped",
    hint: "Response was stopped before it finished.",
    showResume: true,
  },
  "max-tokens": {
    label: "Cut off",
    hint: "Response reached the output limit.",
    showResume: true,
  },
  error: {
    label: "Incomplete",
    hint: "Response stopped due to an error.",
    showResume: false,
  },
};

export function PartialResponse({
  content,
  reason = "interrupted",
  onResume,
  onRetry,
  resuming = false,
  className,
}: PartialResponseProps) {
  const config = reasonConfig[reason];

  return (
    <div className={cn("flex flex-col gap-0 rounded-2xl border border-border bg-muted/30 overflow-hidden", className)}>
      <div className="px-4 py-3 text-sm leading-relaxed text-foreground">
        {content}
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[1px] rounded-sm bg-foreground/40"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{config.label}</span>
          {" · "}
          {config.hint}
        </p>

        <div className="flex items-center gap-1.5">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Retry from scratch"
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="size-3" aria-hidden />
              Retry
            </button>
          )}
          {config.showResume && onResume && (
            <button
              type="button"
              onClick={onResume}
              disabled={resuming}
              aria-label={resuming ? "Resuming response" : "Continue response"}
              className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {resuming ? (
                "Continuing…"
              ) : (
                <>
                  Continue
                  <ChevronRight className="size-3" aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
