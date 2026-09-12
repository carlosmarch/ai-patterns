"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileCode2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DiffLine {
  type: "context" | "add" | "remove";
  content: string;
}

export interface DiffTabFile {
  id: string;
  name: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

export interface DiffTabsProps {
  files: DiffTabFile[];
  defaultFileId?: string;
  className?: string;
}

export function DiffTabs({ files, defaultFileId, className }: DiffTabsProps) {
  const [activeId, setActiveId] = React.useState(defaultFileId ?? files[0]?.id);
  const active = files.find((file) => file.id === activeId) ?? files[0];

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap items-center gap-2" role="tablist">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            role="tab"
            aria-selected={file.id === active.id}
            onClick={() => setActiveId(file.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              file.id === active.id
                ? "border-foreground/20 bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <span className="max-w-40 truncate">{file.name}</span>
            <DiffCounts additions={file.additions} deletions={file.deletions} />
          </button>
        ))}
      </div>

      <div className="mt-2 overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <FileCode2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex-1 truncate text-xs font-medium">{active.name}</span>
          <DiffCounts additions={active.additions} deletions={active.deletions} />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-x-auto"
          >
            <pre className="min-w-full font-mono text-xs leading-relaxed">
              {active.lines.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    "px-4 py-0.5",
                    line.type === "add" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    line.type === "remove" && "bg-red-500/10 text-red-700 dark:text-red-400"
                  )}
                >
                  <span aria-hidden className="mr-2 inline-block w-3 select-none text-muted-foreground">
                    {line.type === "add" ? "+" : line.type === "remove" ? "-" : ""}
                  </span>
                  {line.content}
                </div>
              ))}
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DiffCounts({ additions, deletions }: { additions: number; deletions: number }) {
  return (
    <span className="shrink-0 font-mono text-[11px]">
      <span className="text-emerald-600 dark:text-emerald-400">+{additions}</span>
      {deletions > 0 && <span className="ml-1 text-red-600 dark:text-red-400">-{deletions}</span>}
    </span>
  );
}
