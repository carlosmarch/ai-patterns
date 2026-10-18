"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRightFromLine,
  ArrowUpRight,
  ChevronDown,
  CircleArrowOutUpRight,
  Code,
  CornerDownRight,
  EllipsisVertical,
  Heading1,
  Plus,
  Shuffle,
  Text as TextIcon,
  Trash2,
  Workflow,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ── data model ── */

/** An inline reference inside an instruction, e.g. "Tag · Refund initiated". */
export interface ProcedureChip {
  /** Bold leading verb: "Update", "Tag", "Use", "Read". */
  verb: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export type ProcedureSegment = string | ProcedureChip;

export type ProcedureActionKind = "escalate" | "switch" | "workflow" | "end";

export type ProcedureStep =
  | { id: string; kind: "instruction"; content: ProcedureSegment[] }
  | {
      id: string;
      kind: "condition";
      mode: "text" | "code";
      condition: string;
      then: ProcedureStep[];
      /** Present (possibly empty) when the condition has an ELSE branch. */
      else?: ProcedureStep[];
    }
  | { id: string; kind: "header"; text: string }
  /** `target` is the id of a top-level header step. */
  | { id: string; kind: "goto"; target?: string }
  | { id: string; kind: "action"; action: ProcedureActionKind; target?: string };

export interface ProcedureTargets {
  escalate?: string[];
  switch?: string[];
  workflow?: string[];
}

export interface ProcedureBuilderProps {
  initialSteps?: ProcedureStep[];
  /** Options offered by the Escalate / Switch / Run workflow pickers. */
  targets?: ProcedureTargets;
  /** Used in placeholders: "Describe what {agentName} should do…". */
  agentName?: string;
  onChange?: (steps: ProcedureStep[]) => void;
  className?: string;
}

/** Transient row holding the "/Search steps…" input. Never passed to `onChange`. */
type DraftStep = { id: string; kind: "draft" };
type Step = ProcedureStep | DraftStep;
type ConditionStep = Extract<ProcedureStep, { kind: "condition" }>;
type Branch = "then" | "else";

/* ── step catalogue ── */

type StepOption =
  | "instruction"
  | "condition"
  | "header"
  | "goto"
  | ProcedureActionKind;

interface StepOptionMeta {
  label: string;
  /** Shorter/longer label used inside a condition branch. */
  nestedLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  group: "structure" | "action";
}

const BADGE = {
  neutral: "bg-muted text-foreground/80",
  condition: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  goto: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  action: "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
};

const STEP_OPTIONS: Record<StepOption, StepOptionMeta> = {
  instruction: { label: "Instruction", icon: TextIcon, badge: BADGE.neutral, group: "structure" },
  condition: { label: "Condition", icon: ArrowRightFromLine, badge: BADGE.condition, group: "structure" },
  header: { label: "Section header", icon: Heading1, badge: BADGE.neutral, group: "structure" },
  goto: { label: "Go to", nestedLabel: "Go to section", icon: ArrowUpRight, badge: BADGE.goto, group: "structure" },
  escalate: { label: "Escalate", icon: CircleArrowOutUpRight, badge: BADGE.action, group: "action" },
  switch: { label: "Switch", icon: Shuffle, badge: BADGE.action, group: "action" },
  workflow: { label: "Run workflow", icon: Workflow, badge: BADGE.action, group: "action" },
  end: { label: "End", nestedLabel: "End procedure", icon: X, badge: BADGE.action, group: "action" },
};

// Conditions and section headers only make sense at the top level, so a
// branch offers a shorter menu.
const TOP_LEVEL_OPTIONS: StepOption[] = ["instruction", "condition", "header", "goto", "escalate", "switch", "workflow", "end"];
const NESTED_OPTIONS: StepOption[] = ["instruction", "goto", "escalate", "switch", "workflow", "end"];

const ACTION_COPY: Record<ProcedureActionKind, { prefix: string; picker: string }> = {
  escalate: { prefix: "Escalate to", picker: "Choose a team" },
  switch: { prefix: "Switch to", picker: "Choose a procedure" },
  workflow: { prefix: "Run", picker: "Choose a workflow" },
  end: { prefix: "End procedure", picker: "" },
};

/* ── tree helpers ── */

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function mapSteps(steps: Step[], fn: (step: Step) => Step | null): Step[] {
  const out: Step[] = [];
  for (const step of steps) {
    const next = fn(step);
    if (!next) continue;
    if (next.kind === "condition") {
      out.push({
        ...next,
        then: mapSteps(next.then, fn) as ProcedureStep[],
        else: next.else ? (mapSteps(next.else, fn) as ProcedureStep[]) : undefined,
      });
    } else {
      out.push(next);
    }
  }
  return out;
}

function insertAfter(steps: Step[], afterId: string, inserted: Step): Step[] {
  const index = steps.findIndex((s) => s.id === afterId);
  if (index !== -1) return [...steps.slice(0, index + 1), inserted, ...steps.slice(index + 1)];
  return steps.map((s) =>
    s.kind === "condition"
      ? {
          ...s,
          then: insertAfter(s.then, afterId, inserted) as ProcedureStep[],
          else: s.else ? (insertAfter(s.else, afterId, inserted) as ProcedureStep[]) : undefined,
        }
      : s
  );
}

function stripDrafts(steps: Step[]): ProcedureStep[] {
  return mapSteps(steps, (s) => (s.kind === "draft" ? null : s)) as ProcedureStep[];
}

function createStep(option: StepOption, id: string): ProcedureStep {
  switch (option) {
    case "instruction":
      return { id, kind: "instruction", content: [""] };
    case "condition":
      return {
        id,
        kind: "condition",
        mode: "text",
        condition: "",
        then: [{ id: newId("step"), kind: "instruction", content: [""] }],
      };
    case "header":
      return { id, kind: "header", text: "" };
    case "goto":
      return { id, kind: "goto" };
    default:
      return { id, kind: "action", action: option };
  }
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const PLACEHOLDER_SUFFIX: Record<Branch | "top", string> = {
  top: "",
  then: " when this condition is met",
  else: " when this condition isn't met",
};

/* ── context ── */

interface BuilderContextValue {
  agentName: string;
  targets: ProcedureTargets;
  sections: { id: string; text: string }[];
  /** Id of the step that should grab focus when it mounts. */
  focusId: string | null;
  update: (id: string, fn: (step: Step) => Step | null) => void;
  remove: (id: string) => void;
  /** Opens a "/Search steps…" row right after `id`. */
  draftAfter: (id: string) => void;
  /** Opens a "/Search steps…" row at the end of a list (top level when `parentId` is null). */
  draftAtEnd: (parentId: string | null, branch?: Branch) => void;
  commitDraft: (draftId: string, option: StepOption) => void;
}

const BuilderContext = React.createContext<BuilderContextValue | null>(null);

function useBuilder() {
  const ctx = React.useContext(BuilderContext);
  if (!ctx) throw new Error("ProcedureBuilder parts must render inside <ProcedureBuilder>");
  return ctx;
}

/* ── root ── */

export function ProcedureBuilder({
  initialSteps = [],
  targets = {},
  agentName = "the agent",
  onChange,
  className,
}: ProcedureBuilderProps) {
  const [steps, setSteps] = React.useState<Step[]>(initialSteps);
  const [focusId, setFocusId] = React.useState<string | null>(null);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChangeRef.current?.(stripDrafts(steps));
  }, [steps]);

