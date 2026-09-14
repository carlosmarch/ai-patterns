"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { SetupChecklist, type SetupStep } from "./component";

const INITIAL_STEPS: SetupStep[] = [
  {
    id: "connect",
    label: "Connect your apps",
    status: "pending",
    icons: [
      { label: "Slack", color: "#E01E5A", initial: "S" },
      { label: "Notion", color: "#191919", initial: "N" },
      { label: "Drive", color: "#1FA463", initial: "G" },
    ],
  },
  {
    id: "first-task",
    label: "Start your first task",
    status: "done",
  },
  {
    id: "notifications",
    label: "Turn on notifications",
    status: "pending",
  },
];

export default function SetupChecklistDemo() {
  const [steps, setSteps] = React.useState<SetupStep[]>(INITIAL_STEPS);

  function markDone(id: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "done" } : s))
    );
  }

  function reset() {
    setSteps(INITIAL_STEPS);
  }

  const allDone = steps.every((s) => s.status === "done");

  const stepsWithHandlers = steps.map((s) => ({
    ...s,
    onClick: s.status === "pending" ? () => markDone(s.id) : undefined,
  }));

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <SetupChecklist
        title="Set up Computer"
        steps={stepsWithHandlers}
        className="w-full"
      />
      {allDone && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Replay
        </button>
      )}
      {!allDone && (
        <p className="text-xs text-muted-foreground">Click a step to complete it</p>
      )}
    </div>
  );
}
