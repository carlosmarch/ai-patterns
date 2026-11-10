"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Copy, Link2, RefreshCw, ThumbsDown, ThumbsUp, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ResponseRating = "up" | "down" | null;

export interface ResponseFeedback {
  rating: Exclude<ResponseRating, null>;
  reasons: string[];
  note: string;
}

export interface RegenerateOption {
  id: string;
  label: string;
  /** Shown under the label, e.g. "Faster, less detail". */
  hint?: string;
}

export interface ResponseActionsProps {
  /** The reply as plain text or Markdown, for Copy. */
  text: string;
  rating?: ResponseRating;
  onRate?: (rating: ResponseRating) => void;
  /** Called when the person sends a reason for a thumbs-down (or skips it). */
  onFeedback?: (feedback: ResponseFeedback) => void;
  /** Reasons offered after a thumbs-down. */
  reasons?: string[];
  /** Called with no option for a plain "Try again", or with the chosen option. */
  onRegenerate?: (option?: RegenerateOption) => void;
  /** Extra ways to regenerate, listed in the menu under "Try again". */
  regenerateOptions?: RegenerateOption[];
  /** True while a new version is being generated. */
  regenerating?: boolean;
  /** Returns a share link; Share is hidden without it. */
  onShare?: () => string | Promise<string>;
  className?: string;
}

const DEFAULT_REASONS = ["Not accurate", "Didn't follow instructions", "Too long", "Too vague", "Unsafe or offensive"];

