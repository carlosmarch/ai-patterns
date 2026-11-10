"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QualityCriterion {
  id: string;
  /** Short name shown on the chip: "Audience", "Format". */
  label: string;
  /** The tip shown while this is the next thing missing: "Say who it's for". */
  tip: string;
  /** Whether the prompt already covers this. Heuristics or a model's verdict. */
  test: (prompt: string) => boolean;
  /**
   * Text appended when the chip is clicked. Wrap the part to fill in with
   * square brackets — " for [audience]" — and it's selected after insertion.
   */
  insert?: string;
  /** Where `insert` goes. Defaults to the end; a missing task reads better first. */
  at?: "start" | "end";
}

export interface PromptQualityProps {
  value: string;
  onChange: (value: string) => void;
  criteria: QualityCriterion[];
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
  /** The meter appears once the prompt has this many characters. */
  minLength?: number;
  /** Labels from lowest to highest. The meter has one segment per label. */
  levels?: string[];
  className?: string;
}

const DEFAULT_LEVELS = ["Vague", "Basic", "Good", "Specific"];

export function PromptQuality({
  value,
  onChange,
  criteria,
  onSubmit,
  placeholder = "Describe what you need…",
  minLength = 4,
  levels = DEFAULT_LEVELS,
  className,
}: PromptQualityProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const meterId = React.useId();

  // Let the meter settle while typing fast, so chips don't flicker per keystroke.
  const settled = useDebounced(value, 350);

  const met = criteria.map((c) => c.test(settled));
  const score = met.filter(Boolean).length;
  // Segments fill in proportion to what's covered; the top one only when everything is.
  const filled =
    score === 0 ? 0 : score === criteria.length ? levels.length : Math.min(levels.length - 1, Math.ceil((score / criteria.length) * levels.length));
  const level = Math.max(0, filled - 1);
  const next = criteria.find((_, i) => !met[i]);
  const visible = settled.trim().length >= minLength;

  function add(criterion: QualityCriterion) {
    if (!criterion.insert) {
      textareaRef.current?.focus();
      return;
    }
    const insert = criterion.insert;
    let nextValue: string;
    let from: number;
    if (criterion.at === "start") {
      const rest = value.replace(/^\s+/, "");
      nextValue = insert + (rest ? " " + rest.charAt(0).toLowerCase() + rest.slice(1) : "");
      from = 0;
    } else {
      const base = value.replace(/\s+$/, "");
      nextValue = base + (/^[\s,.;:]/.test(insert) || !base ? "" : " ") + insert;
      from = base.length;
    }
    onChange(nextValue);
    // Select the bracketed part so typing replaces it.
    const open = nextValue.indexOf("[", from);
    const close = open >= 0 ? nextValue.indexOf("]", open) : -1;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      if (open >= 0 && close > open) el.setSelectionRange(open, close + 1);
      else el.setSelectionRange(nextValue.length, nextValue.length);
    });
  }

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)}>
      <div className="relative rounded-2xl bg-card focus-within:ring-foreground/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && onSubmit && value.trim()) {
              e.preventDefault();
              onSubmit(value);
            }
          }}
          placeholder={placeholder}
          aria-label="Prompt"
          aria-describedby={visible ? meterId : undefined}
          rows={3}
          className="block min-h-24 w-full resize-none bg-transparent px-4 pt-3 pb-12 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3">
          <div
            id={meterId}
            role="meter"
            aria-label="Prompt detail"
            aria-valuemin={0}
            aria-valuemax={criteria.length}
            aria-valuenow={visible ? score : 0}
            aria-valuetext={visible ? `${levels[level]}: ${score} of ${criteria.length} details` : "Not rated yet"}
            className={cn("flex items-center gap-2 transition-opacity", visible ? "opacity-100" : "opacity-0")}
          >
            <div className="flex gap-1" aria-hidden>
              {levels.map((_, i) => (
                <span key={i} className="relative h-1.5 w-6 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-foreground"
                    initial={false}
                    animate={{ scaleX: visible && i < filled ? 1 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                  />
                </span>
              ))}
            </div>
            <span className="text-xs font-medium tabular-nums" aria-hidden>
              {levels[level]}
            </span>
          </div>

          {onSubmit && (
            <button
              type="button"
              aria-label="Send"
              disabled={!value.trim()}
              onClick={() => onSubmit(value)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-2 px-1"
          >
            <ul className="flex flex-wrap gap-1.5" aria-label="Prompt details">
              {criteria.map((criterion, i) => (
                <li key={criterion.id}>
                  {met[i] ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                      <Check className="size-3" aria-hidden />
                      {criterion.label}
                      <span className="sr-only">, included</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => add(criterion)}
                      title={criterion.tip}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-solid hover:bg-accent hover:text-foreground"
                    >
                      <Plus className="size-3" aria-hidden />
                      {criterion.label}
                      <span className="sr-only">, missing — add it</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <p className="min-h-4 text-xs text-muted-foreground" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={next?.id ?? "done"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {next ? `Tip: ${next.tip}.` : "Specific enough to get a focused answer."}
                </motion.span>
              </AnimatePresence>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useDebounced<T>(value: T, ms: number) {
  const [settled, setSettled] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
}