  const sections = steps
    .filter((s): s is Extract<ProcedureStep, { kind: "header" }> => s.kind === "header")
    .map((s) => ({ id: s.id, text: s.text }));

  // Only one draft row at a time: opening a new one replaces any other.
  const withoutDrafts = (list: Step[]) => mapSteps(list, (s) => (s.kind === "draft" ? null : s));

  const ctx: BuilderContextValue = {
    agentName,
    targets,
    sections,
    focusId,
    update: (id, fn) => setSteps((prev) => mapSteps(prev, (s) => (s.id === id ? fn(s) : s))),
    remove: (id) =>
      setSteps((prev) =>
        mapSteps(prev, (s) => {
          if (s.id === id) return null;
          // A goto pointing at a deleted section loses its target.
          if (s.kind === "goto" && s.target === id) return { ...s, target: undefined };
          return s;
        })
      ),
    draftAfter: (id) => {
      const draft: DraftStep = { id: newId("draft"), kind: "draft" };
      setFocusId(draft.id);
      setSteps((prev) => insertAfter(withoutDrafts(prev), id, draft));
    },
    draftAtEnd: (parentId, branch = "then") => {
      const draft: DraftStep = { id: newId("draft"), kind: "draft" };
      setFocusId(draft.id);
      setSteps((prev) => {
        const clean = withoutDrafts(prev);
        if (parentId === null) return [...clean, draft];
        return mapSteps(clean, (s) =>
          s.id === parentId && s.kind === "condition"
            ? { ...s, [branch]: [...(s[branch] ?? []), draft as unknown as ProcedureStep] }
            : s
        );
      });
    },
    commitDraft: (draftId, option) => {
      const id = newId("step");
      setFocusId(id);
      setSteps((prev) => mapSteps(prev, (s) => (s.id === draftId ? createStep(option, id) : s)));
    },
  };

