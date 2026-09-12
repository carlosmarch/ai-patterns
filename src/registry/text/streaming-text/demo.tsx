"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { StreamingText, type StreamSegment } from "./component";

const segments: StreamSegment[] = [
  {
    type: "text",
    content:
      "For a multi-step agent, pair the thinking loader with an expandable trace — it collapses into a one-line summary and expands into the full step list. ",
  },
  { type: "source", label: "docs" },
  {
    type: "text",
    content:
      " Add a stop-generation button so people can bail out mid-stream, and a follow-up list once the reply lands.",
  },
];

const followUps = ["Show me expandable-trace", "Show me thinking-loader", "How do I install the skill?"];

export default function StreamingTextDemo() {
  const [run, setRun] = React.useState(0);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <StreamingText key={run} segments={segments} followUps={followUps} />
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
