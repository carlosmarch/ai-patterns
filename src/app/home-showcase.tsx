"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AnimatedOrigami } from "@/components/animated-origami";
import { DemoStage } from "@/components/demo-wall";

export interface ShowcaseTile {
  id: string;
  demo: ReactNode;
}

// Six staggered columns of two tiles; each column's vertical offset and its
// tiles' heights, so the grid reads as a wall rather than a table.
const COLUMNS = [
  { offset: -36, heights: [250, 220] },
  { offset: 24, heights: [210, 260] },
  { offset: -96, heights: [280, 230] },
  { offset: 0, heights: [230, 250] },
  { offset: -60, heights: [260, 210] },
  { offset: 12, heights: [220, 260] },
];

// Fewer columns on narrow screens: three on phones, four on tablets. Phones
// also get shorter tiles (--tile-scale).
const COLUMN_VISIBILITY = ["flex", "flex", "flex", "hidden sm:flex", "hidden lg:flex", "hidden lg:flex"];

/**
 * The home page's door into the catalogue: a glimpse of live demos fading
 * into the block, then the count and the way in. The demos are decoration
 * here (inert), the full wall is on /patterns.
 */
export function HomeShowcase({ tiles, total, jobCount }: { tiles: ShowcaseTile[]; total: number; jobCount: number }) {
  return (
    <section
      id="patterns"
      className="logo-link relative scroll-mt-16 [--tile-scale:0.62] sm:[--tile-scale:1] overflow-hidden rounded-[32px] bg-(--showcase)"
      style={{ "--showcase": "color-mix(in oklab, var(--muted) 65%, var(--background))" } as CSSProperties}
    >
      <div inert aria-hidden className="absolute inset-x-0 top-0 flex gap-3 px-3">
        {COLUMNS.map((column, c) => (
          <div
            key={c}
            className={`${COLUMN_VISIBILITY[c]} min-w-0 flex-1 flex-col gap-3`}
            style={{ transform: `translateY(calc(${column.offset}px * var(--tile-scale)))` }}
          >
            {column.heights.map((height, r) => {
              const tile = tiles[c * 2 + r];
              return (
                tile && (
                  <div
                    key={tile.id}
                    className="relative overflow-hidden rounded-[24px] border bg-background/80 dark:bg-background/50"
                    style={{ height: `calc(${height}px * var(--tile-scale))` }}
                  >
                    <DemoStage demo={tile.demo} width={440} padding={14} reserveBottom={0} className="absolute inset-0" />
                  </div>
                )
              );
            })}
          </div>
        ))}
      </div>

      {/* The tiles fade into the block's own colour, leaving the top row clear. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_12%,var(--showcase)_50%)]" />

      <div className="relative flex flex-col items-center px-6 pt-[210px] pb-12 text-center sm:pt-[360px] sm:pb-14">
        <div className="flex size-20 items-center justify-center rounded-[24px] border bg-background">
          <AnimatedOrigami className="size-9" />
        </div>
        <h2 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Explore {total} patterns</h2>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg">
          Every one a live demo, with the code and the spec behind it. Sorted by the {jobCount} jobs they do for your
          user.
        </p>
        <Link
          href="/patterns"
          className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Browse patterns
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-10 text-sm text-muted-foreground">Open source, MIT licensed, readable by your coding agent.</p>
      </div>
    </section>
  );
}
