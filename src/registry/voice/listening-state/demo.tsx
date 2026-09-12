"use client";

import * as React from "react";

import { ListeningState } from "./component";

export default function ListeningStateDemo() {
  const [active, setActive] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex w-full items-center justify-center rounded-2xl border bg-card py-8">
        <ListeningState active={active} onStop={() => setActive(false)} />
      </div>

      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {active ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
