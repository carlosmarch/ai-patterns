"use client";

import * as React from "react";
import { Code2, LayoutGrid, MousePointer2, RotateCcw, SquareTerminal, Terminal } from "lucide-react";

import { PromptOnboarding, type CodingTool, type PromptOnboardingStatus } from "./component";

const REFERENCE_URL =
  "https://github.com/carlosmarch/ai-patterns/tree/main/plugins/ai-patterns/skills/ai-patterns/reference";

const PROMPT = `Add one pattern from the ai-patterns catalogue to this app: a real screen, built in this codebase's own design system, that I can open and use.

1. Read the catalogue index at ${REFERENCE_URL}/index.md and shortlist patterns that fit a screen this app already has or needs (e.g. a composer, a pending-response loader, a tool approval prompt).
2. Detect the stack and design system: framework, styling (Tailwind, CSS modules, tokens), and component library. Note what's already installed.
3. Pick one pattern, open its spec (<category>/<slug>.md in the same folder) and follow it: Anatomy, Behavior, Content guidelines, Accessibility.
4. Build it into the existing components folder. If the app has its own design system, re-express the reference implementation with its components and tokens; only use the demoed Tailwind + Motion code verbatim if there's none. Add only the dependencies the pattern needs (e.g. motion, lucide-react).
5. Render it on a real route, run the app, and summarize the files you changed and where to see the pattern.`;

const SNIPPET = `# In Claude Code, install the skill:
/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns

# Then ask for a screen, e.g.
"Add a prompt bar with a model picker to the chat page"`;

const TOOLS: CodingTool[] = [
  { id: "claude-code", label: "Claude Code", icon: SquareTerminal },
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "vscode", label: "VS Code", icon: Code2 },
];

const IDLE_HINT = "Copy the prompt or open it in a tool to simulate setup";

export default function PromptOnboardingDemo() {
  const [status, setStatus] = React.useState<PromptOnboardingStatus>("waiting");
  const [hint, setHint] = React.useState(IDLE_HINT);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  // Stand-in for the agent doing the work: the first pattern lands a few seconds later.
  function simulateAgentRun(label: string) {
    if (status === "received") return;
    setHint(`${label} — the agent is scaffolding a pattern…`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus("received");
      setHint("Pattern scaffolded — setup can finish");
    }, 3200);
  }

  function reset() {
    clearTimeout(timer.current);
    setStatus("waiting");
    setHint(IDLE_HINT);
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <PromptOnboarding
        title="Add AI Patterns to your app"
        prompt={PROMPT}
        snippet={SNIPPET}
        hints={{
          prompt:
            "Paste this prompt into an AI coding tool like Claude Code or Cursor — it picks a pattern and builds it in your design system.",
          snippet: "Using Claude Code? Install the ai-patterns skill and ask for screens in plain language.",
        }}
        tools={TOOLS}
        status={status}
        statusLabels={{ waiting: "Waiting for your first pattern…", received: "First pattern added" }}
        alternatives={[
          {
            id: "browse",
            title: "Browse the catalogue",
            description: "Preview all 40+ patterns live",
            icon: LayoutGrid,
            onClick: () => setHint("Opens /patterns"),
          },
          {
            id: "copy",
            title: "Copy a component",
            description: "Grab the code from any pattern's Code tab",
            icon: Terminal,
            onClick: () => setHint("Opens a pattern's Code tab"),
          },
        ]}
        onCopy={(mode) => simulateAgentRun(mode === "prompt" ? "Prompt copied" : "Commands copied")}
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
