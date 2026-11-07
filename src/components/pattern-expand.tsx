"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** `?view=expanded` opens a pattern page straight into the expanded view, so it can be shared. */
const VIEW_PARAM = "view";
const EXPANDED_VALUE = "expanded";

interface PatternExpandState {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const PatternExpandContext = createContext<PatternExpandState | null>(null);

/**
 * Holds the "preview expanded to full width" state for the pattern detail
 * pages. It lives in the detail layout, which stays mounted while moving
 * between patterns, so prev/next keeps the preview expanded.
 */
export function PatternExpandProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Whether the URL asked to open expanded and the state hasn't caught up yet
  // (null until first read on mount). Read from window.location rather than
  // useSearchParams so the static export doesn't need a Suspense boundary.
  const pendingOpen = useRef<boolean | null>(null);

  // Keep the URL in step — on toggle and after prev/next — so it can be copied and shared.
  useEffect(() => {
    if (pendingOpen.current === null) {
      pendingOpen.current = new URLSearchParams(window.location.search).get(VIEW_PARAM) === EXPANDED_VALUE;
      if (pendingOpen.current) requestAnimationFrame(() => setExpanded(true));
    }
    if (pendingOpen.current) {
      if (!expanded) return;
      pendingOpen.current = false;
    }

    const url = new URL(window.location.href);
    const inUrl = url.searchParams.get(VIEW_PARAM) === EXPANDED_VALUE;
    if (inUrl === expanded) return;
    if (expanded) url.searchParams.set(VIEW_PARAM, EXPANDED_VALUE);
    else url.searchParams.delete(VIEW_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [expanded, pathname]);

  // The expanded preview covers the page, so stop the page behind it scrolling.
  useEffect(() => {
    if (!expanded) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [expanded]);

  return (
    <PatternExpandContext.Provider value={{ expanded, setExpanded }}>{children}</PatternExpandContext.Provider>
  );
}

export function usePatternExpand(): PatternExpandState {
  const ctx = useContext(PatternExpandContext);
  if (!ctx) throw new Error("usePatternExpand must be used inside <PatternExpandProvider>");
  return ctx;
}
