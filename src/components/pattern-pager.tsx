"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export interface PagerLink {
  href: string;
  title: string;
  category: string;
}

// Arrow keys belong to these widgets (and to anything editable) — don't steal them.
const ARROW_KEY_OWNERS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="tablist"], [role="listbox"], [role="menu"], [role="menubar"], [role="radiogroup"], [role="slider"], [role="tree"], [role="grid"], [role="dialog"]';

/**
 * Previous / next links at the bottom of a pattern page. ← and → jump to the
 * neighbouring patterns when focus isn't in something that uses arrow keys.
 */
export function PatternPager({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(ARROW_KEY_OWNERS)) return;

      const to = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : undefined;
      if (!to) return;
      e.preventDefault();
      router.push(to.href);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [prev, next, router]);

  if (!prev && !next) return null;

  return (
    <nav aria-label="Previous and next pattern" className="mt-12 grid grid-cols-2 gap-4 border-t pt-6">
      {prev ? <PagerCard link={prev} direction="prev" /> : <span />}
      {next && <PagerCard link={next} direction="next" />}
    </nav>
  );
}

function PagerCard({ link, direction }: { link: PagerLink; direction: "prev" | "next" }) {
  const isNext = direction === "next";

  return (
    <Link
      href={link.href}
      rel={direction}
      aria-keyshortcuts={isNext ? "ArrowRight" : "ArrowLeft"}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-accent",
        isNext && "col-start-2 items-end text-right"
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {!isNext && <PagerKey>←</PagerKey>}
        {isNext ? "Next" : "Previous"}
        {isNext && <PagerKey>→</PagerKey>}
      </span>
      <span className="text-sm font-medium">{link.title}</span>
      <span className="text-xs text-muted-foreground capitalize">{link.category}</span>
    </Link>
  );
}

function PagerKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="hidden rounded border bg-muted px-1 font-sans text-xs leading-4 font-medium sm:inline">
      {children}
    </kbd>
  );
}
