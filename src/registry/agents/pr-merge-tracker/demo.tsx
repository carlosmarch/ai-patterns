"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { PrMergeTracker, type MergeCondition, type MergeTrackerStage } from "./component";

type State = { conditions: MergeCondition[]; stage: MergeTrackerStage; activity: string };

const INITIAL: State = {
  stage: "watching",
  activity: "Opened the PR · watching checks and reviews",
  conditions: [
    { id: "lint", label: "npm run lint", status: "running" },
    { id: "build", label: "npm run build", status: "running" },
    { id: "preview", label: "Workers Builds: ai-patterns", status: "pending" },
    { id: "review", label: "1 approving review", status: "pending" },
  ],
};

const set = (s: State, id: string, patch: Partial<MergeCondition>): MergeCondition[] =>
  s.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c));

/** The scripted life of the PR; `merge` steps only run while auto-merge is on. */
const STEPS: { delay: number; merge?: boolean; apply: (s: State) => State }[] = [
  {
    delay: 1400,
    apply: (s) => ({
      ...s,
      activity: "Lint failed — reading the log",
      conditions: set(s, "lint", {
        status: "failed",
        detail: "'Check' is defined but never used in pr-merge-tracker/demo.tsx",
      }),
    }),
  },
  { delay: 1100, apply: (s) => ({ ...s, stage: "fixing", activity: "Removing the unused import from demo.tsx" }) },
  {
    delay: 1500,
    apply: (s) => ({
      stage: "watching",
      activity: "Pushed 1 commit · checks restarted",
      conditions: set({ ...s, conditions: set(s, "lint", { status: "running" }) }, "build", { status: "passed" }),
    }),
  },
  {
    delay: 1300,
    apply: (s) => ({
      ...s,
      activity: "Waiting for the PR preview build",
      conditions: set({ ...s, conditions: set(s, "lint", { status: "passed" }) }, "preview", { status: "running" }),
    }),
  },
  {
    delay: 1600,
    apply: (s) => ({
      ...s,
      activity: "Preview is up at /patterns/agents/pr-merge-tracker · waiting for a review",
      conditions: set(s, "preview", { status: "passed" }),
    }),
  },
  {
    delay: 1600,
    apply: (s) => ({
      ...s,
      stage: "ready",
      activity: "Review approved: “Thumbnail reads well at card size.”",
      conditions: set(s, "review", { status: "passed" }),
    }),
  },
  { delay: 900, merge: true, apply: (s) => ({ ...s, stage: "merging", activity: "Squash-merging into main" }) },
  {
    delay: 1200,
    merge: true,
    apply: (s) => ({ ...s, stage: "merged", activity: "Branch deleted · PR Merge Tracker is in the catalogue" }),
  },
];

export default function PrMergeTrackerDemo() {
  const [state, setState] = React.useState<State>(INITIAL);
  const [step, setStep] = React.useState(0);
  const [autoMerge, setAutoMerge] = React.useState(true);

  const paused = state.stage === "stopped";
  const next = STEPS[step];
  const waitingForPerson = next?.merge && !autoMerge;

  React.useEffect(() => {
    if (!next || paused || waitingForPerson) return;
    const timer = window.setTimeout(() => {
      setState(next.apply);
      setStep((i) => i + 1);
    }, next.delay);
    return () => window.clearTimeout(timer);
  }, [next, paused, waitingForPerson]);

  const resumeStage = React.useRef<MergeTrackerStage>("watching");

  const reset = () => {
    setState(INITIAL);
    setStep(0);
    setAutoMerge(true);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-sm">
      <p className="text-foreground/90">
        Opened #267 for the new pattern. I&rsquo;ll track it, fix anything CI flags, and merge once it&rsquo;s green
        and reviewed.
      </p>

      <PrMergeTracker
        number={267}
        title="Add PR Merge Tracker pattern"
        branch="claude/kind-hawking-2v49zf"
        conditions={state.conditions}
        stage={state.stage}
        activity={state.activity}
        autoMerge={autoMerge}
        onAutoMergeChange={setAutoMerge}
        onMerge={() => setAutoMerge(true)}
        onStop={() => {
          resumeStage.current = state.stage;
          setState((s) => ({ ...s, stage: "stopped", activity: "You stopped tracking. Push or merge it yourself." }));
        }}
        onResume={() =>
          setState((s) => ({ ...s, stage: resumeStage.current, activity: "Tracking again · picking up where I left off" }))
        }
      />

      {state.stage === "merged" && (
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Replay
        </button>
      )}
    </div>
  );
}
