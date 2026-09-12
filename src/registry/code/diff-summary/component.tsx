"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight, Code2, Copy, Pin, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DiffFile {
  id: string;
  name: string;
  additions: number;
  deletions: number;
}

export interface DiffSummaryCardProps {
  files: DiffFile[];
  visibleCount?: number;
  timestamp?: string;
  onUndo?: () => void;
  onViewChanges?: () => void;
  className?: string;
}

export function DiffSummaryCard({
  files,
  visibleCount = 5,
  timestamp = "now",
  onUndo,
  onViewChanges,
  className,
}: DiffSummaryCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const primary = files.slice(0, visibleCount);
  const rest = files.slice(visibleCount);

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-xs font-medium">Edited {files.length} files</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onViewChanges}
            className="rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
          >
            View changes
          </button>
        </div>
      </div>

      <ul className="divide-y">
        {primary.map((file) => (
          <FileRow key={file.id} file={file} />
        ))}
      </ul>

      <AnimatePresence initial={false}>
        {expanded && rest.length > 0 && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="divide-y overflow-hidden border-t"
          >
            {rest.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-1.5 border-t px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? "Show less" : `Show ${rest.length} more`}
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </button>
      )}

      <div className="flex items-center justify-between border-t px-4 py-2.5">
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            aria-label="Copy"
            className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Pin"
            className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pin className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Read aloud"
            className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Volume2 className="size-3.5" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
    </div>
  );
}

function FileRow({ file }: { file: DiffFile }) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
      >
        <Code2 className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-xs">{file.name}</span>
        <span className="shrink-0 font-mono text-xs">
          <span className="text-emerald-600 dark:text-emerald-400">+{file.additions}</span>
          <span className="ml-1.5 text-red-600 dark:text-red-400">-{file.deletions}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}
