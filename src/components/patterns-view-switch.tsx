"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "gallery", label: "Gallery", href: "/gallery", Icon: LayoutGrid, title: "Live demos" },
  { id: "details", label: "Details", href: "/patterns", Icon: List, title: "Wireframes with descriptions, by job" },
] as const;

export type PatternsView = (typeof VIEWS)[number]["id"];

/**
 * Switches between the two views of the catalogue — the live-demo gallery and
 * the detailed index — keeping the `?job=` and `?category=` filters, so the
 * same set of patterns stays on screen. Both pages read them on load.
 */
export function PatternsViewSwitch({ current, size = "md" }: { current: PatternsView; size?: "sm" | "md" }) {
  const router = useRouter();

  function go(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // Carry the filters across, so the same set of patterns stays on screen.
    const from = new URLSearchParams(window.location.search);
    const to = new URLSearchParams();
    for (const key of ["job", "category"]) {
      const value = from.get(key);
      if (value) to.set(key, value);
    }
    router.push(to.size ? `${href}?${to}` : href);
  }

  const segment = cn(
    "flex items-center rounded-full font-medium transition-colors",
    size === "sm" ? "h-6 gap-1 px-2.5 text-xs" : "h-7 gap-1.5 px-3 text-sm",
  );
  const icon = size === "sm" ? "size-3" : "size-3.5";

  return (
    <nav aria-label="Patterns view" className="flex shrink-0 rounded-full bg-muted p-0.5">
      {VIEWS.map(({ id, label, href, Icon, title }) =>
        id === current ? (
          <span
            key={id}
            aria-current="page"
            title={title}
            className={cn(segment, "bg-background text-foreground ring-1 ring-black/5 dark:ring-white/10")}
          >
            <Icon className={icon} />
            {label}
          </span>
        ) : (
          <Link
            key={id}
            href={href}
            title={title}
            onClick={(e) => go(e, href)}
            className={cn(segment, "text-muted-foreground hover:text-foreground")}
          >
            <Icon className={icon} />
            {label}
          </Link>
        ),
      )}
    </nav>
  );
}
