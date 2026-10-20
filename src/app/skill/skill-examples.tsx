"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, MousePointer2, Origami, Package, SquareTerminal } from "lucide-react";

import { cn } from "@/lib/utils";
import { trackCodeCopied } from "@/lib/analytics";
import {
  PromptOnboarding,
  type CodingTool,
  type PromptOnboardingStatus,
} from "@/registry/onboarding/prompt-onboarding/component";

const INSTALL = `/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns`;

export interface SkillExample {
  id: string;
  label: string;
  mode: "apply" | "review" | "list";
  /** Natural-language request — the skill routes itself. */
  prompt: string;
  /** The same request as an explicit slash command. */
  command: string;
  /** What the skill should land on, so the reader can check it. */
  outcome: string;
  /** The pattern the skill should land on, as "category/slug" — apply mode only. */
  pattern?: string;
}

const EXAMPLES: SkillExample[] = [
  {
    id: "loading-state",
    label: "Agent loading state",
    mode: "apply",
    prompt: `Our chat page shows a bare spinner while the agent runs tools, which can take 5–30 seconds. Users think it's frozen.

Replace it with a loading state that tells them the agent is still working and roughly what it's doing. Propose the pattern you'd use and why before writing code, then build it with our existing components and tokens.`,
    command: "/ai-patterns add a loading state while the agent is working",
    outcome: "Expect Thinking Loader — and a note to stop it the moment the answer starts streaming.",
    pattern: "loaders/thinking-loader",
  },
  {
    id: "tool-approval",
    label: "Approve a risky action",
    mode: "apply",
    prompt: `Our agent can send emails and delete calendar events on the user's behalf. Right now it just does it.

Before any destructive or outbound tool call, pause and ask the user to approve it — show what will happen, with the exact arguments. Pick the right ai-patterns pattern for this, then wire it into the agent's tool-call handler.`,
    command: "/ai-patterns apply tool-approval before outbound tool calls",
    outcome: "Expect Tool Approval, with Human in the Loop weighed and ruled out for a yes/no gate.",
    pattern: "permissions/tool-approval",
  },
  {
    id: "composer",
    label: "Build a composer",
    mode: "apply",
    prompt: `Design the message composer for our new assistant screen. People need to attach files with @, run /commands, switch between our two models, and dictate on mobile.

We're on shadcn/ui — keep its look, but follow the pattern's behavior and accessibility rules.`,
    command: "/ai-patterns design this composer",
    outcome: "Expect Prompt Bar, re-expressed with shadcn primitives instead of the catalogue's markup.",
    pattern: "composer/prompt-bar",
  },
  {
    id: "review",
    label: "Audit my project",
    mode: "review",
    prompt: `Review this project for hand-rolled AI UI — custom spinners, chat bubbles, ad-hoc error states — that an ai-patterns pattern already covers.

Don't edit anything. Give me a per-file list of what you'd replace, which pattern, and the spec line that justifies it.`,
    command: "/ai-patterns review my project",
    outcome: "Read-only: a per-file list of swaps, each citing the pattern's When to use.",
  },
  {
    id: "list",
    label: "What's in the catalogue?",
    mode: "list",
    prompt: `List every pattern the ai-patterns skill knows about, grouped by category, so I can see what's available before I start on the onboarding flow.`,
    command: "/ai-patterns list all patterns",
    outcome: "A numbered inventory of the whole catalogue, grouped by category.",
  },
];

const TOOLS: CodingTool[] = [
  { id: "claude-code", label: "Claude Code", icon: SquareTerminal },
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
];

export function SkillExamples({
  onBrowse,
  onTry,
}: {
  /** Where "Browse the catalogue" goes. Defaults to the /patterns page. */
  onBrowse?: () => void;
  /** When set, adds a "Run it with Origami" option that hands the example over. */
  onTry?: (example: SkillExample) => void;
} = {}) {
  const router = useRouter();
  const [exampleId, setExampleId] = React.useState(EXAMPLES[0].id);
  const [status, setStatus] = React.useState<PromptOnboardingStatus>("waiting");
  const [note, setNote] = React.useState<string | null>(null);
  const example = EXAMPLES.find((e) => e.id === exampleId) ?? EXAMPLES[0];

  function select(id: string) {
    setExampleId(id);
    setStatus("waiting");
    setNote(null);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked; the component still confirms.
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div role="radiogroup" aria-label="Example request" className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            role="radio"
            aria-checked={e.id === example.id}
            onClick={() => select(e.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              e.id === example.id
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      <PromptOnboarding
        title={example.label}
        prompt={example.prompt}
        snippet={`# Install once\n${INSTALL}\n\n# Then call the ${example.mode} mode directly\n${example.command}`}
        hints={{
          prompt:
            "Paste this into your coding agent with the skill installed — no command needed, it routes itself.",
          snippet: "Prefer to be explicit? Install the plugin and name the mode with the slash command.",
        }}
        tools={TOOLS}
        status={status}
        statusLabels={{
          waiting: "Copy the prompt to try it in your project",
          received: "Copied — paste it into your agent",
        }}
        alternatives={[
          {
            id: "install",
            title: "Copy install commands",
            description: "Add the plugin to Claude Code",
            icon: Package,
            onClick: () => {
              copy(INSTALL);
              trackCodeCopied({ type: "install_command" });
              setNote("Install commands copied");
            },
          },
          {
            id: "browse",
            title: "Browse the catalogue",
            description: "Every pattern the skill can apply",
            icon: LayoutGrid,
            onClick: onBrowse ?? (() => router.push("/patterns")),
          },
          ...(onTry
            ? [
                {
                  id: "origami",
                  title: "Run it with Origami",
                  description: "Watch the skill work in this workspace",
                  icon: Origami,
                  onClick: () => onTry(example),
                },
              ]
            : []),
        ]}
        onCopy={(mode) => {
          if (mode === "snippet") trackCodeCopied({ type: "install_command" });
          setStatus("received");
          setNote(null);
        }}
        onOpenIn={(tool) => {
          copy(example.prompt);
          setStatus("received");
          if (tool.id === "cursor") {
            window.open(`https://cursor.com/link/prompt?text=${encodeURIComponent(example.prompt)}`, "_blank");
            setNote(null);
          } else {
            setNote("Prompt copied — paste it into Claude Code");
          }
        }}
      />

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {note ?? example.outcome}
      </p>
    </div>
  );
}
