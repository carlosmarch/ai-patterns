"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface ResearchTocItem {
  id: string;
  /** Chapter number or appendix letter; empty for front and back matter. */
  n: string;
  label: string;
}

/**
 * The thesis's table of contents, styled like the patterns sidebar: a rule
 * on the left, the current chapter marked by a bar on the rule and a pill,
 * and hover mirroring that state faintly. The current chapter is the last
 * one whose heading has scrolled past the top third of the viewport.
 */
export function ResearchToc({ items }: { items: ResearchTocItem[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      // At the very bottom the last chapters may never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label="Contents" className="hidden lg:block">
      <div className="sticky top-24">
        <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Contents</p>
        <ol className="space-y-0.5 border-l">
          {items.map((t) => {
            const isActive = t.id === active;
            return (
              <li key={t.id} className="relative">
                {isActive && (
                  <motion.span
                    layoutId="research-toc-active"
                    aria-hidden
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute inset-y-0 -left-px right-0"
                  >
                    {/* Bar sits on the list's rule; the pill floats clear of it. */}
                    <span className="absolute inset-y-1 -left-[0.5px] w-0.5 rounded-full bg-foreground" />
                    <span className="absolute inset-y-0 left-[calc(0.5rem+1px)] right-0 rounded-md bg-muted" />
                  </motion.span>
                )}
                <a
                  href={`#${t.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "relative ml-2 flex gap-2 rounded-md py-1 pr-2 pl-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    // Hover mirrors the selected state: a faint bar on the rule, a faint pill.
                    "after:absolute after:inset-y-1 after:-left-[calc(0.5rem+1.5px)] after:w-0.5 after:rounded-full after:transition-colors",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:after:bg-muted-foreground",
                  )}
                >
                  <span className="w-4 shrink-0 font-mono text-xs leading-5 font-normal tabular-nums">{t.n}</span>
                  <span>{t.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
