"use client";

import type { CSSProperties, ReactNode } from "react";

import { AnimatedOrigami } from "@/components/animated-origami";
import { DemoStage } from "@/components/demo-wall";
import { cn } from "@/lib/utils";

export interface ShowcaseTile {
  id: string;
  demo: ReactNode;
}

// Six staggered columns of two tiles; each column's vertical offset, its
// tiles' heights and (when moving) how long one loop takes, so the grid reads
// as a wall rather than a table.
const COLUMNS = [
  { offset: -36, heights: [250, 220], duration: 46 },
  { offset: 24, heights: [210, 260], duration: 58 },
  { offset: -96, heights: [280, 230], duration: 50 },
  { offset: 0, heights: [230, 250], duration: 62 },
  { offset: -60, heights: [260, 210], duration: 48 },
  { offset: 12, heights: [220, 260], duration: 56 },
];

// Fewer columns on narrow screens: three on phones, four on tablets.
const COLUMN_VISIBILITY = ["flex", "flex", "flex", "hidden sm:flex", "hidden lg:flex", "hidden lg:flex"];

/**
 * A block that opens onto the catalogue: small live demos in staggered
 * columns, fading into the block, over the block's own content (`children`:
 * a heading, a line and a call to action, centred). The demos are decoration
 * (inert); the content carries the links.
 *
 * `compact` makes it shorter; `moving` sets each column drifting slowly, up
 * and down in turn (still under prefers-reduced-motion).
 */
export function Showcase({
  tiles,
  compact,
  moving,
  id,
  className,
  children,
}: {
  /** Two per column, column by column; the first of each pair is the clearer one. */
  tiles: ShowcaseTile[];
  compact?: boolean;
  moving?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "logo-link relative scroll-mt-16 overflow-hidden rounded-[32px] bg-(--showcase)",
        // Tile size: phones get shorter tiles, a compact block shorter still.
        compact ? "[--tile-scale:0.5] sm:[--tile-scale:0.72]" : "[--tile-scale:0.62] sm:[--tile-scale:1]",
        className,
      )}
      style={{ "--showcase": "color-mix(in oklab, var(--muted) 65%, var(--background))" } as CSSProperties}
    >
      <div inert aria-hidden className="absolute inset-x-0 top-0 flex gap-3 px-3">
        {COLUMNS.map((column, c) => {
          const pair = [tiles[c * 2], tiles[c * 2 + 1]];
          // Moving columns repeat their tiles once, then loop by half their height.
          const rounds = moving ? [0, 1] : [0];
          return (
            <div
              key={c}
              className={`${COLUMN_VISIBILITY[c]} min-w-0 flex-1 flex-col`}
              style={{ transform: `translateY(calc(${column.offset}px * var(--tile-scale)))` }}
            >
              <div
                className={cn("flex flex-col", moving && "showcase-drift")}
                style={
                  moving
                    ? { animationDuration: `${column.duration}s`, animationDirection: c % 2 ? "reverse" : "normal" }
                    : undefined
                }
              >
                {rounds.map((round) =>
                  pair.map(
                    (tile, r) =>
                      tile && (
                        <div key={`${tile.id}-${round}`} className="pb-3">
                          <div
                            className="relative overflow-hidden rounded-[24px] border bg-background/80 dark:bg-background/50"
                            style={{ height: `calc(${column.heights[r]}px * var(--tile-scale))` }}
                          >
                            <DemoStage demo={tile.demo} width={440} padding={14} reserveBottom={0} className="absolute inset-0" />
                          </div>
                        </div>
                      ),
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* The tiles fade into the block's own colour, leaving the top row clear. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          compact
            ? "bg-[linear-gradient(to_bottom,transparent_8%,var(--showcase)_42%)]"
            : "bg-[linear-gradient(to_bottom,transparent_12%,var(--showcase)_50%)]",
        )}
      />

      <div
        className={cn(
          "relative flex flex-col items-center px-6 text-center",
          compact ? "pt-[150px] pb-10 sm:pt-[200px] sm:pb-12" : "pt-[210px] pb-12 sm:pt-[360px] sm:pb-14",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** The logo in its bordered tile, for the top of a showcase's content. */
export function ShowcaseLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex size-20 items-center justify-center rounded-[24px] border bg-background", className)}>
      <AnimatedOrigami className="size-9" />
    </div>
  );
}
