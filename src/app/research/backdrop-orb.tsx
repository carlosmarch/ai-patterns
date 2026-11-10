"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

import { VoiceOrb } from "@/registry/voice/voice-orb/component";

/** How far (px) the orb drifts toward the pointer. */
const DRIFT = 48;
const SPRING = { stiffness: 40, damping: 18, mass: 1.2 };
/** How much faster than the orb its reflection slides, the other way. */
const SHEEN_PARALLAX = -3;

/**
 * Banded steel, diagonal. Darker on the light theme and brighter on the dark
 * one, so the bands read on either background.
 */
const STEEL = {
  light: ["#0b0f14", "#6b7280", "#1f2937", "#a3a9b3", "#111827", "#4b5563", "#d1d5db", "#1f2937", "#6b7280"],
  dark: ["#ffffff", "#6b7280", "#f3f4f6", "#374151", "#e5e7eb", "#9ca3af", "#ffffff", "#4b5563", "#d1d5db"],
};


/**
 * Decorative Voice Orb bleeding off the top-right corner, behind the brief.
 *
 * It answers the pointer: the orb drifts toward it on a soft spring, and the
 * sphere swells and ripples with how fast the pointer moves and how close it
 * gets — fed in through the orb's `level` ref, as live audio would be. With
 * nothing happening it keeps a slow breath, so it never sits dead still.
 *
 * It reads as polished steel: every particle is painted with a banded grey
 * canvas gradient (the orb's `fill`), so the bands land on the dots only and
 * the page stays clean. The bands slide against the orb's drift, so the
 * reflection moves as the pointer does, and a soft off-centre glow behind it
 * adds the shine. A radial mask fades the sphere into the page. Smaller and
 * fainter on phones, where it sits behind the title.
 *
 * Kept cheap on purpose: the gradient is drawn by the canvas itself (an SVG
 * filter over a canvas this size re-rasterises every frame), the canvas is
 * drawn at 1x (the mask and opacity hide the difference), and the pointer
 * handler reads layout only after a scroll or resize.
 */
export function BackdropOrb() {
  const ref = React.useRef<HTMLDivElement>(null);
  const level = React.useRef(0);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  // The reflection slides the other way, faster, like light on a curved surface.
  const fill = React.useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const stops = document.documentElement.classList.contains("dark") ? STEEL.dark : STEEL.light;
      const ox = -0.25 * width + x.get() * SHEEN_PARALLAX;
      const oy = -0.25 * height + y.get() * SHEEN_PARALLAX;
      const g = ctx.createLinearGradient(ox, oy, ox + 1.5 * width, oy + 1.5 * height);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      return g;
    },
    [x, y]
  );

  React.useEffect(() => {
    if (reduced) {
      level.current = 0.15;
      return;
    }

    let energy = 0; // pointer speed, decays every frame
    let proximity = 0; // 1 at the orb's centre, 0 a full radius away
    let last: { x: number; y: number; t: number } | null = null;
    // The orb's resting centre and radius in viewport px, without its drift. Re-measured only after a scroll or resize.
    let anchor: { cx: number; cy: number; reach: number } | null = null;
    const invalidate = () => {
      anchor = null;
    };

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const now = performance.now();
      if (last) {
        const dt = Math.max(now - last.t, 8);
        const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px per ms
        energy = Math.min(1, energy + speed * 0.25);
      }
      last = { x: e.clientX, y: e.clientY, t: now };

      if (!anchor) {
        const box = el.getBoundingClientRect();
        anchor = {
          cx: box.left + box.width / 2 - x.get(),
          cy: box.top + box.height / 2 - y.get(),
          reach: box.width / 2,
        };
      }
      const { cx, cy, reach } = anchor;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      proximity = Math.max(0, 1 - dist / reach);
      // Lean toward the pointer, harder the closer it is.
      const pull = DRIFT * (0.4 + 0.6 * proximity);
      x.set((dx / (dist || 1)) * pull * Math.min(1, dist / 200));
      y.set((dy / (dist || 1)) * pull * Math.min(1, dist / 200));
    };

    const onLeave = () => {
      last = null;
      proximity = 0;
      x.set(0);
      y.set(0);
    };

    let frame = 0;
    const tick = (now: number) => {
      energy *= 0.94;
      const breath = 0.12 + 0.08 * Math.sin(now / 1400);
      level.current = Math.min(1, breath + energy * 0.7 + proximity * 0.35);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, x, y]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute -top-40 -right-64 -z-10 size-[36rem] opacity-40 [mask-image:radial-gradient(closest-side,black_55%,transparent)] sm:-top-80 sm:-right-64 sm:size-[64rem] sm:opacity-100"
    >
      {/* A soft specular glow, off-centre toward the light, so the sphere reads as polished. */}
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(148_163_184/0.45),rgb(203_213_225/0.18)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.16),rgb(148_163_184/0.06)_40%,transparent_70%)]" />
      <VoiceOrb
        state="speaking"
        level={level}
        particles={3200}
        fill={fill}
        maxPixelRatio={1.5}
        className="size-full"
      />
    </motion.div>
  );
}