  return (
    <BuilderContext.Provider value={ctx}>
      <div className={cn("w-full text-sm text-foreground", className)}>
        <StepList steps={steps} parentId={null} />
        <button
          type="button"
          onClick={() => ctx.draftAtEnd(null)}
          className="ml-8 mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3.5" aria-hidden />
          Add step
        </button>
      </div>
    </BuilderContext.Provider>
  );
}

/* ── lists ── */

function StepList({ steps, parentId, branch }: { steps: Step[]; parentId: string | null; branch?: Branch }) {
  const nested = parentId !== null;
  // Section headers are unnumbered so the procedure's numbering stays a plain
  // count of things the agent does.
  const markers: string[] = [];
  for (const step of steps) {
    const count = markers.filter(Boolean).length;
    markers.push(step.kind === "header" ? "" : nested ? `${LETTERS[count % 26]}.` : `${count + 1}.`);
  }

  return (
    <ol className={cn("flex flex-col", nested ? "gap-2.5" : "gap-5")}>
      <AnimatePresence initial={false}>
        {steps.map((step, index) => (
          <motion.li
            key={step.id}
            layout="position"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-[2rem_minmax(0,1fr)] items-start"
          >
            <span
              aria-hidden
              className={cn(
                "select-none font-mono text-[11px] tabular-nums text-muted-foreground",
                step.kind === "condition" ? "pt-1" : "pt-[3px]"
              )}
            >
              {markers[index]}
            </span>
            <StepRow step={step} nested={nested} branch={branch} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}

function StepRow({ step, nested, branch }: { step: Step; nested: boolean; branch?: Branch }) {
  switch (step.kind) {
    case "draft":
      return <DraftRow id={step.id} nested={nested} />;
    case "instruction":
      return <InstructionRow step={step} branch={branch} />;
    case "condition":
      return <ConditionBlock step={step} />;
    case "header":
      return <HeaderRow step={step} />;
    case "goto":
      return <GotoRow step={step} />;
    case "action":
      return <ActionRow step={step} />;
  }
}

/* ── draft row: the "/" step picker ── */

function DraftRow({ id, nested }: { id: string; nested: boolean }) {
  const { focusId, remove, commitDraft } = useBuilder();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listId = React.useId();

  React.useEffect(() => {
    if (focusId === id) inputRef.current?.focus();
  }, [focusId, id]);

  const options = (nested ? NESTED_OPTIONS : TOP_LEVEL_OPTIONS).filter((option) => {
    const meta = STEP_OPTIONS[option];
    const label = nested ? (meta.nestedLabel ?? meta.label) : meta.label;
    return label.toLowerCase().includes(query.trim().toLowerCase());
  });
  const activeIndex = Math.min(active, Math.max(0, options.length - 1));

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!options.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + delta + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (options[activeIndex]) commitDraft(id, options[activeIndex]);
    } else if (event.key === "Escape" || (event.key === "Backspace" && query === "")) {
      event.preventDefault();
      remove(id);
    }
  }

  const structure = options.filter((o) => STEP_OPTIONS[o].group === "structure");
  const actions = options.filter((o) => STEP_OPTIONS[o].group === "action");

  function renderOption(option: StepOption) {
    const meta = STEP_OPTIONS[option];
    const index = options.indexOf(option);
    const Icon = meta.icon;
    return (
      <li
        key={option}
        id={`${listId}-${option}`}
        role="option"
        aria-selected={index === activeIndex}
        onPointerMove={() => setActive(index)}
        // Keep focus in the input so blur doesn't dismiss the row mid-click.
        onPointerDown={(event) => event.preventDefault()}
        onClick={() => commitDraft(id, option)}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
          index === activeIndex ? "bg-muted" : "text-foreground/90"
        )}
      >
        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", meta.badge)}>
          <Icon className="size-3.5" aria-hidden />
        </span>
        {nested ? (meta.nestedLabel ?? meta.label) : meta.label}
      </li>
    );
  }

  return (
    <div className="relative">
      <div className="inline-flex items-center rounded-md bg-muted/70 px-1.5 py-0.5">
        <span aria-hidden className="text-foreground/70">
          /
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => remove(id)}
          placeholder="Search steps…"
          role="combobox"
          aria-label="Add a step"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={options[activeIndex] ? `${listId}-${options[activeIndex]}` : undefined}
          className="w-28 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        style={{ transformOrigin: "top left" }}
        className="absolute left-0 top-full z-30 mt-1.5 w-60 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
      >
        <ul id={listId} role="listbox" aria-label="Step types">
          {structure.map(renderOption)}
          {structure.length > 0 && actions.length > 0 && <li role="separator" className="-mx-1.5 my-1.5 h-px bg-border" />}
          {actions.map(renderOption)}
          {options.length === 0 && <li className="px-2 py-1.5 text-sm text-muted-foreground">No matching steps</li>}
        </ul>
      </motion.div>
    </div>
  );
}

