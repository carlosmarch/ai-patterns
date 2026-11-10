"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { keepScrollOnNextNavigation } from "@/components/scroll-restoration";

/** `?view=expanded` opens a pattern page straight into the expanded view, so it can be shared. */
const VIEW_PARAM = "view";
const EXPANDED_VALUE = "expanded";

/** Where the expanded view returns to when it was opened from the gallery. */
export const GALLERY_HREF = "/gallery";

// Set by the gallery right before it navigates to a pattern. The provider
// reads it on mount to render expanded in the very first frame — that's what
// lets the gallery card's view transition pair with the expanded view. A
// module flag rather than state: on a hard load it's always false, so the
// static HTML and hydration agree.
let openingFromGallery = false;

/** Call right before navigating from the gallery to `/patterns/<category>/<slug>?view=expanded`. */
export function markOpeningFromGallery() {
  openingFromGallery = true;
}

/** The shared view-transition name of a pattern's gallery card and its expanded view. */
export function patternTransitionName(category: string, slug: string) {
  return `pattern-${category}-${slug}`;
}

interface PatternExpandState {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  /** Opened from the gallery: collapsing goes back there instead of to the page. */
  fromGallery: boolean;
}

const PatternExpandContext = createContext<PatternExpandState | null>(null);

/**
 * Holds the "preview expanded to full width" state for the pattern detail
 * pages. It lives in the detail layout, which stays mounted while moving
 * between patterns, so prev/next keeps the preview expanded.
 */
export function PatternExpandProvider({ children }: { children: ReactNode }) {
  // Not consumed in the initializer: Strict Mode runs initializers twice.
  const [fromGallery] = useState(() => openingFromGallery);
  const [expanded, setExpandedState] = useState(fromGallery);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    openingFromGallery = false;
  }, []);

  const setExpanded = useCallback(
    (next: boolean) => {
      if (next || !fromGallery) return setExpandedState(next);
      // Collapsing a view opened from the gallery returns to the gallery,
      // morphing back into the card. A push, not router.back(): back/forward
      // navigations don't run as transitions, so they wouldn't animate. The
      // gallery restores its own filter and scroll position.
      keepScrollOnNextNavigation();
      router.push(GALLERY_HREF, { scroll: false });
    },
    [fromGallery, router],
  );

  // Whether the URL asked to open expanded and the state hasn't caught up yet
  // (null until first read on mount). Read from window.location rather than
  // useSearchParams so the static export doesn't need a Suspense boundary.
  // Already expanded when opened from the gallery, so nothing is pending.
  const pendingOpen = useRef<boolean | null>(fromGallery ? false : null);

  // Keep the URL in step — on toggle and after prev/next — so it can be copied and shared.
  useEffect(() => {
    if (pendingOpen.current === null) {
      pendingOpen.current = new URLSearchParams(window.location.search).get(VIEW_PARAM) === EXPANDED_VALUE;
      if (pendingOpen.current) requestAnimationFrame(() => setExpandedState(true));
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
    <PatternExpandContext.Provider value={{ expanded, setExpanded, fromGallery }}>{children}</PatternExpandContext.Provider>
  );
}

export function usePatternExpand(): PatternExpandState {
  const ctx = useContext(PatternExpandContext);
  if (!ctx) throw new Error("usePatternExpand must be used inside <PatternExpandProvider>");
  return ctx;
}
