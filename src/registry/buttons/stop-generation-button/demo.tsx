"use client";

import * as React from "react";

import { StopGenerationButton, type GenerationState } from "./component";

export default function StopGenerationButtonDemo() {
  const [state, setState] = React.useState<GenerationState>("idle");
  const [value, setValue] = React.useState("Summarize this thread");

  React.useEffect(() => {
    if (state !== "generating") return;
    const id = window.setTimeout(() => setState("idle"), 2600);
    return () => window.clearTimeout(id);
  }, [state]);

  return (
    <div className="flex w-full max-w-sm items-center gap-2 rounded-full border bg-card py-1.5 pl-4 pr-1.5 shadow-sm">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={state === "generating"}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:text-muted-foreground"
      />
      <StopGenerationButton
        state={state}
        disabled={!value.trim()}
        onSubmit={() => setState("generating")}
        onStop={() => setState("idle")}
      />
    </div>
  );
}
