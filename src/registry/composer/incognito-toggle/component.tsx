"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface IncognitoToggleProps {
  active: boolean;
  onActiveChange: (active: boolean) => void;
  label?: string;
  /** Hide the label and show the icon only, e.g. in a crowded header. */
  iconOnly?: boolean;
  className?: string;
}

/** The header control that starts or ends a temporary chat. */
export function IncognitoToggle({
  active,
  onActiveChange,
  label = "Temporary chat",
  iconOnly,
  className,
}: IncognitoToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      onClick={() => onActiveChange(!active)}
      className={cn(
        "relative inline-flex h-8 items-center gap-1.5 rounded-full border text-xs font-medium transition-colors",
        iconOnly ? "w-8 justify-center" : "px-3",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="flex"
      >
        <EyeOff className="size-3.5" aria-hidden />
      </motion.span>
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}

export interface TemporaryChatBannerProps {
  active: boolean;
  title?: string;
  /** What is and isn't kept. Be specific: this is the promise users rely on. */
  description?: string;
  onExit?: () => void;
  exitLabel?: string;
  className?: string;
}

/** The persistent notice shown for as long as the chat is temporary. */
export function TemporaryChatBanner({
  active,
  title = "Temporary chat",
  description = "This chat won't appear in your history, won't update memory and won't be used to train models. It may be kept for up to 30 days for safety.",
  onExit,
  exitLabel = "Exit",
  className,
}: TemporaryChatBannerProps) {
  return (
    <AnimatePresence initial={false}>
      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-dashed border-foreground/30 bg-muted/50 px-4 py-3",
              className
            )}
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <EyeOff className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs text-pretty text-muted-foreground">{description}</p>
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="shrink-0 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                {exitLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
