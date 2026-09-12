"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Check, ChevronDown, CircleDot, Terminal, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface LogLine {
  id: string;
  text: string;
  level?: "default" | "info" | "warn" | "error" | "success";
}

export type TerminalStatus = "running" | "done" | "error";

export interface TerminalStreamProps {
  command: string;
  lines: LogLine[];
  status: TerminalStatus;
  defaultOpen?: boolean;
  className?: string;
}

const LEVEL_CLASS: Record<NonNullable<LogLine["level"]>, string> = {
  default: "text-neutral-300",
  info: "text-sky-400",
  warn: "text-amber-400",
  error: "text-red-400",
  success: "text-emerald-400",
};

export function TerminalStream({
  command,
  lines,
  status,
  defaultOpen = true,
  className,
}: TerminalStreamProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [pinnedToBottom, setPinnedToBottom] = React.useState(true);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !pinnedToBottom) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open, pinnedToBottom]);

  function handleScroll() {
    const el = bodyRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setPinnedToBottom(atBottom);
  }

  function jumpToLatest() {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setPinnedToBottom(true);
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-50",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm"
      >
        <Terminal className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-200">{command}</span>
        <StatusBadge status={status} />
        <span className="text-xs text-neutral-500">{lines.length}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-neutral-500 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative overflow-hidden"
          >
            <div
              ref={bodyRef}
              onScroll={handleScroll}
              role="log"
              aria-live={status === "running" ? "polite" : "off"}
              className="max-h-64 overflow-y-auto px-3.5 py-2.5 font-mono text-xs leading-relaxed"
            >
              {lines.map((line) => (
                <p key={line.id} className={LEVEL_CLASS[line.level ?? "default"]}>
                  {line.text}
                </p>
              ))}
              {status === "running" && <BlinkingCursor />}
            </div>

            {!pinnedToBottom && (
              <button
                type="button"
                onClick={jumpToLatest}
                className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 shadow-sm transition-colors hover:bg-neutral-700"
              >
                <ArrowDown className="size-3" aria-hidden /> Jump to latest
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: TerminalStatus }) {
  if (status === "running") {
    return <CircleDot className="size-3.5 shrink-0 animate-pulse text-amber-400" aria-label="Running" />;
  }
  if (status === "error") {
    return <X className="size-3.5 shrink-0 text-red-400" aria-label="Failed" />;
  }
  return <Check className="size-3.5 shrink-0 text-emerald-400" aria-label="Done" />;
}

function BlinkingCursor() {
  return (
    <motion.span
      aria-hidden
      className="inline-block h-3 w-[6px] translate-y-px bg-neutral-400"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
    />
  );
}
