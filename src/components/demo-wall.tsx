"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { NewBadge } from "@/components/new-badge";
import { patternTransitionName } from "@/components/pattern-expand";

// The wall of live demos: the /patterns gallery and the home page's preview of
// it share these cards and the way they're dealt into columns.

export interface WallItem {
  id: string;
  category: string;
  slug: string;
  title: string;
  job: string;
  href: string;
  isNew: boolean;
  demo: ReactNode;
}

// Column count per breakpoint (Tailwind sm / lg), read on the client; the static
// HTML assumes the desktop wall.
export const SM = "(min-width: 640px)";
const LG = "(min-width: 1024px)";

function subscribeToColumns(onChange: () => void) {
  const queries = [SM, LG].map((q) => window.matchMedia(q));
  queries.forEach((mq) => mq.addEventListener("change", onChange));
  return () => queries.forEach((mq) => mq.removeEventListener("change", onChange));
}

function getColumns() {
  return window.matchMedia(LG).matches ? 3 : window.matchMedia(SM).matches ? 2 : 1;
}

/** 1, 2 or 3 columns, following the viewport. */
export function useColumnCount() {
  return useSyncExternalStore(subscribeToColumns, getColumns, () => 3);
}

/** Card heights cycle so the columns stagger like a masonry wall. */
const HEIGHTS = [420, 500, 440, 520, 460, 400];

/**
 * Deal the cards into columns, each to the currently shortest one, so the
 * wall reads left to right in order and the columns end level (the last card
 * of each column stretches to close the remaining gap).
 */
function toColumns<T>(items: T[], count: number) {
  const columns: { item: T; height: number }[][] = Array.from({ length: count }, () => []);
  const totals = new Array<number>(count).fill(0);
  items.forEach((item, i) => {
    const height = HEIGHTS[i % HEIGHTS.length];
    const shortest = totals.indexOf(Math.min(...totals));
    columns[shortest].push({ item, height });
    totals[shortest] += height;
  });
  return columns;
}

/** A pattern page opened straight into its expanded view. */
export function expandedHref(item: Pick<WallItem, "href">) {
  return `${item.href}?view=expanded`;
}

/** The masonry wall itself: `items` in reading order, `onOpen` when a card is opened. */
export function DemoWall({ items, onOpen }: { items: WallItem[]; onOpen: (item: WallItem) => void }) {
  const columns = toColumns(items, useColumnCount());
  return (
    <div className="flex items-stretch gap-3">
      {columns.map((column, c) => (
        <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3">
          {column.map(({ item, height }) => (
            <li key={item.id} className="flex flex-col last:flex-1">
              <DemoCard item={item} height={height} onOpen={() => onOpen(item)} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

// Clicks on the demo's own controls play with the demo; anywhere else opens the pattern.
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [role="slider"], [role="switch"], [role="tab"], [role="checkbox"], [role="radio"], [role="menuitem"], [role="option"], [contenteditable="true"]';

function DemoCard({ item, height, onOpen }: { item: WallItem; height: number; onOpen: () => void }) {
  function handleCardClick(e: MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (target.closest(INTERACTIVE) || window.getSelection()?.toString()) return;
    onOpen();
  }

  function handleLinkClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let new-tab / new-window clicks through.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onOpen();
  }

  return (
    <ViewTransition name={patternTransitionName(item.category, item.slug)} share="pattern-morph" default="none">
      <article
        onClick={handleCardClick}
        className="group relative flex-1 cursor-pointer overflow-hidden rounded-[28px] bg-muted/70 dark:bg-muted/40"
        style={{ minHeight: height }}
      >
        <DemoStage demo={item.demo} className="absolute inset-0" />

        {item.isNew && (
          <span className="pointer-events-none absolute top-4 left-4 flex rounded-full bg-background">
            <NewBadge />
          </span>
        )}

        <Link
          href={expandedHref(item)}
          onClick={handleLinkClick}
          className="absolute right-3 bottom-3 left-3 flex items-center gap-2 rounded-full bg-background/90 py-1.5 pr-1.5 pl-4 text-sm backdrop-blur"
        >
          {/* Always visible: what it is and its category. */}
          <span className="min-w-0 truncate font-medium">{item.title}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground capitalize">{item.category}</span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
            <ArrowUpRight className="size-3.5" />
          </span>
        </Link>
      </article>
    </ViewTransition>
  );
}

/**
 * A live demo laid out at `width` and scaled down (never up) to fit its box,
 * like a print on a stage. Mounted only once it comes near the viewport:
 * dozens of live demos at once is a lot of timers and animation.
 */
export function DemoStage({
  demo,
  className,
  width = 480,
  padding = 28,
  reserveBottom = 24,
}: {
  demo: ReactNode;
  className?: string;
  /** The width the demo lays out at before scaling. */
  width?: number;
  padding?: number;
  /** Extra room kept clear at the bottom (the card's title pill). */
  reserveBottom?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!mounted || !box || !content) return;
    const fit = () => {
      const w = box.clientWidth - padding * 2;
      const h = box.clientHeight - padding * 2 - reserveBottom;
      setScale(Math.min(1, w / content.offsetWidth, h / Math.max(1, content.offsetHeight)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    ro.observe(content);
    return () => ro.disconnect();
  }, [mounted, padding, reserveBottom]);

  return (
    <div ref={boxRef} className={className}>
      {mounted && (
        <div
          className="absolute top-1/2 left-1/2 cursor-auto"
          style={{
            transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
            visibility: scale === null ? "hidden" : "visible",
          }}
        >
          <div ref={contentRef} className="flex justify-center" style={{ width }}>
            {demo}
          </div>
        </div>
      )}
    </div>
  );
}
