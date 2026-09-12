"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Check, Code2, FileText, Globe, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS = {
  search: Search,
  file: FileText,
  code: Code2,
  network: Globe,
} as const;

export type ToolCallKind = keyof typeof ICONS;
export type ToolCallStatus = "running" | "success" | "error";

export interface ToolCallChipProps {
  kind?: ToolCallKind;
  verb: string;
  target: string;
  status: ToolCallStatus;
  /** Replaces the verb + target label once status is "success" or "error". */
  result?: string;
  className?: string;
}

export function ToolCallChip({
  kind = "search",
  verb,
  target,
  status,
  result,
  className,
}: ToolCallChipProps) {
  const Icon = ICONS[kind];

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm",
        className
      )}
    >
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span aria-live="polite" className="min-w-0 flex-1 truncate">
        {status === "running" ? (
          <>
            {verb} <span className="text-muted-foreground">&quot;{target}&quot;</span>
          </>
        ) : (
          (result ?? `${verb} "${target}"`)
        )}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="shrink-0"
        >
          {status === "running" && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
          )}
          {status === "success" && (
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          )}
          {status === "error" && <AlertCircle className="size-3.5 text-destructive" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
