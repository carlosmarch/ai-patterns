"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { MultiAgentTrace, type Agent } from "./component";

const INITIAL: Agent[] = [
  {
    id: "research",
    name: "Research agent",
    status: "running",
    currentStep: "Searching recent changelogs",
    elapsedSeconds: 0,
    steps: [{ label: "Reading project docs" }],
  },
  {
    id: "code",
    name: "Code agent",
    status: "queued",
    elapsedSeconds: 0,
    steps: [],
  },
  {
    id: "review",
    name: "Review agent",
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

          if (agent.id === "research") {
            if (elapsed >= 4) {
              return {
                ...agent,
                status: "done",
                currentStep: undefined,
                elapsedSeconds: elapsed,
                steps: [...agent.steps, { label: "Compiled findings", meta: "6 sources" }],
              };
            }
            return { ...agent, status: "running", elapsedSeconds: elapsed };
          }

          if (agent.id === "code") {
            if (elapsed < 2) return { ...agent, elapsedSeconds: elapsed };
            if (elapsed >= 6) {
              return {
                ...agent,
                status: "done",
                currentStep: undefined,
                elapsedSeconds: elapsed,
                steps: [...agent.steps, { label: "Opened a pull request" }],
              };
            }
            return {
              ...agent,
              status: "running",
              currentStep: "Editing component.tsx",
              elapsedSeconds: elapsed,
              steps: elapsed === 2 ? [{ label: "Reading component.tsx" }] : agent.steps,
            };
          }

          if (agent.id === "review") {
            if (elapsed < 5) return { ...agent, elapsedSeconds: elapsed };
            return {
              ...agent,
              status: "error",
              currentStep: undefined,
              elapsedSeconds: elapsed,
              steps: [...agent.steps, { label: "Lint check failed", meta: "2 errors" }],
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
      <MultiAgentTrace agents={agents} className="w-full" />
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
