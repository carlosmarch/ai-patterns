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
 * current pattern highlighted. Shown on the pattern detail pages; it is
 * part of the normal page flow and scrolls with the page.
 *
 * Keyboard: the list is a single Tab stop (roving tabindex on the current
 * pattern). Once focus is inside, ↑ / ↓ move to the previous / next pattern
 * and open it straight away; Home / End jump to the first / last one.
 */
export function PatternsSidebar({
  groups,
}: {
  groups: PatternsSidebarGroup[];
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

  // A navigation scrolls the window to the top (see <ScrollRestoration>).
  // When it came from the arrow keys, bring the focused item back into view
  // once that has happened.
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav || !nav.contains(document.activeElement)) return;
    const frame = requestAnimationFrame(() => {
      (document.activeElement as HTMLElement | null)?.scrollIntoView({
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(frame);
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
    link.scrollIntoView({ block: "nearest" });
    router.push(link.getAttribute("href")!);
  }

  return (
    <nav
      ref={navRef}
      aria-label="All patterns"
      aria-keyshortcuts="ArrowUp ArrowDown"
      onKeyDown={onKeyDown}
      className="hidden w-56 shrink-0 py-16 pr-4 lg:block"
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
                        className="absolute inset-y-0 -left-px right-0 rounded-r-md bg-muted"
                      >
                        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground" />
                      </motion.span>
                    )}
                    <Link
                      href={href}
                      data-pattern-link
                      tabIndex={href === tabStop ? 0 : -1}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "relative -ml-px flex items-center gap-2 rounded-r-md border-l py-1 pl-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        isActive
                          ? "border-transparent font-medium text-foreground"
                          : "border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
    </nav>
  );
}
