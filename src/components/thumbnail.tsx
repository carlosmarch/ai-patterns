import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * Tiny SVG primitives for the simplified, wireframe-style hero image each
 * pattern ships in its `thumbnail.tsx`. Everything draws on a 200×120
 * canvas and uses theme tokens, so thumbnails follow light/dark mode.
 */

export const tone = {
  text: "fill-muted-foreground/35",
  faint: "fill-muted-foreground/15",
  strong: "fill-foreground",
  card: "fill-card stroke-border",
  muted: "fill-muted stroke-border",
} as const;

export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      aria-hidden
      className={cn("h-full w-full", className)}
      fill="none"
      strokeWidth={0.75}
    >
      {children}
    </svg>
  );
}

export function Line({
  x,
  y,
  w,
  h = 4,
  className = tone.text,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  className?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={className} />;
}

export function Box({
  x,
  y,
  w,
  h,
  r = 6,
  className = tone.card,
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  className?: string;
  dashed?: boolean;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      className={className}
      strokeDasharray={dashed ? "2 2" : undefined}
    />
  );
}

export function Dot({
  cx,
  cy,
  r = 3,
  className = tone.text,
  dashed,
}: {
  cx: number;
  cy: number;
  r?: number;
  className?: string;
  dashed?: boolean;
}) {
  return (
    <circle cx={cx} cy={cy} r={r} className={className} strokeDasharray={dashed ? "1.5 1.5" : undefined} />
  );
}

/** A filled pill button; `outline` draws a bordered, empty one. */
export function Button({
  x,
  y,
  w,
  h = 10,
  outline,
  className,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  outline?: boolean;
  className?: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={h / 2}
      className={className ?? (outline ? tone.card : tone.strong)}
    />
  );
}

/** A small check mark centred on (cx, cy). */
export function Check({ cx, cy, s = 3, className = "stroke-background" }: { cx: number; cy: number; s?: number; className?: string }) {
  return (
    <path
      d={`M${cx - s} ${cy} l${s * 0.7} ${s * 0.7} l${s * 1.3} -${s * 1.4}`}
      className={className}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
