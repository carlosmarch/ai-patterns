"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RateLimitProps {
  label: string;
  resetTime?: string;
  resetAt?: Date;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}

function useCountdown(resetAt?: Date) {
  const getRemaining = () =>
    resetAt ? Math.max(0, Math.floor((resetAt.getTime() - Date.now()) / 1000)) : null;
  const [remaining, setRemaining] = React.useState(getRemaining);

  React.useEffect(() => {
    if (!resetAt) return;
    const id = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(id);
  }, [resetAt]);

  if (remaining === null) return null;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RateLimit({
  label,
  resetTime,
  resetAt,
  upgradeLabel = "Get more usage",
  onUpgrade,
  onDismiss,
  className,
}: RateLimitProps) {
  const [visible, setVisible] = React.useState(true);
  const countdown = useCountdown(resetAt);

  const resetLabel = countdown ? `Resets in ${countdown}` : resetTime ? `Resets at ${resetTime}` : null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-2.5",
            className
          )}
        >
          <PulsingIcon />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-xs font-medium text-foreground">{label}</span>
            {resetLabel && (
              <span className="shrink-0 text-xs text-muted-foreground" aria-label={resetLabel}>
                {resetLabel}
              </span>
            )}
          </div>

          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="shrink-0 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              {upgradeLabel}
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PulsingIcon() {
  return (
    <span className="relative flex size-4 shrink-0 items-center justify-center" aria-hidden>
      <span className="absolute size-3.5 animate-ping rounded-full bg-foreground/10" />
      <span className="relative flex size-4 items-center justify-center rounded-full">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-foreground/60">
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <path
            d="M5.2 10.8a4 4 0 0 1 0-5.6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M10.8 10.8a4 4 0 0 0 0-5.6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M3.4 12.6a6.5 6.5 0 0 1 0-9.2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M12.6 12.6a6.5 6.5 0 0 0 0-9.2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </span>
    </span>
  );
}
