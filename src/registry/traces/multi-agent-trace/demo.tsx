"use client";

import * as React from "react";
import { Origami, RotateCcw } from "lucide-react";

import { MultiAgentTrace, type Agent } from "./component";

const INITIAL: Agent[] = [
  {
    id: "triage",
    name: "Triage agent",
    status: "running",
    currentStep: "Reading issue #pattern-request",
    elapsedSeconds: 0,
    steps: [{ label: "Fetched issue from carlosmarch/ai-patterns" }],
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

export default function MultiAgentTraceDemo() {
  const [run, setRun] = React.useState(0);
  const [agents, setAgents] = React.useState<Agent[]>(INITIAL);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === "done" || agent.status === "error") return agent;
          const elapsed = (agent.elapsedSeconds ?? 0) + 1;

          if (agent.id === "triage") {
            if (elapsed >= 4) {
              return {
                ...agent,
                status: "done",
                currentStep: undefined,
                elapsedSeconds: elapsed,
                steps: [...agent.steps, { label: "Matched to Agent Triggers pattern", meta: "0.91 score" }],
              };
            }
            return { ...agent, status: "running", elapsedSeconds: elapsed };
          }

          if (agent.id === "recommender") {
            if (elapsed < 2) return { ...agent, elapsedSeconds: elapsed };
            if (elapsed >= 6) {
              return {
                ...agent,
                status: "done",
                currentStep: undefined,
                elapsedSeconds: elapsed,
                steps: [...agent.steps, { label: "Drafted component spec" }],
              };
            }
            return {
              ...agent,
              status: "running",
              currentStep: "Scanning registry index",
              elapsedSeconds: elapsed,
              steps: elapsed === 2 ? [{ label: "Loaded 38 patterns" }] : agent.steps,
            };
          }

          if (agent.id === "pr") {
            if (elapsed < 5) return { ...agent, elapsedSeconds: elapsed };
            return {
              ...agent,
              status: "done",
              currentStep: undefined,
              elapsedSeconds: elapsed,
              steps: [...agent.steps, { label: "Opened PR #84", meta: "carlosmarch/ai-patterns" }],
            };
          }

          return agent;
        })
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <MultiAgentTrace
        agent={{
          name: "AI-Patterns",
          icon: Origami,
          trigger: "Issue labeled pattern-request · carlosmarch/ai-patterns",
        }}
        agents={agents}
        className="w-full"
      />
      <button
        type="button"
        onClick={() => {
          setAgents(INITIAL);
          setRun((r) => r + 1);
        }}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
