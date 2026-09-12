"use client";

import { FolderOpen, Sparkles } from "lucide-react";

import { PromptBarPro, type PromptBarItem, type SessionSuggestion } from "./component";

const suggestions: SessionSuggestion[] = [
  { id: "designs", label: "Review my recent designs", icon: Sparkles },
  { id: "drive", label: "Organize my Drive", icon: FolderOpen },
  { id: "changes", label: "Summarize shared file changes", icon: Sparkles },
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
