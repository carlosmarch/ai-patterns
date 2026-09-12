"use client";

import * as React from "react";

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
        className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Run again
      </button>
    </div>
  );
}