/* ── instruction ── */

function InstructionRow({ step, branch }: { step: Extract<ProcedureStep, { kind: "instruction" }>; branch?: Branch }) {
  const { agentName, focusId, update, remove, draftAfter } = useBuilder();
  const plain = step.content.every((segment) => typeof segment === "string");

  // Instructions holding inline references render read-only here; a full
  // editor would insert chips through an @-mention picker.
  if (!plain) {
    return (
      <StepShell onRemove={() => remove(step.id)} label="instruction">
        <p className="leading-7 text-foreground/90">
          {step.content.map((segment, i) =>
            typeof segment === "string" ? <React.Fragment key={i}>{segment}</React.Fragment> : <InlineChip key={i} chip={segment} />
          )}
        </p>
      </StepShell>
    );
  }

  const value = step.content.join("");
  return (
    <StepShell onRemove={() => remove(step.id)} label="instruction">
      <AutoTextarea
        value={value}
        autoFocus={focusId === step.id}
        aria-label="Instruction"
        placeholder={`Describe what ${agentName} should do${PLACEHOLDER_SUFFIX[branch ?? "top"]}`}
        onChange={(text) => update(step.id, (s) => ({ ...(s as typeof step), content: [text] }))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            draftAfter(step.id);
          } else if (event.key === "Backspace" && value === "") {
            event.preventDefault();
            remove(step.id);
          } else if (event.key === "/" && value === "") {
            // Typing "/" in an empty instruction swaps it for the step picker.
            event.preventDefault();
            draftAfter(step.id);
            remove(step.id);
          }
        }}
        className="leading-7 text-foreground/90"
      />
    </StepShell>
  );
}

