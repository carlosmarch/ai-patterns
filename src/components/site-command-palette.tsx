"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileCode2, LayoutGrid, Origami, Search, Sparkles } from "lucide-react";

import { getAdjacentEntries, getEntryHref, registry } from "@/registry";
import { CommandPalette, type CommandPaletteGroup } from "@/registry/navigation/command-palette/component";

const navItems = [
  { id: "/", label: "Home", icon: Origami },
  { id: "/patterns", label: "Patterns", icon: LayoutGrid },
  { id: "/skill", label: "Skill", icon: Sparkles },
];

export function SiteCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const groups: CommandPaletteGroup[] = React.useMemo(() => {
    // On a pattern page, offer jumps to its neighbours first.
    const [, section, category, slug] = pathname.split("/");
    const { prev, next } =
      section === "patterns" && category && slug ? getAdjacentEntries(category, slug) : {};
    const pagerItems = [
      prev && { id: `${getEntryHref(prev)}#prev`, label: `Previous pattern: ${prev.title}`, icon: ArrowLeft, meta: "←" },
      next && { id: `${getEntryHref(next)}#next`, label: `Next pattern: ${next.title}`, icon: ArrowRight, meta: "→" },
    ].filter((item) => !!item);

    return [
      ...(pagerItems.length ? [{ label: "This pattern", items: pagerItems }] : []),
      { label: "Navigate", items: navItems },
      {
        label: "Patterns",
        items: registry.map((entry) => ({
          id: `/patterns/${entry.category}/${entry.slug}`,
          label: entry.title,
          icon: FileCode2,
          meta: entry.category,
          keywords: entry.description,
        })),
      },
    ];
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search patterns"
        className="flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:w-56 md:px-4"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="hidden md:inline">Search</span>
        <kbd className="ml-auto hidden font-sans text-xs text-muted-foreground/70 md:inline">⌘K</kbd>
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder="Search patterns or jump to a page..."
        // Item ids are routes; pager items carry a #prev/#next suffix to keep ids unique.
        onSelect={(item) => router.push(item.id.replace(/#(prev|next)$/, ""))}
      />
    </>
  );
}
