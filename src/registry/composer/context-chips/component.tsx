"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, Check, Eye, EyeOff, Plus, Search, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ContextSource {
  id: string;
  label: string;
  /** The menu section it is listed under, e.g. "Files", "Connectors", "Web". */
  group: string;
  icon: LucideIcon;
  /** A second line in the menu: a path, a URL, a count. */
  detail?: string;
}

export interface AutoContext {
  label: string;
  icon: LucideIcon;
  /** What it is, for the tooltip and screen readers: "The file you have open". */
  description: string;
  included: boolean;
  onIncludedChange: (included: boolean) => void;
}

export interface ContextChipsComposerProps {
  sources: ContextSource[];
  /** Ids of the sources attached to the next message. */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Context the product adds on its own (the open file, the current page). Shown first, and can be excluded but not removed. */
  auto?: AutoContext;
  placeholder?: string;
  onSubmit?: (text: string, ids: string[]) => void;
  className?: string;
}

export function ContextChipsComposer({
  sources,
  value,
  onChange,
  auto,
  placeholder = "Ask anything… type @ to add context",
  onSubmit,
  className,
}: ContextChipsComposerProps) {
  const reduce = useReducedMotion();
  const [text, setText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();

  const byId = React.useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const attached = value.map((v) => byId.get(v)).filter((s): s is ContextSource => Boolean(s));

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? sources.filter((s) => `${s.label} ${s.detail ?? ""} ${s.group}`.toLowerCase().includes(q))
      : sources;
  }, [sources, query]);
  const groups = React.useMemo(() => {
    const map = new Map<string, ContextSource[]>();
    for (const s of filtered) map.set(s.group, [...(map.get(s.group) ?? []), s]);
    return [...map.entries()];
  }, [filtered]);

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function openMenu() {
    setQuery("");
    setActive(0);
    setOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function closeMenu() {
    setOpen(false);
    textareaRef.current?.focus();
  }

  function toggle(source: ContextSource) {
    if (value.includes(source.id)) {
      onChange(value.filter((v) => v !== source.id));
      setAnnouncement(`Removed ${source.label}`);
    } else {
      onChange([...value, source.id]);
      setAnnouncement(`Added ${source.label}`);
    }
  }

  function remove(source: ContextSource) {
    onChange(value.filter((v) => v !== source.id));
    setAnnouncement(`Removed ${source.label}`);
    textareaRef.current?.focus();
  }

  function submit() {
    if (!text.trim()) return;
    onSubmit?.(text.trim(), value);
    setText("");
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = filtered[active];
      if (s) toggle(s);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const activeSource = filtered[active];

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="rounded-2xl bg-card p-2 border">
        {(auto || attached.length > 0) && (
          <ul aria-label="Context for this message" className="flex flex-wrap gap-1.5 px-1 pt-1 pb-2">
            {auto && (
              <li>
                <button
                  type="button"
                  aria-pressed={auto.included}
                  title={`${auto.description} — ${auto.included ? "click to exclude" : "click to include"}`}
                  onClick={() => auto.onIncludedChange(!auto.included)}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-lg border px-2 text-xs transition-colors",
                    auto.included
                      ? "bg-muted text-foreground"
                      : "border-dashed text-muted-foreground line-through decoration-muted-foreground/60"
                  )}
                >
                  <auto.icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="max-w-40 truncate">{auto.label}</span>
                  <span className="sr-only">, {auto.description}</span>
                  {auto.included ? (
                    <Eye className="size-3 text-muted-foreground" aria-hidden />
                  ) : (
                    <EyeOff className="size-3" aria-hidden />
                  )}
                </button>
              </li>
            )}
            <AnimatePresence initial={false}>
              {attached.map((s) => (
                <motion.li
                  key={s.id}
                  layout={!reduce}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.14 }}
                  className="flex h-7 items-center gap-1.5 rounded-lg pr-0.5 pl-2 text-xs bg-muted"
                >
                  <s.icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="max-w-40 truncate" title={s.detail ?? s.label}>
                    {s.label}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${s.label}`}
                    onClick={() => remove(s)}
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <textarea
          ref={textareaRef}
          rows={2}
          value={text}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(e) => {
            const next = e.target.value;
            // "@" at the start or after a space opens the same menu as the + button.
            const typedAt = next.length === text.length + 1 && /(^|\s)@$/.test(next);
            if (typedAt) {
              setText(next.slice(0, -1));
              openMenu();
            } else {
              setText(next);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && text === "" && attached.length > 0) {
              e.preventDefault();
              remove(attached[attached.length - 1]);
            } else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="block w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? `${id}-menu` : undefined}
            onClick={() => (open ? closeMenu() : openMenu())}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground"
          >
            <Plus className="size-4" aria-hidden />
            Add context
          </button>
          <button
            type="button"
            aria-label="Send"
            onClick={submit}
            disabled={!text.trim()}
            className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            role="dialog"
            aria-label="Add context"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute bottom-full left-0 z-20 mb-2 w-72 origin-bottom-left overflow-hidden rounded-2xl bg-popover text-popover-foreground border"
          >
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search files, apps and the web"
                role="combobox"
                aria-expanded
                aria-controls={`${id}-list`}
                aria-activedescendant={activeSource ? `${id}-opt-${activeSource.id}` : undefined}
                aria-label="Search context sources"
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul
              id={`${id}-list`}
              role="listbox"
              aria-multiselectable
              aria-label="Context sources"
              className="max-h-56 overflow-auto p-1"
            >
              {groups.length === 0 && (
                <li className="px-2.5 py-6 text-center text-xs text-muted-foreground">Nothing matches “{query}”</li>
              )}
              {groups.map(([group, items]) => (
                <li key={group} role="presentation">
                  <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium text-muted-foreground">{group}</p>
                  <ul role="group" aria-label={group}>
                    {items.map((s) => {
                      const index = filtered.indexOf(s);
                      const selected = value.includes(s.id);
                      return (
                        <li
                          key={s.id}
                          id={`${id}-opt-${s.id}`}
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActive(index)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggle(s)}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5",
                            index === active && "bg-accent"
                          )}
                        >
                          <s.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">{s.label}</span>
                            {s.detail && (
                              <span className="block truncate text-xs text-muted-foreground">{s.detail}</span>
                            )}
                          </span>
                          <Check className={cn("size-4 shrink-0", !selected && "invisible")} aria-hidden />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
              Enter to add or remove · Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
