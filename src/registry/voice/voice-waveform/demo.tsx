"use client";

import * as React from "react";

import { useMicLevel, VoiceWaveform, type VoiceWaveformState, type VoiceWaveformVariant } from "./component";

const STATES: { value: VoiceWaveformState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
];

const VARIANTS: { value: VoiceWaveformVariant; label: string }[] = [
  { value: "bars", label: "Bars" },
  { value: "dots", label: "Dots" },
];

export default function VoiceWaveformDemo() {
  const [state, setState] = React.useState<VoiceWaveformState>("listening");
  const [variant, setVariant] = React.useState<VoiceWaveformVariant>("bars");
  const mic = useMicLevel();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2">
        {STATES.map((s) => (
          <Pill key={s.value} active={state === s.value} onClick={() => setState(s.value)}>
            {s.label}
          </Pill>
        ))}
        <span className="mx-1 w-px self-stretch bg-border" aria-hidden />
        {VARIANTS.map((v) => (
          <Pill key={v.value} active={variant === v.value} onClick={() => setVariant(v.value)}>
            {v.label}
          </Pill>
        ))}
      </div>

      <div className="flex w-full items-center justify-center rounded-2xl border bg-card px-5 py-6">
        <VoiceWaveform
          state={state}
          variant={variant}
          level={mic.active ? mic.level : undefined}
          className="w-full"
        />
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

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
