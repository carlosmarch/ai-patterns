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
import PromptBarProDemo from "./composer/prompt-bar-pro/demo";
import { pattern as promptBarProPattern } from "./composer/prompt-bar-pro/pattern";
import FlowchartDemo from "./flowcharts/trigger-condition/demo";
import { pattern as flowchartPattern } from "./flowcharts/trigger-condition/pattern";
import ChatBubbleDemo from "./messages/chat-bubble/demo";
import { pattern as chatBubblePattern } from "./messages/chat-bubble/pattern";
import ToolApprovalDemo from "./permissions/tool-approval/demo";
import { pattern as toolApprovalPattern } from "./permissions/tool-approval/pattern";
import ToolCallChipDemo from "./loaders/tool-call-chip/demo";
import { pattern as toolCallChipPattern } from "./loaders/tool-call-chip/pattern";
import AttachmentTrayDemo from "./uploads/attachment-chip/demo";
import { pattern as attachmentChipPattern } from "./uploads/attachment-chip/pattern";
import StopGenerationButtonDemo from "./buttons/stop-generation-button/demo";
import { pattern as stopGenerationButtonPattern } from "./buttons/stop-generation-button/pattern";
import TerminalStreamDemo from "./code/terminal-stream/demo";
import { pattern as terminalStreamPattern } from "./code/terminal-stream/pattern";
import InlineCitationDemo from "./text/inline-citation/demo";
import { pattern as inlineCitationPattern } from "./text/inline-citation/pattern";
import MultiAgentTraceDemo from "./traces/multi-agent-trace/demo";
import { pattern as multiAgentTracePattern } from "./traces/multi-agent-trace/pattern";
import SourcesStackDemo from "./text/sources-stack/demo";
import { pattern as sourcesStackPattern } from "./text/sources-stack/pattern";
import FollowUpListDemo from "./text/follow-up-list/demo";
import { pattern as followUpListPattern } from "./text/follow-up-list/pattern";
import SelectionActionsDemo from "./text/selection-actions/demo";
import { pattern as selectionActionsPattern } from "./text/selection-actions/pattern";

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
    slug: "prompt-bar-pro",
    category: "composer",
    title: "Prompt Bar Pro",
    description: "A first-run composer with suggestion chips, an environment picker, and an orchestrator picker.",
    Demo: PromptBarProDemo,
    uxDoc: promptBarProPattern,
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
    slug: "trigger-condition",
    category: "flowcharts",
    title: "Flowchart",
    description: "Workflow trigger and condition steps on a dotted canvas.",
    Demo: FlowchartDemo,
    uxDoc: flowchartPattern,
  },
  {
    slug: "chat-bubble",
    category: "messages",
    title: "Chat Bubble with Actions",
    description: "A message bubble with feedback thumbs, edit-and-resubmit, and regenerate.",
    Demo: ChatBubbleDemo,
    uxDoc: chatBubblePattern,
  },
  {
    slug: "tool-approval",
    category: "permissions",
    title: "Tool Approval",
    description: "A pending tool-call prompt with allow, always-allow, and deny actions.",
    Demo: ToolApprovalDemo,
    uxDoc: toolApprovalPattern,
  },
  {
    slug: "tool-call-chip",
    category: "loaders",
    title: "Tool Call Chip",
    description: "An inline pill naming an in-flight tool call that resolves into a result summary.",
    Demo: ToolCallChipDemo,
    uxDoc: toolCallChipPattern,
  },
  {
    slug: "attachment-chip",
    category: "uploads",
    title: "Attachment Chip",
    description: "A composer's file/image attachment tray with drag-drop, upload progress, and inline preview.",
    Demo: AttachmentTrayDemo,
    uxDoc: attachmentChipPattern,
  },
  {
    slug: "stop-generation-button",
    category: "buttons",
    title: "Stop Generation Button",
    description: "A send button that morphs into a stop control mid-stream and back on completion.",
    Demo: StopGenerationButtonDemo,
    uxDoc: stopGenerationButtonPattern,
  },
  {
    slug: "terminal-stream",
    category: "code",
    title: "Terminal Stream",
    description: "An auto-scrolling, collapsible panel streaming raw command output line by line.",
    Demo: TerminalStreamDemo,
    uxDoc: terminalStreamPattern,
  },
  {
    slug: "inline-citation",
    category: "text",
    title: "Inline Citation",
    description: "A hoverable, clickable footnote-style source marker inline within text.",
    Demo: InlineCitationDemo,
    uxDoc: inlineCitationPattern,
  },
  {
    slug: "multi-agent-trace",
    category: "traces",
    title: "Multi-Agent Trace",
    description: "A tree of parallel sub-agent tasks, each with its own status and step list.",
    Demo: MultiAgentTraceDemo,
    uxDoc: multiAgentTracePattern,
  },
  {
    slug: "sources-stack",
    category: "text",
    title: "Sources Stack",
    description: "An overlapping stack of source favicons with a count, expanding into a linked source list.",
    Demo: SourcesStackDemo,
    uxDoc: sourcesStackPattern,
  },
  {
    slug: "follow-up-list",
    category: "text",
    title: "Follow-Up List",
    description: "A vertical list of suggested next questions shown after a response, each sendable with a tap.",
    Demo: FollowUpListDemo,
    uxDoc: followUpListPattern,
  },
  {
    slug: "selection-actions",
    category: "text",
    title: "Selection Actions",
    description: "A floating toolbar on text selection for describing edits, explaining, or improving a passage.",
    Demo: SelectionActionsDemo,
    uxDoc: selectionActionsPattern,
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
