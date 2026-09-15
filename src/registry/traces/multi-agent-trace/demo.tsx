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
    },
    {
      id: "triage",
      name: "Triage agent",
      status: "queued",
      elapsedSeconds: 0,
      steps: [],
    },
    {
      id: "recommender",
      name: "Recommender agent",
      status: "queued",
      elapsedSeconds: 0,
      steps: [],
    },
    {
      id: "pr",
      name: "PR agent",
      status: "queued",
      elapsedSeconds: 0,
      steps: [],
    },
  ];
}

function tick(agents: Agent[]): Agent[] {
  const elapsed = (agents[0].elapsedSeconds ?? 0) + 1;

  return agents.map((agent) => {
    if (agent.status === "done" || agent.status === "error") return agent;

    if (agent.id === "ai-patterns") {
      const others = agents.filter((a) => a.id !== "ai-patterns");
      const allDone = others.every((a) => a.status === "done" || a.status === "error");
      return {
        ...agent,
        elapsedSeconds: elapsed,
        status: allDone ? ("done" as const) : ("running" as const),
        currentStep: allDone
          ? undefined
          : elapsed < 2
          ? "Issue labeled pattern-request · carlosmarch/ai-patterns"
          : "Coordinating sub-agents",
        steps: allDone ? [{ label: "All sub-agents completed" }] : agent.steps,
      };
    }

    if (agent.id === "triage") {
      if (elapsed < 2) return agent;
      if (elapsed === 2)
        return { ...agent, status: "running" as const, currentStep: "Reading issue #pattern-request", elapsedSeconds: elapsed, steps: [{ label: "Fetched issue from carlosmarch/ai-patterns" }] };
      if (elapsed >= 5)
        return { ...agent, status: "done" as const, currentStep: undefined, elapsedSeconds: elapsed, steps: [...agent.steps, { label: "Matched Agent Triggers pattern", meta: "0.91" }] };
      return { ...agent, elapsedSeconds: elapsed };
    }

    if (agent.id === "recommender") {
      if (elapsed < 4) return agent;
      if (elapsed === 4)
        return { ...agent, status: "running" as const, currentStep: "Scanning registry index", elapsedSeconds: elapsed, steps: [{ label: "Loaded 38 patterns" }] };
      if (elapsed >= 8)
        return { ...agent, status: "done" as const, currentStep: undefined, elapsedSeconds: elapsed, steps: [...agent.steps, { label: "Drafted component spec" }] };
      return { ...agent, elapsedSeconds: elapsed };
    }

    if (agent.id === "pr") {
      if (elapsed < 7) return agent;
      if (elapsed === 7)
        return { ...agent, status: "running" as const, currentStep: "Scaffolding PR", elapsedSeconds: elapsed, steps: [] };
      if (elapsed >= 10)
        return { ...agent, status: "done" as const, currentStep: undefined, elapsedSeconds: elapsed, steps: [{ label: "Opened PR #84", meta: "carlosmarch/ai-patterns" }] };
      return { ...agent, elapsedSeconds: elapsed };
    }

    return agent;
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
