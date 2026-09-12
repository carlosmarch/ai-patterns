"use client";

import * as React from "react";

import { VoiceWaveform, type VoiceWaveformState } from "./component";

const STATES: { value: VoiceWaveformState; label: string }[] = [
  { value: "idle", label: "Idle" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
];

export default function VoiceWaveformDemo() {
  const [state, setState] = React.useState<VoiceWaveformState>("listening");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex gap-2">
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

      <div className="flex w-full items-center justify-center rounded-2xl border bg-card py-6">
        <VoiceWaveform state={state} className="w-full" />
      </div>
    </div>
  );
}
