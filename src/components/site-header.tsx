"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const HERO_ID = "intro-hero";

/** Scroll past this before the header may collapse. */
const COLLAPSE_AFTER = 80;
/** Ignore scroll jitter smaller than this. */
const DELTA = 4;

/**
 * Sticky site header. On pages with the intro hero it starts transparent and
 * floats over it, then picks up its background once the hero scrolls past.
 *
 * Scrolling down collapses it to just the search pill (`data-collapsed`);
 * scrolling up brings everything back. Children hide themselves with
 * `group-data-[collapsed=true]/header:*` variants.
 */
export function SiteHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(pathname !== "/");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const hero = document.getElementById(HERO_ID);
      setSolid(!hero || hero.getBoundingClientRect().bottom <= 56);

      const y = window.scrollY;
      // Scroll is locked (and reset by some lock implementations) while a
      // modal is open — don't treat that as the reader scrolling.
      if (document.body.style.overflow === "hidden") return;
      if (y < COLLAPSE_AFTER) setCollapsed(false);
      else if (y - lastY > DELTA) setCollapsed(true);
      else if (lastY - y > DELTA) setCollapsed(false);
      if (Math.abs(y - lastY) > DELTA || y < COLLAPSE_AFTER) lastY = y;
    };
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <header
      data-solid={solid}
      data-collapsed={collapsed}
      className={cn(
        "group/header sticky top-0 z-40 h-14 transition-[background-color,backdrop-filter] duration-300",
        solid && !collapsed
          ? "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "bg-transparent",
        // Collapsed, only the search pill takes clicks; the rest of the bar
        // lets them through to the page underneath.
        collapsed && "pointer-events-none"
      )}
    >
      {children}
    </header>
  );
}
