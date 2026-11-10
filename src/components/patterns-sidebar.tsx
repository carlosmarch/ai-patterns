"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface PatternsSidebarGroup {
  category: string;
  items: { slug: string; title: string; isNew?: boolean }[];
}

/**
 * Sidebar listing every pattern, grouped by category, with the
 * current pattern highlighted. Shown on the pattern detail pages; it sticks
 * below the site header and scrolls on its own, so the current pattern stays
 * in view while its page is shown beside it.
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
  /** Overrides for the nav, e.g. its sticky offset and padding on /patterns. */
  className?: string;
}) {
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

  return (
    // layoutScroll: the active pill's layout animation measures correctly
    // while the nav itself is scrolled.
    <motion.nav
      ref={navRef}
      layoutScroll
      aria-label="All patterns"
      aria-keyshortcuts="ArrowUp ArrowDown"
      onKeyDown={onKeyDown}
      className={cn(
        "sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 self-start overflow-y-auto overscroll-contain py-16 pr-4 [scrollbar-width:thin] lg:block",
        className,
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
