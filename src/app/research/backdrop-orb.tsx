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
 * Banded steel, diagonal, as an SVG image the filter can sample. Darker on
 * the light theme and brighter on the dark one, so the bands read on either
 * background.
 */
const STEEL = {
  light: ["#0b0f14", "#6b7280", "#1f2937", "#a3a9b3", "#111827", "#4b5563", "#d1d5db", "#1f2937", "#6b7280"],
  dark: ["#ffffff", "#6b7280", "#f3f4f6", "#374151", "#e5e7eb", "#9ca3af", "#ffffff", "#4b5563", "#d1d5db"],
};

function steelImage(stops: string[]) {
  const s = stops.map((c, i) => `<stop offset='${i / (stops.length - 1)}' stop-color='${c}'/>`).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>${s}</linearGradient><rect width='1' height='1' fill='url(#g)'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Decorative Voice Orb bleeding off the top-right corner, behind the brief.
 *
 * It answers the pointer: the orb drifts toward it on a soft spring, and the
 * sphere swells and ripples with how fast the pointer moves and how close it
 * gets — fed in through the orb's `level` ref, as live audio would be. With
 * nothing happening it keeps a slow breath, so it never sits dead still.
 *
 * It reads as polished steel: an SVG filter fills every particle with a
 * banded grey gradient, keeping the particle's own alpha (`feComposite in`),
 * so the bands land on the dots only and the page stays clean. The bands
 * slide against the orb's drift, so the reflection moves as the pointer
 * does, and a soft off-centre glow behind it adds the shine. A radial mask fades the sphere into the page. Smaller and fainter
 * on phones, where it sits behind the title.
 */
export function BackdropOrb() {
  const ref = React.useRef<HTMLDivElement>(null);
  const level = React.useRef(0);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const sheens = React.useRef<SVGFEImageElement[]>([]);

  // The reflection slides the other way, faster, like light on a curved surface.
  React.useEffect(() => {
    const move = (axis: "x" | "y") => (v: number) => {
      const size = ref.current?.offsetWidth || 1;
      const at = String(-0.25 + (v * SHEEN_PARALLAX) / size);
      for (const el of sheens.current) el?.setAttribute(axis, at);
    };
    const offX = x.on("change", move("x"));
    const offY = y.on("change", move("y"));
    return () => {
      offX();
      offY();
    };
  }, [x, y]);

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
      className="pointer-events-none absolute -top-40 -right-64 -z-10 size-[36rem] opacity-40 [mask-image:radial-gradient(closest-side,black_55%,transparent)] sm:-top-80 sm:-right-64 sm:size-[64rem] sm:opacity-100"
    >
      <svg className="absolute size-0">
        {(["light", "dark"] as const).map((theme, i) => (
          <filter
            key={theme}
            id={`research-orb-steel-${theme}`}
            x="0"
            y="0"
            width="1"
            height="1"
            primitiveUnits="objectBoundingBox"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              ref={(el) => {
                if (el) sheens.current[i] = el;
              }}
              href={steelImage(STEEL[theme])}
              x="-0.25"
              y="-0.25"
              width="1.5"
              height="1.5"
              preserveAspectRatio="none"
              result="steel"
            />
            <feComposite in="steel" in2="SourceGraphic" operator="in" />
          </filter>
        ))}
      </svg>
      {/* A soft specular glow, off-centre toward the light, so the sphere reads as polished. */}
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(148_163_184/0.45),rgb(203_213_225/0.18)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.16),rgb(148_163_184/0.06)_40%,transparent_70%)]" />
      <VoiceOrb
        state="speaking"
        level={level}
        particles={3200}
        className="size-full text-foreground [filter:url(#research-orb-steel-light)] dark:[filter:url(#research-orb-steel-dark)]"
      />
    </motion.div>
  );
}
