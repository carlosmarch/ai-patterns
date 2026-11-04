"use client";

import * as React from "react";
import type { LucideProps } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "motion/react";

// The AI Patterns brand mark: a paper crane drawn on lucide's 24×24 grid
// so it sits next to lucide icons at any size. One continuous outline
// (head → neck → body → tail) plus two creases that split the body into
// facets, with a faint fill on the left facet for the folded-paper read.

const HEAD = "M2.5 7 5 3.5";
const NECK = "M5 3.5 10 14";
const TAIL = "M21.5 4 14 14";
const OUTLINE = "M5 3.5 7 16.5 12 20l5.5-3.5L21.5 4";
const CREASE = "M7 16.5 12 12l5.5 4.5";
const KEEL = "M12 12v8";
const FACET = "M7 16.5 12 12v8z";

// Same props as a lucide icon, so the mark can go anywhere a `LucideIcon` is expected.
type MarkProps = Omit<LucideProps, "ref">;

function svgProps({ size = 24, strokeWidth = 2, absoluteStrokeWidth, ...props }: MarkProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

/** Static crane mark. Drop-in for a lucide icon (`className="size-5"`). */
export const OrigamiMark = React.forwardRef<SVGSVGElement, MarkProps>(function OrigamiMark(props, ref) {
  return (
    <svg ref={ref} {...svgProps(props)}>
      <path d={FACET} fill="currentColor" fillOpacity={0.18} stroke="none" />
      <path d={OUTLINE} />
      <path d={NECK} />
      <path d={TAIL} />
      <path d={HEAD} />
      <path d={CREASE} />
      <path d={KEEL} />
    </svg>
  );
});

type AnimatedMarkProps = MarkProps & {
  /**
   * `mount` folds once when it appears, `hover` also refolds on pointer
   * enter, `loop` keeps folding (for loading / "thinking" states).
   */
  trigger?: "mount" | "hover" | "loop";
  /** Change this value to replay the fold from outside (e.g. parent hover). */
  replayKey?: React.Key;
};

const ease = [0.65, 0, 0.35, 1] as const;
/** Loop cycle length (s) and the point where the unfold starts. */
const CYCLE = 2.4;
const HOLD = 0.82;

/**
 * The crane folds itself: the body outline creases in, the keel and side
 * creases follow, then neck and tail lift and the head tucks. Each stroke
 * is drawn with `pathLength`, so the motion reads as a fold, not a fade.
 * Renders the static mark when the user prefers reduced motion.
 */
export function OrigamiMarkAnimated({ trigger = "hover", replayKey, onPointerEnter, ...props }: AnimatedMarkProps) {
  const reduce = useReducedMotion();
  const [hoverKey, setHoverKey] = React.useState(0);

  if (reduce) return <OrigamiMark {...props} />;

  const loop = trigger === "loop";

  // One-shot: draw each stroke after its delay. Loop: the same timeline as
  // keyframes inside a fixed cycle (fold, hold, unfold together), so the
  // strokes never drift apart between repeats.
  const stroke = (delay: number, duration: number) =>
    loop
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: [0, 0, 1, 1, 0], opacity: [0, 1, 1, 1, 0] },
          transition: {
            duration: CYCLE,
            times: [0, delay / CYCLE, (delay + duration) / CYCLE, HOLD, 1],
            ease,
            repeat: Infinity,
          } satisfies Transition,
        }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay, duration, ease },
            opacity: { delay, duration: 0.01 },
          } satisfies Transition,
        };

  const facet = loop
    ? {
        animate: { fillOpacity: [0, 0, 0.18, 0.18, 0] },
        transition: { duration: CYCLE, times: [0, 0.55 / CYCLE, 1.05 / CYCLE, HOLD, 1], repeat: Infinity },
      }
    : { animate: { fillOpacity: 0.18 }, transition: { delay: 0.55, duration: 0.5 } };

  return (
    <svg
      {...svgProps(props)}
      onPointerEnter={(e) => {
        if (trigger === "hover") setHoverKey((k) => k + 1);
        onPointerEnter?.(e);
      }}
    >
      <g key={`${String(replayKey ?? "")}-${hoverKey}`}>
        <motion.path d={FACET} fill="currentColor" stroke="none" initial={{ fillOpacity: 0 }} {...facet} />
        <motion.path d={OUTLINE} {...stroke(0, 0.6)} />
        <motion.path d={KEEL} {...stroke(0.35, 0.3)} />
        <motion.path d={CREASE} {...stroke(0.45, 0.4)} />
        <motion.path d={NECK} {...stroke(0.6, 0.35)} />
        <motion.path d={TAIL} {...stroke(0.6, 0.35)} />
        <motion.path d={HEAD} {...stroke(0.9, 0.2)} />
      </g>
    </svg>
  );
}
