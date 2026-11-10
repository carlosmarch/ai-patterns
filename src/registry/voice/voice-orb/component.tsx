"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

import { cn } from "@/lib/utils";

export type VoiceOrbState = "ready" | "listening" | "thinking" | "speaking";

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
  /**
   * Custom paint for the particles, e.g. a `CanvasGradient` for a metallic
   * sheen. Called every frame with the canvas context and its CSS size, so it
   * can move with the page. Defaults to the orb's `currentColor`.
   */
  fill?: (ctx: CanvasRenderingContext2D, width: number, height: number) => string | CanvasGradient | CanvasPattern;
  /**
   * Cap on the canvas's device-pixel ratio (default 2). Lower it for a very
   * large orb, where every extra pixel is drawn every frame.
   */
  maxPixelRatio?: number;
  className?: string;
}

const STATE_LABEL: Record<VoiceOrbState, string> = {
  ready: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/** How much the sphere is allowed to swell and how fast it spins, per state. */
const STATE_MOTION: Record<VoiceOrbState, { gain: number; spin: number; ripple: number }> = {
  ready: { gain: 0, spin: 0.12, ripple: 0.01 },
  listening: { gain: 0.22, spin: 0.25, ripple: 0.05 },
  thinking: { gain: 0, spin: 0.15, ripple: 0 },
  speaking: { gain: 0.32, spin: 0.35, ripple: 0.08 },
};

/**
 * A 3D particle sphere that breathes with the voice signal. Drawn on a 2D
 * canvas with a tiny hand-rolled projection — no WebGL or 3D library — and
 * colored by `currentColor`, so a `text-*` class on the orb sets its tint
 * (and it follows light/dark theme changes live). While thinking, the sphere
 * twists like a Rubik's cube: one third of it turns 90° at a time.
 */
export function VoiceOrb({ state, level, particles = 900, fill, maxPixelRatio = 2, className }: VoiceOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stateRef = React.useRef(state);
  const levelRef = React.useRef(level);
  const fillRef = React.useRef(fill);

  React.useEffect(() => {
    stateRef.current = state;
    levelRef.current = level;
    fillRef.current = fill;
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = fibonacciSphere(particles);
    // Per-frame screen positions, reused so drawing allocates nothing.
    const xs = new Float32Array(particles);
    const ys = new Float32Array(particles);
    const sizes = new Float32Array(particles);
    const bands = new Uint8Array(particles);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Only animate while the orb is on screen and the tab is visible.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);

    // Reading computed style forces a style recalc, so sample the color a few times a second, not every frame.
    let color = "";
    let colorAt = -Infinity;

    let frame = 0;
    let angle = 0;
    let smoothed = 0;
    let last = performance.now();
    let turn: Turn | null = null;
    let pause = 0;

    const draw = (now: number) => {
      if (!visible) {
        frame = 0;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const current = stateRef.current;
      const motion = STATE_MOTION[current];

      const raw = readLevel(levelRef.current, current, t);
      // Fast attack, slow release: the orb jumps with a syllable and settles gently.
      smoothed += (raw - smoothed) * (raw > smoothed ? 0.35 : 0.08);

      if (!reducedMotion) angle += dt * motion.spin;

      // Rubik's-cube twist: while thinking, keep turning slices one after another.
      // A turn in progress always finishes, so leaving "thinking" never leaves a half-twisted ball.
      if (turn) {
        turn.progress = Math.min(1, turn.progress + dt / TURN_SECONDS);
        if (turn.progress >= 1) {
          for (const p of points) if (inSlice(p, turn)) rotateAxis(p, turn.axis, turn.direction * (Math.PI / 2));
          turn = null;
          pause = TURN_PAUSE;
        }
      } else if (current === "thinking" && !reducedMotion) {
        pause -= dt;
        if (pause <= 0) turn = randomTurn();
      }
      const twist = turn ? turn.direction * (Math.PI / 2) * easeInOut(turn.progress) : 0;

      if (now - colorAt > 250) {
        color = getComputedStyle(canvas).color;
        colorAt = now;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = fillRef.current ? fillRef.current(ctx, width, height) : color;

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

      // The turning slice lifts slightly off the ball and settles back, so the twist reads at a glance.
      const lift = turn ? 1 + 0.1 * Math.sin(Math.PI * turn.progress) : 1;

      for (let i = 0; i < points.length; i++) {
        const base = points[i];
        const turning = turn !== null && inSlice(base, turn);
        const p = turn && turning ? rotatedCopy(base, turn.axis, twist) : base;
        // Per-particle displacement: a slow wave travelling over the surface.
        const wave = Math.sin(p.x * 4 + t * 2.1) + Math.sin(p.y * 5 - t * 1.7) + Math.sin(p.z * 3 + t * 1.3);
        const r = swell * (1 + ripple * wave * p.jitter) * (turning ? lift : 1);

        // Rotate around Y, then tilt around X.
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        const scale = focal / (focal - z2 * r);
        const sx = cx + x1 * r * baseRadius * scale;
        const sy = cy + y2 * r * baseRadius * scale;
        xs[i] = sx;
        ys[i] = sy;
        sizes[i] = (0.5 + depth * 1.3 + smoothed * 0.5) * p.size;
        bands[i] = Math.min(ALPHA_BANDS - 1, Math.floor(depth * ALPHA_BANDS));
      }

      // One path and one fill per depth band instead of one per particle: far fewer draw calls.
      for (let b = 0; b < ALPHA_BANDS; b++) {
        ctx.globalAlpha = 0.15 + ((b + 0.5) / ALPHA_BANDS) * 0.85;
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          if (bands[i] !== b) continue;
          ctx.moveTo(xs[i] + sizes[i], ys[i]);
          ctx.arc(xs[i], ys[i], sizes[i], 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
    };
  }, [particles, maxPixelRatio]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={STATE_LABEL[state]}
      className={cn("block aspect-square w-full text-foreground", className)}
    />
  );
}

export interface VoiceOrbTranscript {
  speaker: "user" | "assistant";
  /** The words heard (user) or spoken (assistant) so far in this turn. */
  text: string;
  /** True once the turn is complete; only final lines are announced to screen readers. */
  final?: boolean;
}

export interface VoiceOrbCallProps {
  state: VoiceOrbState;
  /** Whether the call is live. The timer runs while true; false shows a "Call again" button. */
  connected?: boolean;
  /** The current turn's words, shown under the orb as they stream in. */
  transcript?: VoiceOrbTranscript | null;
  /** Live audio level for the orb (see `VoiceOrb`). */
  level?: VoiceOrbProps["level"];
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  onEnd?: () => void;
  onStart?: () => void;
  /** Words at the tail of the line stay at full strength; older ones fade back. */
  recentWords?: number;
  className?: string;
  orbClassName?: string;
}

const CALL_STATUS: Record<VoiceOrbState, string> = {
  ready: "Ready",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

/**
 * A full voice-agent surface built around the orb: the turn state above it,
 * the live transcript below it, and a pill with mute, the call timer and
 * end call. Muting holds the orb at rest, whatever the agent's state.
 */
export function VoiceOrbCall({
  state,
  connected = true,
  transcript,
  level,
  muted = false,
  onMutedChange,
  onEnd,
  onStart,
  recentWords = 6,
  className,
  orbClassName,
}: VoiceOrbCallProps) {
  const seconds = useCallTimer(connected);
  const orbState: VoiceOrbState = !connected || muted ? "ready" : state;
  const status = !connected ? "Call ended" : muted ? "Muted" : CALL_STATUS[state];
  const words = transcript?.text.trim() ? transcript.text.trim().split(/\s+/) : [];
  const finalLine = transcript?.final ? transcript.text : "";

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {/* Turn state: the one word that says whose turn it is. */}
      <div className="relative h-5 w-full text-center text-sm text-muted-foreground">
        <AnimatePresence initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0"
          >
            {status}
          </motion.span>
        </AnimatePresence>
      </div>

      <VoiceOrb
        state={orbState}
        level={level}
        className={cn(
          "my-2 w-full max-w-64 transition-opacity duration-500",
          !connected && "opacity-40",
          orbClassName
        )}
      />

      {/* Live transcript: the tail stays strong, earlier words fade back, the top edge feathers out. */}
      <div className="flex h-[4.5rem] w-full flex-col justify-end overflow-hidden px-2 [mask-image:linear-gradient(to_bottom,transparent,black_35%)]">
        <p aria-hidden className="text-center text-lg leading-snug text-balance">
          {words.map((word, i) => (
            <motion.span
              key={`${transcript?.speaker}-${i}`}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.25 }}
              className={cn(
                "inline-block whitespace-pre transition-colors duration-700",
                i < words.length - recentWords || !connected ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {word}{i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </p>
      </div>

      {/* Controls: mute · timer · end call — or a single button to call again. */}
      <div className="mt-4 flex h-14 items-center">
        {connected ? (
          <div className="flex items-center gap-1 rounded-full border bg-background p-1.5">
            <button
              type="button"
              onClick={() => onMutedChange?.(!muted)}
              aria-pressed={muted}
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              className={cn(
                "flex size-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                muted && "bg-muted text-muted-foreground"
              )}
            >
              {muted ? <MicOff className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
            </button>
            <span className="w-12 text-center text-sm tabular-nums" aria-label={`Call time ${formatClock(seconds)}`}>
              {formatClock(seconds)}
            </span>
            <button
              type="button"
              onClick={onEnd}
              aria-label="End call"
              className="flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600 outline-none transition-colors hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-ring dark:text-red-400"
            >
              <PhoneOff className="size-5" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="size-4" aria-hidden />
            Call again
          </button>
        )}
      </div>

      {/* Turn changes and finished lines are announced; streaming partials are not. */}
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
      <span aria-live="polite" className="sr-only">
        {finalLine && `${transcript?.speaker === "user" ? "You" : "Assistant"}: ${finalLine}`}
      </span>
    </div>
  );
}

/** Whole seconds since the call connected; restarts from 0 on each new call and holds when it ends. */
function useCallTimer(connected: boolean) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!connected) return;
    const started = Date.now();
    const tick = () => setSeconds(Math.floor((Date.now() - started) / 1000));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 250);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [connected]);
  return seconds;
}

function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

type Point = { x: number; y: number; z: number; size: number; jitter: number };
type Axis = "x" | "y" | "z";
type Turn = { axis: Axis; slice: -1 | 0 | 1; direction: 1 | -1; progress: number };

/** Depth bands the particles are batched into, each drawn at one opacity. */
const ALPHA_BANDS = 10;
const TURN_SECONDS = 0.45;
const TURN_PAUSE = 0.12;
const SLICE_EDGE = 1 / 3;

function randomTurn(): Turn {
  const axes: Axis[] = ["x", "y", "z"];
  const slices = [-1, 0, 1] as const;
  return {
    axis: axes[Math.floor(Math.random() * 3)],
    slice: slices[Math.floor(Math.random() * 3)],
    direction: Math.random() < 0.5 ? 1 : -1,
    progress: 0,
  };
}

/** Which third of the sphere (along the turn's axis) a point sits in. */
function inSlice(p: Point, turn: Turn) {
  const c = p[turn.axis];
  const slice = c < -SLICE_EDGE ? -1 : c > SLICE_EDGE ? 1 : 0;
  return slice === turn.slice;
}

function rotateAxis(p: Point, axis: Axis, a: number) {
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const { x, y, z } = p;
  if (axis === "x") {
    p.y = y * cos - z * sin;
    p.z = y * sin + z * cos;
  } else if (axis === "y") {
    p.x = x * cos + z * sin;
    p.z = -x * sin + z * cos;
  } else {
    p.x = x * cos - y * sin;
    p.y = x * sin + y * cos;
  }
}

function rotatedCopy(p: Point, axis: Axis, a: number): Point {
  const copy = { ...p };
  rotateAxis(copy, axis, a);
  return copy;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

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
  if (state === "ready") return 0;
  if (state === "thinking") return 0;
  const syllables = Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 2.3) + 0.25 * Math.sin(t * 13.1));
  return clamp(state === "speaking" ? syllables * 1.1 : syllables * 0.8);
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}
