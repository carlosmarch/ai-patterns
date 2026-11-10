"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowUp, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type TemplateSlot = {
  id: string;
  /** Shown inside the empty slot and used as its accessible name ("topic", "audience"). */
  placeholder: string;
  /** Turns the slot into a choice instead of free text. */
  options?: string[];
  /** Pre-filled value. */
  value?: string;
  optional?: boolean;
};

/** A template is text with slots: ["Write a ", { id: "tone", … }, " email about ", …]. */
export type TemplatePart = string | TemplateSlot;

export interface PromptTemplateProps {
  title?: string;
  parts: TemplatePart[];
  /** Called with the filled-in prompt and the slot values. */
  onSubmit: (prompt: string, values: Record<string, string>) => void;
  submitLabel?: string;
  className?: string;
}

const isSlot = (part: TemplatePart): part is TemplateSlot => typeof part !== "string";

export function PromptTemplate({ title, parts, onSubmit, submitLabel = "Run", className }: PromptTemplateProps) {
  const slots = parts.filter(isSlot);
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(slots.map((s) => [s.id, s.value ?? ""]))
  );
  const [touched, setTouched] = React.useState(false);
  const uid = React.useId();
  const slotDomId = (slotId: string) => `${uid}-slot-${slotId}`;

  const missing = slots.filter((s) => !s.optional && !values[s.id]?.trim());
  const prompt = parts
    .map((p) => (isSlot(p) ? values[p.id]?.trim() || "" : p))
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim();

  function submit() {
    setTouched(true);
    if (missing.length) {
      document.getElementById(slotDomId(missing[0].id))?.focus();
      return;
    }
    onSubmit(prompt, values);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn("flex w-full flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10", className)}
    >
      {title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}

      <p className="text-base leading-9 text-pretty">
        {parts.map((part, i) =>
          isSlot(part) ? (
            <Slot
              key={part.id}
              slot={part}
              domId={slotDomId(part.id)}
              value={values[part.id] ?? ""}
              invalid={touched && !part.optional && !values[part.id]?.trim()}
              onChange={(v) => setValues((prev) => ({ ...prev, [part.id]: v }))}
            />
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {missing.length ? `${missing.length} ${missing.length === 1 ? "blank" : "blanks"} to fill` : "Ready"}
        </span>
        <button
          type="submit"
          aria-disabled={missing.length > 0}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90",
            missing.length > 0 && "opacity-40"
          )}
        >
          {submitLabel}
          <ArrowUp className="size-3.5" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function Slot({
  slot,
  domId,
  value,
  invalid,
  onChange,
}: {
  slot: TemplateSlot;
  domId: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  const filled = value.trim() !== "";
  const base = cn(
    "mx-0.5 inline-block h-8 rounded-lg border px-2 align-middle text-base leading-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
    filled ? "border-foreground/20 bg-muted font-medium text-foreground" : "border-dashed border-foreground/30 bg-background text-muted-foreground",
    invalid && "border-destructive"
  );

  if (slot.options) {
    return (
      <span className="relative inline-block">
        <select
          id={domId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={slot.placeholder}
          aria-invalid={invalid || undefined}
          className={cn(base, "cursor-pointer appearance-none pr-7")}
        >
          <option value="" disabled>
            {slot.placeholder}
          </option>
          {slot.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </span>
    );
  }

  // Free-text slots grow with their content: a hidden sizer sets the width.
  return (
    <span className="relative inline-grid align-middle">
      <span aria-hidden className={cn(base, "invisible col-start-1 row-start-1 whitespace-pre")}>
        {value || slot.placeholder}
      </span>
      <motion.input
        id={domId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={slot.placeholder}
        aria-label={slot.placeholder}
        aria-invalid={invalid || undefined}
        animate={invalid ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(base, "col-start-1 row-start-1 w-full min-w-0 placeholder:text-muted-foreground")}
      />
    </span>
  );
}
