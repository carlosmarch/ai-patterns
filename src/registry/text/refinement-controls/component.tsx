"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlignJustify,
  AlignLeft,
  ArrowUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  List,
  PenLine,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface Refinement {
  /** Instruction passed to `onRefine`, e.g. "Shorten". */
  label: string;
  /** Present-progressive form shown while the request runs, e.g. "Shortening". */
  progress: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface RefinementControlsProps {
  /** The first AI draft — version 1. */
  text: string;
  onRefine: (text: string, instruction: string) => string | Promise<string>;
  /** Refinements shown as always-visible chips. */
  primary?: Refinement[];
  /** Refinements tucked into the "More" menu. */
  more?: Refinement[];
  placeholder?: string;
  className?: string;
}

export const DEFAULT_PRIMARY: Refinement[] = [
  { label: "Match writing style", progress: "Matching your style", icon: PenLine },
  { label: "Rephrase", progress: "Rephrasing", icon: WandSparkles },
];

export const DEFAULT_MORE: Refinement[] = [
  { label: "Shorten", progress: "Shortening", icon: AlignLeft },
  { label: "Elaborate", progress: "Elaborating", icon: AlignJustify },
  { label: "More formal", progress: "Making it more formal", icon: Briefcase },
  { label: "Bulletize", progress: "Bulletizing", icon: List },
  { label: "Summarize", progress: "Summarizing", icon: FileText },
];

interface Version {
  text: string;
  /** The refinement that produced this version; null for the original draft. */
  label: string | null;
}

export function RefinementControls({
  text,
  onRefine,
  primary = DEFAULT_PRIMARY,
  more = DEFAULT_MORE,
  placeholder = "Format this by…",
  className,
}: RefinementControlsProps) {
  const [versions, setVersions] = React.useState<Version[]>([{ text, label: null }]);
  const [index, setIndex] = React.useState(0);
  const [pending, setPending] = React.useState<string | null>(null);
  const [instruction, setInstruction] = React.useState("");

  const current = versions[index];
  const busy = pending !== null;

  async function refine(label: string, progress: string) {
    if (busy) return;
    setPending(progress);
    try {
      const result = await onRefine(current.text, label);
      // `busy` blocks concurrent refinements, so `versions` is current here.
      setVersions((prev) => [...prev, { text: result, label }]);
      setIndex(versions.length);
    } finally {
      setPending(null);
    }
  }

  function submitInstruction() {
    const trimmed = instruction.trim();
    if (!trimmed || busy) return;
    setInstruction("");
    refine(trimmed, "Applying your instruction");
  }

  return (
    <div className={cn("w-full rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <span className="truncate text-xs text-muted-foreground">
          {current.label ?? "Original draft"}
        </span>
        {versions.length > 1 && (
          <VersionStepper
            index={index}
            total={versions.length}
            disabled={busy}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(versions.length - 1, i + 1))}
          />
        )}
      </div>

      <div className="relative px-4 pb-4 pt-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            aria-busy={busy}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: busy ? 0.45 : 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="whitespace-pre-line text-sm leading-relaxed text-foreground/90"
          >
            {current.text}
          </motion.div>
        </AnimatePresence>
        <div role="status" aria-live="polite" className="h-0">
          <AnimatePresence>
            {pending && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-1.5 left-4 flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <WandSparkles className="size-3.5 animate-pulse" aria-hidden />
                {pending}…
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="rounded-b-2xl border-t bg-muted/30">
        <div className="flex flex-wrap items-center gap-1 px-2 pt-2" role="toolbar" aria-label="Refine output">
          {primary.map((r) => (
            <ChipButton key={r.label} icon={r.icon} disabled={busy} onClick={() => refine(r.label, r.progress)}>
              {r.label}
            </ChipButton>
          ))}
          {more.length > 0 && (
            <MoreMenu items={more} disabled={busy} onSelect={(r) => refine(r.label, r.progress)} />
          )}
        </div>

        <form
          className="flex items-center gap-2 px-2 pb-2 pt-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            submitInstruction();
          }}
        >
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={busy}
            placeholder={placeholder}
            aria-label="Describe how to refine the output"
            className="min-w-0 flex-1 rounded-full bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="Apply instruction"
            disabled={busy || !instruction.trim()}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-25"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}

function ChipButton({
  icon: Icon,
  disabled,
  onClick,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
  );
}

function MoreMenu({
  items,
  disabled,
  onSelect,
}: {
  items: Refinement[];
  disabled?: boolean;
  onSelect: (r: Refinement) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    const focused = itemRefs.current.findIndex((el) => el === document.activeElement);
    const move = (to: number) => itemRefs.current[(to + items.length) % items.length]?.focus();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(focused + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(focused - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(items.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
          open && "bg-accent text-foreground"
        )}
      >
        More
        <ChevronUp className={cn("size-3.5 transition-transform", !open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="More refinements"
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-52 origin-bottom-left overflow-hidden rounded-xl border bg-popover py-1 shadow-lg"
          >
            {items.map((r, i) => (
              <button
                key={r.label}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(true);
                  onSelect(r);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground/90 outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <r.icon className="size-4 text-muted-foreground" aria-hidden />
                {r.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VersionStepper({
  index,
  total,
  disabled,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
      <button
        type="button"
        aria-label="Previous version"
        disabled={disabled || index === 0}
        onClick={onPrev}
        className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
      </button>
      <span className="tabular-nums" aria-live="polite">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        aria-label="Next version"
        disabled={disabled || index === total - 1}
        onClick={onNext}
        className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
