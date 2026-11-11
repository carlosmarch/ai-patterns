"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

import { AnimatedOrigami } from "@/components/animated-origami";
import { DemoStage } from "@/components/demo-wall";
import { BorderBeam } from "@/registry/effects/border-beam/component";
import { cn } from "@/lib/utils";

export interface ShowcaseTile {
  id: string;
  demo: ReactNode;
}

// Six staggered columns of two tiles; each column's vertical offset, its
// tiles' heights and how long one loop takes, so the grid reads
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
const COLUMN_VISIBILITY = [
  "flex",
  "flex",
  "flex",
  "hidden sm:flex",
  "hidden lg:flex",
  "hidden lg:flex",
];

/**
 * A full-width page-header background: small live demos in staggered columns
 * drifting slowly (up and down in turn; still under prefers-reduced-motion),
 * with a clearing behind the header's own content (`children`, centred) and
 * the bottom fading into the page. The demos are decoration (inert); the
 * content carries the links.
 */
export function Showcase({
  tiles,
  className,
  children,
}: {
  /** Two per column, column by column; the first of each pair is the clearer one. */
  tiles: ShowcaseTile[];
  className?: string;
  children: ReactNode;
}) {
  return (
    // Phones get shorter tiles (--tile-scale).
    <section
      className={cn(
        "logo-link relative overflow-hidden bg-background [--tile-scale:0.62] sm:[--tile-scale:1]",
        className,
      )}
    >
      <div
        inert
        aria-hidden
        className="absolute inset-x-0 top-0 flex gap-3 px-3"
      >
        {COLUMNS.map((column, c) => {
          const pair = [tiles[c * 2], tiles[c * 2 + 1]];
          return (
            <div
              key={c}
              className={`${COLUMN_VISIBILITY[c]} min-w-0 flex-1 flex-col`}
              style={{
                transform: `translateY(calc(${column.offset}px * var(--tile-scale)))`,
              }}
            >
              {/* The pair repeats three times and the column loops by one repeat,
                  so it always reaches the bottom of the header. */}
              <div
                className="showcase-drift flex flex-col"
                style={{
                  animationDuration: `${column.duration}s`,
                  animationDirection: c % 2 ? "reverse" : "normal",
                }}
              >
                {[0, 1, 2].map((round) =>
                  pair.map(
                    (tile, r) =>
                      tile && (
                        <div key={`${tile.id}-${round}`} className="pb-3">
                          <div
                            className="relative overflow-hidden rounded-[24px] bg-muted/70 dark:bg-muted/40"
                            style={{
                              height: `calc(${column.heights[r]}px * var(--tile-scale))`,
                            }}
                          >
                            <DemoStage
                              demo={tile.demo}
                              width={440}
                              padding={14}
                              reserveBottom={0}
                              className="absolute inset-0"
                            />
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

      {/* A clearing behind the content (wider on phones), and the bottom fading into the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_42%_at_50%_55%,var(--background)_45%,transparent_100%),linear-gradient(to_bottom,transparent_45%,var(--background)_96%)] sm:bg-[radial-gradient(ellipse_42%_48%_at_50%_52%,var(--background)_35%,transparent_100%),linear-gradient(to_bottom,transparent_45%,var(--background)_96%)]"
      />

      <div className="relative flex flex-col items-center px-6 py-20 text-center sm:py-28">
        {children}
      </div>
    </section>
  );
}

/** The logo in a tile, for the top of a showcase's content. */
/** Same arcs and lap as BorderBeam's defaults, so the outer glow tracks the beam. */
const BEAM_GRADIENT =
  "conic-gradient(from 0deg, transparent 0deg, #34d399 30deg, #60a5fa 70deg, transparent 110deg, transparent 180deg, #f472b6 210deg, #fb923c 250deg, transparent 290deg)";
const BEAM_LAP = 8;

export function ShowcaseLogo({ className, beam = false }: { className?: string; beam?: boolean }) {
  const reduceMotion = useReducedMotion();
  const logo = (
    <div
      className={cn(
        "relative flex size-16 items-center justify-center rounded-[20px] bg-muted",
        !beam && className,
      )}
    >
      <AnimatedOrigami className="size-9" />
    </div>
  );
  if (!beam) return logo;
  return (
    <BorderBeam radius={20} duration={BEAM_LAP} className={className}>
      {/* Outer glow: the beam's gradient, blurred behind the logo so it only shows past its edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1.5 -z-10 overflow-hidden rounded-[26px] opacity-70 blur-lg"
      >
        <motion.span
          className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
          style={{ background: BEAM_GRADIENT }}
          animate={reduceMotion ? { rotate: 45 } : { rotate: 360 }}
          transition={reduceMotion ? { duration: 0 } : { duration: BEAM_LAP, ease: "linear", repeat: Infinity }}
        />
      </span>
      {logo}
    </BorderBeam>
  );
}
