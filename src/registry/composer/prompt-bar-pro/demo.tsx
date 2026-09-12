"use client";

import { Bot, Code2, LayoutGrid, Sparkles } from "lucide-react";

import { PromptBarPro, type PromptBarItem, type SessionSuggestion } from "./component";

const suggestions: SessionSuggestion[] = [
  { id: "loading", label: "Add a loading state while the agent works", icon: Sparkles },
  { id: "composer", label: "Design a composer for my chat app", icon: LayoutGrid },
  { id: "diff", label: "Show a pattern for reviewing a diff", icon: Code2 },
  { id: "agents", label: "Design a trace for a multi-agent run", icon: Bot },
];

const sources: PromptBarItem[] = [
  { id: "drive", label: "Drive" },
  { id: "figma", label: "Figma" },
  { id: "notion", label: "Notion" },
];

const commands: PromptBarItem[] = [
  { id: "organize", label: "/organize", description: "Tidy up a folder or board" },
  { id: "summarize", label: "/summarize", description: "Summarize recent activity" },
  { id: "review", label: "/review", description: "Review a file for changes" },
];

export default function PromptBarProDemo() {
  return (
    <PromptBarPro
      suggestions={suggestions}
      sources={sources}
      commands={commands}
      className="w-full max-w-lg"
    />
  );
}
