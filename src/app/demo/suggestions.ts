import {
  Bot,
  Code2,
  GitBranch,
  Globe,
  LayoutGrid,
  MousePointerClick,
  PackagePlus,
  Paperclip,
  PauseCircle,
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
export const SUGGESTIONS: SessionSuggestion[] = [
  { id: "diff", label: "Show me a diff", icon: Code2 },
  { id: "terminal", label: "Stream a terminal run", icon: TerminalSquare },
  { id: "trace", label: "Show your reasoning", icon: Sparkles },
  { id: "agents", label: "Run a multi-agent workflow", icon: Bot },
  { id: "approve", label: "Ask permission first", icon: ShieldCheck },
  { id: "tools", label: "Chain a couple of tool calls", icon: Search },
  { id: "sources", label: "Cite your sources", icon: Globe },
  { id: "citation", label: "Pop open an inline citation", icon: Quote },
  { id: "stop", label: "Give me a slow answer", icon: Square },
  { id: "uploads", label: "Track a file upload", icon: Paperclip },
  { id: "flowchart", label: "Design an automation trigger", icon: GitBranch },
  { id: "selection", label: "Let me rewrite your answer", icon: MousePointerClick },
  { id: "ratelimit", label: "Hit a rate limit", icon: TriangleAlert },
  { id: "partial", label: "Interrupt your response", icon: PauseCircle },
  { id: "more", label: "Show me more patterns", icon: LayoutGrid },
  { id: "skill", label: "How do I install this?", icon: PackagePlus },
];
