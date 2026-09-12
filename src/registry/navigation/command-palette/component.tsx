"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  meta?: string;
}

export interface CommandPaletteGroup {
  label: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandPaletteGroup[];
  placeholder?: string;
  emptyLabel?: string;
  onSelect?: (item: CommandPaletteItem) => void;
  className?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Search or run a command...",
  emptyLabel = "No matches",
  onSelect,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [wasOpen, setWasOpen] = React.useState(open);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  const visibleGroups = React.useMemo(() => filterGroups(groups, query), [groups, query]);
  const flatItems = React.useMemo(() => visibleGroups.flatMap((g) => g.items), [visibleGroups]);

  React.useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  React.useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function close() {
    onOpenChange(false);
  }

  function commit(item: CommandPaletteItem | undefined) {
    if (!item) return;
    onSelect?.(item);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(flatItems[activeIndex]);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50 flex justify-center px-4 pt-[12vh]", className)}>
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onKeyDown={handleKeyDown}
            className="relative z-10 flex h-fit max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-list"
                aria-activedescendant={flatItems[activeIndex] ? `command-palette-item-${flatItems[activeIndex].id}` : undefined}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div id="command-palette-list" role="listbox" ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
              {flatItems.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
              ) : (
                visibleGroups.map((group) => (
                  <div key={group.label} className="mb-2 last:mb-0">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{group.label}</p>
                    {group.items.map((item) => {
                      const index = flatItems.indexOf(item);
                      const active = index === activeIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          id={`command-palette-item-${item.id}`}
                          data-index={index}
                          role="option"
                          aria-selected={active}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => commit(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            active ? "bg-accent text-accent-foreground" : "text-foreground"
                          )}
                        >
                          {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.meta && (
                            <span className="shrink-0 text-xs text-muted-foreground">{item.meta}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-3 border-t px-4 py-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                Select
              </span>
              <span className="flex items-center gap-1.5">
                <Kbd>
                  <CornerDownLeft className="size-3" />
                </Kbd>
                Open
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Kbd>Esc</Kbd>
                Close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

function filterGroups(groups: CommandPaletteGroup[], query: string): CommandPaletteGroup[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(trimmed)),
    }))
    .filter((group) => group.items.length > 0);
}
