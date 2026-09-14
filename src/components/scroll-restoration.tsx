"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const STORAGE_PREFIX = "scroll-pos:";

// Set once per document via `popstate`, then consumed (and reset) by the next
// pathname-change effect below — this is how we tell a back/forward
// navigation apart from a regular Link click, which never fires `popstate`.
let lastNavWasPopState = false;

/** Renders nothing. On a real back/forward navigation, restores the scroll
 * position this pathname had when the user left it; on every other
 * navigation (including a hard reload), scrolls to the top. */
export function ScrollRestoration() {
  const pathname = usePathname();

  React.useEffect(() => {
    function onPopState() {
      lastNavWasPopState = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  React.useEffect(() => {
    const wasPopState = lastNavWasPopState;
    lastNavWasPopState = false;

    let saved = 0;
    try {
      saved = wasPopState ? Number(sessionStorage.getItem(STORAGE_PREFIX + pathname)) : 0;
    } catch {
      // sessionStorage unavailable — fall through to scrolling to top.
    }
    if (!saved) {
      window.scrollTo(0, 0);
      return;
    }

    // The route's content streams in async, so the page may not be tall
    // enough yet to reach `saved` — retry until it is (or give up).
    let frame = 0;
    let attempts = 0;
    function tryRestore() {
      attempts += 1;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= saved || attempts > 30) {
        window.scrollTo(0, saved);
      } else {
        frame = requestAnimationFrame(tryRestore);
      }
    }
    frame = requestAnimationFrame(tryRestore);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Snapshot scrollY continuously (cheap, no storage I/O) so we always have
  // a fresh value to persist the instant a navigation starts.
  const scrollYRef = React.useRef(0);
  React.useEffect(() => {
    scrollYRef.current = window.scrollY;
    function onScroll() {
      scrollYRef.current = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  React.useEffect(() => {
    function persist() {
      try {
        sessionStorage.setItem(STORAGE_PREFIX + location.pathname, String(scrollYRef.current));
      } catch {
        // sessionStorage can throw (private browsing, quota) — losing the
        // saved position just means the next back navigation lands at top.
      }
    }
    // Capture phase, so this runs (and reads the pre-navigation scrollY)
    // before a click or Enter keypress hands off to the router — which,
    // for a push navigation, resets scroll on the page being left before
    // the pathname actually changes.
    document.addEventListener("click", persist, true);
    document.addEventListener("keydown", persist, true);
    return () => {
      document.removeEventListener("click", persist, true);
      document.removeEventListener("keydown", persist, true);
    };
  }, []);

  return null;
}
