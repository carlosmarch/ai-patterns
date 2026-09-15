"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ToolCallChip } from "@/registry/loaders/tool-call-chip/component";

export interface HitlOption {
  id: string;
  label: string;
}

export interface HitlQuestion {
  id: string;
  question: string;
  options: HitlOption[];
  freeTextPlaceholder?: string;
}

export interface HumanInTheLoopProps {
  questions: HitlQuestion[];
  onSubmit?: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  onClose?: () => void;
  /** Called ~500 ms after the resolved chip shows "success". */
  onDone?: () => void;
  className?: string;
}

export function HumanInTheLoop({
  questions,
  onSubmit,
  onSkip,
  onClose,
  onDone,
  className,
}: HumanInTheLoopProps) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);
  const [chipStatus, setChipStatus] = React.useState<"running" | "success">("running");

  React.useEffect(() => {
    if (!done) return;
    const t1 = setTimeout(() => setChipStatus("success"), 1200);
    const t2 = setTimeout(() => onDone?.(), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const current = questions[step];
  const total = questions.length;
  const selected = answers[current.id];
  const isFreeText = selected?.startsWith("free:");
  const freeTextValue = isFreeText ? selected.slice(5) : "";

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
  }

  function setFreeText(value: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: `free:${value}` }));
  }

  function handleContinue() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      setDone(true);
      onSubmit?.(answers);
    }
  }

  function handleSkip() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      onSkip?.();
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={cn("w-full max-w-xs", className)}
      >
        <ToolCallChip
          kind="code"
          verb="Resuming"
          target="agent task"
          status={chipStatus}
          result="Agent task resumed"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("w-full max-w-xs overflow-visible rounded-2xl border bg-card", className)}
    >
      {/* Header */}
      <div className="flex items-start gap-2 px-4 pt-4 pb-3">
        <p className="flex-1 text-xs font-semibold leading-snug">{current.question}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss question"
            className="mt-0.5 shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Options */}
      <div className="space-y-0 px-4 pb-3">
        {current.options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectOption(option.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-accent"
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                  isSelected
                    ? "border-foreground bg-foreground"
                    : "border-muted-foreground/40"
                )}
              >
                {isSelected && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <span
                className={cn(
                  "text-xs transition-colors",
                  isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}

        {/* Free-text fallback */}
        {current.freeTextPlaceholder !== undefined && (
          <div className="flex items-center gap-2.5 px-1 pt-1.5">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                isFreeText && freeTextValue
                  ? "border-blue-500 bg-blue-500"
                  : "border-muted-foreground/40"
              )}
            >
              {isFreeText && freeTextValue && (
                <span className="size-1.5 rounded-full bg-white" />
              )}
            </span>
            <input
              type="text"
              value={freeTextValue}
              placeholder={current.freeTextPlaceholder}
              onChange={(e) => setFreeText(e.target.value)}
              onFocus={() => {
                if (!isFreeText) setFreeText("");
              }}
              className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/50 outline-none focus:text-foreground"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t px-4 py-3">
        {/* Prev / step count / next */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            aria-label="Previous question"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="tabular-nums text-xs text-muted-foreground">
            {step + 1}/{total}
          </span>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={step === total - 1}
            aria-label="Next question"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || (isFreeText && !freeTextValue)}
            className="rounded-full bg-foreground px-4 py-1.5 text-[11px] font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

