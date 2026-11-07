"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type VoiceWaveformState = "idle" | "listening" | "speaking";
export type VoiceWaveformVariant = "bars" | "dots";

export interface VoiceWaveformProps {
  state: VoiceWaveformState;
  /**
   * Live audio level (0-1) from a real source — `useMicLevel()` below, or an
   * AnalyserNode on the assistant's playback. Read on every frame, so pass a
   * ref to avoid re-rendering 60 times a second. Each new sample enters on
   * the right and scrolls left, so the row reads as a recent history of the
   * voice. When omitted (and no `levels` are given), the waveform drives
   * itself with a synthetic rhythm — useful before real audio is wired up.
   */
  level?: React.RefObject<number> | number;
  /** Explicit per-bar levels (0-1), e.g. frequency bins. Overrides `level`. */
  levels?: number[];
  /**
   * `bars`: a centered row of amplitude bars.
   * `dots`: a full-width dotted line whose dots stretch into short pills as you
   * speak — the compact dictation look of the Claude mobile app.
   */
  variant?: VoiceWaveformVariant;
  /** Bar count for `bars`. `dots` fills its container's width instead. */
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

const VARIANT = {
  bars: { size: 3, gap: 3, max: 36, floor: 3, sampleMs: 50 },
  dots: { size: 4, gap: 4, max: 20, floor: 4, sampleMs: 70 },
} as const;

export function VoiceWaveform({
  state,
  level,
  levels,
  variant = "bars",
  barCount = 27,
  className,
}: VoiceWaveformProps) {
  const config = VARIANT[variant];
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [fitCount, setFitCount] = React.useState(0);
  const count = variant === "dots" ? fitCount : barCount;

  // Latest props, read from inside the animation loop without restarting it.
  const live = React.useRef({ state, level, levels });
  React.useEffect(() => {
    live.current = { state, level, levels };
  });

  // The dotted line fills whatever width it's given.
  React.useEffect(() => {
    if (variant !== "dots") return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setFitCount(Math.max(1, Math.floor((el.clientWidth + config.gap) / (config.size + config.gap))));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant, config.gap, config.size]);

  React.useEffect(() => {
    if (count === 0) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const history = new Array<number>(count).fill(0);
    const heights = new Array<number>(count).fill(config.floor);
    let lastSample = 0;
    let frame = 0;

    const draw = (now: number) => {
      const { state: current, level: source, levels: explicit } = live.current;
      const t = now / 1000;

      // Scroll the history one step per sample period; the newest sample is on the right.
      if (now - lastSample >= config.sampleMs) {
        lastSample = now;
        history.shift();
        history.push(current === "idle" ? 0 : readLevel(source, current, t));
      }

      for (let i = 0; i < count; i++) {
        let target: number;
        if (current === "idle") target = 0;
        else if (explicit) target = clamp(explicit[i] ?? 0);
        else if (reducedMotion) target = 0.25 + 0.15 * Math.sin(i / 2); // calm, static shape
        else target = history[i];

        const goal = config.floor + target * (config.max - config.floor);
        // Fast attack, slow release: peaks land with the syllable and settle gently.
        heights[i] += (goal - heights[i]) * (goal > heights[i] ? 0.5 : 0.18);
        const bar = barRefs.current[i];
        if (bar) bar.style.height = `${heights[i].toFixed(1)}px`;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [count, config]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={STATE_LABEL[state]}
      className={cn(
        "flex items-center",
        variant === "bars" ? "h-10 justify-center" : "h-6 w-full justify-between overflow-hidden",
        className
      )}
      style={{ gap: config.gap }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className={cn(
            "shrink-0 rounded-full transition-colors",
            variant === "dots" ? "bg-foreground/70" : STATE_COLOR[state]
          )}
          style={{ width: config.size, height: config.floor }}
        />
      ))}
    </div>
  );
}

/**
 * Samples the microphone's loudness (RMS, 0-1) into a ref on every frame —
 * no re-renders. Pass `level` straight to `<VoiceWaveform level={level} />`.
 */
export function useMicLevel() {
  const level = React.useRef(0);
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const cleanup = React.useRef<() => void>(() => {});

  const stop = React.useCallback(() => {
    cleanup.current();
    cleanup.current = () => {};
    level.current = 0;
    setActive(false);
  }, []);

  const start = React.useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audio = new AudioContext();
      const analyser = audio.createAnalyser();
      analyser.fftSize = 512;
      audio.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      let frame = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        level.current = Math.min(1, Math.sqrt(sum / data.length) * 4);
        frame = requestAnimationFrame(tick);
      };
      tick();

      cleanup.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void audio.close();
      };
      setActive(true);
      return true;
    } catch {
      setError("Microphone unavailable — showing a synthetic rhythm instead.");
      return false;
    }
  }, []);

  React.useEffect(() => () => cleanup.current(), []);

  return { level, active, error, start, stop };
}

function readLevel(level: VoiceWaveformProps["level"], state: VoiceWaveformState, t: number) {
  if (typeof level === "number") return clamp(level);
  if (level && typeof level.current === "number") return clamp(level.current);
  // Synthetic syllable rhythm for prototypes with no audio wired up yet.
  const syllables = Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 2.3) + 0.25 * Math.sin(t * 13.1));
  const jitter = 0.85 + Math.random() * 0.3;
  return clamp(syllables * jitter * (state === "speaking" ? 1.1 : 0.8));
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}
