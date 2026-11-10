"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AiDisclosureDetails {
  /** The model or feature that produced the content. */
  model?: string;
  /** When it was generated, already formatted ("Today, 14:02"). */
  generatedAt?: string;
  /** Who reviewed or edited it after generation. Changes the label to "AI-assisted". */
  editedBy?: string;
  /** A short caveat, such as "May contain mistakes. Check important facts." */
  note?: string;
}

export interface AiDisclosureBadgeProps {
  /** Defaults to "AI-generated", or "AI-assisted" once a person has edited it. */
  label?: string;
  details?: AiDisclosureDetails;
  /**
   * "chip" — a bordered pill next to a title or in a card header.
   * "overlay" — a translucent pill for the corner of an image or video.
   * "inline" — icon and label only, for a byline or under a paragraph.
   */
  variant?: "chip" | "overlay" | "inline";
  className?: string;
}

export function AiDisclosureBadge({ label, details, variant = "chip", className }: AiDisclosureBadgeProps) {
  const [open, setOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const closeTimer = React.useRef<number | undefined>(undefined);
  const id = React.useId();

  const text = label ?? (details?.editedBy ? "AI-assisted" : "AI-generated");
  const hasDetails = Boolean(details && (details.model || details.generatedAt || details.editedBy || details.note));

  React.useEffect(() => {
    if (!pinned) return;
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setPinned(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [pinned]);

  React.useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function show() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hide() {
    if (pinned) return;
    // A short delay lets the pointer travel from the badge into the card.
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  }

  const badgeClass = cn(
    "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap",
    variant === "chip" && "rounded-full px-2 py-0.5 text-muted-foreground bg-muted",
    variant === "overlay" && "rounded-full bg-black/55 px-2 py-0.5 text-white backdrop-blur-sm",
    variant === "inline" && "text-muted-foreground",
    hasDetails && "cursor-pointer transition-colors",
    hasDetails && variant === "chip" && "hover:text-foreground",
    hasDetails && variant === "inline" && "underline decoration-dotted underline-offset-2 hover:text-foreground"
  );

  const content = (
    <>
      <Sparkles className="size-3" aria-hidden />
      {text}
    </>
  );

  if (!hasDetails) {
    return <span className={cn(badgeClass, className)}>{content}</span>;
  }

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-details`}
        onClick={() => {
          // Hover previews the card; a click pins it open until the next click.
          setPinned(!pinned);
          setOpen(!pinned);
        }}
        onFocus={show}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node)) {
            setPinned(false);
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setPinned(false);
            setOpen(false);
          }
        }}
        className={cn(badgeClass, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring")}
      >
        {content}
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            id={`${id}-details`}
            role="note"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute top-full left-0 z-20 mt-1.5 block w-60 rounded-2xl bg-popover p-3 text-left text-xs font-normal whitespace-normal text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10"
          >
            <span className="block font-medium text-foreground">
              {details?.editedBy ? "Created with AI, reviewed by a person" : "Created with AI"}
            </span>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {details?.model && <Row term="Model" value={details.model} />}
              {details?.generatedAt && <Row term="Generated" value={details.generatedAt} />}
              {details?.editedBy && <Row term="Edited by" value={details.editedBy} />}
            </dl>
            {details?.note && <span className="mt-2 block border-t pt-2 text-pretty text-muted-foreground">{details.note}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="text-foreground">{value}</dd>
    </>
  );
}
