"use client";

import { Bot, Code2, LayoutGrid, Sparkles } from "lucide-react";

import { PromptBarPro, type SessionSuggestion } from "./component";

const suggestions: SessionSuggestion[] = [
  { id: "loading", label: "Add a loading state while the agent works", icon: Sparkles },
  { id: "composer", label: "Design a composer for my chat app", icon: LayoutGrid },
  { id: "diff", label: "Show a pattern for reviewing a diff", icon: Code2 },
  { id: "agents", label: "Design a trace for a multi-agent run", icon: Bot },
];

export default function PromptBarProDemo() {
  return <PromptBarPro suggestions={suggestions} className="w-full max-w-lg" />;
}
