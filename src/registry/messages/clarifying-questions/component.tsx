"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ClarifyingQuestion {
  id: string;
  label: string;
  options: string[];
  /** The assistant's best guess, pre-selected and marked "Suggested". */
  suggested?: string;
  /** Adds a free-text "Other" option. */
  allowOther?: boolean;
}

export type ClarifyingAnswers = Record<string, string>;

export interface ClarifyingQuestionsProps {
  intro?: string;
  questions: ClarifyingQuestion[];
  /** Called with every answer — the suggested ones included — when the person starts. */
  onSubmit: (answers: ClarifyingAnswers, edited: string[]) => void;
  submitLabel?: string;
  className?: string;
}

const OTHER = "__other__";

export function ClarifyingQuestions({
  intro = "A few quick questions so I get this right. I've filled in my best guesses — change anything that's off.",
  questions,
  onSubmit,
  submitLabel = "Start",
  className,
}: ClarifyingQuestionsProps) {
  const initial = React.useMemo(
    () => Object.fromEntries(questions.map((q) => [q.id, q.suggested ?? ""])) as ClarifyingAnswers,
    [questions]
  );
  const [answers, setAnswers] = React.useState<ClarifyingAnswers>(initial);
  const [other, setOther] = React.useState<ClarifyingAnswers>({});
  const [submitted, setSubmitted] = React.useState(false);
  const id = React.useId();

  const resolved = (q: ClarifyingQuestion) => (answers[q.id] === OTHER ? other[q.id]?.trim() ?? "" : answers[q.id]);
  const missing = questions.filter((q) => !resolved(q));
  const edited = questions.filter((q) => resolved(q) !== (q.suggested ?? "")).map((q) => q.id);

  function submit() {
    if (missing.length) return;
    setSubmitted(true);
    onSubmit(Object.fromEntries(questions.map((q) => [q.id, resolved(q)])), edited);
  }

  return (
    <div className={cn("w-full rounded-2xl bg-card border", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div role="status" className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="size-3" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Got it — starting with these details</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {questions.map((q) => (
                    <li key={q.id} className="rounded-full px-2 py-0.5 text-xs bg-muted">
                      <span className="text-muted-foreground">{q.label}: </span>
                      {resolved(q)}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                aria-label="Change answers"
                title="Change answers"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="size-3.5" aria-hidden />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4 p-4"
          >
            <p className="text-sm text-pretty">{intro}</p>

            {questions.map((q, qi) => (
              <fieldset key={q.id} className="flex flex-col gap-2">
                <legend className="mb-2 text-xs font-medium text-muted-foreground">
                  {qi + 1}. {q.label}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {[...q.options, ...(q.allowOther ? [OTHER] : [])].map((option) => {
                    const checked = answers[q.id] === option;
                    return (
                      <label key={option} className="relative">
                        <input
                          type="radio"
                          name={`${id}-${q.id}`}
                          value={option}
                          checked={checked}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring bg-muted",
                            checked
                              ? "border-foreground bg-foreground text-background"
                              : "text-foreground hover:bg-foreground/10"
                          )}
                        >
                          {option === OTHER ? "Other…" : option}
                          {option === q.suggested && (
                            <span className={cn("text-[10px]", checked ? "text-background/70" : "text-muted-foreground")}>
                              Suggested
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <AnimatePresence initial={false}>
                  {answers[q.id] === OTHER && (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      autoFocus
                      value={other[q.id] ?? ""}
                      onChange={(e) => setOther((o) => ({ ...o, [q.id]: e.target.value }))}
                      aria-label={`${q.label}, other`}
                      placeholder="Type your answer"
                      className="w-full rounded-xl px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring bg-muted focus:bg-background"
                    />
                  )}
                </AnimatePresence>
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <span aria-live="polite" className="text-xs text-muted-foreground">
                {missing.length
                  ? `${missing.length} still to answer`
                  : edited.length
                    ? `${edited.length} changed from my suggestions`
                    : "Using my suggestions"}
              </span>
              <button
                type="submit"
                disabled={missing.length > 0}
                className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitLabel}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
