"use client";

import * as React from "react";
import { Origami, RotateCcw } from "lucide-react";

import { MultiAgentTrace, type Agent } from "./component";

function makeInitial(): Agent[] {
  return [
    {
      id: "ai-patterns",
      name: "AI-Patterns",
      icon: Origami,
      status: "running",
      currentStep: "Issue labeled pattern-request · carlosmarch/ai-patterns",
      elapsedSeconds: 0,
      steps: [],
      subAgents: [
        { id: "triage", name: "Triage agent", status: "queued", elapsedSeconds: 0, steps: [] },
        { id: "recommender", name: "Recommender agent", status: "queued", elapsedSeconds: 0, steps: [] },
        { id: "pr", name: "PR agent", status: "queued", elapsedSeconds: 0, steps: [] },
      ],
    },
  ];
}

function tick(agents: Agent[]): Agent[] {
  return agents.map((agent) => {
    if (agent.id !== "ai-patterns") return agent;

    const elapsed = (agent.elapsedSeconds ?? 0) + 1;
    const subs = agent.subAgents ?? [];

    const nextSubs = subs.map((sub) => {
      const se = (sub.elapsedSeconds ?? 0) + 1;

      if (sub.id === "triage") {
        if (sub.status === "queued" && elapsed >= 2)
          return { ...sub, status: "running" as const, currentStep: "Reading issue #pattern-request", elapsedSeconds: se, steps: [{ label: "Fetched issue from carlosmarch/ai-patterns" }] };
        if (sub.status === "running" && se >= 4)
          return { ...sub, status: "done" as const, currentStep: undefined, elapsedSeconds: se, steps: [...sub.steps, { label: "Matched Agent Triggers pattern", meta: "0.91" }] };
        if (sub.status !== "queued" && sub.status !== "done") return { ...sub, elapsedSeconds: se };
      }

      if (sub.id === "recommender") {
        if (sub.status === "queued" && elapsed >= 5)
          return { ...sub, status: "running" as const, currentStep: "Scanning registry index", elapsedSeconds: se, steps: [{ label: "Loaded 38 patterns" }] };
        if (sub.status === "running" && se >= 4)
          return { ...sub, status: "done" as const, currentStep: undefined, elapsedSeconds: se, steps: [...sub.steps, { label: "Drafted component spec" }] };
        if (sub.status !== "queued" && sub.status !== "done") return { ...sub, elapsedSeconds: se };
      }

      if (sub.id === "pr") {
        if (sub.status === "queued" && elapsed >= 9)
          return { ...sub, status: "running" as const, currentStep: "Scaffolding PR", elapsedSeconds: se, steps: [] };
        if (sub.status === "running" && se >= 3)
          return { ...sub, status: "done" as const, currentStep: undefined, elapsedSeconds: se, steps: [{ label: "Opened PR #84", meta: "carlosmarch/ai-patterns" }] };
        if (sub.status !== "queued" && sub.status !== "done") return { ...sub, elapsedSeconds: se };
      }

      return sub;
    });

    const allDone = nextSubs.every((s) => s.status === "done" || s.status === "error");

    return {
      ...agent,
      elapsedSeconds: elapsed,
      currentStep: allDone ? undefined : elapsed < 2 ? "Issue labeled pattern-request · carlosmarch/ai-patterns" : "Coordinating sub-agents",
      status: allDone ? ("done" as const) : ("running" as const),
      steps: allDone && agent.steps.length === 0 ? [{ label: "All sub-agents completed" }] : agent.steps,
      subAgents: nextSubs,
    };
  });
}

export default function MultiAgentTraceDemo() {
  const [agents, setAgents] = React.useState<Agent[]>(makeInitial);
  const [run, setRun] = React.useState(0);

  const allDone = agents.every((a) => a.status === "done" || a.status === "error");

  React.useEffect(() => {
    if (allDone) return;
    const id = window.setInterval(() => setAgents((prev) => tick(prev)), 1000);
    return () => window.clearInterval(id);
  }, [run, allDone]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <MultiAgentTrace agents={agents} className="w-full" />
      <button
        type="button"
        onClick={() => { setAgents(makeInitial()); setRun((r) => r + 1); }}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
