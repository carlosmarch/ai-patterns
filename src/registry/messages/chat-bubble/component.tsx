"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant";
export type ChatFeedback = "up" | "down" | null;

export interface ChatBubbleProps {
  role: ChatRole;
  content: string;
  onEditSubmit?: (content: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (feedback: ChatFeedback) => void;
  /** 0-based index of the version currently shown. Omit (with versionCount) to hide the stepper. */
  versionIndex?: number;
  /** Total number of versions (edits/regenerations) available for this message. */
  versionCount?: number;
  onVersionChange?: (index: number) => void;
  className?: string;
}

export function ChatBubble({
  role,
  content,
  onEditSubmit,
  onRegenerate,
  onFeedback,
  versionIndex,
  versionCount,
  onVersionChange,
  className,
}: ChatBubbleProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(content);
  const [feedback, setFeedback] = React.useState<ChatFeedback>(null);
  const [copied, setCopied] = React.useState(false);
  const isUser = role === "user";
  const hasVersions = versionCount != null && versionCount > 1 && versionIndex != null && onVersionChange;

  function startEdit() {
    setDraft(content);
    setEditing(true);
  }

  function handleFeedback(next: ChatFeedback) {
    const value = feedback === next ? null : next;
    setFeedback(value);
    onFeedback?.(value);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === content) {
      setDraft(content);
      return;
    }
    onEditSubmit?.(trimmed);
  }

  function cancelEdit() {
    setDraft(content);
    setEditing(false);
  }

  return (
    <div className={cn("group flex flex-col gap-1.5", isUser ? "items-end" : "items-start", className)}>
      {editing ? (
        <div className="w-full max-w-md space-y-2">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              }
              if (e.key === "Escape") cancelEdit();
            }}
            rows={Math.min(6, Math.max(2, draft.split("\n").length))}
            className="w-full resize-none rounded-2xl border bg-background px-4 py-2.5 text-sm leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save & submit
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          {content}
        </div>
      )}

      {!editing && (
        <div
          className={cn(
            "flex items-center gap-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            (copied || feedback) && "opacity-100"
          )}
        >
          {isUser ? (
            <>
              {onRegenerate && (
                <IconButton label="Retry" onClick={onRegenerate}>
                  <RotateCcw className="size-3.5" />
                </IconButton>
              )}
              <IconButton label="Edit message" onClick={startEdit}>
                <Pencil className="size-3.5" />
              </IconButton>
              <IconButton label="Copy" onClick={handleCopy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </IconButton>
            </>
          ) : (
            <>
              <IconButton label="Copy" onClick={handleCopy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </IconButton>
              <IconButton label="Good response" active={feedback === "up"} onClick={() => handleFeedback("up")}>
                <ThumbsUp className="size-3.5" />
              </IconButton>
              <IconButton label="Bad response" active={feedback === "down"} onClick={() => handleFeedback("down")}>
                <ThumbsDown className="size-3.5" />
              </IconButton>
              <IconButton label="Regenerate" onClick={onRegenerate}>
                <RotateCcw className="size-3.5" />
              </IconButton>
            </>
          )}

          {hasVersions && (
            <VersionNav index={versionIndex} count={versionCount} onChange={onVersionChange} />
          )}
        </div>
      )}
    </div>
  );
}

function VersionNav({
  index,
  count,
  onChange,
}: {
  index: number;
  count: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="ml-0.5 flex items-center gap-0.5 border-l pl-1">
      <IconButton label="Previous version" onClick={() => onChange(index - 1)} disabled={index <= 0}>
        <ChevronLeft className="size-3.5" />
      </IconButton>
      <span className="min-w-[2.5ch] text-center text-xs tabular-nums text-muted-foreground">
        {index + 1}/{count}
      </span>
      <IconButton label="Next version" onClick={() => onChange(index + 1)} disabled={index >= count - 1}>
        <ChevronRight className="size-3.5" />
      </IconButton>
    </div>
  );
}

function IconButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}
