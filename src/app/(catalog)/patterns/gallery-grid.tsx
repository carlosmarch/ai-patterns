"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { NewBadge } from "@/components/new-badge";
import { markOpeningFromGallery, patternTransitionName } from "@/components/pattern-expand";
import { CatalogHeader, type CatalogFilter } from "@/components/catalog-header";
import { setCatalogJob } from "@/components/catalog-filter-store";

export interface GalleryItem {
  id: string;
  category: string;
  slug: string;
  title: string;
  job: string;
  href: string;
  isNew: boolean;
  demo: ReactNode;
}

const ALL = "all";

// Column count per breakpoint (Tailwind sm / lg), read on the client; the static
// HTML assumes the desktop wall.
const SM = "(min-width: 640px)";
const LG = "(min-width: 1024px)";

function subscribeToColumns(onChange: () => void) {
  const queries = [SM, LG].map((q) => window.matchMedia(q));
  queries.forEach((mq) => mq.addEventListener("change", onChange));
  return () => queries.forEach((mq) => mq.removeEventListener("change", onChange));
}

function getColumns() {
  return window.matchMedia(LG).matches ? 3 : window.matchMedia(SM).matches ? 2 : 1;
}

/**
 * Deal the cards into columns, each to the currently shortest one, so the
 * wall reads left to right in catalogue order and the columns end level
 * (the last card of each column stretches to close the remaining gap).
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
const NEW = "new";

/** Card heights cycle so the columns stagger like a masonry wall. */
const HEIGHTS = [420, 500, 440, 520, 460, 400];

/** The width demos lay out at before being scaled into their card. */
const STAGE_WIDTH = 480;
const STAGE_PADDING = 28;

// Filter and scroll position, kept while a pattern is open so closing it lands
// back in place. Coming back is a client-side navigation, so a module variable
// survives it; on a hard load it's null, matching the static HTML.
let returnState: { filter: string; y: number } | null = null;

function saveReturnState(state: { filter: string; y: number }) {
  returnState = state;
}

function takeReturnState() {
  const state = returnState;
  returnState = null;
  return state;
}

function expandedHref(item: GalleryItem) {
  return `${item.href}?view=expanded`;
}

/** The gallery URL for the job filter (`?job=`). */
function galleryHref(filter: string) {
  return filter === ALL ? "/patterns" : `/patterns?job=${encodeURIComponent(filter)}`;
}

export function GalleryGrid({
  items,
  filters,
}: {
  /** In catalogue order: by job, clustered by category. */
  items: GalleryItem[];
  filters: CatalogFilter[];
}) {
  const router = useRouter();
  // Read, not taken, in the initializer: Strict Mode runs initializers twice.
  const [restore] = useState(() => returnState);
  const [active, setActive] = useState(restore?.filter ?? ALL);

  // Put the scroll back before the first paint, so the view transition
  // morphs into the right card.
  useLayoutEffect(() => {
    takeReturnState();
    if (restore) window.scrollTo(0, restore.y);
  }, [restore]);

  // Otherwise the filter comes from ?job= (a shared link or a reload). Synced
  // after hydration: the static HTML always renders "all".
  useEffect(() => {
    if (restore) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("job");
    const valid = fromUrl === NEW || filters.some((f) => f.id === fromUrl);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && valid) setActive(fromUrl);
  }, [restore, filters]);

  // Tell the patterns sidebar which job is in play, so it can fold the others.
  useEffect(() => {
    setCatalogJob(active === ALL || active === NEW ? null : active);
  }, [active]);

  function choose(id: string) {
    setActive(id);
    window.history.replaceState(window.history.state, "", galleryHref(id));
  }

  function open(item: GalleryItem) {
    saveReturnState({ filter: active, y: window.scrollY });
    markOpeningFromGallery(galleryHref(active));
    router.push(expandedHref(item));
  }

  // One wall, no section headings: catalogue order (by job) or, for "New", newest first.
  const visible = items.filter((item) => (active === ALL ? true : active === NEW ? item.isNew : item.job === active));
  const columnCount = useSyncExternalStore(subscribeToColumns, getColumns, () => 3);
  const columns = toColumns(visible, columnCount);

  return (
    <>
      <CatalogHeader
        total={items.length}
        newCount={items.filter((item) => item.isNew).length}
        filters={filters}
        active={active}
        onChoose={choose}
      />

      <div className="flex items-stretch gap-3">
        {columns.map((column, c) => (
          <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3">
            {column.map(({ item, height }) => (
              <li key={item.id} className="flex flex-col last:flex-1">
                <GalleryCard item={item} height={height} onOpen={() => open(item)} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </>
  );
}

// Clicks on the demo's own controls play with the demo; anywhere else opens the pattern.
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [role="slider"], [role="switch"], [role="tab"], [role="checkbox"], [role="radio"], [role="menuitem"], [role="option"], [contenteditable="true"]';

function GalleryCard({ item, height, onOpen }: { item: GalleryItem; height: number; onOpen: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState<number | null>(null);

  // Mount demos only once they come near the viewport: ~90 live demos at once
  // is a lot of timers and animation.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  // Scale the demo down (never up) so it fits the card, like a print on a stage.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const content = contentRef.current;
    if (!mounted || !card || !content) return;
    const fit = () => {
      const w = card.clientWidth - STAGE_PADDING * 2;
      const h = card.clientHeight - STAGE_PADDING * 2 - 24;
      const s = Math.min(1, w / content.offsetWidth, h / Math.max(1, content.offsetHeight));
      setScale(s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(card);
    ro.observe(content);
    return () => ro.disconnect();
  }, [mounted]);

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
        <div ref={cardRef} className="absolute inset-0">
          {mounted && (
            <div
              className="absolute top-1/2 left-1/2 cursor-auto"
              style={{
                transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
                visibility: scale === null ? "hidden" : "visible",
              }}
            >
              <div ref={contentRef} className="flex justify-center" style={{ width: STAGE_WIDTH }}>
                {item.demo}
              </div>
            </div>
          )}
        </div>

        {item.isNew && (
          <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-background">
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
