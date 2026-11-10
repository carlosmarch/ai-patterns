"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, ChevronDown, Eye, RotateCcw, Search, Sparkles, X, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export type ReviewStatus = "pending" | "accepted" | "dismissed";

export interface Evidence {
  id: string;
  /** The exact passage the value was extracted from. */
  quote: string;
}

export interface ReviewField {
  key: string;
  label: string;
  /** The value the model extracted. */
  value: string;
  /** Why the model chose this value — one short paragraph. */
  reasoning: string;
  evidence: Evidence[];
  /** Starting status. Defaults to "pending". */
  status?: ReviewStatus;
}

export interface AiReviewPanelProps {
  fields: ReviewField[];
  title?: string;
  /** Fires on every accept, dismiss, restore or undo — and once per field on "Apply all". */
  onStatusChange?: (key: string, status: ReviewStatus) => void;
  /** Hover / focus on a quote: highlight it in the source. `null` clears. */
  onEvidencePreview?: (evidence: Evidence | null) => void;
  /** Click on a quote: scroll the source to it. */
  onEvidenceOpen?: (evidence: Evidence) => void;
  onViewSource?: () => void;
  onClose?: () => void;
  className?: string;
}

type Filter = "all" | ReviewStatus;

const STATUS: Record<
  ReviewStatus,
  { label: string; dot: string; bar: string; badge: string }
