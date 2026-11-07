"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, MicOff, Square } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ListeningStateProps {
  /** Whether the mic is actively capturing audio. Set false for a paused/muted variant with no ripple. */
  active?: boolean;
  /**
   * Live mic loudness (0-1) — e.g. the `level` ref from Voice Waveform's
   * `useMicLevel()`. Read on every frame, so pass a ref to avoid re-renders.
   * When given, the halo swells with the voice and a long silence turns the
   * label into a "can't hear you" hint. When omitted, the glyph just pulses.
   */
  level?: React.RefObject<number> | number;
  label?: string;
  /** Shown instead of `label` after `silenceMs` of near-silence on a real `level`. */
  silenceHint?: string;
  silenceMs?: number;
  /** Show an elapsed-time counter next to the label. */
  showTimer?: boolean;
  onStop?: () => void;
  className?: string;
}

const SILENCE_THRESHOLD = 0.04;

export function ListeningState({
  active = true,
  level,
  label = "Listening…",
  silenceHint = "Can't hear you — check your mic",
  silenceMs = 4000,
  showTimer = true,
  onStop,
  className,
}: ListeningStateProps) {
  const haloRef = React.useRef<HTMLSpanElement>(null);
  const levelRef = React.useRef(level);
  React.useEffect(() => {
    levelRef.current = level;
  });

  const hasLevel = level !== undefined;
  const [silent, setSilent] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);

  // Elapsed time restarts every time capture (re)starts.
  React.useEffect(() => {
    if (!active) return;
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250);
    return () => {
      window.clearInterval(id);
      setElapsed(0);
    };
  }, [active]);

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

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex size-14 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
          !active ? "text-muted-foreground" : silent ? "text-amber-500" : "text-sky-500"
        )}
      >
        {/* Voice-driven halo: swells with each syllable. */}
        {active && hasLevel && (
          <span
            ref={haloRef}
            aria-hidden
            className="absolute inset-0 rounded-full bg-current opacity-15 will-change-transform"
          />
        )}
        {/* Ambient ripple: "the mic is live" even between words. */}
        {active && !silent && (
          <motion.span
            key="ripple"
            aria-hidden
            className="absolute inset-0 rounded-full bg-current/20 motion-reduce:hidden"
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
            className="relative"
          >
            {active ? <Mic className="size-6" aria-hidden /> : <MicOff className="size-6" aria-hidden />}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex min-h-6 items-center gap-2">
        <span aria-live="polite" className="text-sm text-muted-foreground">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </span>
        {showTimer && active && (
          <span className="text-sm tabular-nums text-muted-foreground/70" aria-hidden>
            {formatElapsed(elapsed)}
          </span>
        )}
        {onStop && active && (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop listening"
            className="flex size-6 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
          >
            <Square className="size-2.5" aria-hidden fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function readLevel(level: ListeningStateProps["level"]) {
  if (typeof level === "number") return Math.min(1, Math.max(0, level));
  if (level && typeof level.current === "number") return Math.min(1, Math.max(0, level.current));
  return 0;
}
