"use client";

import * as React from "react";
import { AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { siClaude, siCursor, siGithubcopilot, siWindsurf, type SimpleIcon } from "simple-icons";

import { AgentSetupPill, type SetupAgent } from "./component";

const PROMPT = `Set up this project to use Acme.

1. Detect the framework and package manager, then install the Acme SDK.
2. Add ACME_API_KEY to the env file (never hard-code it) and initialize the client once at the app's entry point.
3. Make one real request so the first event shows up in the Acme dashboard.
4. Summarize the files you changed.`;

function mark(icon: SimpleIcon, color?: string) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={icon.title} fill={color ?? "currentColor"}>
      <path d={icon.path} />
    </svg>
  );
}

const AGENTS: SetupAgent[] = [
  { id: "claude", label: "Claude Code", icon: mark(siClaude, `#${siClaude.hex}`) },
  { id: "cursor", label: "Cursor", icon: mark(siCursor) },
  { id: "copilot", label: "GitHub Copilot", icon: mark(siGithubcopilot) },
  { id: "windsurf", label: "Windsurf", icon: mark(siWindsurf) },
];

export default function AgentSetupPillDemo() {
  const [open, setOpen] = React.useState(true);
  const [note, setNote] = React.useState("Hover for the tooltip, click to copy the prompt");

  return (
    <div className="flex min-h-40 w-full flex-col items-center justify-end gap-4 pt-12">
      <AnimatePresence mode="wait">
        {open ? (
          <AgentSetupPill
            key="pill"
            label="Onboard your agent to Acme"
            prompt={PROMPT}
            agents={AGENTS}
            onCopy={() => setNote("Prompt copied to the clipboard")}
            onDismiss={() => {
              setOpen(false);
              setNote("Dismissed — keep it reachable from docs or settings");
            }}
          />
        ) : (
          <button
            key="reset"
            type="button"
            onClick={() => {
              setOpen(true);
              setNote("Hover for the tooltip, click to copy the prompt");
            }}
            className="flex h-10 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Show again
          </button>
        )}
      </AnimatePresence>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
