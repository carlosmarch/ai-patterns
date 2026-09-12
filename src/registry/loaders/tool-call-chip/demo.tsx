"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { ToolCallChip, type ToolCallStatus } from "./component";

export default function ToolCallChipDemo() {
  const [status, setStatus] = React.useState<ToolCallStatus>("running");

  React.useEffect(() => {
    if (status !== "running") return;
    const id = window.setTimeout(() => setStatus("success"), 2200);
    return () => window.clearTimeout(id);
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-4">
      <ToolCallChip
        kind="search"
        verb="Searching"
        target="tailwind v4 changelog"
        status={status}
        result="Searched — 4 results"
      />
      <button
        type="button"
        onClick={() => setStatus("running")}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
