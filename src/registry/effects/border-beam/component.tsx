"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Seconds for one lap of the beam. Halved while `active`. */
  duration?: number;
  /** Turn the beam up while the AI is working: faster lap and a brighter glow. */
  active?: boolean;
  /** Hide the beam entirely, e.g. once the surface is idle and out of focus. */
  disabled?: boolean;
  /** Colors the beam cycles through, as CSS colors. Two soft arcs are drawn from them. */
  colors?: [string, string, string, string];
  /** Inner radius of the wrapped surface, matched so the beam hugs its corners. */
  radius?: number | string;
}

/** Masks an element down to its padding box: only the ring between border and content shows. */
const RING_MASK: React.CSSProperties = {
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
};

const DEFAULT_COLORS: [string, string, string, string] = ["#34d399", "#60a5fa", "#f472b6", "#fb923c"];

/**
 * Wraps a surface (composer, search field, card) and runs a soft multicolor
 * glow around its border. The beam is two arcs of a rotating conic gradient,
 * masked to a 1px ring, plus a blurred copy that bleeds slightly inside.
 */
export function BorderBeam({
  children,
  duration = 8,
  active = false,
  disabled = false,
  colors = DEFAULT_COLORS,
  radius = 16,
  className,
  style,
  ...props
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion();
  const [a, b, c, d] = colors;
  const gradient = `conic-gradient(from 0deg, transparent 0deg, ${a} 30deg, ${b} 70deg, transparent 110deg, transparent 180deg, ${c} 210deg, ${d} 250deg, transparent 290deg)`;
  const lap = active ? duration / 2 : duration;
  const r = typeof radius === "number" ? `${radius}px` : radius;

  const spinner = (
    <motion.span
      aria-hidden
      className="absolute top-1/2 left-1/2 aspect-square w-[max(200%,40rem)] -translate-x-1/2 -translate-y-1/2"
      style={{ background: gradient }}
      animate={reduceMotion ? { rotate: 45 } : { rotate: 360 }}
      transition={reduceMotion ? { duration: 0 } : { duration: lap, ease: "linear", repeat: Infinity }}
    />
  );

  return (
    <div className={cn("relative isolate", className)} style={{ borderRadius: r, ...style }} {...props}>
      {children}
      {!disabled && (
        <>
          {/* Soft glow: a wider ring of the same beam, blurred and clipped so it bleeds inward only. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ borderRadius: r }}
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 0.8 : 0.45 }}
            transition={{ duration: 0.6 }}
          >
            <span className="absolute inset-0 blur-md">
              <span className="absolute inset-0 overflow-hidden p-1.5" style={{ borderRadius: r, ...RING_MASK }}>
                {spinner}
              </span>
            </span>
          </motion.span>
          {/* The crisp beam on the 1px border ring. */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden p-px"
            style={{ borderRadius: r, ...RING_MASK }}
            initial={{ opacity: 0 }}
            animate={{ opacity: active ? 1 : 0.7 }}
            transition={{ duration: 0.6 }}
          >
            {spinner}
          </motion.span>
        </>
      )}
    </div>
  );
}
