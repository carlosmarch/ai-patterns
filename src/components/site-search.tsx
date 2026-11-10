"use client";

import * as React from "react";
import { CornerDownLeft, FileCode2, LayoutGrid, Origami, Search, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getCatalogOrder, getEntryHref, isNewEntry, type RegistryEntry } from "@/registry";
import { JOBS, getJob } from "@/registry/jobs";

/*
 * The site's ⌘K search: a free-standing search field and, a gap below it, a
 * separate results panel. Rows show a title and a one-line description.
 * With an empty query it opens on recently visited patterns, then pages,
 * jobs and the full catalogue.
 */

// ---------------------------------------------------------------------------
// Recently visited patterns (per browser, in localStorage)

const RECENT_KEY = "ai-patterns:recent";
const RECENT_MAX = 5;

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(hrefs: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(hrefs.slice(0, RECENT_MAX)));
  } catch {
    // Storage blocked (private mode etc.) — recents are a convenience only.
  }
}

/** Remembers a visit to a pattern page, most recent first. */
export function recordVisit(pathname: string) {
  const href = pathname.replace(/\/$/, "");
  if (!entryByHref.has(href)) return;
  writeRecent([href, ...readRecent().filter((h) => h !== href)]);
}

// ---------------------------------------------------------------------------
// Items

type Item = {
  id: string;
  href: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  entry?: RegistryEntry;
  /** Short tag on the right (job · category for patterns). */
  meta?: string;
  /** Extra searchable text. */
  keywords?: string;
  removable?: boolean;
};

type Group = { label: string; items: Item[]; clearable?: boolean };

const catalog = getCatalogOrder();
const entryByHref = new Map(catalog.map((entry) => [getEntryHref(entry), entry]));

function patternItem(entry: RegistryEntry, prefix: string): Item {
  const job = getJob(entry.job);
  return {
    id: `${prefix}:${getEntryHref(entry)}`,
    href: getEntryHref(entry),
    title: entry.title,
    description: entry.description,
    entry,
    meta: job?.label,
    keywords: `${entry.category} ${job?.label ?? ""} ${job?.question ?? ""}`,
  };
}

const pageItems: Item[] = [
  { id: "page:/", href: "/", title: "Home", description: "What this catalogue is and what's new", icon: Origami },
  { id: "page:/patterns", href: "/patterns", title: "Patterns", description: "Every pattern as a live demo, by job", icon: LayoutGrid },
  { id: "page:/skill", href: "/skill", title: "Skill", description: "Install the design skill and MCP server for your agent", icon: Sparkles },
];

const jobItems: Item[] = JOBS.map((job) => ({
  id: `job:${job.id}`,
  href: `/patterns?job=${job.id}`,
  title: `${job.label} — “${job.question}”`,
  description: job.description,
  icon: LayoutGrid,
  meta: "Job",
  keywords: job.id,
}));

const allPatternItems = catalog.map((entry) => patternItem(entry, "pattern"));

// ---------------------------------------------------------------------------
// Matching: every word of the query must appear somewhere in the item;
// title hits rank above description-only hits.

function tokens(query: string) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function score(item: Item, words: string[]): number {
  const title = item.title.toLowerCase();
  const rest = `${item.description} ${item.keywords ?? ""}`.toLowerCase();
  let total = 0;
  for (const word of words) {
    if (title.startsWith(word)) total += 4;
    else if (title.includes(` ${word}`)) total += 3;
    else if (title.includes(word)) total += 2;
    else if (rest.includes(word)) total += 1;
    else return 0;
  }
  return total;
}

