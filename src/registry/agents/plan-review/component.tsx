"use client";

import * as React from "react";
import { AnimatePresence, Reorder, useDragControls } from "motion/react";
import { Check, GripVertical, Plus, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PlanStep {
  id: string;
  text: string;
}

export interface PlanReviewProps {
  title?: string;
  steps: PlanStep[];
  /** Rough cost or duration of running the plan ("~6 min · 40 credits"). */
  estimate?: string;
  onApprove: (steps: PlanStep[]) => void;
  /** Asks the agent for a fresh plan. */
  onRegenerate?: () => Promise<PlanStep[]>;
  approveLabel?: string;
  className?: string;
}

type Phase = "review" | "regenerating" | "approved";

export function PlanReview({
  title = "Here's my plan",
  steps: initialSteps,
  estimate,
  onApprove,
  onRegenerate,
  approveLabel = "Approve & run",
  className,
}: PlanReviewProps) {
  const [steps, setSteps] = React.useState(initialSteps);
  // What "Edited" compares against: the agent's latest plan.
  const [baseline, setBaseline] = React.useState(initialSteps);
  const [phase, setPhase] = React.useState<Phase>("review");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const counter = React.useRef(0);
  const listRef = React.useRef<HTMLUListElement>(null);
  const keysId = React.useId();

  const changed = JSON.stringify(steps) !== JSON.stringify(baseline);
  const locked = phase !== "review";

  function update(id: string, text: string) {
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, text } : step)));
  }

  function remove(id: string) {
    setSteps((s) => s.filter((step) => step.id !== id));
    setAnnouncement("Step removed");
  }

  function add() {
    const id = `new-${++counter.current}`;
    setSteps((s) => [...s, { id, text: "" }]);
    setEditingId(id);
  }

  function move(id: string, by: -1 | 1) {
    const i = steps.findIndex((step) => step.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
    setAnnouncement(`Moved to position ${j + 1} of ${steps.length}`);
    // Keep keyboard focus on the moved row.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-step="${id}"]`)?.focus());
  }

  async function regenerate() {
    if (!onRegenerate) return;
    setPhase("regenerating");
    setEditingId(null);
    try {
      const next = await onRegenerate();
      setSteps(next);
      setBaseline(next);
      setAnnouncement("New plan ready");
    } finally {
      setPhase("review");
    }
  }

  function approve() {
    const clean = steps.map((s) => ({ ...s, text: s.text.trim() })).filter((s) => s.text);
    setSteps(clean);
    setEditingId(null);
    setPhase("approved");
    onApprove(clean);
  }

  return (
    <section className={cn("w-full rounded-2xl border bg-card", className)} aria-label="Plan review">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{phase === "approved" ? "Plan approved" : title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {phase === "approved"
              ? `Running ${steps.length} steps${estimate ? ` · ${estimate}` : ""}`
              : `Nothing runs until you approve.${estimate ? ` Estimated ${estimate}.` : ""}`}
          </p>
        </div>
        {changed && phase === "review" && (
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">Edited</span>
        )}
      </header>

      <Reorder.Group
        ref={listRef}
        as="ul"
        axis="y"
        values={steps}
        onReorder={setSteps}
        aria-label="Plan steps"
        className={cn("flex flex-col gap-1 px-2 transition-opacity", phase === "regenerating" && "opacity-40")}
      >
        <AnimatePresence initial={false}>
          {steps.map((step, i) => (
            <Row
              key={step.id}
              step={step}
              index={i}
              total={steps.length}
              locked={locked}
              keysId={keysId}
              editing={editingId === step.id}
              onEdit={() => setEditingId(step.id)}
              onDone={(text) => {
                if (text.trim()) update(step.id, text.trim());
                else remove(step.id);
                setEditingId(null);
              }}
              onRemove={() => remove(step.id)}
              onMove={(by) => move(step.id, by)}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      <span id={keysId} className="sr-only">
        Enter to edit, Alt plus arrow keys to move, Delete to remove.
      </span>

      <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
        {phase === "approved" ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
            <Check className="size-3.5" aria-hidden />
            Approved — the agent is working through these steps.
          </span>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={add}
                disabled={locked}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <Plus className="size-3.5" aria-hidden />
                Add step
              </button>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={locked}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  <RotateCcw className={cn("size-3.5", phase === "regenerating" && "animate-spin [animation-direction:reverse]")} aria-hidden />
                  {phase === "regenerating" ? "Rethinking…" : "New plan"}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={approve}
              disabled={locked || steps.every((s) => !s.text.trim())}
              className="rounded-xl bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {approveLabel}
            </button>
          </>
        )}
      </footer>
    </section>
  );
}

function Row({
  step,
  index,
  total,
  locked,
  keysId,
  editing,
  onEdit,
  onDone,
  onRemove,
  onMove,
}: {
  step: PlanStep;
  index: number;
  total: number;
  locked: boolean;
  keysId: string;
  editing: boolean;
  onEdit: () => void;
  onDone: (text: string) => void;
  onRemove: () => void;
  onMove: (by: -1 | 1) => void;
}) {
  const controls = useDragControls();
  const [draft, setDraft] = React.useState(step.text);

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="group relative list-none"
    >
      <div
        data-step={step.id}
        tabIndex={locked || editing ? -1 : 0}
        aria-label={`Step ${index + 1} of ${total}: ${step.text || "empty"}`}
        aria-describedby={locked ? undefined : keysId}
        onKeyDown={(e) => {
          if (locked || editing || e.target !== e.currentTarget) return;
          if (e.altKey && e.key === "ArrowUp") {
            e.preventDefault();
            onMove(-1);
          } else if (e.altKey && e.key === "ArrowDown") {
            e.preventDefault();
            onMove(1);
          } else if (e.key === "Enter") {
            e.preventDefault();
            setDraft(step.text);
            onEdit();
          } else if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            onRemove();
          }
        }}
        className="flex items-start gap-2 rounded-xl bg-card px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring [.group:hover_&]:bg-muted/50"
      >
        {!locked && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onPointerDown={(e) => controls.start(e)}
            className="mt-0.5 cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <span
          className={cn(
            "mt-px flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums",
            locked && "border-foreground bg-foreground text-background"
          )}
          aria-hidden
        >
          {index + 1}
        </span>

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onDone(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onDone(draft);
              if (e.key === "Escape") onDone(step.text);
            }}
            aria-label={`Edit step ${index + 1}`}
            placeholder="Describe the step"
            className="min-w-0 flex-1 rounded-md border bg-background px-2 py-0.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <button
            type="button"
            tabIndex={-1}
            disabled={locked}
            onClick={() => {
              setDraft(step.text);
              onEdit();
            }}
            className="min-w-0 flex-1 cursor-text text-left text-sm text-pretty disabled:cursor-default"
          >
            {step.text}
          </button>
        )}

        {!locked && !editing && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onRemove}
            aria-label={`Remove step ${index + 1}`}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
    </Reorder.Item>
  );
}
