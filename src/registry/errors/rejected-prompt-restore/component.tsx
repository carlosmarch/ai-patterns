"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, CircleSlash, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PromptRejection {
  /** Why the agent didn't start, in one sentence ("It can't edit files outside this project."). */
  reason: string;
  /** What would work instead, if the agent said ("Ask about files in /web instead."). */
  suggestion?: string;
  /** The exact text that was rejected, so edits can be compared against it. */
  prompt: string;
}

export interface RejectedPromptComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  /** Set when the agent rejected the last prompt; the composer already holds its text. */
  rejection?: PromptRejection | null;
  onDismissRejection: () => void;
  /** The agent is deciding whether to start. */
  sending?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * A composer that gets the person's words back when an agent rejects the
 * first prompt of a session. Nothing is left behind as a failed session:
 * the text returns to the input, the agent's reason sits right above it,
 * and editing and resending is the obvious next step.
 */
export function RejectedPromptComposer({
  value,
  onChange,
  onSend,
  rejection,
  onDismissRejection,
  sending = false,
  placeholder = "Describe a task…",
  className,
}: RejectedPromptComposerProps) {
  const reduce = useReducedMotion();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const reasonId = React.useId();
  const edited = rejection ? value.trim() !== rejection.prompt.trim() : false;

  // When a rejection lands, put the cursor back at the end of the restored text.
  React.useEffect(() => {
    if (!rejection) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [rejection]);

  function send() {
    if (!value.trim() || sending) return;
    onSend(value);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence initial={false}>
        {rejection && (
          <motion.div
            key="rejection"
            role="alert"
            id={reasonId}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-start gap-2.5 rounded-xl border bg-muted/40 px-3 py-2.5"
          >
            <CircleSlash className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-xs font-medium">The agent didn&apos;t start this task</p>
              <p className="text-xs text-muted-foreground">{rejection.reason}</p>
              {rejection.suggestion && <p className="text-xs text-muted-foreground">{rejection.suggestion}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {edited ? "Edited — send when ready." : "Your prompt is back in the box below. Edit it and send again."}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismissRejection}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
              <span className="sr-only">Dismiss</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl bg-card px-3 py-2 transition-colors border",
          rejection && !edited && "border-foreground/30"
        )}
      >
        <textarea
          ref={inputRef}
          value={value}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          aria-label="Task for the agent"
          aria-describedby={rejection ? reasonId : undefined}
          className="min-w-0 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          disabled={!value.trim() || sending}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="size-4" aria-hidden />
          <span className="sr-only">{rejection ? "Send again" : "Send"}</span>
        </button>
      </div>
    </div>
  );
}
