"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useMotionTemplate, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  /** The action label, e.g. "Generate spec" or "Run scout". */
  children: React.ReactNode;
  /** Leading icon. Defaults to Sparkles to mark the action as AI-powered; pass `null` to hide it. */
  icon?: React.ReactNode;
  /** Run a multicolor beam around the border. On by default; set `false` for a plain sheen. */
  beam?: boolean;
  /** Seconds for one lap of the beam. */
  beamDuration?: number;
}

const BEAM_STOPS =
  "transparent 0deg, #34d399 30deg, #60a5fa 70deg, transparent 110deg, transparent 180deg, #f472b6 210deg, #fb923c 250deg, transparent 290deg";

export function ShinyButton({
  children,
  icon = <Sparkles className="size-4" aria-hidden />,
  beam = true,
  beamDuration = 6,
  className,
  style,
  disabled,
  ...props
}: ShinyButtonProps) {
  const reduceMotion = useReducedMotion();
  const angle = useMotionValue(45);
  const spinning = beam && !disabled && !reduceMotion;

  React.useEffect(() => {
    if (!spinning) return;
    const controls = animate(angle, [angle.get(), angle.get() + 360], {
      duration: beamDuration,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [spinning, beamDuration, angle]);

  // The beam is painted on the button's own transparent border (border-box
  // layer) under the solid fill (padding-box layer). Fill and ring share one
  // edge on one element, so there is no gap or anti-aliased seam between them.
  const background = useMotionTemplate`linear-gradient(var(--shiny-fill), var(--shiny-fill)) padding-box, conic-gradient(from ${angle}deg, ${BEAM_STOPS}) border-box`;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      className={cn(
        "relative isolate overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium text-slate-50 [--shiny-fill:var(--color-slate-900)] disabled:opacity-50 dark:text-slate-900 dark:[--shiny-fill:var(--color-slate-100)]",
        !beam && "border border-white/10 bg-[var(--shiny-fill)]",
        className
      )}
      style={beam ? { border: "1.5px solid transparent", background, ...style } : style}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
      {!disabled && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPositionX: "150%" }}
          animate={reduceMotion ? undefined : { backgroundPositionX: "-50%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 2.2,
            ease: "linear",
            repeatDelay: 0.8,
          }}
        />
      )}
    </motion.button>
  );
}
