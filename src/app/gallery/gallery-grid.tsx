"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { NewBadge } from "@/components/new-badge";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title: string;
  job: string;
  href: string;
  isNew: boolean;
  demo: ReactNode;
}

const ALL = "all";
const NEW = "new";

/** Card heights cycle so the columns stagger like a masonry wall. */
const HEIGHTS = [420, 500, 440, 520, 460, 400];

/** The width demos lay out at before being scaled into their card. */
const STAGE_WIDTH = 480;
const STAGE_PADDING = 28;

export function GalleryGrid({ items, filters }: { items: GalleryItem[]; filters: { id: string; label: string }[] }) {
  const [active, setActive] = useState(ALL);
  const visible = items.filter((item) =>
    active === ALL ? true : active === NEW ? item.isNew : item.job === active,
  );
  const pills = [{ id: ALL, label: "All" }, { id: NEW, label: "New" }, ...filters];

  return (
    <>
      <div role="toolbar" aria-label="Filter patterns" className="mt-14 mb-5 flex flex-wrap gap-2">
        {pills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            aria-pressed={active === pill.id}
            onClick={() => setActive(pill.id)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition-colors",
              active === pill.id
                ? "bg-foreground text-background"
                : "bg-muted text-foreground/80 hover:bg-muted-foreground/15 hover:text-foreground",
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {visible.map((item, i) => (
          <li key={item.id} className="mb-3 break-inside-avoid">
            <GalleryCard item={item} height={HEIGHTS[i % HEIGHTS.length]} />
          </li>
        ))}
      </ul>
    </>
  );
}

function GalleryCard({ item, height }: { item: GalleryItem; height: number }) {
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

  return (
    <article
      className="group relative overflow-hidden rounded-[28px] bg-muted/70 dark:bg-muted/40"
      style={{ height }}
    >
      <div ref={cardRef} className="absolute inset-0">
        {mounted && (
          <div
            className="absolute top-1/2 left-1/2"
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
        href={item.href}
        className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 rounded-full bg-background/90 py-1.5 pr-1.5 pl-4 text-sm font-medium opacity-0 shadow-sm backdrop-blur transition-[opacity,transform] duration-200 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100 lg:translate-y-1 lg:group-hover:translate-y-0"
      >
        <span className="truncate">{item.title}</span>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <ArrowUpRight className="size-3.5" />
        </span>
      </Link>
    </article>
  );
}
