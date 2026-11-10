"use client";

import * as React from "react";

import { useMicLevel } from "../voice-waveform/component";
import { ListeningState } from "./component";

export default function ListeningStateDemo() {
  const [active, setActive] = React.useState(true);
  const mic = useMicLevel();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex w-full items-center justify-center rounded-2xl border bg-card py-8">
        <ListeningState
          active={active}
          level={mic.active ? mic.level : undefined}
          onActiveChange={setActive}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (mic.active) {
              mic.stop();
            } else {
              setActive(true);
              void mic.start();
            }
          }}
          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {mic.active ? "Stop microphone" : "Use my microphone"}
        </button>
        <p className="text-xs text-muted-foreground">Click the mic to pause and resume.</p>
      </div>
      {mic.error && <p className="text-xs text-muted-foreground">{mic.error}</p>}
    </div>
  );
}
