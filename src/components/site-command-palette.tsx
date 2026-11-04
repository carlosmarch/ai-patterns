"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileCode2, LayoutGrid, Origami, Search, Sparkles, SquareDashedMousePointer } from "lucide-react";

import { getAdjacentEntries, getEntryHref, registry } from "@/registry";
import { CommandPalette, type CommandPaletteGroup } from "@/registry/navigation/command-palette/component";

const navItems = [
  { id: "/", label: "Home", icon: Origami },
  { id: "/patterns", label: "Patterns", icon: LayoutGrid },
  { id: "/demo", label: "Demo", icon: SquareDashedMousePointer },
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
        className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="size-3.5" aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="rounded border bg-muted px-1 py-0.5 font-sans text-[10px] font-medium">⌘K</kbd>
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
