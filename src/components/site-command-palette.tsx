"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileCode2, Home, LayoutGrid, MonitorPlay, Search, Sparkles } from "lucide-react";

import { registry } from "@/registry";
import { CommandPalette, type CommandPaletteGroup } from "@/registry/navigation/command-palette/component";

const navItems = [
  { id: "/", label: "Home", icon: Home },
  { id: "/patterns", label: "Patterns", icon: LayoutGrid },
  { id: "/demo", label: "Demo", icon: MonitorPlay },
  { id: "/skill", label: "Skill", icon: Sparkles },
];

export function SiteCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

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

  const groups: CommandPaletteGroup[] = React.useMemo(
    () => [
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
    ],
    []
  );

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
        onSelect={(item) => router.push(item.id)}
      />
    </>
  );
}
