"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { StreamingText, type StreamSegment } from "./component";

const segments: StreamSegment[] = [
  {
    type: "text",
    content:
      "Pistachio is your fastest-growing flavor — sales are up 23% this month and margins beat vanilla by 8 points. ",
  },
  { type: "source", label: "scoopdata.io" },
  {
    type: "text",
    content:
      " Stone-fruit flavors are trending up too, so a limited pistachio-apricot swirl could ride both waves.",
  },
];

const followUps = ["Show trend chart", "Compare margins", "Draft launch plan"];

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