export function ResponseActions({
  text,
  rating = null,
  onRate,
  onFeedback,
  reasons = DEFAULT_REASONS,
  onRegenerate,
  regenerateOptions = [],
  regenerating = false,
  onShare,
  className,
}: ResponseActionsProps) {
  const [flash, setFlash] = React.useState<"copied" | "linked" | "thanks" | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const flashTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(flashTimer.current), []);

  function showFlash(kind: NonNullable<typeof flash>) {
    clearTimeout(flashTimer.current);
    setFlash(kind);
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      showFlash("copied");
    } catch {
      // Clipboard can be blocked (permissions, insecure context); stay quiet.
    }
  }

  async function share() {
    if (!onShare) return;
    try {
      const url = await onShare();
      await navigator.clipboard.writeText(url);
      showFlash("linked");
    } catch {
      // Leave the button as it was; the host can surface its own error.
    }
  }

  function rate(next: Exclude<ResponseRating, null>) {
    const value = rating === next ? null : next;
    onRate?.(value);
    if (value === "down") setFeedbackOpen(true);
    else {
      setFeedbackOpen(false);
      if (value === "up") showFlash("thanks");
    }
  }

  const status =
    flash === "copied" ? "Copied" : flash === "linked" ? "Link copied" : flash === "thanks" ? "Thanks for the feedback" : "";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div role="toolbar" aria-label="Response actions" className="flex items-center gap-0.5 text-muted-foreground">
        <IconAction label={flash === "copied" ? "Copied" : "Copy"} onClick={copy}>
          <SwapIcon active={flash === "copied"} on={<Check />} off={<Copy />} />
        </IconAction>

        {onRate && (
          <>
            <IconAction label="Good response" pressed={rating === "up"} onClick={() => rate("up")}>
              <ThumbsUp className={cn(rating === "up" && "fill-current")} />
            </IconAction>
            <IconAction
              label="Bad response"
              pressed={rating === "down"}
              expanded={feedbackOpen}
              onClick={() => rate("down")}
            >
              <ThumbsDown className={cn(rating === "down" && "fill-current")} />
            </IconAction>
          </>
        )}

        {onShare && (
          <IconAction label={flash === "linked" ? "Link copied" : "Copy share link"} onClick={share}>
            <SwapIcon active={flash === "linked"} on={<Check />} off={<Link2 />} />
          </IconAction>
        )}

        {onRegenerate && (
          <RegenerateButton options={regenerateOptions} busy={regenerating} onRegenerate={onRegenerate} />
        )}

        <span aria-live="polite" className="ml-1.5 text-xs">
          <AnimatePresence mode="wait">
            {status && (
              <motion.span
                key={status}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {status}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      <AnimatePresence initial={false}>
        {feedbackOpen && (
          <FeedbackPanel
            reasons={reasons}
            onClose={() => setFeedbackOpen(false)}
            onSend={(picked, note) => {
              onFeedback?.({ rating: "down", reasons: picked, note });
              setFeedbackOpen(false);
              showFlash("thanks");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IconAction({
  label,
  pressed,
  expanded,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  expanded?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground [&_svg]:size-4",
        pressed && "text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/** Cross-fades between two icons, e.g. Copy → Check. */
function SwapIcon({ active, on, off }: { active: boolean; on: React.ReactNode; off: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={active ? "on" : "off"}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.15 }}
        className="flex"
        aria-hidden
      >
        {active ? on : off}
      </motion.span>
    </AnimatePresence>
  );
}

function RegenerateButton({
  options,
  busy,
  onRegenerate,
}: {
  options: RegenerateOption[];
  busy: boolean;
  onRegenerate: (option?: RegenerateOption) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = React.useId();
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;
    itemsRef.current[0]?.focus();
    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function pick(option?: RegenerateOption) {
    setOpen(false);
    onRegenerate(option);
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const items = itemsRef.current.filter(Boolean) as HTMLButtonElement[];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      items[e.key === "Home" ? 0 : items.length - 1]?.focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close();
    }
  }

  const icon = (
    <motion.span
      className="flex"
      animate={busy && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={busy ? { duration: 0.9, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
      aria-hidden
    >
      <RefreshCw className="size-4" />
    </motion.span>
  );

  if (!options.length) {
    return (
      <IconAction label={busy ? "Regenerating" : "Regenerate"} onClick={() => !busy && onRegenerate()}>
        {icon}
      </IconAction>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-busy={busy}
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none"
      >
        {icon}
        {busy ? "Regenerating…" : "Regenerate"}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label="Regenerate"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 z-20 mt-1 w-56 origin-top-left rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10"
          >
            <MenuItem ref={(el) => { itemsRef.current[0] = el; }} label="Try again" hint="Same prompt, new answer" onSelect={() => pick()} />
            <div role="separator" className="my-1 h-px bg-border" />
            {options.map((option, i) => (
              <MenuItem
                key={option.id}
                ref={(el) => { itemsRef.current[i + 1] = el; }}
                label={option.label}
                hint={option.hint}
                onSelect={() => pick(option)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  ref,
  label,
  hint,
  onSelect,
}: {
  ref: React.Ref<HTMLButtonElement>;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={onSelect}
      className="flex w-full flex-col items-start rounded-lg px-2.5 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
    >
      <span>{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

function FeedbackPanel({
  reasons,
  onSend,
  onClose,
}: {
  reasons: string[];
  onSend: (reasons: string[], note: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");
  const headingId = React.useId();
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      aria-labelledby={headingId}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center justify-between gap-2">
          <h3 id={headingId} className="text-sm font-medium">
            What went wrong?
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>

        <div role="group" aria-label="Reasons" className="flex flex-wrap gap-1.5">
          {reasons.map((reason) => {
            const on = picked.includes(reason);
            return (
              <button
                key={reason}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked((p) => (on ? p.filter((r) => r !== reason) : [...p, reason]))}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs transition-colors bg-muted",
                  on ? "bg-foreground text-background" : "hover:bg-foreground/10"
                )}
              >
                {reason}
              </button>
            );
          })}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          aria-label="Anything else? (optional)"
          placeholder="Anything else? (optional)"
          className="resize-none rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-foreground/30 bg-muted focus:bg-background"
        />

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">Sent with this conversation to help improve answers.</p>
          <button
            type="button"
            onClick={() => onSend(picked, note.trim())}
            className="shrink-0 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
          >
            {picked.length || note.trim() ? "Send" : "Skip"}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
