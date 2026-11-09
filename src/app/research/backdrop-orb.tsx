"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

import { VoiceOrb } from "@/registry/voice/voice-orb/component";

/** How far (px) the orb drifts toward the pointer. */
const DRIFT = 48;
const SPRING = { stiffness: 40, damping: 18, mass: 1.2 };

/**
 * Decorative Voice Orb bleeding off the top-right corner, behind the brief.
 *
 * It answers the pointer: the orb drifts toward it on a soft spring, and the
 * sphere swells and ripples with how fast the pointer moves and how close it
 * gets — fed in through the orb's `level` ref, as live audio would be. With
 * nothing happening it keeps a slow breath, so it never sits dead still.
 *
 * The radial mask makes the wrapper its own compositing group, so the
 * gradient layer blends (`mix-blend-color`) only with the orb: it tints the
 * grey particles and, where there are none, shows as a soft glow that the
 * mask fades into the page. Smaller and fainter on phones, where it sits
 * behind the title.
 */
export function BackdropOrb() {
  const ref = React.useRef<HTMLDivElement>(null);
  const level = React.useRef(0);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  React.useEffect(() => {
    if (reduced) {
      level.current = 0.15;
      return;
    }

    let energy = 0; // pointer speed, decays every frame
    let proximity = 0; // 1 at the orb's centre, 0 a full radius away
    let last: { x: number; y: number; t: number } | null = null;

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

      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = box.width / 2;
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
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, x, y]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none absolute -top-40 -right-64 -z-10 size-[36rem] opacity-50 [mask-image:radial-gradient(closest-side,black_50%,transparent)] sm:-top-80 sm:-right-64 sm:size-[64rem] sm:opacity-100"
    >
      <VoiceOrb state="speaking" level={level} particles={3200} className="size-full text-foreground/45" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#7dd3fc_0%,#a78bfa_35%,#f472b6_65%,#fb923c_100%)] opacity-80 mix-blend-color" />
    </motion.div>
  );
}
