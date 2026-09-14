"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { WifiOff, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ConnectivityErrorProps {
  title?: string;
  description?: string;
  detailsLabel?: string;
  retryLabel?: string;
  onViewDetails?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export function ConnectivityError({
  title = "Connection lost",
  description = "Check your internet connection, VPN or proxy and try again.",
  detailsLabel = "View details",
  retryLabel = "Try again",
  onViewDetails,
  onRetry,
  onClose,
  className,
}: ConnectivityErrorProps) {
  const [visible, setVisible] = React.useState(true);

  function handleClose() {
    setVisible(false);
    onClose?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="alert"
          aria-live="assertive"
          className={cn(
            "flex w-full flex-wrap items-center gap-x-4 gap-y-2 overflow-hidden rounded-lg border border-border bg-background px-4 py-2.5 text-foreground",
            className
          )}
        >
          {/* Message */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <WifiOff className="size-3.5 shrink-0 text-foreground" aria-hidden />
            <span className="truncate text-xs font-semibold text-foreground">{title}</span>
            <span className="truncate text-xs text-muted-foreground">{description}</span>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"
              >
                {detailsLabel}
              </button>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"
              >
                {retryLabel}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
