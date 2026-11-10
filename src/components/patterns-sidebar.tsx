"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";

// Compact mode folds the sidebar into a column of ticks, one per pattern,
// which opens into the full list on hover or keyboard focus. The mode lives
// on <html data-sidebar="compact"> — set before first paint by the root
// layout's init script from localStorage — so the CSS (the `sidebar-compact:`
// variant in globals.css) gets it right without waiting for React, and the
// server HTML is the same either way. React only reads it for the toggle.
const SIDEBAR_KEY = "ai-patterns:sidebar";
const sidebarListeners = new Set<() => void>();

function isCompact() {
  return document.documentElement.dataset.sidebar === "compact";
}

function setCompact(compact: boolean) {
  if (compact) document.documentElement.dataset.sidebar = "compact";
  else delete document.documentElement.dataset.sidebar;
  try {
    localStorage.setItem(SIDEBAR_KEY, compact ? "compact" : "full");
  } catch {
    // Storage unavailable: the mode still applies until the next load.
  }
  sidebarListeners.forEach((listener) => listener());
}

function subscribeToSidebar(listener: () => void) {
  sidebarListeners.add(listener);
  return () => sidebarListeners.delete(listener);
}

export interface PatternsSidebarGroup {
  category: string;
  items: { slug: string; title: string; isNew?: boolean }[];
}

/**
 * Sidebar listing every pattern, grouped by category, with the
 * current pattern highlighted. Shown on the catalogue pages (gallery, index
 * and pattern pages) at the very left; it sticks below the site header and
 * scrolls on its own, so the current pattern stays in view beside its page.
 * The toggle at its top compresses it into a column of ticks (see above).
 *
 * Keyboard: the list is a single Tab stop (roving tabindex on the current
 * pattern). Once focus is inside, ↑ / ↓ move to the previous / next pattern
 * and open it straight away; Home / End jump to the first / last one.
 */
