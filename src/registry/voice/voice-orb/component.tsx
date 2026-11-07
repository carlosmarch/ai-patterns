"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type VoiceOrbState = "idle" | "listening" | "thinking" | "speaking";

export interface VoiceOrbProps {
  state: VoiceOrbState;
  /**
   * Live audio level (0-1), sampled by the caller from a real source
   * (an AnalyserNode on the mic, or on the assistant's playback). Read on
   * every frame, so pass a ref to avoid re-rendering 60 times a second.
   * When omitted, the orb drives itself with a synthetic rhythm.
   */
  level?: React.RefObject<number> | number;
  /** Number of particles on the sphere. */
  particles?: number;
  className?: string;
}

const STATE_LABEL: Record<VoiceOrbState, string> = {
  idle: "Voice idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/** How much the sphere is allowed to swell and how fast it spins, per state. */
const STATE_MOTION: Record<VoiceOrbState, { gain: number; spin: number; ripple: number }> = {
  idle: { gain: 0, spin: 0.12, ripple: 0.01 },
  listening: { gain: 0.22, spin: 0.25, ripple: 0.05 },
  thinking: { gain: 0.06, spin: 0.9, ripple: 0.03 },
  speaking: { gain: 0.32, spin: 0.35, ripple: 0.08 },
};

/**
 * A 3D particle sphere that breathes with the voice signal. Drawn on a 2D
 * canvas with a tiny hand-rolled projection — no WebGL or 3D library — and
 * colored by `currentColor`, so a `text-*` class on the orb sets its tint.
 */
export function VoiceOrb({ state, level, particles = 900, className }: VoiceOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stateRef = React.useRef(state);
  const levelRef = React.useRef(level);

  React.useEffect(() => {
    stateRef.current = state;
    levelRef.current = level;
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = fibonacciSphere(particles);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = 0;
    let angle = 0;
    let smoothed = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const current = stateRef.current;
      const motion = STATE_MOTION[current];

      const raw = readLevel(levelRef.current, current, t);
      // Fast attack, slow release: the orb jumps with a syllable and settles gently.
      smoothed += (raw - smoothed) * (raw > smoothed ? 0.35 : 0.08);

      if (!reducedMotion) angle += dt * motion.spin;

      const color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.3;
      const swell = 1 + smoothed * motion.gain;
      const ripple = reducedMotion ? 0 : motion.ripple * (0.4 + smoothed);
      const cosY = Math.cos(angle);
      const sinY = Math.sin(angle);
      const tilt = 0.35;
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);
      const focal = 4;

      for (const p of points) {
        // Per-particle displacement: a slow wave travelling over the surface.
        const wave = Math.sin(p.x * 4 + t * 2.1) + Math.sin(p.y * 5 - t * 1.7) + Math.sin(p.z * 3 + t * 1.3);
        const r = swell * (1 + ripple * wave * p.jitter);

        // Rotate around Y, then tilt around X.
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        const scale = focal / (focal - z2 * r);
        const sx = cx + x1 * r * baseRadius * scale;
        const sy = cy + y2 * r * baseRadius * scale;
        const size = (0.5 + depth * 1.3 + smoothed * 0.5) * p.size;

        ctx.globalAlpha = 0.15 + depth * 0.85;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={STATE_LABEL[state]}
      className={cn("block aspect-square w-full text-foreground", className)}
    />
  );
}

type Point = { x: number; y: number; z: number; size: number; jitter: number };

/** Evenly distributes points over a unit sphere (golden-angle spiral). */
function fibonacciSphere(count: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Deterministic pseudo-random size so the sphere looks like scattered dust, not a grid.
    const seed = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    return { x: Math.cos(theta) * ring, y, z: Math.sin(theta) * ring, size: 0.6 + seed * 0.9, jitter: 0.5 + seed };
  });
}

function readLevel(level: VoiceOrbProps["level"], state: VoiceOrbState, t: number) {
  if (typeof level === "number") return clamp(level);
  if (level && typeof level.current === "number") return clamp(level.current);
  // Synthetic rhythm for prototypes with no audio wired up yet.
  if (state === "idle") return 0;
  if (state === "thinking") return 0.3 + 0.15 * Math.sin(t * 3);
  const syllables = Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 2.3) + 0.25 * Math.sin(t * 13.1));
  return clamp(state === "speaking" ? syllables * 1.1 : syllables * 0.8);
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}
