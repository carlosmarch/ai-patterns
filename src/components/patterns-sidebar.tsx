"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface PatternsSidebarGroup {
  category: string;
  items: { slug: string; title: string; isNew?: boolean }[];
}

/**
 * Sidebar listing every pattern, grouped by category, with the
 * current pattern highlighted. Shown on the pattern detail pages; it is
 * part of the normal page flow and scrolls with the page.
 */
export function PatternsSidebar({
  groups,
}: {
  groups: PatternsSidebarGroup[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="All patterns"
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
                  <li key={slug}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "-ml-px flex items-center gap-2 border-l py-1 pl-3 text-sm transition-colors",
                        isActive
                          ? "border-foreground font-medium text-foreground"
                          : "border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground",
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
