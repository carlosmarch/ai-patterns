"use client";

import * as React from "react";
import { motion } from "motion/react";
import { AlertCircle, File, RotateCcw, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  /** 0-100. Ignored once status is "done" or "error". */
  progress: number;
  status: "uploading" | "done" | "error";
  previewUrl?: string;
}

export interface AttachmentTrayProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  onDropFiles?: (files: FileList) => void;
  className?: string;
}

export function AttachmentTray({
  attachments,
  onRemove,
  onRetry,
  onDropFiles,
  className,
}: AttachmentTrayProps) {
  const [dragging, setDragging] = React.useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) onDropFiles?.(e.dataTransfer.files);
      }}
      className={cn("relative rounded-2xl border p-3", className)}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-1 z-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-foreground/30 bg-background/90 text-sm text-muted-foreground">
          <Upload className="size-4" aria-hidden />
          Drop to attach
        </div>
      )}

      {attachments.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {attachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={onRemove}
              onRetry={onRetry}
            />
          ))}
        </ul>
      ) : (
        !dragging && (
          <p className="text-sm text-muted-foreground">Drag files here, or use the attach button.</p>
        )
      )}
    </div>
  );
}

function AttachmentChip({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: Attachment;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const { id, name, size, progress, status, previewUrl } = attachment;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;

  return (
    <li
      className={cn(
        "relative flex w-40 shrink-0 items-center gap-2 rounded-xl border bg-card p-2",
        status === "error" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div
        className="relative flex size-9 shrink-0 items-center justify-center"
        {...(status === "uploading"
          ? { role: "progressbar", "aria-valuenow": progress, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": `Uploading ${name}` }
          : {})}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="size-9 rounded-lg object-cover" />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <File className="size-4" aria-hidden />
          </span>
        )}
        {status === "uploading" && (
          <svg width={36} height={36} className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx={18} cy={18} r={radius} strokeWidth={2} className="stroke-background/70" fill="none" />
            <motion.circle
              cx={18}
              cy={18}
              r={radius}
              strokeWidth={2}
              strokeLinecap="round"
              className="stroke-foreground"
              fill="none"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
              transition={{ duration: 0.2 }}
            />
          </svg>
        )}
        {status === "error" && (
          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="size-4 text-destructive" aria-hidden />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{truncateMiddle(name)}</p>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {status === "error" ? (
            <button
              type="button"
              onClick={() => onRetry?.(id)}
              className="inline-flex items-center gap-1 text-destructive hover:underline"
            >
              <RotateCcw className="size-3" aria-hidden /> Retry
            </button>
          ) : (
            formatBytes(size)
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove?.(id)}
        aria-label={`Remove ${name}`}
        className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        <X className="size-2.5" aria-hidden />
      </button>
    </li>
  );
}

function truncateMiddle(name: string, max = 20) {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = max - ext.length - 1;
  if (keep <= 1) return `${name.slice(0, max - 1)}…`;
  return `${base.slice(0, Math.ceil(keep / 2))}…${base.slice(-Math.floor(keep / 2))}${ext}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
