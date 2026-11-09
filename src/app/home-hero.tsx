"use client";

import { PromptBarPro, type PromptBarItem } from "@/registry/composer/prompt-bar-pro/component";
import { SUGGESTIONS } from "./demo/suggestions";

const SOURCES: PromptBarItem[] = [
  { id: "drive", label: "Drive" },
  { id: "figma", label: "Figma" },
  { id: "notion", label: "Notion" },
];

const COMMANDS: PromptBarItem[] = [
  { id: "organize", label: "/organize", description: "Tidy up a folder or board" },
  { id: "summarize", label: "/summarize", description: "Summarize recent activity" },
  { id: "review", label: "/review", description: "Review a file for changes" },
];

// The homepage "Try it" card: a live prompt bar with the demo's use-case
// suggestions. It stays on the page — submitting doesn't navigate anywhere.
export function HomeHero() {
  return (
    <PromptBarPro
      suggestions={SUGGESTIONS}
      visibleCount={4}
      sources={SOURCES}
      commands={COMMANDS}
      placeholder="Ask about a pattern, or try one below…"
      className="w-full max-w-lg"
    />
  );
}
