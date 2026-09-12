"use client";

import * as React from "react";

import { PartialResponse, type PartialResponseReason } from "./component";

const snippets: Record<PartialResponseReason, string> = {
  interrupted:
    "The ai-patterns skill gives any Claude Code session access to the full pattern library. Once installed, you can reference patterns by name in your prompts — for example, \"use the Streaming Text pattern for the assistant reply\" or \"wire up the Tool Approval pattern before each shell command\". The skill exposes each pattern's UX spec, component source, and demo so Claude can",
  "max-tokens":
    "Here's how to add a new pattern to the library:\n\n1. Create a folder under src/registry/<category>/<slug>/.\n2. Write component.tsx — the self-contained React component, Tailwind-only, no external CSS.\n3. Write demo.tsx — a realistic interactive preview that renders in the Preview tab.\n4. Write pattern.ts — the UX spec as a markdown string, authored for agents implementing the pattern, not end users.\n5. Register the entry in src/registry/index.ts.\n6. Run npm run skill:build to regenerate the Claude Code plugin reference.\n\nThe registry is the single source of truth — routing, the gallery, static page generation, and the",
  error:
    "The Partial Response pattern handles the case where an AI generation ends before reaching a natural conclusion. Unlike a Generation Error — which means nothing was produced — a partial response contains real, useful content that the user may want to keep. The component preserves what was generated, marks it visually as incomplete with a blinking cursor, and surfaces two recovery paths: Continue",
};

const reasons: { value: PartialResponseReason; label: string }[] = [
  { value: "interrupted", label: "Stopped" },
  { value: "max-tokens", label: "Cut off" },
  { value: "error", label: "Error" },
];

export default function PartialResponseDemo() {
  const [reason, setReason] = React.useState<PartialResponseReason>("interrupted");
  const [resuming, setResuming] = React.useState(false);
  const [key, setKey] = React.useState(0);

  function handleResume() {
    setResuming(true);
    window.setTimeout(() => {
      setResuming(false);
      setKey((k) => k + 1);
    }, 1600);
  }

  function handleRetry() {
    setKey((k) => k + 1);
  }

  function selectReason(r: PartialResponseReason) {
    setReason(r);
    setResuming(false);
    setKey((k) => k + 1);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex gap-2">
        {reasons.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => selectReason(value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              reason === value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <PartialResponse
        key={key}
        content={snippets[reason]}
        reason={reason}
        onResume={handleResume}
        onRetry={handleRetry}
        resuming={resuming}
      />
    </div>
  );
}
