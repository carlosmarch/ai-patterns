"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, CircleHelp, Loader2, RotateCcw, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectionActionsProps {
  text: string;
  onExplain?: (selection: string) => string | Promise<string>;
  onRewrite: (selection: string, instruction: string) => string | Promise<string>;
  className?: string;
}

const QUICK_EDITS = ["Fix grammar", "Shorten", "Make more formal"];
const TOOLBAR_WIDTH = 320;
const REVIEW_WIDTH = 200;
const MARGIN = 8;
const DEFAULT_INSTRUCTION = "Improve the clarity and flow of this passage.";

interface Anchor {
  top: number;
  bottom: number;
  left: number;
}

interface Selection {
  start: number;
  end: number;
  text: string;
}

interface Review {
  start: number;
  end: number;
  original: string;
  instruction: string;
  candidate: string | null;
}

export function SelectionActions({ text, onExplain, onRewrite, className }: SelectionActionsProps) {
  const [value, setValue] = React.useState(text);
  const [selection, setSelection] = React.useState<Selection | null>(null);
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const [instruction, setInstruction] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [review, setReview] = React.useState<Review | null>(null);
  const [reviewAnchor, setReviewAnchor] = React.useState<Anchor | null>(null);

  const containerRef = React.useRef<HTMLParagraphElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const candidateRef = React.useRef<HTMLElement>(null);
  const mounted = useMounted();

  const clearSelectionState = React.useCallback(() => {
    setSelection(null);
    setAnchor(null);
    setInstruction("");
    setExpanded(false);
    setExplanation(null);
  }, []);

  const updateFromDom = React.useCallback(
    (target: Node) => {
      const container = containerRef.current;
      const insideToolbar = toolbarRef.current?.contains(target);
      const insideContainer = container?.contains(target);

      if (!insideToolbar && !insideContainer) {
        clearSelectionState();
        return;
      }
      if (insideToolbar) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !container) {
        clearSelectionState();
        return;
      }
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) {
        clearSelectionState();
        return;
      }
      const { start, end } = offsetsWithin(container, range);
      if (start === end) {
        clearSelectionState();
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelection({ start, end, text: value.slice(start, end) });
      setAnchor({ top: rect.top, bottom: rect.bottom, left: rect.left + rect.width / 2 });
      setExpanded(false);
      setExplanation(null);
    },
    [value, clearSelectionState]
  );

  React.useEffect(() => {
    if (review) return;
    function handlePointerUp(e: PointerEvent) {
      updateFromDom(e.target as Node);
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.getSelection()?.removeAllRanges();
        clearSelectionState();
        return;
      }
      if (e.key.startsWith("Arrow") || e.key === "Shift") updateFromDom(e.target as Node);
    }
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [review, updateFromDom, clearSelectionState]);

  React.useLayoutEffect(() => {
    if (!review || !candidateRef.current) return;
    const rect = candidateRef.current.getBoundingClientRect();
    setReviewAnchor({ top: rect.top, bottom: rect.bottom, left: rect.left + rect.width / 2 });
  }, [review, review?.candidate]);

  async function runRewrite(rawInstruction: string) {
    if (!selection) return;
    const instructionToUse = rawInstruction.trim() || DEFAULT_INSTRUCTION;
    const { start, end, text: original } = selection;
    window.getSelection()?.removeAllRanges();
    clearSelectionState();
    setReview({ start, end, original, instruction: instructionToUse, candidate: null });
    const result = await onRewrite(original, instructionToUse);
    setReview((prev) => (prev && prev.start === start && prev.end === end ? { ...prev, candidate: result } : prev));
  }

  function retry() {
    if (!review) return;
    const { start, end, original, instruction: usedInstruction } = review;
    setReview((prev) => (prev ? { ...prev, candidate: null } : prev));
    Promise.resolve(onRewrite(original, usedInstruction)).then((result) => {
      setReview((prev) => (prev && prev.start === start && prev.end === end ? { ...prev, candidate: result } : prev));
    });
  }

  function keep() {
    if (!review || review.candidate == null) return;
    const { start, end, candidate } = review;
    setValue((prev) => prev.slice(0, start) + candidate + prev.slice(end));
    setReview(null);
    setReviewAnchor(null);
  }

  function discard() {
    setReview(null);
    setReviewAnchor(null);
  }

  async function explain() {
    if (!selection || !onExplain) return;
    const result = await onExplain(selection.text);
    setExplanation(result);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <p ref={containerRef} className="select-text text-base leading-relaxed text-foreground/90">
        {renderContent(value, review, candidateRef)}
      </p>

      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {selection && anchor && !review && (
                <FloatingToolbar
                  ref={toolbarRef}
                  anchor={anchor}
                  instruction={instruction}
                  onInstructionChange={setInstruction}
                  onSubmitInstruction={() => runRewrite(instruction)}
                  hasExplain={!!onExplain}
                  onExplain={explain}
                  onImprove={() => runRewrite(DEFAULT_INSTRUCTION)}
                  onQuickEdit={runRewrite}
                  expanded={expanded}
                  onToggleExpanded={() => setExpanded((v) => !v)}
                  explanation={explanation}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {review && reviewAnchor && (
                <ReviewToolbar
                  anchor={reviewAnchor}
                  loading={review.candidate == null}
                  onKeep={keep}
                  onDiscard={discard}
                  onRetry={retry}
                />
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}

function renderContent(
  value: string,
  review: Review | null,
  candidateRef: React.RefObject<HTMLElement | null>
) {
  if (!review) return value;

  const before = value.slice(0, review.start);
  const after = value.slice(review.end);
  const loading = review.candidate == null;

  return (
    <>
      {before}
      <mark
        ref={candidateRef}
        aria-busy={loading}
        className={cn(
          "rounded px-0.5",
          loading
            ? "animate-pulse bg-muted text-muted-foreground"
            : "bg-blue-100 text-foreground dark:bg-blue-500/20"
        )}
      >
        {loading ? review.original : review.candidate}
      </mark>
      {after}
    </>
  );
}

const FloatingToolbar = React.forwardRef<
  HTMLDivElement,
  {
    anchor: Anchor;
    instruction: string;
    onInstructionChange: (v: string) => void;
    onSubmitInstruction: () => void;
    hasExplain: boolean;
    onExplain: () => void;
    onImprove: () => void;
    onQuickEdit: (instruction: string) => void;
    expanded: boolean;
    onToggleExpanded: () => void;
    explanation: string | null;
  }
>(function FloatingToolbar(
  {
    anchor,
    instruction,
    onInstructionChange,
    onSubmitInstruction,
    hasExplain,
    onExplain,
    onImprove,
    onQuickEdit,
    expanded,
    onToggleExpanded,
    explanation,
  },
  ref
) {
  const left = clampCenterX(anchor.left, TOOLBAR_WIDTH);

  return (
    <motion.div
      ref={ref}
      role="toolbar"
      aria-label="Selection actions"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14 }}
      style={{ position: "fixed", top: anchor.bottom + MARGIN, left, width: TOOLBAR_WIDTH, transform: "translateX(-50%)" }}
      className="z-50"
    >
      <div className="flex items-center gap-1 rounded-full border bg-popover px-1.5 py-1 shadow-md">
        <input
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && instruction.trim()) onSubmitInstruction();
          }}
          placeholder="Describe edits"
          aria-label="Describe edits"
          className="min-w-0 flex-1 bg-transparent px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        {hasExplain && (
          <>
            <Divider />
            <ToolbarButton icon={CircleHelp} label="Explain" onClick={onExplain} />
          </>
        )}
        <Divider />
        <ToolbarButton icon={Sparkles} label="Improve" onClick={onImprove} />
        <Divider />
        <button
          type="button"
          aria-label={expanded ? "Fewer quick edits" : "More quick edits"}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} aria-hidden />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="mt-1.5 overflow-hidden rounded-xl border bg-popover shadow-md"
          >
            {QUICK_EDITS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onQuickEdit(q)}
                className="block w-full px-3 py-2 text-left text-xs text-foreground/90 hover:bg-accent"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {explanation && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="mt-1.5 rounded-xl border bg-popover p-3 text-xs text-foreground/90 shadow-md"
          >
            {explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function Divider() {
  return <span className="h-4 w-px shrink-0 bg-border" aria-hidden />;
}

function ReviewToolbar({
  anchor,
  loading,
  onKeep,
  onDiscard,
  onRetry,
}: {
  anchor: Anchor;
  loading: boolean;
  onKeep: () => void;
  onDiscard: () => void;
  onRetry: () => void;
}) {
  const left = clampCenterX(anchor.left, REVIEW_WIDTH);

  return (
    <motion.div
      role="toolbar"
      aria-label="Review suggested edit"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14 }}
      style={{ position: "fixed", top: anchor.bottom + MARGIN, left, transform: "translateX(-50%)" }}
      className="z-50 flex items-center gap-1 rounded-full border bg-popover p-1 shadow-md"
    >
      <button
        type="button"
        disabled={loading}
        onClick={onKeep}
        className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
      >
        <Check className="size-3.5" aria-hidden />
        Keep
      </button>
      <button
        type="button"
        onClick={onDiscard}
        className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden />
        Discard
      </button>
      <span className="h-4 w-px bg-border" aria-hidden />
      <button
        type="button"
        aria-label="Retry"
        disabled={loading}
        onClick={onRetry}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
      </button>
    </motion.div>
  );
}

function offsetsWithin(container: HTMLElement, range: Range) {
  const pre = document.createRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  return { start, end: start + range.toString().length };
}

function clampCenterX(centerX: number, width: number) {
  if (typeof window === "undefined") return centerX;
  return Math.min(Math.max(centerX, width / 2 + MARGIN), window.innerWidth - width / 2 - MARGIN);
}

/** True only once the client has rendered — lets a portal target `document.body` without an SSR mismatch. */
function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
