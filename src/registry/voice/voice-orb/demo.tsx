"use client";

import * as React from "react";

import { VoiceOrb, type VoiceOrbState } from "./component";

const STATES: { value: VoiceOrbState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "listening", label: "Listening" },
  { value: "thinking", label: "Thinking" },
  { value: "speaking", label: "Speaking" },
];

export default function VoiceOrbDemo() {
  const [state, setState] = React.useState<VoiceOrbState>("speaking");
  const mic = useMicLevel();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {STATES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setState(s.value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              state === s.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="w-full rounded-2xl border bg-card p-4">
        <VoiceOrb state={state} level={mic.active ? mic.level : undefined} className="text-foreground dark:text-orange-50" />
      </div>

      <button
        type="button"
        onClick={() => {
          if (mic.active) {
            mic.stop();
          } else {
            setState("listening");
            void mic.start();
          }
        }}
        className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {mic.active ? "Stop microphone" : "Use my microphone"}
      </button>
      {mic.error && <p className="text-xs text-muted-foreground">{mic.error}</p>}
    </div>
  );
}

/** Samples the mic's loudness into a ref on every frame (no re-renders). */
function useMicLevel() {
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
        stream.getTracks().forEach((t) => t.stop());
        void audio.close();
      };
      setActive(true);
    } catch {
      setError("Microphone unavailable — showing the synthetic rhythm instead.");
    }
  }, []);

  React.useEffect(() => () => cleanup.current(), []);

  return { level, active, error, start, stop };
}
