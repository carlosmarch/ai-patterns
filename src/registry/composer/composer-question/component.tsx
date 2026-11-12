"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ComposerQuestionOption {
  id: string;
  label: string;
}

export type ComposerQuestionAnswer =
  | { kind: "option"; id: string; label: string }
  | { kind: "text"; text: string }
  | { kind: "skip" };

export interface ComposerQuestionProps {
  /** The agent's question. `null` hides the card and leaves a plain composer. */
  question: string | null;
  options?: ComposerQuestionOption[];
  /** Label of the write-in row. Pass `false` to leave it out. */
  otherLabel?: string | false;
  /** Called once per question: a picked option, a written answer, or a skip. */
  onAnswer?: (answer: ComposerQuestionAnswer) => void;
  /** Called with a message typed in the composer while no question is open. */
  onSend?: (text: string) => void;
  /** Close (×): dismiss the question without answering. */
  onDismiss?: () => void;
  placeholder?: string;
  className?: string;
}

const spring = { type: "spring", stiffness: 480, damping: 40 } as const;

export function ComposerQuestion({
  question,
  options = [],
  otherLabel = "Something else",
  onAnswer,
  onSend,
  onDismiss,
  placeholder,
  className,
}: ComposerQuestionProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const hasOther = otherLabel !== false;
  const count = options.length + (hasOther ? 1 : 0);
  const otherIndex = hasOther ? options.length : -1;

  const [active, setActive] = React.useState(0);
  const [other, setOther] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);
  const otherRef = React.useRef<HTMLInputElement>(null);

  // A new question starts at the first option with empty fields.
  const [asked, setAsked] = React.useState(question);
  if (asked !== question) {
    setAsked(question);
    setActive(0);
    setOther("");
  }

  const open = question !== null;

  function answer(a: ComposerQuestionAnswer) {
    onAnswer?.(a);
  }

  function choose(index: number) {
    if (index === otherIndex) {
      setActive(index);
      otherRef.current?.focus();
      return;
    }
    const option = options[index];
    if (option) answer({ kind: "option", id: option.id, label: option.label });
  }

  function move(delta: number, from: "list" | "other") {
    const next = (active + delta + count) % count;
    setActive(next);
    if (next === otherIndex) otherRef.current?.focus();
    else if (from === "other") listRef.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    // Keys typed in the write-in field are handled by onOtherKey.
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      move(e.key === "ArrowDown" ? 1 : -1, "list");
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= count) {
      e.preventDefault();
      choose(Number(e.key) - 1);
    } else if (e.key === "Escape" && onDismiss) {
      e.preventDefault();
      onDismiss();
    }
  }

  function onOtherKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp" || (e.key === "ArrowDown" && !other)) {
      e.preventDefault();
      move(e.key === "ArrowDown" ? 1 : -1, "other");
    } else if (e.key === "Enter" && other.trim()) {
      e.preventDefault();
      answer({ kind: "text", text: other.trim() });
    } else if (e.key === "Escape" && onDismiss) {
      e.preventDefault();
      onDismiss();
    }
  }

  function submitDraft(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    // While a question is open, a typed reply answers it.
    if (open) answer({ kind: "text", text });
    else onSend?.(text);
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {open && (
          <motion.div
            key={question}
            layout
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={spring}
            className="rounded-2xl border bg-card"
          >
            <div className="flex items-start gap-3 px-4 pb-2 pt-3.5">
              <p id={`${id}-q`} className="flex-1 text-sm font-medium leading-snug">
                {question}
              </p>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Dismiss question"
                  className="-mr-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div
              ref={listRef}
              role="listbox"
              tabIndex={0}
              aria-labelledby={`${id}-q`}
              aria-activedescendant={`${id}-o${active}`}
              onKeyDown={onListKey}
              className="px-2 pb-2 focus-visible:outline-none [&:focus-visible_[data-active=true]]:ring-2 [&:focus-visible_[data-active=true]]:ring-ring"
            >
              {options.map((option, i) => (
                <Row
                  key={option.id}
                  id={`${id}-o${i}`}
                  n={i + 1}
                  active={active === i}
                  divider={i > 0}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                >
                  {option.label}
                </Row>
              ))}

              {hasOther && (
                <Row
                  id={`${id}-o${otherIndex}`}
                  n={otherIndex + 1}
                  active={active === otherIndex}
                  divider={options.length > 0}
                  icon={active === otherIndex}
                  onPointerEnter={() => setActive(otherIndex)}
                  onClick={() => choose(otherIndex)}
                  trailing={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        answer({ kind: "skip" });
                      }}
                      className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Skip
                    </button>
                  }
                >
                  <input
                    ref={otherRef}
                    value={other}
                    tabIndex={-1}
                    onChange={(e) => setOther(e.target.value)}
                    onKeyDown={onOtherKey}
                    onFocus={() => setActive(otherIndex)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={otherLabel || undefined}
                    aria-label={otherLabel || "Your answer"}
                    className="w-full cursor-text bg-transparent outline-none placeholder:text-foreground focus:placeholder:text-muted-foreground"
                  />
                </Row>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        layout
        transition={spring}
        onSubmit={submitDraft}
        className="flex items-center gap-2 rounded-2xl border bg-card py-1.5 pl-4 pr-1.5"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder ?? (open ? "Or reply directly…" : "Ask anything…")}
          aria-label={open ? "Reply to the question" : "Message"}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
      </motion.form>

      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden
            className="flex flex-wrap items-center gap-x-1.5 px-2 text-[11px] text-muted-foreground"
          >
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate <span aria-hidden>·</span> <Kbd>↵</Kbd> to select{" "}
            <span aria-hidden>·</span> or type below
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  id,
  n,
  active,
  divider,
  icon,
  trailing,
  children,
  onClick,
  onPointerEnter,
}: {
  id: string;
  n: number;
  active: boolean;
  divider: boolean;
  icon?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  onPointerEnter: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      data-active={active}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={cn(
        "relative flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors",
        active ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      {divider && !active && (
        <span aria-hidden className="pointer-events-none absolute inset-x-2 -top-px h-px bg-border" />
      )}
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md text-xs tabular-nums transition-colors",
          active ? "border bg-background text-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {icon ? <Pencil className="size-3" /> : n}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{children}</span>
      {trailing}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-background px-1 font-sans text-[10px]">
      {children}
    </kbd>
  );
}
