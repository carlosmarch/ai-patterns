"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { CheckpointTimeline, type CheckpointTurn, type RestoredState } from "./component";

const turns: CheckpointTurn[] = [
  {
    id: "t1",
    time: "10:42",
    prompt: "Add an annual plan to the pricing page.",
    reply: "Added a Monthly / Annual toggle and an annual price for each plan.",
    changes: [
      { path: "pricing.tsx", kind: "edit" },
      { path: "plans.ts", kind: "edit" },
    ],
  },
  {
    id: "t2",
    time: "10:47",
    prompt: "Show the saving as a badge.",
    reply: "Added a “Save 20%” badge beside the annual price.",
    changes: [{ path: "saving-badge.tsx", kind: "create" }],
  },
  {
    id: "t3",
    time: "10:51",
    prompt: "Make the whole card green when annual is on.",
    reply: "Switched the card background and border to green in annual mode.",
    changes: [
      { path: "pricing.tsx", kind: "edit" },
      { path: "theme.css", kind: "edit" },
    ],
  },
];

export default function CheckpointRestoreDemo() {
  const [restored, setRestored] = React.useState<RestoredState | null>(null);
  const [draft, setDraft] = React.useState("");

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Hover a checkpoint line and choose Restore — try the last one.
      </p>
      <div className="rounded-2xl border bg-background p-4">
        <CheckpointTimeline
          turns={turns}
          restored={restored}
          onRestore={(state) => {
            setRestored(state);
            // Rewinding the conversation hands the prompt back, ready to edit.
            setDraft(state.mode === "code" ? "" : turns[state.index].prompt);
          }}
          onRedo={() => {
            setRestored(null);
            setDraft("");
          }}
        />
        <div className="mt-1 flex items-center gap-2 rounded-2xl border bg-card px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask for a change…"
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <ArrowUp className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}
