import type { ComponentType } from "react";

import ShinyButtonDemo from "./buttons/shiny-button/demo";
import { pattern as shinyButtonPattern } from "./buttons/shiny-button/pattern";
import ThinkingLoaderDemo from "./loaders/thinking-loader/demo";
import { pattern as thinkingLoaderPattern } from "./loaders/thinking-loader/pattern";
import ExpandableTraceDemo from "./traces/expandable-trace/demo";
import { pattern as expandableTracePattern } from "./traces/expandable-trace/pattern";
import StreamingTextDemo from "./text/streaming-text/demo";
import { pattern as streamingTextPattern } from "./text/streaming-text/pattern";
import PromptBarDemo from "./composer/prompt-bar/demo";
import { pattern as promptBarPattern } from "./composer/prompt-bar/pattern";
import DiffSummaryCardDemo from "./code/diff-summary/demo";
import { pattern as diffSummaryPattern } from "./code/diff-summary/pattern";
import SessionStarterBarDemo from "./composer/session-starter-bar/demo";
import { pattern as sessionStarterBarPattern } from "./composer/session-starter-bar/pattern";
import FlowchartDemo from "./flowcharts/trigger-condition/demo";
import { pattern as flowchartPattern } from "./flowcharts/trigger-condition/pattern";

export interface RegistryEntry {
  slug: string;
  category: string;
  title: string;
  description: string;
  Demo: ComponentType;
  /** A UX spec for the pattern, written for agents implementing or reusing it — not the code. */
  uxDoc: string;
}

export const registry: RegistryEntry[] = [
  {
    slug: "shiny-button",
    category: "buttons",
    title: "Shiny Button",
    description: "A button with an animated light sweep across its surface.",
    Demo: ShinyButtonDemo,
    uxDoc: shinyButtonPattern,
  },
  {
    slug: "thinking-loader",
    category: "loaders",
    title: "Thinking Loader",
    description: "A loader with a shimmering label and a live elapsed-time counter.",
    Demo: ThinkingLoaderDemo,
    uxDoc: thinkingLoaderPattern,
  },
  {
    slug: "expandable-trace",
    category: "traces",
    title: "Expandable Trace",
    description: "A collapsible \"Thought for Xs\" summary that expands into a step-by-step trace.",
    Demo: ExpandableTraceDemo,
    uxDoc: expandableTracePattern,
  },
  {
    slug: "streaming-text",
    category: "text",
    title: "Streaming Text",
    description: "A streamed answer with inline sources, actions, and follow-ups.",
    Demo: StreamingTextDemo,
    uxDoc: streamingTextPattern,
  },
  {
    slug: "prompt-bar",
    category: "composer",
    title: "Prompt Bar",
    description: "A composer with @ sources, / commands, a model picker, and dictation.",
    Demo: PromptBarDemo,
    uxDoc: promptBarPattern,
  },
  {
    slug: "diff-summary",
    category: "code",
    title: "Diff Summary Card",
    description: "A collapsed summary of a batch of file edits, with undo and an overflow list.",
    Demo: DiffSummaryCardDemo,
    uxDoc: diffSummaryPattern,
  },
  {
    slug: "session-starter-bar",
    category: "composer",
    title: "Session Starter Bar",
    description: "A first-run composer with suggestion chips, an environment picker, and an orchestrator picker.",
    Demo: SessionStarterBarDemo,
    uxDoc: sessionStarterBarPattern,
  },
  {
    slug: "trigger-condition",
    category: "flowcharts",
    title: "Flowchart",
    description: "Workflow trigger and condition steps on a dotted canvas.",
    Demo: FlowchartDemo,
    uxDoc: flowchartPattern,
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
