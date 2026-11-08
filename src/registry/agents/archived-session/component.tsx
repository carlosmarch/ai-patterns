"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Archive, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ArchivedSessionBannerProps {
  /** Whether the session is archived. While true the banner replaces the composer. */
  archived: boolean;
  /** Brings the session back. Resolve when it can take messages again; reject to show `error`. */
  onUnarchive: () => Promise<void> | void;
  /** Shown once the session is active again — usually the ordinary composer. */
  children: React.ReactNode;
  /** One sentence on what the person has to do ("Unarchive it to keep working in it."). */
  message?: string;
  /** Optional detail: when or why it was archived ("Archived after 7 days without activity."). */
  detail?: string;
  className?: string;
}

/**
 * Takes the composer's place in an archived session. The transcript stays
 * readable above it; the one action that makes the session writable again
 * sits right where the person was going to type.
 */
export function ArchivedSessionBanner({
  archived,
  onUnarchive,
  children,
  message = "This session is archived. Unarchive it to keep working in it.",
  detail,
  className,
}: ArchivedSessionBannerProps) {
  const reduce = useReducedMotion();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const wasArchived = React.useRef(archived);

  // When the session comes back, hand focus to whatever replaced the banner.
  React.useEffect(() => {
    if (wasArchived.current && !archived) {
      const el = wrapperRef.current?.querySelector<HTMLElement>("textarea, input, [contenteditable='true']");
      el?.focus();
    }
    wasArchived.current = archived;
  }, [archived]);

  async function unarchive() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await onUnarchive();
    } catch {
      setError("Couldn't unarchive the session. Try again.");
      buttonRef.current?.focus();
    } finally {
      setPending(false);
    }
  }

  const fade = reduce ? { opacity: 0 } : { opacity: 0, y: 6 };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {archived ? (
          <motion.div
            key="archived"
            role="status"
            initial={fade}
            animate={{ opacity: 1, y: 0 }}
            exit={fade}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col gap-3 rounded-2xl bg-muted px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              <Archive className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm">{message}</p>
                {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
                {error && (
                  <p role="alert" className="mt-0.5 text-xs text-destructive">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <button
              ref={buttonRef}
              type="button"
              onClick={unarchive}
              disabled={pending}
              aria-busy={pending}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 self-end rounded-lg bg-foreground/[0.06] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/10 disabled:opacity-70 sm:self-auto"
            >
              {pending && <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />}
              {pending ? "Unarchiving…" : "Unarchive"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={fade}
            animate={{ opacity: 1, y: 0 }}
            exit={fade}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
