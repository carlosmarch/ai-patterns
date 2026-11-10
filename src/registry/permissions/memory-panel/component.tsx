"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, Check, Pencil, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Memory {
  id: string;
  text: string;
  /** Where it was learned, already formatted ("From a chat on 12 Oct"). */
  source?: string;
}

export interface MemoryPanelProps {
  memories: Memory[];
  /** Whether the AI may save and use memories at all. */
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onEdit?: (id: string, text: string) => void;
  /** Called once the undo window has passed, so the deletion can be committed. */
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  title?: string;
  /** How long a deleted memory can be restored, in ms. */
  undoMs?: number;
  className?: string;
}

export function MemoryPanel({
  memories,
  enabled,
  onEnabledChange,
  onEdit,
  onDelete,
  onClearAll,
  title = "Memory",
  undoMs = 5000,
  className,
}: MemoryPanelProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [pending, setPending] = React.useState<Memory | null>(null);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  const onDeleteRef = React.useRef(onDelete);
  const titleId = React.useId();

  React.useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const visible = memories.filter((m) => m.id !== pending?.id);

  function commitPending() {
    window.clearTimeout(timer.current);
    if (pending) onDeleteRef.current?.(pending.id);
  }

  function remove(memory: Memory) {
    // Deleting another memory commits the previous one first: one undo at a time.
    commitPending();
    setPending(memory);
    timer.current = window.setTimeout(() => {
      onDeleteRef.current?.(memory.id);
      setPending(null);
    }, undoMs);
  }

  function undo() {
    window.clearTimeout(timer.current);
    setPending(null);
  }

  function startEdit(memory: Memory) {
    setEditingId(memory.id);
    setDraft(memory.text);
  }

  function saveEdit() {
    const text = draft.trim();
    if (editingId && text) onEdit?.(editingId, text);
    setEditingId(null);
  }

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex w-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 dark:ring-white/10", className)}
    >
      <header className="flex items-start gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-sm font-semibold">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
            {enabled
              ? "Details the assistant remembers about you to personalise answers."
              : "Memory is off. Nothing new is saved, and saved memories aren't used."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Use memory"
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
            enabled ? "bg-foreground" : "bg-muted-foreground/30"
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn("size-4 rounded-full bg-background shadow-sm", enabled ? "ml-[18px]" : "ml-0.5")}
          />
        </button>
      </header>

      <ul className={cn("flex flex-col transition-opacity", !enabled && "opacity-50")} aria-label="Saved memories">
        <AnimatePresence initial={false}>
          {visible.map((memory) => (
            <motion.li
              key={memory.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="group overflow-hidden border-b last:border-b-0"
            >
              {editingId === memory.id ? (
                <form
                  className="flex flex-col gap-2 px-4 py-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit();
                  }}
                >
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingId(null);
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEdit();
                      }
                    }}
                    aria-label="Edit memory"
                    rows={2}
                    className="w-full resize-none rounded-xl px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-muted focus:bg-background"
                  />
                  <div className="flex justify-end gap-1.5">
                    <IconButton label="Cancel" onClick={() => setEditingId(null)}>
                      <X className="size-3.5" aria-hidden />
                    </IconButton>
                    <IconButton label="Save" type="submit" primary>
                      <Check className="size-3.5" aria-hidden />
                    </IconButton>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-pretty">{memory.text}</p>
                    {memory.source && <p className="mt-0.5 text-xs text-muted-foreground">{memory.source}</p>}
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100">
                    {onEdit && (
                      <IconButton label={`Edit memory: ${memory.text}`} onClick={() => startEdit(memory)}>
                        <Pencil className="size-3.5" aria-hidden />
                      </IconButton>
                    )}
                    <IconButton label={`Forget: ${memory.text}`} onClick={() => remove(memory)}>
                      <Trash2 className="size-3.5" aria-hidden />
                    </IconButton>
                  </div>
                </div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <li className="flex flex-col items-center gap-1 px-4 py-8 text-center">
            <Brain className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">Nothing remembered yet</p>
            <p className="text-xs text-muted-foreground">Ask the assistant to remember something, like your role or tone.</p>
          </li>
        )}
      </ul>

      <footer className="flex min-h-11 items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2">
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <motion.div
              key="undo"
              role="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <span className="truncate text-xs text-muted-foreground">Memory forgotten</span>
              <button type="button" onClick={undo} className="shrink-0 text-xs font-medium underline-offset-2 hover:underline">
                Undo
              </button>
            </motion.div>
          ) : (
            <motion.span
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              {visible.length} {visible.length === 1 ? "memory" : "memories"}
            </motion.span>
          )}
        </AnimatePresence>

        {onClearAll && visible.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirmClear) return setConfirmClear(true);
              setConfirmClear(false);
              commitPending();
              setPending(null);
              onClearAll();
            }}
            onBlur={() => setConfirmClear(false)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              confirmClear ? "bg-destructive text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {confirmClear ? "Click again to forget all" : "Forget all"}
          </button>
        )}
      </footer>
    </section>
  );
}

/** A one-line notice for the chat, shown when the assistant saves something new. */
export function MemoryUpdatedNotice({
  text,
  onManage,
  className,
}: {
  text: string;
  onManage?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="status"
      className={cn("inline-flex max-w-full items-center gap-2 rounded-full py-1 pr-1 pl-2.5 text-xs bg-muted", className)}
    >
      <Brain className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 truncate">
        <span className="text-muted-foreground">Memory updated · </span>
        {text}
      </span>
      {onManage && (
        <button
          type="button"
          onClick={onManage}
          className="shrink-0 rounded-full px-2 py-0.5 font-medium text-foreground transition-colors hover:bg-accent"
        >
          Manage
        </button>
      )}
    </motion.div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  type = "button",
  primary,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  primary?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      title={label.split(":")[0]}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors",
        primary ? "bg-foreground text-background hover:bg-foreground/90" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