export function InlineChip({ chip }: { chip: ProcedureChip }) {
  const Icon = chip.icon;
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border/60 bg-muted/60 px-2 py-px align-baseline text-[13px] leading-6">
      {Icon && <Icon className="size-3.5 text-foreground/80" aria-hidden />}
      <span className="font-semibold">{chip.verb}</span>
      <span className="text-foreground/80">{chip.label}</span>
      <EllipsisVertical className="-mr-1 size-3.5 text-muted-foreground" aria-hidden />
    </span>
  );
}

/* ── section header ── */

function HeaderRow({ step }: { step: Extract<ProcedureStep, { kind: "header" }> }) {
  const { focusId, update, remove, draftAfter } = useBuilder();
  return (
    <StepShell onRemove={() => remove(step.id)} label="section">
      <AutoTextarea
        value={step.text}
        autoFocus={focusId === step.id}
        aria-label="Section name"
        placeholder="Section name"
        onChange={(text) => update(step.id, (s) => ({ ...(s as typeof step), text }))}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            draftAfter(step.id);
          } else if (event.key === "Backspace" && step.text === "") {
            event.preventDefault();
            remove(step.id);
          }
        }}
        className="text-base font-semibold leading-7"
      />
    </StepShell>
  );
}

/* ── go to / actions ── */

function GotoRow({ step }: { step: Extract<ProcedureStep, { kind: "goto" }> }) {
  const { sections, focusId, update, remove } = useBuilder();
  const options = sections.map((s) => ({ value: s.id, label: s.text || "Untitled section" }));
  return (
    <StepShell onRemove={() => remove(step.id)} label="go to step">
      <div className="flex flex-wrap items-center gap-2 leading-7">
        <StepBadge icon={ArrowUpRight} className={BADGE.goto} />
        <span>Go to</span>
        <TargetPicker
          value={step.target}
          options={options}
          placeholder="Choose a section"
          emptyLabel="Add a section header first"
          autoOpen={focusId === step.id}
          onSelect={(target) => update(step.id, (s) => ({ ...(s as typeof step), target }))}
        />
      </div>
    </StepShell>
  );
}

function ActionRow({ step }: { step: Extract<ProcedureStep, { kind: "action" }> }) {
  const { targets, focusId, update, remove } = useBuilder();
  const meta = STEP_OPTIONS[step.action];
  const copy = ACTION_COPY[step.action];
  const options = step.action === "end" ? [] : (targets[step.action] ?? []).map((t) => ({ value: t, label: t }));

  return (
    <StepShell onRemove={() => remove(step.id)} label={`${meta.label} step`}>
      <div className="flex flex-wrap items-center gap-2 leading-7">
        <StepBadge icon={meta.icon} className={BADGE.action} />
        <span>{copy.prefix}</span>
        {step.action !== "end" && (
          <TargetPicker
            value={step.target}
            options={options}
            placeholder={copy.picker}
            emptyLabel="Nothing to choose yet"
            autoOpen={focusId === step.id}
            onSelect={(target) => update(step.id, (s) => ({ ...(s as typeof step), target }))}
          />
        )}
      </div>
    </StepShell>
  );
}

