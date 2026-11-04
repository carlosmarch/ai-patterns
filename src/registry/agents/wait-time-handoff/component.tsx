"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Timer, Users, Workflow } from "lucide-react";

import { cn } from "@/lib/utils";

export type WaitUnit = "seconds" | "minutes" | "hours";
export type HandoffKind = "team" | "workflow";

export interface HandoffOption {
  id: string;
  label: string;
  /** Default message sent to the customer when this target is chosen. */
  message?: string;
}

export interface WaitTimeHandoffValue {
  amount: number;
  unit: WaitUnit;
  kind: HandoffKind;
  targetId: string;
  message: string;
  workingHoursOnly: boolean;
}

export interface WaitTimeHandoffProps {
  /** Name of the agent that is waiting, used in copy ("Set how long Fin waits…"). */
  agentName?: string;
  teams?: HandoffOption[];
  workflows?: HandoffOption[];
  defaultValue?: Partial<WaitTimeHandoffValue>;
  defaultOpen?: boolean;
  onChange?: (value: WaitTimeHandoffValue) => void;
  className?: string;
}

const UNITS: { value: WaitUnit; label: string; max: number }[] = [
  { value: "seconds", label: "Second(s)", max: 59 },
  { value: "minutes", label: "Minute(s)", max: 59 },
  { value: "hours", label: "Hour(s)", max: 72 },
];

export const DEFAULT_TEAMS: HandoffOption[] = [
  { id: "support", label: "Support", message: "I'm passing you to our support team — someone will be with you shortly." },
  { id: "billing", label: "Billing", message: "I'm passing you to our billing team — they'll pick this up from here." },
  { id: "escalations", label: "Escalations", message: "I've escalated this to a specialist who'll follow up with you." },
];

export const DEFAULT_WORKFLOWS: HandoffOption[] = [
  {
    id: "request-info",
    label: "Request further information",
    message: "We'll need to collect some more information to process this request.",
  },
  { id: "csat", label: "Send CSAT survey", message: "Before you go, how did we do today?" },
  { id: "close", label: "Snooze and close", message: "No problem — just reply here whenever you're ready to pick this up again." },
];

function formatWait(amount: number, unit: WaitUnit) {
  const singular = unit.slice(0, -1);
  return `${amount} ${amount === 1 ? singular : unit}`;
}

