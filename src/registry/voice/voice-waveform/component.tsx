"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export type VoiceWaveformState = "idle" | "listening" | "speaking";

export interface VoiceWaveformProps {
  state: VoiceWaveformState;
  /**
   * Live amplitude levels (0-1), one per bar, sampled from a real audio
   * source (e.g. an AnalyserNode) by the caller on each animation frame.
   * When omitted, the waveform drives itself with a synthetic idle rhythm —
   * useful for prototypes before real audio is wired up.
   */
  levels?: number[];
  barCount?: number;
  className?: string;
}

const STATE_COLOR: Record<VoiceWaveformState, string> = {
  idle: "bg-muted-foreground/30",
  listening: "bg-sky-500 dark:bg-sky-400",
  speaking: "bg-foreground",
};

const STATE_LABEL: Record<VoiceWaveformState, string> = {
  idle: "Voice input idle",
  listening: "Listening",
  speaking: "Speaking",
};

export function VoiceWaveform({ state, levels, barCount = 27, className }: VoiceWaveformProps) {
  const synthetic = useSyntheticLevels(barCount, state);
  const active = levels ?? synthetic;

  return (
    <div
      role="img"
      aria-label={STATE_LABEL[state]}
      className={cn("flex h-10 items-center justify-center gap-[3px]", className)}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const height = state === "idle" ? 3 : Math.max(3, Math.round((active[i] ?? 0) * 36));
        return (
          <motion.span
            key={i}
            className={cn("w-[3px] shrink-0 rounded-full", STATE_COLOR[state])}
            animate={{ height }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

/** Generates a plausible-looking amplitude trace when the caller has no real audio source to sample yet. */
function useSyntheticLevels(barCount: number, state: VoiceWaveformState) {
  const reducedMotion = usePrefersReducedMotion();

  // Idle and reduced-motion levels are pure functions of the inputs, so they're
  // derived directly rather than pushed into state from an effect.
  const staticLevels = React.useMemo(() => {
    if (state === "idle") return Array(barCount).fill(0);
    if (reducedMotion) return Array.from({ length: barCount }, (_, i) => 0.3 + 0.2 * Math.sin(i / 2));
    return null;
  }, [barCount, state, reducedMotion]);

  const [animatedLevels, setAnimatedLevels] = React.useState<number[]>(() => Array(barCount).fill(0));

  React.useEffect(() => {
    if (staticLevels) return;
    const ceiling = state === "speaking" ? 0.95 : 0.7;
    const id = window.setInterval(() => {
      setAnimatedLevels(Array.from({ length: barCount }, () => Math.random() * ceiling + 0.05));
    }, 120);
    return () => window.clearInterval(id);
  }, [barCount, state, staticLevels]);

  return staticLevels ?? animatedLevels;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}
