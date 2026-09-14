import {
  BadgeCheck,
  Bot,
  Code2,
  Columns2,
  Command,
  FileDiff,
  Gauge,
  GitBranch,
  Globe,
  LayoutGrid,
  Mic,
  MousePointerClick,
  PackagePlus,
  Paperclip,
  PauseCircle,
  Play,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";

import type { SessionSuggestion } from "@/registry/composer/prompt-bar-pro/component";

// The master catalogue of use cases the demo can walk through. Each id maps
// to a flow in pattern-demo.tsx — this same list backs both the demo
// page's own composer and the homepage's shuffled use-case pills, so
// clicking a pill anywhere in the app lands on the matching live component.
// The first 4 entries are always shown on initial load (before shuffle).
export const SUGGESTIONS: SessionSuggestion[] = [
  { id: "tour", label: "Show me a live demo", icon: Play },
  { id: "skill", label: "How do I install this?", icon: PackagePlus },
  { id: "agents", label: "Run a multi-agent workflow", icon: Bot },
  { id: "approve", label: "Ask permission first", icon: ShieldCheck },
  { id: "compare", label: "Compare two answers", icon: Columns2 },
  { id: "voice", label: "Talk instead of type", icon: Mic },
  { id: "diff", label: "Show me a diff", icon: Code2 },
  { id: "difftabs", label: "Diff more than one file", icon: FileDiff },
  { id: "terminal", label: "Stream a terminal run", icon: TerminalSquare },
  { id: "trace", label: "Show your reasoning", icon: Sparkles },
  { id: "tools", label: "Chain a couple of tool calls", icon: Search },
  { id: "sources", label: "Cite your sources", icon: Globe },
  { id: "confidence", label: "Rate your own confidence", icon: Gauge },
  { id: "trust", label: "Vet a source before citing it", icon: BadgeCheck },
  { id: "citation", label: "Pop open an inline citation", icon: Quote },
  { id: "uploads", label: "Track a file upload", icon: Paperclip },
  { id: "flowchart", label: "Design an automation trigger", icon: GitBranch },
  { id: "selection", label: "Let me rewrite your answer", icon: MousePointerClick },
  { id: "palette", label: "Open a command palette", icon: Command },
  { id: "ratelimit", label: "Hit a rate limit", icon: TriangleAlert },
  { id: "partial", label: "Interrupt your response", icon: PauseCircle },
  { id: "stop", label: "Give me a slow answer", icon: Square },
  { id: "more", label: "Show me more patterns", icon: LayoutGrid },
];
