"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface PatternsSidebarGroup {
  category: string;
  items: { slug: string; title: string }[];
}

/**
 * Fixed sidebar listing every pattern, grouped by category, with the
 * current pattern highlighted. Shown on the pattern detail pages.
 */
export function PatternsSidebar({
  groups,
}: {
  groups: PatternsSidebarGroup[];
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Keep the active link in view when arriving on a pattern far down the list.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    const navRect = nav.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    if (activeRect.top < navRect.top || activeRect.bottom > navRect.bottom) {
      nav.scrollTop +=
        activeRect.top -
        navRect.top -
        navRect.height / 2 +
        activeRect.height / 2;
    }
  }, [pathname]);

  // The nav is `fixed` (not `sticky`) so it stays on screen while the page
  // scrolls, even past the end of the content column. Shrink it by however
  // much of the footer is in view so the two never overlap.
  useEffect(() => {
    const nav = navRef.current;
    const footer = document.querySelector("footer");
    if (!nav || !footer) return;
    const update = () => {
      const overlap = Math.max(
        0,
        window.innerHeight - footer.getBoundingClientRect().top,
      );
      nav.style.setProperty("--footer-overlap", `${overlap}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    // In-flow spacer reserves the column; the fixed nav inside keeps its
    // static horizontal position because it sets no left/right offset.
    <div className="hidden w-56 shrink-0 lg:block">
      <nav
        ref={navRef}
        aria-label="All patterns"
        className="fixed top-14 h-[calc(100vh-3.5rem-var(--footer-overlap,0px))] w-56 overflow-y-auto overscroll-contain py-16 pr-4"
      >
        <div className="space-y-6">
          {groups.map(({ category, items }) => (
            <div key={category}>
              <h2 className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {category}
              </h2>
              <ul className="space-y-0.5 border-l">
                {items.map(({ slug, title }) => {
                  const href = `/patterns/${category}/${slug}`;
                  const isActive = pathname === href;
                  return (
                    <li key={slug}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "-ml-px block border-l py-1 pl-3 text-sm transition-colors",
                          isActive
                            ? "border-foreground font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                        )}
                      >
                        {title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