function rank(items: Item[], words: string[]) {
  return items
    .map((item, i) => ({ item, s: score(item, words), i }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.item);
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-transparent text-foreground underline decoration-foreground/40 underline-offset-2">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// The panel

export interface SiteSearchProps {
  /** Navigate to a route (and close). `newTab` comes from ⌘/Ctrl+Enter or a middle click. */
  onNavigate: (href: string, newTab: boolean) => void;
  onClose: () => void;
  /** Wraps the search field, so the caller can morph it (layoutId). */
  renderField: (field: React.ReactNode) => React.ReactNode;
  /** Wraps the results panel, so the caller can animate it in. */
  renderResults: (results: React.ReactNode) => React.ReactNode;
  /** The page being viewed — left out of "Recently visited". */
  currentPath?: string;
}

export function SiteSearch({ onNavigate, onClose, renderField, renderResults, currentPath }: SiteSearchProps) {
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [recent, setRecent] = React.useState<string[]>(() => (typeof window === "undefined" ? [] : readRecent()));
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const words = React.useMemo(() => tokens(query), [query]);

  const groups: Group[] = React.useMemo(() => {
    if (words.length) {
      const patterns = rank(allPatternItems, words);
      const pages = rank([...pageItems, ...jobItems], words);
      return [
        ...(patterns.length ? [{ label: `Patterns · ${patterns.length}`, items: patterns }] : []),
        ...(pages.length ? [{ label: "Pages", items: pages }] : []),
      ];
    }
    const here = currentPath?.replace(/\/$/, "");
    const recentItems = recent
      .filter((href) => href !== here)
      .map((href) => entryByHref.get(href))
      .filter((entry): entry is RegistryEntry => !!entry)
      .map((entry) => ({ ...patternItem(entry, "recent"), removable: true }));
    return [
      ...(recentItems.length
        ? [
            {
              label: "Recently visited",
              items: recentItems,
              clearable: true,
            },
          ]
        : []),
      { label: "Go to", items: pageItems },
      { label: "Browse by job", items: jobItems },
      { label: `All patterns · ${allPatternItems.length}`, items: allPatternItems },
    ];
  }, [words, recent, currentPath]);

  const flatItems = React.useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const active = flatItems[Math.min(activeIndex, flatItems.length - 1)];

  React.useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function removeRecent(href: string) {
    const next = readRecent().filter((h) => h !== href);
    writeRecent(next);
    setRecent(next);
  }

  function clearRecent() {
    writeRecent([]);
    setRecent([]);
  }

  function move(delta: number) {
    if (!flatItems.length) return;
    setActiveIndex((i) => (i + delta + flatItems.length) % flatItems.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (query) {
        setQuery("");
        setActiveIndex(0);
      } else onClose();
    } else if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home" && e.ctrlKey) {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End" && e.ctrlKey) {
      e.preventDefault();
      setActiveIndex(flatItems.length - 1);
    } else if (e.key === "Enter" && active) {
      e.preventDefault();
      onNavigate(active.href, e.metaKey || e.ctrlKey);
    } else if ((e.key === "Backspace" || e.key === "Delete") && e.shiftKey && active?.removable) {
      e.preventDefault();
      removeRecent(active.href);
    }
  }

  const field = (
    <div className="flex h-12 items-center gap-2.5 px-4">
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        role="combobox"
        aria-label="Search patterns and pages"
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search patterns, jobs or pages…"
        spellCheck={false}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setActiveIndex(0);
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Esc
        </button>
      )}
    </div>
  );

  const results = (
    <div className="flex max-h-[min(60vh,560px)] flex-col">
      <div id={listId} role="listbox" aria-label="Results" ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {flatItems.length === 0 ? (
          <div className="px-3 py-10 text-center text-sm">
            <p className="text-foreground">No results for “{query.trim()}”</p>
            <p className="mt-1 text-muted-foreground">Try a job like “recover”, or a word like “loader” or “sources”.</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} role="group" aria-label={group.label} className="mb-2 last:mb-0">
              <div className="flex items-center justify-between px-3 pt-1.5 pb-1">
                <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                {group.clearable && (
                  <button
                    type="button"
                    onMouseDown={keepFocus}
                    onClick={clearRecent}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              {group.items.map((item) => {
                const index = flatItems.indexOf(item);
                return (
                  <ResultRow
                    key={item.id}
                    id={`${listId}-${item.id}`}
                    index={index}
                    item={item}
                    words={words}
                    active={item === active}
                    onHover={() => setActiveIndex(index)}
                    onSelect={(newTab) => onNavigate(item.href, newTab)}
                    onRemove={item.removable ? () => removeRecent(item.href) : undefined}
                  />
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="hidden items-center gap-3 border-t px-4 py-2.5 text-xs text-muted-foreground sm:flex">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeft className="size-3" />
          </Kbd>
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd>
          <Kbd>
            <CornerDownLeft className="size-3" />
          </Kbd>
          New tab
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          {query ? "Clear" : "Close"}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {renderField(field)}
      {renderResults(results)}
    </>
  );
}

function ResultRow({
  id,
  index,
  item,
  words,
  active,
  onHover,
  onSelect,
  onRemove,
}: {
  id: string;
  index: number;
  item: Item;
  words: string[];
  active: boolean;
  onHover: () => void;
  onSelect: (newTab: boolean) => void;
  onRemove?: () => void;
}) {
  const Icon = item.icon ?? FileCode2;
  const Thumbnail = item.entry?.Thumbnail;
  return (
    <div
      id={id}
      data-index={index}
      role="option"
      aria-selected={active}
      onMouseMove={onHover}
      onMouseDown={keepFocus}
      onClick={(e) => onSelect(e.metaKey || e.ctrlKey)}
      onAuxClick={(e) => e.button === 1 && onSelect(true)}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-foreground"
      )}
    >
      <span className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
        {Thumbnail ? <Thumbnail /> : <Icon className="size-4 text-muted-foreground" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">
            <Highlight text={item.title} words={words} />
          </span>
          {item.entry && isNewEntry(item.entry) && (
            <span className="shrink-0 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] leading-none font-medium text-blue-600 dark:text-blue-400">
              New
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          <Highlight text={item.description} words={words} />
        </span>
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${item.title} from recent`}
          onMouseDown={keepFocus}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "shrink-0 rounded-md p-1 text-muted-foreground transition-opacity hover:bg-background hover:text-foreground",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <X className="size-3.5" />
        </button>
      ) : (
        item.meta && <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{item.meta}</span>
      )}
    </div>
  );
}

/** Clicks inside the panel leave focus (and the caret) in the search field. */
function keepFocus(e: React.MouseEvent) {
  e.preventDefault();
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
