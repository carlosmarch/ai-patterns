"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const STORAGE_PREFIX = "scroll-pos:";

// Set once per document via `popstate`, then consumed (and reset) by the next
// pathname-change effect below — this is how we tell a back/forward
// navigation apart from a regular Link click, which never fires `popstate`.
let lastNavWasPopState = false;

// Set right before a navigation whose destination restores its own scroll
// position (the gallery, when a pattern opened from it is collapsed).
let skipNextReset = false;

/** The next pathname change leaves the scroll position to the destination page. */
export function keepScrollOnNextNavigation() {
  skipNextReset = true;
}

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
    if (skipNextReset) {
      skipNextReset = false;
      return;
    }

    let saved = 0;
    try {
      saved = wasPopState ? Number(sessionStorage.getItem(STORAGE_PREFIX + pathname)) : 0;
    } catch {
      // sessionStorage unavailable — fall through to scrolling to top.
    }
    if (!saved) {
      // A link to an in-page anchor (e.g. /patterns#text) should land on that
      // section, not the top. The target may not have rendered yet, so retry.
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) {
        window.scrollTo(0, 0);
        return;
      }
      let frame = 0;
      let attempts = 0;
      function tryScrollToHash() {
        attempts += 1;
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView();
        } else if (attempts > 30) {
          window.scrollTo(0, 0);
        } else {
          frame = requestAnimationFrame(tryScrollToHash);
        }
      }
      frame = requestAnimationFrame(tryScrollToHash);
      return () => cancelAnimationFrame(frame);
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
