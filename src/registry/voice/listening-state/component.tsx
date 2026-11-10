"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ListeningStateProps {
  /** Whether the mic is actively capturing audio. Set false for a paused/muted variant with no ripple. */
  active?: boolean;
  /**
   * Live mic loudness (0-1) — e.g. the `level` ref from Voice Waveform's
   * `useMicLevel()`. Read on every frame, so pass a ref to avoid re-renders.
   * When given, the halo swells with the voice and a long silence tints the
   * glyph amber. When omitted, the glyph just pulses.
   */
  level?: React.RefObject<number> | number;
  /** Announced to screen readers while capturing (there is no visible label). */
  label?: string;
  /** Announced (and shown as a tooltip) after `silenceMs` of near-silence on a real `level`. */
  silenceHint?: string;
  silenceMs?: number;
  /**
   * Called with the next state when the mic glyph is clicked: `false` to
   * pause/stop capture, `true` to resume. Without it the glyph is not interactive.
   */
  onActiveChange?: (active: boolean) => void;
  className?: string;
}

const SILENCE_THRESHOLD = 0.04;

export function ListeningState({
  active = true,
  level,
  label = "Listening…",
  silenceHint = "Can't hear you — check your mic",
  silenceMs = 4000,
  onActiveChange,
  className,
}: ListeningStateProps) {
  const haloRef = React.useRef<HTMLSpanElement>(null);
  const levelRef = React.useRef(level);
  React.useEffect(() => {
    levelRef.current = level;
  });

  const hasLevel = level !== undefined;
  const [silent, setSilent] = React.useState(false);
  const elapsed = useElapsed(active);

  // Halo follows the voice: fast attack, slow release, written straight to the DOM each frame.
  React.useEffect(() => {
    if (!active || !hasLevel) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let smoothed = 0;
    let quietSince = performance.now();
    let isSilent = false;
    let frame = 0;

    const tick = (now: number) => {
      const raw = readLevel(levelRef.current);
      smoothed += (raw - smoothed) * (raw > smoothed ? 0.4 : 0.1);

      if (raw > SILENCE_THRESHOLD) quietSince = now;
      const nextSilent = now - quietSince > silenceMs;
      if (nextSilent !== isSilent) {
        isSilent = nextSilent;
        setSilent(nextSilent);
      }

      const halo = haloRef.current;
      if (halo) {
        halo.style.transform = `scale(${reducedMotion ? 1 : 1 + smoothed * 0.7})`;
        halo.style.opacity = String(0.15 + smoothed * 0.5);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      setSilent(false);
    };
  }, [active, hasLevel, silenceMs]);

  const status = !active ? "Paused" : silent ? silenceHint : label;
  const interactive = Boolean(onActiveChange);
  const Glyph = interactive ? "button" : "div";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Glyph
        {...(interactive
          ? {
              type: "button" as const,
              onClick: () => onActiveChange?.(!active),
              "aria-label": active ? "Stop listening" : "Resume listening",
              title: silent ? silenceHint : active ? "Stop listening" : "Resume listening",
            }
          : { "aria-hidden": true })}
        className={cn(
          "group relative flex size-14 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
          !active ? "text-muted-foreground" : silent ? "text-amber-500" : "text-sky-500",
          interactive &&
            "cursor-pointer outline-none hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {/* Voice-driven halo: swells with each syllable. */}
        {active && hasLevel && (
          <span
            ref={haloRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-current opacity-15 will-change-transform"
          />
        )}
        {/* Ambient ripple: "the mic is live" even between words. */}
        {active && !silent && (
          <motion.span
            key="ripple"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-current/20 motion-reduce:hidden"
            animate={{ scale: [1, 1.5], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active ? "on" : "off"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative transition-transform group-active:scale-90"
          >
            {active ? <Mic className="size-6" aria-hidden /> : <MicOff className="size-6" aria-hidden />}
          </motion.span>
        </AnimatePresence>
      </Glyph>

      {/* The only visible text: elapsed capture time, frozen and dimmed while paused. */}
      <span
        aria-hidden
        className={cn(
          "text-sm tabular-nums transition-colors duration-300",
          active ? "text-muted-foreground" : "text-muted-foreground/50"
        )}
      >
        {formatElapsed(elapsed)}
      </span>

      {/* State changes are still announced, just not shown. */}
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </div>
  );
}

/** Seconds spent capturing: counts while `active`, holds while paused, continues on resume. */
function useElapsed(active: boolean) {
  const [elapsed, setElapsed] = React.useState(0);
  const banked = React.useRef(0);

  React.useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const id = window.setInterval(
      () => setElapsed(Math.floor((banked.current + Date.now() - started) / 1000)),
      250
    );
    return () => {
      window.clearInterval(id);
      banked.current += Date.now() - started;
    };
  }, [active]);

  return elapsed;
}

function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function readLevel(level: ListeningStateProps["level"]) {
  if (typeof level === "number") return Math.min(1, Math.max(0, level));
  if (level && typeof level.current === "number") return Math.min(1, Math.max(0, level.current));
  return 0;
}