export function PatternsSidebar({
  groups,
  className,
}: {
  groups: PatternsSidebarGroup[];
  /** Overrides for the outer column. */
  className?: string;
}) {
  const compact = React.useSyncExternalStore(subscribeToSidebar, isCompact, () => false);
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const navRef = React.useRef<HTMLElement>(null);

  const hrefs = React.useMemo(
    () =>
      groups.flatMap(({ category, items }) =>
        items.map(({ slug }) => `/patterns/${category}/${slug}`),
      ),
    [groups],
  );
  const activeIndex = hrefs.indexOf(pathname);
  const tabStop = activeIndex === -1 ? hrefs[0] : pathname;

  // Keep the current pattern visible inside the sidebar's own scroll area.
  // Loaded straight onto a pattern, it is centred; after that the list only
  // moves as far as needed — including the first pattern opened from
  // /patterns, which shares this sidebar (patterns/layout.tsx), so it stays
  // where the reader left it. Scrolls the nav alone — never the window, which
  // <ScrollRestoration> owns.
  const hasPositioned = React.useRef(false);
  React.useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('a[aria-current="page"]');
    const mode = hasPositioned.current ? "nearest" : "center";
    hasPositioned.current = true;
    if (!nav || !link) return;
    revealInNav(nav, link, mode);
  }, [pathname]);

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const links = Array.from(
      navRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-pattern-link]") ?? [],
    );
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (current === -1) return;

    let next: number;
    switch (e.key) {
      case "ArrowDown":
        next = Math.min(current + 1, links.length - 1);
        break;
      case "ArrowUp":
        next = Math.max(current - 1, 0);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = links.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next === current) return;
    const link = links[next];
    link.focus({ preventScroll: true });
    if (navRef.current) revealInNav(navRef.current, link, "nearest");
    router.push(link.getAttribute("href")!);
  }

  const ToggleIcon = compact ? PanelLeftOpen : PanelLeftClose;

  return (
    <div
      className={cn(
        // z-30: sticky makes this column its own stacking context, so the compact overlay's z-40 only
        // counts inside it; the column itself must sit above the page (cards, captions), below the
        // site header and the expanded view (z-50).
        "group/sidebar sticky top-14 z-30 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 self-start transition-[width] duration-200 ease-out lg:block motion-reduce:transition-none",
        "sidebar-compact:w-14",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setCompact(!compact)}
        aria-label={compact ? "Expand the patterns menu" : "Compress the patterns menu"}
        title={compact ? "Expand menu" : "Compress menu"}
        className="absolute top-5 left-2.5 z-50 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:left-4"
      >
        <ToggleIcon className="size-4" />
      </button>

      {/* Compact: one tick per pattern, grouped by category; the current one is longer and darker.
          Decorative — hovering (or tabbing into) the column opens the real list over it. */}
      <div aria-hidden data-sidebar-ticks className="hidden h-full flex-col overflow-hidden pt-16 pb-6 pl-4 sm:pl-6 sidebar-compact:flex">
        {groups.map(({ category, items }) => (
          <div key={category} className="flex flex-col gap-1 pb-2.5">
            {items.map(({ slug }) => {
              const isActive = pathname === `/patterns/${category}/${slug}`;
              return (
                <span
                  key={slug}
                  className={cn(
                    "rounded-full transition-[width,background-color]",
                    isActive ? "h-0.5 w-5 bg-foreground" : "h-px w-3 bg-muted-foreground/40 group-hover/sidebar:bg-muted-foreground/60",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* layoutScroll: the active pill's layout animation measures correctly
          while the nav itself is scrolled. In compact mode the nav becomes an
          overlay over the ticks (and the page), shown while the column is
          hovered or the list holds keyboard focus. */}
      <motion.nav
        ref={navRef}
        layoutScroll
        aria-label="All patterns"
        aria-keyshortcuts="ArrowUp ArrowDown"
        onKeyDown={onKeyDown}
        className={cn(
          "h-full overflow-y-auto overscroll-contain py-16 pr-4 pl-4 [scrollbar-width:thin] sm:pl-6",
          "sidebar-compact:pointer-events-none sidebar-compact:absolute sidebar-compact:inset-y-0 sidebar-compact:left-0 sidebar-compact:z-40 sidebar-compact:w-72 sidebar-compact:bg-background sidebar-compact:opacity-0 sidebar-compact:ring-1 sidebar-compact:ring-black/5 sidebar-compact:transition-opacity sidebar-compact:duration-150 dark:sidebar-compact:ring-white/10",
          "sidebar-compact:group-hover/sidebar:pointer-events-auto sidebar-compact:group-hover/sidebar:opacity-100 sidebar-compact:group-hover/sidebar:delay-75",
          // Keyboard focus in the list opens it too; a mouse click (on the toggle or a link) doesn't keep it open.
          "sidebar-compact:has-[:focus-visible]:pointer-events-auto sidebar-compact:has-[:focus-visible]:opacity-100",
        )}
      >
        <div className="space-y-6">
          {groups.map(({ category, items }) => (
            <div key={category}>
              <h2 className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {category}
              </h2>
              <ul className="space-y-0.5 border-l">
                {items.map(({ slug, title, isNew }) => {
                  const href = `/patterns/${category}/${slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={slug} className="relative">
                      {isActive && (
                        <motion.span
                          layoutId="patterns-sidebar-active"
                          aria-hidden
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 500, damping: 40 }
                          }
                          className="absolute inset-y-0 -left-px right-0"
                        >
                          {/* Bar sits on the list's rule; the pill floats clear of it. */}
                          <span className="absolute inset-y-1 -left-[0.5px] w-0.5 rounded-full bg-foreground" />
                          <span className="absolute inset-y-0 left-[calc(0.5rem+1px)] right-0 rounded-md bg-muted" />
                        </motion.span>
                      )}
                      <Link
                        href={href}
                        data-pattern-link
                        tabIndex={href === tabStop ? 0 : -1}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative ml-2 flex items-center gap-2 rounded-md py-1 pr-2 pl-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          // Hover mirrors the selected state: a faint bar on the rule, a faint pill.
                          "after:absolute after:inset-y-1 after:-left-[calc(0.5rem+1.5px)] after:w-0.5 after:rounded-full after:transition-colors",
                          isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:after:bg-muted-foreground",
                        )}
                      >
                        {title}
                        {isNew && (
                          <span
                            title="New pattern"
                            className="size-1.5 shrink-0 rounded-full bg-blue-500"
                          >
                            <span className="sr-only">(new)</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </motion.nav>
    </div>
  );
}

/** Scroll `nav` (only) so `el` is inside its visible area. */
function revealInNav(nav: HTMLElement, el: HTMLElement, mode: "nearest" | "center") {
  const navRect = nav.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const margin = 48;
  const top = elRect.top - navRect.top + nav.scrollTop;
  let next = nav.scrollTop;
  if (mode === "center") {
    next = top - (nav.clientHeight - elRect.height) / 2;
  } else if (elRect.top < navRect.top + margin) {
    next = top - margin;
  } else if (elRect.bottom > navRect.bottom - margin) {
    next = top + elRect.height - nav.clientHeight + margin;
  }
  if (next !== nav.scrollTop) nav.scrollTo({ top: Math.max(0, next) });
}