> = {
  dismissed: {
    label: "Dismissed",
    dot: "bg-red-500",
    bar: "bg-red-500",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  accepted: {
    label: "Accepted",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
};

const FILTERS: Filter[] = ["all", "pending", "accepted", "dismissed"];

export function AiReviewPanel({
  fields,
  title = "AI Review",
  onStatusChange,
  onEvidencePreview,
  onEvidenceOpen,
  onViewSource,
  onClose,
  className,
}: AiReviewPanelProps) {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = React.useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.status ?? "pending"]))
  );
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const listId = React.useId();

  const counts = React.useMemo(() => {
    const c = { all: fields.length, pending: 0, accepted: 0, dismissed: 0 };
    for (const f of fields) c[status[f.key]] += 1;
    return c;
  }, [fields, status]);

  const q = query.trim().toLowerCase();
  const visible = fields.filter(
    (f) =>
      (filter === "all" || status[f.key] === filter) &&
      (!q || f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q))
  );

  function set(key: string, next: ReviewStatus) {
    setStatus((s) => ({ ...s, [key]: next }));
    onStatusChange?.(key, next);
    const label = fields.find((f) => f.key === key)?.label ?? key;
    setAnnouncement(`${label} ${next === "pending" ? "moved back to pending" : next}`);
  }

  function applyAll() {
    const pending = fields.filter((f) => status[f.key] === "pending");
    setStatus((s) => ({ ...s, ...Object.fromEntries(pending.map((f) => [f.key, "accepted" as const])) }));
    pending.forEach((f) => onStatusChange?.(f.key, "accepted"));
    setAnnouncement(`${pending.length} field${pending.length === 1 ? "" : "s"} accepted`);
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = FILTERS[(i + dir + FILTERS.length) % FILTERS.length];
    setFilter(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <aside
      aria-label={title}
      className={cn(
        "flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-background text-sm border",
        className
      )}
    >
      <header className="flex items-center gap-2 px-4 pb-2 pt-3.5">
        <Sparkles className="size-4 text-violet-500" aria-hidden />
        <h2 className="flex-1 font-medium">{title}</h2>
        {onViewSource && (
          <button
            type="button"
            onClick={onViewSource}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Eye className="size-3.5" aria-hidden />
            View source
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </header>

      {/* Progress: one segment per status, sized by share of fields */}
      <div className="px-4 pb-3">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-medium">Status</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {counts.accepted + counts.dismissed} of {counts.all} reviewed
          </span>
        </div>
        <div
          role="img"
          aria-label={`${counts.accepted} accepted, ${counts.pending} pending, ${counts.dismissed} dismissed`}
          className="flex h-1.5 gap-0.5"
        >
          {(["dismissed", "pending", "accepted"] as const).map((s) => (
            <motion.span
              key={s}
              className={cn("h-full rounded-full", STATUS[s].bar)}
              initial={false}
              animate={{ flexGrow: counts[s], opacity: counts[s] ? 1 : 0 }}
              style={{ flexBasis: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 30 }}
            />
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Filter by status" className="flex border-b px-1.5">
        {FILTERS.map((f, i) => {
          const active = filter === f;
          return (
            <button
              key={f}
              ref={(el) => {
                tabRefs.current[f] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={listId}
              tabIndex={active ? 0 : -1}
              onClick={() => setFilter(f)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1 whitespace-nowrap px-1 py-2 text-xs transition-colors",
                active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : STATUS[f].label}
              <span
                className={cn(
                  "min-w-4.5 rounded-full px-1 py-px text-center text-[11px] tabular-nums",
                  f === "all" ? "bg-muted text-muted-foreground" : STATUS[f].badge
                )}
              >
                {counts[f]}
              </span>
              {active && (
                <motion.span
                  layoutId={`${listId}-tab`}
                  className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-foreground"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-3 py-2.5">
        <label className="flex h-8 items-center gap-2 rounded-lg px-2.5 focus-within:ring-2 focus-within:ring-ring/40 bg-muted">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields…"
            aria-label="Search fields"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div id={listId} role="tabpanel" className="flex-1 overflow-y-auto px-3 pb-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((f) => (
            <motion.div
              key={f.key}
              layout={!reduceMotion}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="mb-1.5"
            >
              <FieldCard
                field={f}
                status={status[f.key]}
                open={expanded === f.key}
                onToggle={() => setExpanded((k) => (k === f.key ? null : f.key))}
                onSet={(s) => set(f.key, s)}
                onEvidencePreview={onEvidencePreview}
                onEvidenceOpen={onEvidenceOpen}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            {q ? `No fields match “${query.trim()}”` : filter === "pending" ? "Nothing left to review" : "No fields here yet"}
          </p>
        )}
      </div>

      <footer className="border-t px-3 py-3">
        <button
          type="button"
          onClick={applyAll}
          disabled={counts.pending === 0}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {counts.pending > 0 ? (
            <>
              <Zap className="size-3.5" aria-hidden />
              Apply all pending ({counts.pending})
            </>
          ) : (
            <>
              <Check className="size-3.5" aria-hidden />
              All fields reviewed
            </>
          )}
        </button>
      </footer>

      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </aside>
  );
}

function FieldCard({
  field,
  status,
  open,
  onToggle,
  onSet,
  onEvidencePreview,
  onEvidenceOpen,
}: {
  field: ReviewField;
  status: ReviewStatus;
  open: boolean;
  onToggle: () => void;
  onSet: (s: ReviewStatus) => void;
  onEvidencePreview?: (e: Evidence | null) => void;
  onEvidenceOpen?: (e: Evidence) => void;
}) {
  const reduceMotion = useReducedMotion();
  const bodyId = React.useId();

  return (
    <div className={cn("overflow-hidden rounded-lg transition-colors", open ? "bg-muted/60" : "hover:bg-muted/40")}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
        >
          <span className={cn("size-2 shrink-0 rounded-full transition-colors", STATUS[status].dot)} aria-hidden />
          <span className="min-w-0 flex-1 truncate">{field.label}</span>
          <span className="sr-only">, {STATUS[status].label}</span>
          {!open && (
            <span className="max-w-[40%] truncate text-xs text-muted-foreground">{field.value}</span>
          )}
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex flex-col gap-2 px-2 pb-2">
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                <Sparkles className="size-3.5 shrink-0 text-violet-500" aria-hidden />
                <span className="font-medium">Value</span>
                <span className="min-w-0 flex-1 truncate text-right text-muted-foreground">{field.value}</span>
              </div>

              <Section title="Reasoning">
                <p className="leading-relaxed text-foreground/90">{field.reasoning}</p>
              </Section>

              {field.evidence.length > 0 && (
                <Section title="Evidence">
                  <ul className="flex flex-col gap-1.5">
                    {field.evidence.map((ev) => (
                      <li key={ev.id}>
                        <button
                          type="button"
                          onMouseEnter={() => onEvidencePreview?.(ev)}
                          onMouseLeave={() => onEvidencePreview?.(null)}
                          onFocus={() => onEvidencePreview?.(ev)}
                          onBlur={() => onEvidencePreview?.(null)}
                          onClick={() => onEvidenceOpen?.(ev)}
                          aria-label={`View in source: ${ev.quote}`}
                          className="group w-full rounded-md bg-muted/60 py-2 pl-2 pr-3 text-left transition-colors hover:bg-violet-500/10"
                        >
                          <span className="block border-l-2 border-violet-500 pl-3 leading-relaxed">“{ev.quote}”</span>
                          <span className="mt-1.5 flex items-center gap-1 pl-3.5 text-[11px] text-violet-600 dark:text-violet-400">
                            <ArrowUpRight className="size-3" aria-hidden />
                            Hover to preview · click to view in text
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <div className="flex justify-end gap-1.5 pt-0.5">
                {status === "pending" ? (
                  <>
                    <ActionButton onClick={() => onSet("dismissed")}>
                      <X className="size-3.5" aria-hidden />
                      Dismiss
                    </ActionButton>
                    <ActionButton primary onClick={() => onSet("accepted")}>
                      <Check className="size-3.5" aria-hidden />
                      Accept
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton onClick={() => onSet("pending")}>
                    <RotateCcw className="size-3.5" aria-hidden />
                    {status === "dismissed" ? "Restore" : "Undo"}
                  </ActionButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const id = React.useId();
  return (
    <div className="rounded-md border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Sparkles className="size-3.5 shrink-0 text-violet-500" aria-hidden />
        <span className="flex-1 font-medium">{title}</span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", !open && "-rotate-90")}
          aria-hidden
        />
      </button>
      {open && (
        <div id={id} className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "border bg-background hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}
