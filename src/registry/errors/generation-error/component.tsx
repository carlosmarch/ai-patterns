"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, CircleAlert, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export type GenerationErrorReason = "network" | "server" | "timeout" | "filtered";

export interface GenerationErrorProps {
  reason?: GenerationErrorReason;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

const reasonConfig: Record<GenerationErrorReason, { title: string; hint: string; retryable: boolean }> = {
  network: {
    title: "Connection lost",
    hint: "Check your connection and try again.",
    retryable: true,
  },
  server: {
    title: "Something went wrong",
    hint: "The response couldn't be generated.",
    retryable: true,
  },
  timeout: {
    title: "Request timed out",
    hint: "The model took too long to respond.",
    retryable: true,
  },
  filtered: {
    title: "Response blocked",
    hint: "This request was blocked by content safety filters.",
    retryable: false,
  },
};

export function GenerationError({
  reason = "server",
  message,
  errorCode,
  onRetry,
  retrying = false,
  className,
}: GenerationErrorProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const config = reasonConfig[reason];

  return (
    <div
      role="alert"
      className={cn("flex flex-col gap-0 rounded-2xl border border-border bg-muted/30 overflow-hidden", className)}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-xs font-medium text-foreground">{config.title}</p>
          <p className="text-[11px] text-muted-foreground">{message ?? config.hint}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-4 py-2.5">
        {errorCode ? (
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={cn("size-3 transition-transform", detailsOpen && "rotate-180")}
              aria-hidden
            />
            Show details
          </button>
        ) : (
          <span />
        )}

        {config.retryable && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            aria-label={retrying ? "Retrying" : "Retry"}
            className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            <RotateCcw className={cn("size-3", retrying && "animate-spin")} aria-hidden />
            {retrying ? "Retrying…" : "Retry"}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen && errorCode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60"
          >
            <pre className="whitespace-pre-wrap break-all px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
              {errorCode}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
