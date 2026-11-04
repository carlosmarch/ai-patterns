"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const HERO_ID = "intro-hero";

/**
 * Sticky site header. On pages with the intro hero it starts transparent and
 * floats over it, then picks up its background once the hero scrolls past.
 */
export function SiteHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(pathname !== "/");

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById(HERO_ID);
      setSolid(!hero || hero.getBoundingClientRect().bottom <= 56);
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
      className={cn(
        "sticky top-0 z-40 h-14 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        solid
          ? "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "border-transparent! bg-transparent"
      )}
    >
      {children}
    </header>
  );
}
