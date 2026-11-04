"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
