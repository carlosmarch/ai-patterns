"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, ChevronDown, Flag, Info, Sparkles, Tag } from "lucide-react";

import { cn } from "@/lib/utils";

export type CriterionStatus = "missing" | "not-met" | "met";
export type Determination = "applies" | "does-not-apply" | "uncertain";

export interface Criterion {
  id: string;
  /** The requirement, phrased as a statement that is either true or false for the subject. */
  label: string;
  /** Optional source text or rationale, revealed behind "Show details" on missing criteria. */
  details?: string;
  status: CriterionStatus;
}

const DETERMINATIONS: Record<Determination, { label: string; dot: string }> = {
  applies: { label: "Applies", dot: "bg-emerald-500" },
  "does-not-apply": { label: "Does not apply", dot: "bg-muted-foreground/50" },
  uncertain: { label: "Uncertain", dot: "bg-amber-500" },
};

const GROUPS: { status: CriterionStatus; title: string; hint: string }[] = [
  {
    status: "missing",
    title: "Missing information",
    hint: "The AI couldn't verify these from the available evidence. Answer them to firm up the determination.",
  },
  { status: "not-met", title: "Not met", hint: "Evidence shows these requirements are not satisfied." },
  { status: "met", title: "Met", hint: "Evidence shows these requirements are satisfied." },
];

/** Derives the AI determination from criteria: any gap keeps it uncertain; otherwise every criterion must be met. */
export function deriveDetermination(criteria: Criterion[]): Determination {
  if (criteria.some((c) => c.status === "missing")) return "uncertain";
  if (criteria.some((c) => c.status === "not-met")) return "does-not-apply";
  return "applies";
}

export interface CriteriaDeterminationProps {
  criteria: Criterion[];
  /** Called when the user answers a missing criterion with Yes (met) or No (not met). */
  onAnswer?: (id: string, met: boolean) => void;
  /** A manual override. When undefined, the determination is derived from criteria and marked as AI. */
  override?: Determination;
  onOverrideChange?: (value: Determination | undefined) => void;
  className?: string;
}

export function CriteriaDetermination({
  criteria,
  onAnswer,
  override,
  onOverrideChange,
  className,
}: CriteriaDeterminationProps) {
  const derived = deriveDetermination(criteria);
  const value = override ?? derived;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-x-6 gap-y-5 rounded-2xl border bg-card p-4 text-sm sm:grid-cols-[10rem_1fr] sm:p-5",
        className
      )}
    >
      <FieldLabel icon={Flag} label="Determination" hint="Whether this obligation applies, based on the criteria below." />
      <DeterminationSelect
        value={value}
        isAi={override === undefined}
        derived={derived}
        onChange={onOverrideChange}
      />

      <FieldLabel icon={Tag} label="Criteria" hint="Every requirement must be met for the obligation to apply." />
      <LayoutGroup>
        <div className="flex min-w-0 flex-col gap-5">
          {GROUPS.map((group) => {
            const items = criteria.filter((c) => c.status === group.status);
            if (items.length === 0) return null;
            return (
              <motion.section key={group.status} layout="position" className="flex flex-col gap-2">
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  {group.title}
                  <HintIcon hint={group.hint} />
                </h3>
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((c) =>
                    group.status === "missing" ? (
                      <MissingCard key={c.id} criterion={c} onAnswer={onAnswer} />
                    ) : (
                      <ResolvedRow key={c.id} criterion={c} />
                    )
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function FieldLabel({ icon: Icon, label, hint }: { icon: typeof Flag; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-2 self-start pt-2 text-muted-foreground">
      <span className="flex items-center gap-2">
        <Icon className="size-4" aria-hidden />
        {label}
      </span>
      <HintIcon hint={hint} />
    </div>
  );
}

function HintIcon({ hint }: { hint: string }) {
  return (
    <span title={hint} aria-label={hint} role="img" className="inline-flex text-muted-foreground/70">
      <Info className="size-3.5" aria-hidden />
    </span>
  );
}

function DeterminationSelect({
  value,
  isAi,
  derived,
  onChange,
}: {
  value: Determination;
  isAi: boolean;
  derived: Determination;
  onChange?: (value: Determination | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Determination) => {
    onChange?.(next === derived ? undefined : next);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border bg-background px-3.5 py-2.5 text-left shadow-xs transition-colors hover:bg-accent/50"
      >
        <motion.span
          key={value}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          className={cn("size-2 shrink-0 rounded-full", DETERMINATIONS[value].dot)}
          aria-hidden
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex-1 font-medium"
          >
            {DETERMINATIONS[value].label}
          </motion.span>
        </AnimatePresence>
        {isAi ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <Sparkles className="size-3" aria-hidden />
            AI
          </span>
        ) : (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">Edited</span>
        )}
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Determination"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-x-0 top-full z-10 mt-1 origin-top rounded-xl border bg-popover p-1 shadow-lg"
          >
            {(Object.keys(DETERMINATIONS) as Determination[]).map((key) => (
              <li key={key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={key === value}
                  onClick={() => choose(key)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-accent"
                >
                  <span className={cn("size-2 rounded-full", DETERMINATIONS[key].dot)} aria-hidden />
                  <span className="flex-1">{DETERMINATIONS[key].label}</span>
                  {key === derived && <span className="text-xs text-muted-foreground">AI suggestion</span>}
                  {key === value && <Check className="size-4" aria-hidden />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const cardMotion = {
  layout: true,
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

function MissingCard({
  criterion,
  onAnswer,
}: {
  criterion: Criterion;
  onAnswer?: (id: string, met: boolean) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const detailsId = React.useId();

  return (
    <motion.div
      {...cardMotion}
      layoutId={criterion.id}
      className="rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <p className="font-medium">{criterion.label}</p>

      {criterion.details && (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-amber-400"
          >
            {expanded ? "Hide details" : "Show details"}
            <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id={detailsId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <blockquote className="mt-2 rounded-r-md border-l-2 border-amber-400 bg-amber-100/70 px-3 py-2 leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                  {criterion.details}
                </blockquote>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="mt-3 flex gap-2" role="group" aria-label={`Is this true: ${criterion.label}?`}>
        {[
          { label: "Yes", met: true },
          { label: "No", met: false },
        ].map((answer) => (
          <motion.button
            key={answer.label}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer?.(criterion.id, answer.met)}
            className="rounded-md border border-amber-200 bg-background px-3 py-1 font-medium text-foreground shadow-xs transition-colors hover:bg-accent dark:border-amber-500/30"
          >
            {answer.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ResolvedRow({ criterion }: { criterion: Criterion }) {
  return (
    <motion.div
      {...cardMotion}
      layoutId={criterion.id}
      className="grid grid-cols-[5.5rem_1fr] gap-3 rounded-xl bg-muted/60 px-4 py-3"
    >
      <span className="text-muted-foreground">Requires</span>
      <span className="leading-relaxed">{criterion.label}</span>
    </motion.div>
  );
}
