"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  /** The question for this step: "Who is it for?" */
  question: string;
  hint?: string;
  /** Turns the step into a single choice. Without it, the step is free text. */
  options?: string[];
  placeholder?: string;
  optional?: boolean;
  /** Pre-filled answer. */
  value?: string;
}

export type WizardAnswers = Record<string, string>;

export interface PromptWizardProps {
  title?: string;
  steps: WizardStep[];
  /** Assembles the prompt from the answers so far; also drives the live preview. */
  build: (answers: WizardAnswers) => string;
  onSubmit: (prompt: string, answers: WizardAnswers) => void;
  submitLabel?: string;
  className?: string;
}

export function PromptWizard({ title, steps, build, onSubmit, submitLabel = "Generate", className }: PromptWizardProps) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [answers, setAnswers] = React.useState<WizardAnswers>(() =>
    Object.fromEntries(steps.map((s) => [s.id, s.value ?? ""]))
  );
  // The reviewed prompt, once the person edits it by hand; null means "follow the answers".
  const [edited, setEdited] = React.useState<string | null>(null);
  const advanceTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduceMotion = useReducedMotion();
  const uid = React.useId();

  const reviewing = index === steps.length;
  const step = steps[index];
  const answer = step ? (answers[step.id] ?? "").trim() : "";
  const canContinue = reviewing || step.optional || answer.length > 0;
  const prompt = edited ?? build(answers);

  React.useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // Move focus into each new step as it mounts, so keyboard and
  // screen-reader users land on it — but only after a navigation, never on
  // first render.
  const pendingFocus = React.useRef(false);
  const focusStep = React.useCallback((node: HTMLDivElement | null) => {
    if (!node || !pendingFocus.current) return;
    pendingFocus.current = false;
    node.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, []);

  function go(next: number) {
    clearTimeout(advanceTimer.current);
    pendingFocus.current = true;
    setDirection(next > index ? 1 : -1);
    setIndex(Math.max(0, Math.min(steps.length, next)));
  }

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setEdited(null);
  }

  function next() {
    if (!canContinue) return;
    if (reviewing) onSubmit(prompt.trim(), answers);
    else go(index + 1);
  }

  const offset = reduceMotion ? 0 : 24;

  return (
    <section
      aria-labelledby={`${uid}-question`}
      className={cn("flex w-full flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm", className)}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{title}</span>
          <span aria-live="polite">{reviewing ? "Review" : `Step ${index + 1} of ${steps.length}`}</span>
        </div>
        <div className="flex gap-1" aria-hidden>
          {[...steps, null].map((s, i) => (
            <span key={s?.id ?? "review"} className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="absolute inset-0 origin-left rounded-full bg-foreground"
                initial={false}
                animate={{ scaleX: i <= index ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
              />
            </span>
          ))}
        </div>
      </header>

      <div className="relative min-h-36">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            ref={focusStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -offset }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-3"
            onKeyDown={(e) => {
              // Enter answers a free-text step; Shift+Enter is a new line. Choice
              // chips are buttons, so Enter already picks them, and the review
              // textarea keeps Enter for line breaks.
              if (e.key === "Enter" && !e.shiftKey && !reviewing && e.target instanceof HTMLTextAreaElement) {
                e.preventDefault();
                next();
              }
            }}
          >
            {reviewing ? (
              <>
                <h3 id={`${uid}-question`} className="text-base font-medium">
                  Here&apos;s your prompt
                </h3>
                <ul className="flex flex-wrap gap-1.5" aria-label="Your answers">
                  {steps.map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <span className="sr-only">Change {s.question}: </span>
                        {answers[s.id]?.trim() || "Skipped"}
                      </button>
                    </li>
                  ))}
                </ul>
                <textarea
                  data-autofocus
                  value={prompt}
                  onChange={(e) => setEdited(e.target.value)}
                  rows={4}
                  aria-label="Prompt"
                  className="resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground/30"
                />
                {edited !== null && (
                  <p className="text-xs text-muted-foreground">
                    Edited by hand.{" "}
                    <button type="button" onClick={() => setEdited(null)} className="font-medium text-foreground underline-offset-2 hover:underline">
                      Rebuild from answers
                    </button>
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <h3 id={`${uid}-question`} className="text-base font-medium">
                    {step.question}
                    {step.optional && <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional</span>}
                  </h3>
                  {step.hint && (
                    <p id={`${uid}-hint`} className="text-sm text-muted-foreground">
                      {step.hint}
                    </p>
                  )}
                </div>

                {step.options ? (
                  <Choices
                    labelledBy={`${uid}-question`}
                    options={step.options}
                    value={answers[step.id] ?? ""}
                    onChange={(v) => setAnswer(step.id, v)}
                    onPick={(v) => {
                      setAnswer(step.id, v);
                      // A click is a decision: move on after the selection registers.
                      clearTimeout(advanceTimer.current);
                      advanceTimer.current = setTimeout(() => go(index + 1), reduceMotion ? 0 : 220);
                    }}
                  />
                ) : (
                  <textarea
                    data-autofocus
                    value={answers[step.id] ?? ""}
                    onChange={(e) => setAnswer(step.id, e.target.value)}
                    placeholder={step.placeholder}
                    aria-labelledby={`${uid}-question`}
                    aria-describedby={step.hint ? `${uid}-hint` : undefined}
                    rows={2}
                    className="resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-foreground/30"
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!reviewing && (
        <p className="line-clamp-2 border-t pt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Prompt so far: </span>
          {prompt || "…"}
        </p>
      )}

      <footer className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:invisible"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canContinue || (reviewing && !prompt.trim())}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-opacity disabled:opacity-30"
        >
          {reviewing ? (
            <>
              <Sparkles className="size-3.5" aria-hidden />
              {submitLabel}
            </>
          ) : (
            <>
              {step.optional && !answer ? "Skip" : index === steps.length - 1 ? "Review" : "Next"}
              <ArrowRight className="size-3.5" aria-hidden />
            </>
          )}
        </button>
      </footer>
    </section>
  );
}

/** A single-choice radio group of chips with roving focus. */
function Choices({
  labelledBy,
  options,
  value,
  onChange,
  onPick,
}: {
  labelledBy: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onPick: (value: string) => void;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.indexOf(value);
  const focusable = selected >= 0 ? selected : 0;

  function onKeyDown(e: React.KeyboardEvent, i: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) {
      e.preventDefault();
      const n = (i + keys[e.key] + options.length) % options.length;
      onChange(options[n]);
      refs.current[n]?.focus();
    } else if (e.key === " ") {
      e.preventDefault();
      onChange(options[i]);
    }
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
      {options.map((option, i) => {
        const on = option === value;
        return (
          <button
            key={option}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === focusable ? 0 : -1}
            data-autofocus={i === focusable ? true : undefined}
            onClick={() => onPick(option)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              on ? "border-foreground bg-foreground text-background" : "hover:bg-accent"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
