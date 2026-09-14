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
            "w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-sm",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2">
              <WifiOff className="size-4 shrink-0 text-foreground" aria-hidden />
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>

          {/* Description */}
          <p className="px-4 pb-3.5 text-sm text-muted-foreground">{description}</p>

          {/* Actions */}
          {(onViewDetails || onRetry) && (
            <div className="flex items-center justify-between px-4 pb-3.5">
              {onViewDetails ? (
                <button
                  type="button"
                  onClick={onViewDetails}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {detailsLabel}
                </button>
              ) : (
                <span />
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {retryLabel}
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