function Select({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full cursor-pointer appearance-none rounded-full border bg-background py-0 pl-3 pr-8 text-xs font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function WaitTimeHandoff({
  agentName = "Fin",
  teams = DEFAULT_TEAMS,
  workflows = DEFAULT_WORKFLOWS,
  defaultValue,
  defaultOpen = true,
  onChange,
  className,
}: WaitTimeHandoffProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState(defaultOpen);
  const [value, setValue] = React.useState<WaitTimeHandoffValue>(() => {
    const kind = defaultValue?.kind ?? "workflow";
    const list = kind === "team" ? teams : workflows;
    const target = list.find((o) => o.id === defaultValue?.targetId) ?? list[0];
    return {
      amount: defaultValue?.amount ?? 1,
      unit: defaultValue?.unit ?? "minutes",
      kind,
      targetId: target?.id ?? "",
      message: defaultValue?.message ?? target?.message ?? "",
      workingHoursOnly: defaultValue?.workingHoursOnly ?? false,
    };
  });
  // Track whether the user has edited the message, so switching target only
  // replaces the default copy, never something they wrote.
  const [messageEdited, setMessageEdited] = React.useState(Boolean(defaultValue?.message));
  const [draftAmount, setDraftAmount] = React.useState(String(value.amount));

  const options = value.kind === "team" ? teams : workflows;
  const target = options.find((o) => o.id === value.targetId);
  const unitMax = UNITS.find((u) => u.value === value.unit)!.max;

  function update(patch: Partial<WaitTimeHandoffValue>) {
    setValue((prev) => {
      const next = { ...prev, ...patch };
      onChange?.(next);
      return next;
    });
  }

  function selectTarget(kind: HandoffKind, targetId?: string) {
    const list = kind === "team" ? teams : workflows;
    const next = list.find((o) => o.id === targetId) ?? list[0];
    update({
      kind,
      targetId: next?.id ?? "",
      ...(messageEdited ? {} : { message: next?.message ?? "" }),
    });
  }

  function commitAmount(raw: string) {
    const n = Math.round(Number(raw));
    const clamped = Number.isFinite(n) ? Math.min(Math.max(n, 1), unitMax) : value.amount;
    setDraftAmount(String(clamped));
    if (clamped !== value.amount) update({ amount: clamped });
  }

  function changeUnit(unit: WaitUnit) {
    const max = UNITS.find((u) => u.value === unit)!.max;
    const amount = Math.min(value.amount, max);
    setDraftAmount(String(amount));
    update({ unit, amount });
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-sm", className)}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-title`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold outline-none focus-visible:bg-accent"
        >
          <Timer aria-hidden className="size-4" />
          <span className="flex-1">Wait time</span>
          <AnimatePresence mode="wait" initial={false}>
            {!open && (
              <motion.span
                key="summary"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.15 }}
                className="truncate text-xs font-normal text-muted-foreground"
              >
                {formatWait(value.amount, value.unit)} → {target?.label}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.2 }} className="text-muted-foreground">
            <ChevronUp aria-hidden className="size-4" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-title`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-4 pb-4">
              {/* Wait duration */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-xs text-muted-foreground">
                  Set how long {agentName} waits for a response.
                </legend>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label="Wait duration"
                    min={1}
                    max={unitMax}
                    value={draftAmount}
                    onChange={(e) => setDraftAmount(e.target.value)}
                    onBlur={(e) => commitAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitAmount(e.currentTarget.value)}
                    className="h-8 w-20 rounded-full border bg-background px-3 text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Select
                    label="Wait unit"
                    value={value.unit}
                    onChange={(v) => changeUnit(v as WaitUnit)}
                    options={UNITS.map((u) => ({ value: u.value, label: u.label }))}
                  />
                </div>
              </fieldset>

              {/* Handoff target */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-xs text-muted-foreground">If there&apos;s no response, hand off to:</legend>
                <div role="radiogroup" aria-label="Hand off to" className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
                  {(
                    [
                      { kind: "team", label: "Team", icon: Users },
                      { kind: "workflow", label: "Workflow", icon: Workflow },
                    ] as const
                  ).map(({ kind, label, icon: Icon }) => {
                    const selected = value.kind === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => !selected && selectTarget(kind)}
                        onKeyDown={(e) => {
                          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                            e.preventDefault();
                            const other = kind === "team" ? "workflow" : "team";
                            selectTarget(other);
                            const sibling = (e.currentTarget.parentElement?.querySelector(
                              `[data-kind="${other}"]`,
                            ) as HTMLButtonElement | null);
                            sibling?.focus();
                          }
                        }}
                        data-kind={kind}
                        className={cn(
                          "relative flex h-7 items-center justify-center gap-1.5 rounded-full text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {selected && (
                          <motion.span
                            layoutId={`${id}-segment`}
                            className="absolute inset-0 rounded-full border bg-background shadow-sm"
                            transition={{ type: "spring", stiffness: 500, damping: 38 }}
                          />
                        )}
                        <Icon aria-hidden className="relative size-3.5" />
                        <span className="relative">{label}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={value.kind}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                  >
                    <Select
                      label={value.kind === "team" ? "Team" : "Workflow"}
                      value={value.targetId}
                      onChange={(v) => selectTarget(value.kind, v)}
                      options={options.map((o) => ({ value: o.id, label: o.label }))}
                      className="mt-1"
                    />
                  </motion.div>
                </AnimatePresence>
              </fieldset>

              {/* Handoff message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${id}-message`} className="sr-only">
                  Message sent when handing off
                </label>
                <textarea
                  id={`${id}-message`}
                  rows={3}
                  value={value.message}
                  placeholder="Message the customer sees when the conversation is handed off…"
                  onChange={(e) => {
                    setMessageEdited(true);
                    update({ message: e.target.value });
                  }}
                  className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-xs leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Working hours */}
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={value.workingHoursOnly}
                  onChange={(e) => update({ workingHoursOnly: e.target.checked })}
                  aria-describedby={`${id}-hours-hint`}
                  className="mt-0.5 size-3.5 shrink-0 cursor-pointer accent-foreground"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs">Start wait time during working hours only</span>
                  <span id={`${id}-hours-hint`} className="text-[11px] text-muted-foreground">
                    Customers will be notified when your team is unavailable.
                  </span>
                </span>
              </label>
            </div>

            {/* Live summary */}
            <p
              aria-live="polite"
              className="border-t bg-muted/40 px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground"
            >
              {agentName} waits <span className="font-medium text-foreground">{formatWait(value.amount, value.unit)}</span>
              {value.workingHoursOnly ? " of working hours" : ""}, then hands off to{" "}
              <span className="font-medium text-foreground">
                {value.kind === "team" ? `the ${target?.label} team` : target?.label}
              </span>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
