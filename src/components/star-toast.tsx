"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Star, X } from "lucide-react";

import { GithubMark } from "@/components/github-mark";

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";
const STORAGE_KEY = "star-toast-dismissed";
const SHOW_DELAY_MS = 4000;

// A one-off "star the repo" nudge in the bottom-right corner. It waits a few
// seconds before appearing, and once closed (or clicked) it stays gone.
export function StarToast() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    const timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  // The workspace is a full-screen app with its own chrome.
  const hidden = pathname.startsWith("/workspace");

  return (
    <AnimatePresence>
      {open && !hidden && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed right-4 bottom-4 z-30 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border bg-background p-3 pr-2 shadow-lg sm:right-6 sm:bottom-6"
        >
          <div className="hidden size-9 shrink-0 items-center justify-center rounded-full border sm:flex">
            <GithubMark className="size-4" />
          </div>
          <p className="flex-1 text-sm font-medium whitespace-nowrap">Enjoying AI Patterns?</p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={dismiss}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <Star className="size-3.5" />
            Star on GitHub
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