function TargetPicker({
  value,
  options,
  placeholder,
  emptyLabel,
  autoOpen,
  onSelect,
}: {
  value?: string;
  options: { value: string; label: string }[];
  placeholder: string;
  emptyLabel: string;
  autoOpen: boolean;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(autoOpen);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const listId = React.useId();
  const selected = options.find((o) => o.value === value);

  useDismiss(rootRef, open, () => setOpen(false));

  React.useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!options.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + delta + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[active]) {
        onSelect(options[active].value);
        close(true);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          setActive(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 text-[13px] leading-6 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !selected && "text-muted-foreground"
        )}
      >
        {selected?.label ?? placeholder}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={options[active] ? `${listId}-${active}` : undefined}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-full z-30 mt-1.5 min-w-52 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg focus:outline-none"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={option.value === value}
                onPointerMove={() => setActive(index)}
                onClick={() => {
                  onSelect(option.value);
                  close(true);
                }}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-lg px-2 py-1.5 text-sm",
                  index === active && "bg-muted",
                  option.value === value && "font-medium"
                )}
              >
                {option.label}
              </li>
            ))}
            {options.length === 0 && <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</li>}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── condition ── */

function ConditionBlock({ step }: { step: ConditionStep }) {
  const { focusId, update, remove, draftAtEnd } = useBuilder();
  const set = (patch: Partial<ConditionStep>) => update(step.id, (s) => ({ ...(s as ConditionStep), ...patch }));
  const hasElse = step.else !== undefined;

  return (
    <div className="flex flex-col">
      <BranchHeader
        icon={ArrowRightFromLine}
        label="IF"
        menuLabel="Condition options"
        items={[
          hasElse
            ? { label: "Remove ELSE branch", onSelect: () => set({ else: undefined }) }
            : { label: "Add ELSE branch", onSelect: () => set({ else: [{ id: newId("step"), kind: "instruction", content: [""] }] }) },
          step.mode === "text"
            ? { label: "Write as code", onSelect: () => set({ mode: "code" }) }
            : { label: "Write in plain language", onSelect: () => set({ mode: "text" }) },
          { label: "Delete condition", destructive: true, onSelect: () => remove(step.id) },
        ]}
      />

      <BranchBody onAdd={() => draftAtEnd(step.id, "then")} addLabel="Add a step to this condition">
        <ConditionField
          value={step.condition}
          mode={step.mode}
          autoFocus={focusId === step.id}
          onChange={(condition) => set({ condition })}
          onToggleMode={() => set({ mode: step.mode === "text" ? "code" : "text" })}
        />
        <div className="mt-3">
          <StepList steps={step.then} parentId={step.id} branch="then" />
        </div>
      </BranchBody>

      <AnimatePresence initial={false}>
        {hasElse && (
          <motion.div
            key="else"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <BranchHeader
              icon={CornerDownRight}
              label="ELSE"
              menuLabel="Else options"
              items={[{ label: "Remove ELSE branch", destructive: true, onSelect: () => set({ else: undefined }) }]}
            />
            <BranchBody onAdd={() => draftAtEnd(step.id, "else")} addLabel="Add a step to the else branch">
              <div className="pt-1">
                <StepList steps={step.else ?? []} parentId={step.id} branch="else" />
              </div>
            </BranchBody>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BranchHeader({
  icon,
  label,
  menuLabel,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  menuLabel: string;
  items: MenuItem[];
}) {
  return (
    <div className="flex items-center gap-2">
      <StepBadge icon={icon} className={BADGE.condition} />
      <span className="font-mono text-[13px] font-medium tracking-wide">{label}</span>
      <KebabMenu label={menuLabel} items={items} />
    </div>
  );
}

function BranchBody({ children, onAdd, addLabel }: { children: React.ReactNode; onAdd: () => void; addLabel: string }) {
  return (
    // The rail runs down from the centre of the 1.5rem badge.
    <div className="relative ml-3 border-l border-border pb-10 pl-5 pt-2">
      {children}
      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel}
        className="absolute bottom-0 left-0 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border bg-background text-foreground/80 shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function ConditionField({
  value,
  mode,
  autoFocus,
  onChange,
  onToggleMode,
}: {
  value: string;
  mode: "text" | "code";
  autoFocus: boolean;
  onChange: (value: string) => void;
  onToggleMode: () => void;
}) {
  const code = mode === "code";
  return (
    <div className="group/condition relative rounded-xl border bg-card px-3.5 py-2.5 pr-11 shadow-xs transition-shadow focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/15">
      <div className="relative">
        {code && (
          <pre
            aria-hidden
            className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-6"
          >
            <HighlightedCode source={value} />
            {/* Keeps a trailing newline from collapsing the overlay height. */}{" "}
          </pre>
        )}
        <AutoTextarea
          value={value}
          autoFocus={autoFocus}
          aria-label={code ? "Condition expression" : "Condition"}
          placeholder={code ? "order.total > 100" : "Describe when this applies, e.g. the customer reports a damaged item"}
          spellCheck={!code}
          onChange={onChange}
          className={cn(
            code
              ? "font-mono text-[13px] leading-6 text-transparent caret-foreground selection:bg-blue-500/25"
              : "leading-7 text-foreground/90"
          )}
        />
      </div>
      <button
        type="button"
        onClick={onToggleMode}
        aria-pressed={code}
        aria-label={code ? "Write in plain language" : "Write as code"}
        title={code ? "Write in plain language" : "Write as code"}
        className={cn(
          "absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border bg-background text-foreground/70 transition-[opacity,background-color] hover:bg-muted focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          code ? "opacity-100" : "opacity-0 group-hover/condition:opacity-100 group-focus-within/condition:opacity-100"
        )}
      >
        <Code className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

const CODE_KEYWORDS = new Set(["and", "or", "not", "in", "true", "false", "null"]);

function HighlightedCode({ source }: { source: string }) {
  const tokens = source.match(/\s+|"[^"]*"?|'[^']*'?|\d+(?:\.\d+)?|[A-Za-z_][\w.]*|./g) ?? [];
  return tokens.map((token, i) => {
    let className = "text-muted-foreground";
    if (/^\s+$/.test(token)) className = "";
    else if (/^["']/.test(token)) className = "text-emerald-700 dark:text-emerald-400";
    else if (/^\d/.test(token)) className = "text-amber-700 dark:text-amber-400";
    else if (CODE_KEYWORDS.has(token)) className = "text-foreground";
    else if (/^[A-Za-z_]/.test(token)) className = "text-blue-700 dark:text-blue-400";
    return (
      <span key={i} className={className}>
        {token}
      </span>
    );
  });
}

/* ── shared bits ── */

function StepBadge({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className: string }) {
  return (
    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", className)}>
      <Icon className="size-3.5" aria-hidden />
    </span>
  );
}

/** Row wrapper with a hover-revealed remove button. */
function StepShell({ children, onRemove, label }: { children: React.ReactNode; onRemove: () => void; label: string }) {
  return (
    <div className="group/step relative pr-8">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="absolute right-0 top-0.5 flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/step:opacity-100"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

interface MenuItem {
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

function KebabMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = React.useId();

  useDismiss(rootRef, open, () => setOpen(false));

  React.useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = items.length - 1;
    if (event.key === "ArrowDown") setActive((i) => (i === last ? 0 : i + 1));
    else if (event.key === "ArrowUp") setActive((i) => (i === 0 ? last : i - 1));
    else if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(last);
    else if (event.key === "Escape") close();
    else if (event.key === "Tab") setOpen(false);
    else return;
    if (event.key !== "Tab") event.preventDefault();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setActive(0);
          setOpen((o) => !o);
        }}
        className="flex size-6 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <EllipsisVertical className="size-3.5" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-full z-30 mt-1 min-w-48 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={index === active ? 0 : -1}
                onPointerMove={() => setActive(index)}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm focus:bg-muted focus:outline-none",
                  item.destructive && "text-red-600 dark:text-red-400"
                )}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AutoTextarea({
  value,
  onChange,
  autoFocus,
  className,
  ...props
}: Omit<React.ComponentProps<"textarea">, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "block w-full resize-none overflow-hidden bg-transparent p-0 placeholder:text-muted-foreground focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
  const onDismissRef = React.useRef(onDismiss);
  React.useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onDismissRef.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, ref]);
}
