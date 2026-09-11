"use client";

import { FolderOpen, Sparkles } from "lucide-react";

import { SessionStarterBar, type SessionSuggestion } from "./component";

const suggestions: SessionSuggestion[] = [
  { id: "designs", label: "Review my recent designs", icon: Sparkles },
  { id: "drive", label: "Organize my Drive", icon: FolderOpen },
  { id: "changes", label: "Summarize shared file changes", icon: Sparkles },
];

export default function SessionStarterBarDemo() {
  return <SessionStarterBar suggestions={suggestions} className="w-full max-w-lg" />;
}
