"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronDown, Copy, ThumbsUp, ThumbsDown, X, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CodeLine {
  number: number;
  content: string;
  isError?: boolean;
}

export interface CodeFrame {
  file: string;
  lines: CodeLine[];
}

export interface StackFrame {
  name: string;
  context?: string;
  file?: string;
}

export interface ConsoleErrorCardProps {
  type?: "error" | "warning";
  message: string;
  frame?: CodeFrame;
  stack?: StackFrame[];
  current?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  onCopy?: () => void;
  onOpenFrame?: (file: string) => void;
  onHelpful?: (value: boolean) => void;
  className?: string;
}

export function ConsoleErrorCard({
  type = "error",
  message,
  frame,
  stack = [],
  current = 1,
  total = 1,
  onPrev,
  onNext,
  onClose,
  onCopy,
  onOpenFrame,
  onHelpful,
  className,
}: ConsoleErrorCardProps) {
  const [stackOpen, setStackOpen] = React.useState(false);
  const [helpfulVote, setHelpfulVote] = React.useState<boolean | null>(null);
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleHelpful(value: boolean) {
    setHelpfulVote(value);
    onHelpful?.(value);
  }

  const isError = type === "error";

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground",
        className
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={onPrev}
                disabled={current <= 1}
                aria-label="Previous error"
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {current}/{total}
              </span>
              <button
                type="button"
                onClick={onNext}
                disabled={current >= total}
                aria-label="Next error"
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </>
          )}
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              isError
                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
            )}
          >
            Console {isError ? "Error" : "Warning"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onCopy && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy error"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="size-4 text-emerald-500"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Copy className="size-4" aria-hidden />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      <div className="px-4 py-3">
        <p
          className={cn(
            "text-sm leading-relaxed",
            isError ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {message}
        </p>
      </div>

      {/* Code frame */}
      {frame && (
        <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-border bg-muted/40">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">{frame.file}</span>
            {onOpenFrame && (
              <button
                type="button"
                onClick={() => onOpenFrame(frame.file)}
                aria-label="Open in editor"
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
          <div className="overflow-x-auto p-2 font-mono text-xs leading-6">
            {frame.lines.map((line) => (
              <div
                key={line.number}
                className={cn(
                  "flex gap-3 rounded px-1",
                  line.isError
                    ? "bg-red-50 dark:bg-red-950/40"
                    : ""
                )}
              >
                <span
                  className={cn(
                    "w-6 shrink-0 select-none text-right tabular-nums",
                    line.isError
                      ? "text-red-400 dark:text-red-500"
                      : "text-muted-foreground/50"
                  )}
                >
                  {line.isError ? ">" : ""}{line.number}
                </span>
                <span className="whitespace-pre text-muted-foreground">
                  <CodeContent content={line.content} isError={line.isError} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call stack */}
      {stack.length > 0 && (
        <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setStackOpen((v) => !v)}
            aria-expanded={stackOpen}
            className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Call Stack</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                {stack.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                stackOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>

          <AnimatePresence initial={false}>
            {stackOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border"
              >
                <div className="divide-y divide-border">
                  {stack.map((frame, i) => (
                    <div key={i} className="px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{frame.name}</p>
                      {frame.context && (
                        <p className="text-xs text-muted-foreground">{frame.context}</p>
                      )}
                      {frame.file && (
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/70">{frame.file}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      {onHelpful && (
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <button
            type="button"
            onClick={() => handleHelpful(true)}
            aria-label="Yes, helpful"
            aria-pressed={helpfulVote === true}
            className={cn(
              "rounded-md p-1 transition-colors",
              helpfulVote === true
                ? "text-emerald-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsUp className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => handleHelpful(false)}
            aria-label="Not helpful"
            aria-pressed={helpfulVote === false}
            className={cn(
              "rounded-md p-1 transition-colors",
              helpfulVote === false
                ? "text-red-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ThumbsDown className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

function CodeContent({ content, isError }: { content: string; isError?: boolean }) {
  return (
    <span className={isError ? "text-foreground" : undefined}>
      {content}
    </span>
  );
}
