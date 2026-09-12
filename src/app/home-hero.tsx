"use client";

import { useRouter } from "next/navigation";

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

// The homepage hero reuses the same use-case catalogue as the full demo, so
// every shuffled pill click lands on the /demo page already running the
// matching live component instead of a canned screenshot.
export function HomeHero() {
  const router = useRouter();

  function handleSubmit(value: string) {
    const suggestion = SUGGESTIONS.find((s) => s.label === value);
    const params = new URLSearchParams();
    if (suggestion) {
      params.set("flow", suggestion.id);
    } else {
      params.set("q", value);
    }
    router.push(`/demo?${params.toString()}`);
  }

  return (
    <PromptBarPro
      suggestions={SUGGESTIONS}
      visibleCount={4}
      sources={SOURCES}
      commands={COMMANDS}
      placeholder="Ask about a pattern, or try one below…"
      onSubmit={handleSubmit}
      className="w-full max-w-lg"
    />
  );
}
