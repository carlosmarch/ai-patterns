"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Sparkles, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PromptEnhancerProps {
  value: string;
  onChange: (value: string) => void;
  /** Returns the rewritten prompt. Reject to keep the original. */
  onEnhance: (prompt: string) => Promise<string>;
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
  enhanceLabel?: string;
  /** Prompts shorter than this many characters can't be enhanced. */
  minLength?: number;
  className?: string;
}

type Phase = "idle" | "enhancing" | "review";

export function PromptEnhancer({
  value,
  onChange,
  onEnhance,
  onSubmit,
  placeholder = "Describe what you want…",
  enhanceLabel = "Enhance",
  minLength = 8,
  className,
}: PromptEnhancerProps) {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [original, setOriginal] = React.useState("");
  const [error, setError] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();

  const canEnhance = value.trim().length >= minLength && phase !== "enhancing";

  async function enhance() {
    if (!canEnhance) return;
    const before = value;
    setOriginal(before);
    setError(false);
    setPhase("enhancing");
    try {
      const next = await onEnhance(before);
      onChange(next);
      setPhase("review");
    } catch {
      setError(true);
      setPhase("idle");
    }
  }

  function undo() {
    onChange(original);
    setPhase("idle");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function keep() {
    setPhase("idle");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  const diff = phase === "review" ? diffWords(original, value) : null;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card transition-colors border",
          phase === "enhancing" && "border-foreground/30"
        )}
      >
        {phase === "enhancing" && !reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {diff ? (
          // Review: the rewritten prompt with additions highlighted. Clicking
          // into it, or "Keep", goes back to plain editing.
          <div
            role="textbox"
            aria-readonly="true"
            aria-label="Enhanced prompt"
            tabIndex={0}
            onClick={keep}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                keep();
              }
            }}
            className="min-h-24 cursor-text px-4 pt-3 pb-12 text-sm leading-relaxed whitespace-pre-wrap outline-none"
          >
            {diff.map((part, i) =>
              part.added ? (
                <motion.mark
                  key={i}
                  initial={reduceMotion ? false : { opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.6) }}
                  className="rounded-[3px] bg-foreground/10 px-px text-foreground"
                >
                  {part.text}
                </motion.mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setError(false);
              onChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && onSubmit && value.trim()) {
                e.preventDefault();
                onSubmit(value);
              }
            }}
            readOnly={phase === "enhancing"}
            aria-busy={phase === "enhancing"}
            placeholder={placeholder}
            aria-label="Prompt"
            rows={3}
            className="block min-h-24 w-full resize-none bg-transparent px-4 pt-3 pb-12 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
        )}

        <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={enhance}
            disabled={!canEnhance}
            title={value.trim().length < minLength ? "Write a few words first" : "Rewrite with more detail"}
            className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 border"
          >
            <motion.span
              animate={phase === "enhancing" && !reduceMotion ? { rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
              transition={phase === "enhancing" ? { duration: 0.9, repeat: Infinity } : { duration: 0.2 }}
              className="flex"
            >
              <Sparkles className="size-3.5" aria-hidden />
            </motion.span>
            {phase === "enhancing" ? "Enhancing…" : enhanceLabel}
          </button>

          {onSubmit && (
            <button
              type="button"
              aria-label="Send"
              disabled={!value.trim() || phase === "enhancing"}
              onClick={() => onSubmit(value)}
              className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div aria-live="polite" className="min-h-7">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs"
            >
              <span className="text-muted-foreground">Prompt enhanced — additions are highlighted.</span>
              <button
                type="button"
                onClick={undo}
                className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline"
              >
                <Undo2 className="size-3.5" aria-hidden />
                Undo
              </button>
              <button type="button" onClick={keep} className="font-medium text-foreground underline-offset-2 hover:underline">
                Keep editing
              </button>
            </motion.div>
          )}
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-1 text-xs text-destructive"
            >
              Couldn&apos;t enhance this prompt. Your text is unchanged.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Word-level diff (longest common subsequence) marking words that are new in `after`. */
function diffWords(before: string, after: string) {
  const a = before.split(/(\s+)/);
  const b = after.split(/(\s+)/);
  const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = norm(a[i]) === norm(b[j]) && a[i].trim() !== "" ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const parts: { text: string; added: boolean }[] = [];
  const push = (text: string, added: boolean) => {
    // Whitespace joins whichever run it sits in, so highlights read as phrases.
    const last = parts[parts.length - 1];
    if (last && (last.added === added || text.trim() === "")) last.text += text;
    else parts.push({ text, added });
  };
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && norm(a[i]) === norm(b[j]) && a[i].trim() !== "") {
      push(b[j], false);
      i++;
      j++;
    } else if (i < a.length && dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      push(b[j], b[j].trim() !== "");
      j++;
    }
  }
  return parts;
}
