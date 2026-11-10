"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileCode2, LayoutGrid, Origami, Search, Sparkles } from "lucide-react";

import { getAdjacentEntries, getEntryHref, registry } from "@/registry";
import { CommandPaletteWindow, type CommandPaletteGroup } from "@/registry/navigation/command-palette/component";

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

  // The pill and the panel share a layoutId, so opening morphs the pill into
  // the panel (and closing folds it back) instead of fading a modal in.
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false);
  const reduceMotion = useReducedMotion();
  const morph = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.9 };
  const pillRef = React.useRef<HTMLButtonElement>(null);
  const wasOpen = React.useRef(false);

  // Hand focus back to the pill once it is back in place.
  React.useEffect(() => {
    if (wasOpen.current && !open) pillRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // Lock page scroll behind the panel.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <LayoutGroup id="site-search">
      {/* Holds the pill's slot in the header while it is morphed away. */}
      <div className="h-9 w-9 md:w-56">
        {!open && (
          <motion.button
            ref={pillRef}
            layoutId="site-search"
            transition={morph}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search patterns"
            aria-haspopup="dialog"
            style={{ borderRadius: 18 }}
            className="flex h-9 w-full items-center gap-2 overflow-hidden bg-muted px-[10px] text-sm text-muted-foreground transition-colors hover:text-foreground md:px-4"
          >
            <motion.span layout="position" transition={morph} className="flex min-w-0 flex-1 items-center gap-2">
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">Search</span>
              <kbd className="ml-auto hidden font-sans text-xs text-muted-foreground/70 md:inline">⌘K</kbd>
            </motion.span>
          </motion.button>
        )}
      </div>

      {mounted &&
        // Portal to <body>: the header's backdrop-filter would otherwise
        // become the containing block for this fixed overlay.
        createPortal(
          <AnimatePresence>
            {open && (
              <div key="palette" className="fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]">
                <motion.div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={close}
                  aria-hidden
                />
                <motion.div
                  layoutId="site-search"
                  transition={morph}
                  style={{ borderRadius: 16 }}
                  className="relative z-10 h-fit w-full max-w-lg overflow-hidden bg-popover"
                >
                  {/* The contents fade in once the panel has nearly finished
                      growing, so they are never seen stretched. */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.16, delay: reduceMotion ? 0 : 0.16 } }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  >
                    <CommandPaletteWindow
                      groups={groups}
                      placeholder="Search patterns or jump to a page..."
                      autoFocus
                      // Item ids are routes; pager items carry a #prev/#next suffix to keep ids unique.
                      onSelect={(item) => {
                        router.push(item.id.replace(/#(prev|next)$/, ""));
                        close();
                      }}
                      onClose={close}
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </LayoutGroup>
  );
}

function subscribeNoop() {
  return () => {};
}
