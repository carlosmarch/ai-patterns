"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { AgentRunCard, type RunStep } from "./component";

interface ScriptStep extends Omit<RunStep, "status" | "durationSeconds"> {
  /** Simulated seconds the step takes. */
  duration: number;
  /** The step finishes as failed. */
  fails?: boolean;
  /** Not in the initial plan — the agent adds it after a failure. */
  addedAfter?: string;
}

const SCRIPT: ScriptStep[] = [
  { id: "read-test", kind: "read", label: "Read checkout.test.ts", activeLabel: "Reading checkout.test.ts", detail: "148 lines", duration: 6 },
  { id: "read-cart", kind: "read", label: "Read cart.ts", activeLabel: "Reading cart.ts", detail: "212 lines", duration: 5 },
  { id: "edit-1", kind: "edit", label: "Edited cart.ts", activeLabel: "Editing cart.ts", detail: "+9 −3", duration: 11 },
  { id: "test-1", kind: "test", label: "Ran checkout tests", activeLabel: "Running checkout tests", detail: "1 failed", duration: 16, fails: true },
  { id: "edit-2", kind: "edit", label: "Fixed rounding in cart.ts", activeLabel: "Fixing rounding in cart.ts", detail: "+2 −1", duration: 8, addedAfter: "test-1" },
  { id: "test-2", kind: "test", label: "Ran checkout tests", activeLabel: "Re-running checkout tests", detail: "24 passed", duration: 15, addedAfter: "test-1" },
  { id: "push", kind: "push", label: "Pushed fix/checkout-rounding", activeLabel: "Pushing fix/checkout-rounding", detail: "a3f9c1e", duration: 5 },
];

/** Simulated seconds per real second, so the whole run plays in ~20s. */
const SPEED = 4;

function toStep(s: ScriptStep, status: RunStep["status"], durationSeconds?: number): RunStep {
  return { id: s.id, kind: s.kind, label: s.label, activeLabel: s.activeLabel, detail: s.detail, status, durationSeconds };
}

function initialSteps(): RunStep[] {
  return SCRIPT.filter((s) => !s.addedAfter).map((s, i) => toStep(s, i === 0 ? "running" : "pending"));
}

export default function AgentRunCardDemo() {
  const [steps, setSteps] = React.useState<RunStep[]>(initialSteps);
  const [elapsed, setElapsed] = React.useState(0);
  const stepStart = React.useRef(0);
  const running = steps.some((s) => s.status === "running");

  // Simulated clock.
  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000 / SPEED);
    return () => window.clearInterval(id);
  }, [running]);

  // Finish the running step once its scripted duration has passed.
  React.useEffect(() => {
    const index = steps.findIndex((s) => s.status === "running");
    if (index === -1) return;
    const script = SCRIPT.find((s) => s.id === steps[index].id)!;
    const took = elapsed - stepStart.current;
    if (took < script.duration) return;

    stepStart.current = elapsed;
    setSteps((prev) => {
      let next = prev.map((s, i) =>
        i === index ? { ...s, status: script.fails ? "failed" : "done", durationSeconds: took } as RunStep : s
      );
      // After a failure the agent extends its plan with a fix and a re-run.
      const added = SCRIPT.filter((s) => s.addedAfter === script.id).map((s) => toStep(s, "pending"));
      if (added.length) next = [...next.slice(0, index + 1), ...added, ...next.slice(index + 1)];
      return next.map((s, i) => (i === index + 1 ? { ...s, status: "running" } : s));
    });
  }, [elapsed, steps]);

  function replay() {
    stepStart.current = 0;
    setElapsed(0);
    setSteps(initialSteps());
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <AgentRunCard
        title="Fix flaky checkout test"
        steps={steps}
        elapsedSeconds={elapsed}
        doneLabel="Pushed a fix for the flaky test"
      />
      <button
        type="button"
        onClick={replay}
        className={
          running
            ? "invisible flex items-center gap-1.5 text-xs"
            : "flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        }
        aria-hidden={running}
        tabIndex={running ? -1 : 0}
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
