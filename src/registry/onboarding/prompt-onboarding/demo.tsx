"use client";

import * as React from "react";
import { Database, MousePointer2, RotateCcw, SquareTerminal, Code2, UserPlus } from "lucide-react";

import { PromptOnboarding, type CodingTool, type PromptOnboardingStatus } from "./component";

const API_KEY = "pk_live_8f2c41d09a7e3b65";

const PROMPT = `Set up Acme Analytics in this app: one real, app-produced first event, ingested into project "web-prod".

1. Detect the framework and package manager, then install @acme/analytics.
2. Initialize the SDK once at the app's entry point with API key ${API_KEY}. Read it from an env var (ACME_API_KEY); never hard-code it in client bundles.
3. Track a "Page Viewed" event on route change and one meaningful product event (e.g. "Sign Up Completed").
4. Run the app and trigger the event so it reaches the project.
5. Summarize the files you changed and how to verify in the Acme dashboard.`;

const SNIPPET = `npm install @acme/analytics

import { init, track } from "@acme/analytics";

init(process.env.ACME_API_KEY);
track("Page Viewed");`;

const TOOLS: CodingTool[] = [
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "claude-code", label: "Claude Code", icon: SquareTerminal },
  { id: "vscode", label: "VS Code", icon: Code2 },
];

export default function PromptOnboardingDemo() {
  const [status, setStatus] = React.useState<PromptOnboardingStatus>("waiting");
  const [hint, setHint] = React.useState("Copy the prompt or open it in a tool to simulate setup");
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Stand-in for the agent doing the work: the first event lands a few seconds later.
  function simulateAgentRun(label: string) {
    if (status === "received") return;
    setHint(`${label} — the agent is wiring things up…`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus("received");
      setHint("Event received — setup can finish");
    }, 3200);
  }

  function reset() {
    clearTimeout(timer.current);
    setStatus("waiting");
    setHint("Copy the prompt or open it in a tool to simulate setup");
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <PromptOnboarding
        title="Let's get data in"
        apiKey={API_KEY}
        prompt={PROMPT}
        snippet={SNIPPET}
        tools={TOOLS}
        status={status}
        alternatives={[
          { id: "integrations", title: "Integrations", description: "Segment, Snowflake, and 100+ sources", icon: Database },
          { id: "invite", title: "Invite team", description: "Hand setup to a developer on your team", icon: UserPlus },
        ]}
        onCopy={(mode) => simulateAgentRun(mode === "prompt" ? "Prompt copied" : "Snippet copied")}
        onOpenIn={(tool) => simulateAgentRun(`Opened in ${tool.label}`)}
        onSkip={() => setHint("Skipped — re-surface setup later from the sidebar")}
        onFinish={() => setHint("Setup finished")}
      />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{hint}</span>
        {status === "received" && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
