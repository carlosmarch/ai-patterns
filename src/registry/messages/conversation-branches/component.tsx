"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Branch {
  id: string;
  prompt: string;
  /** Undefined while the reply for this branch is still being generated. */
  response?: React.ReactNode;
}

export interface ConversationBranchesProps {
  branches: Branch[];
  /** Index of the branch on screen. */
  active: number;
  onActiveChange: (index: number) => void;
  /** Called with the edited prompt; the host appends a new branch and makes it active. */
  onEdit: (prompt: string) => void;
  className?: string;
}

export function ConversationBranches({ branches, active, onActiveChange, onEdit, className }: ConversationBranchesProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [direction, setDirection] = React.useState(1);
  const reduceMotion = useReducedMotion();
  const branch = branches[active];
  const pending = branch?.response === undefined;

  function go(index: number) {
    if (index < 0 || index >= branches.length || index === active) return;
    setDirection(index > active ? 1 : -1);
    onActiveChange(index);
  }

  function startEdit() {
    setDraft(branch.prompt);
    setEditing(true);
  }

  function save() {
    const text = draft.trim();
    setEditing(false);
    if (!text || text === branch.prompt) return;
    setDirection(1);
    onEdit(text);
  }

  if (!branch) return null;

  const slide = reduceMotion ? 0 : 16;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {/* The user's turn: the part that branches. */}
      <div className="group flex flex-col items-end gap-1">
        {editing ? (
          <form
            className="flex w-full max-w-[85%] flex-col gap-2 rounded-2xl bg-card p-2 border"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  save();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              aria-label="Edit message"
              rows={2}
              className="w-full resize-none bg-transparent px-1.5 py-1 text-sm outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="px-1.5 text-[11px] text-muted-foreground">Sends as a new branch — the original is kept.</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                  Send
                </button>
              </div>
            </div>
          </form>
        ) : (
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, x: direction * slide }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * slide }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-sm text-pretty whitespace-pre-wrap"
            >
              {branch.prompt}
            </motion.div>
          </AnimatePresence>
        )}

        {!editing && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              onClick={startEdit}
              aria-label="Edit message"
              title="Edit message"
              className="flex size-7 items-center justify-center rounded-md transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
            {branches.length > 1 && (
              <nav aria-label="Message versions" className="flex items-center">
                <button
                  type="button"
                  onClick={() => go(active - 1)}
                  disabled={active === 0}
                  aria-label="Previous version"
                  className="flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <span className="min-w-8 text-center text-xs tabular-nums" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Version </span>
                  {active + 1}
                  <span aria-hidden> / </span>
                  <span className="sr-only"> of </span>
                  {branches.length}
                </span>
                <button
                  type="button"
                  onClick={() => go(active + 1)}
                  disabled={active === branches.length - 1}
                  aria-label="Next version"
                  className="flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* The assistant's reply follows whichever branch is active. */}
      <div className="relative min-h-16" aria-busy={pending}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, x: direction * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * slide }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-sm leading-relaxed text-pretty"
          >
            {pending ? <PendingLines /> : branch.response}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PendingLines() {
  return (
    <div className="flex flex-col gap-2 pt-1" aria-label="Generating reply">
      {[92, 78, 54].map((w, i) => (
        <motion.div
          key={w}
          className="h-3 rounded-full bg-muted"
          style={{ width: `${w}%` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
