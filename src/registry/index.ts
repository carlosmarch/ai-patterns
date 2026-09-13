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
import DiffTabsDemo from "./code/diff-tabs/demo";
import { pattern as diffTabsPattern } from "./code/diff-tabs/pattern";
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
import SourceTrustCardDemo from "./text/source-trust-card/demo";
import { pattern as sourceTrustCardPattern } from "./text/source-trust-card/pattern";
import FollowUpListDemo from "./text/follow-up-list/demo";
import { pattern as followUpListPattern } from "./text/follow-up-list/pattern";
import SelectionActionsDemo from "./text/selection-actions/demo";
import { pattern as selectionActionsPattern } from "./text/selection-actions/pattern";
import RateLimitDemo from "./errors/rate-limit/demo";
import { pattern as rateLimitPattern } from "./errors/rate-limit/pattern";
import PartialResponseDemo from "./errors/partial-response/demo";
import { pattern as partialResponsePattern } from "./errors/partial-response/pattern";
import ResponseCompareDemo from "./compare/response-compare/demo";
import { pattern as responseComparePattern } from "./compare/response-compare/pattern";
import ConfidenceIndicatorDemo from "./indicators/confidence-indicator/demo";
import { pattern as confidenceIndicatorPattern } from "./indicators/confidence-indicator/pattern";
import VoiceWaveformDemo from "./voice/voice-waveform/demo";
import { pattern as voiceWaveformPattern } from "./voice/voice-waveform/pattern";
import ListeningStateDemo from "./voice/listening-state/demo";
import { pattern as listeningStatePattern } from "./voice/listening-state/pattern";
import LiveTranscriptDemo from "./voice/live-transcript/demo";
import { pattern as liveTranscriptPattern } from "./voice/live-transcript/pattern";
import CommandPaletteDemo from "./navigation/command-palette/demo";
import { pattern as commandPalettePattern } from "./navigation/command-palette/pattern";

export interface RegistryEntry {
  slug: string;
  category: string;
  /**
   * Semver for this pattern's public API — the exported types in its
   * `component.tsx` (props, and any types/interfaces it exports alongside
   * them). Bump the major version when you make a breaking change to that
   * surface (a removed or renamed export, a removed/now-required prop, a
   * changed prop type); `npm run check:patterns` enforces this and fails
   * the build otherwise. Bump minor/patch for additive or non-breaking
   * changes. See `scripts/check-pattern-versions.mjs`.
   */
  version: string;
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
    version: "1.0.0",
    title: "Shiny Button",
    description: "A button with an animated light sweep across its surface.",
    Demo: ShinyButtonDemo,
    uxDoc: shinyButtonPattern,
  },
  {
    slug: "thinking-loader",
    category: "loaders",
    version: "1.0.0",
    title: "Thinking Loader",
    description: "A loader with a shimmering label and a live elapsed-time counter.",
    Demo: ThinkingLoaderDemo,
    uxDoc: thinkingLoaderPattern,
  },
  {
    slug: "expandable-trace",
    category: "traces",
    version: "1.0.0",
    title: "Expandable Trace",
    description: "A collapsible \"Thought for Xs\" summary that expands into a step-by-step trace.",
    Demo: ExpandableTraceDemo,
    uxDoc: expandableTracePattern,
  },
  {
    slug: "streaming-text",
    category: "text",
    version: "1.0.0",
    title: "Streaming Text",
    description: "A streamed answer with inline sources, actions, and follow-ups.",
    Demo: StreamingTextDemo,
    uxDoc: streamingTextPattern,
  },
  {
    slug: "prompt-bar",
    category: "composer",
    version: "1.0.0",
    title: "Prompt Bar",
    description: "A composer with @ sources, / commands, a model picker, and dictation.",
    Demo: PromptBarDemo,
    uxDoc: promptBarPattern,
  },
  {
    slug: "prompt-bar-pro",
    category: "composer",
    version: "1.0.0",
    title: "Prompt Bar Pro",
    description:
      "A first-run composer with suggestion chips, @ sources, / commands, an environment picker, and an orchestrator picker.",
    Demo: PromptBarProDemo,
    uxDoc: promptBarProPattern,
  },
  {
    slug: "diff-summary",
    category: "code",
    version: "1.0.0",
    title: "Diff Summary Card",
    description: "A collapsed summary of a batch of file edits, with undo and an overflow list.",
    Demo: DiffSummaryCardDemo,
    uxDoc: diffSummaryPattern,
  },
  {
    slug: "diff-tabs",
    category: "code",
    version: "1.0.0",
    title: "Diff Tabs",
    description: "Per-file chips that switch an inline diff viewer between a batch of changed files.",
    Demo: DiffTabsDemo,
    uxDoc: diffTabsPattern,
  },
  {
    slug: "trigger-condition",
    category: "flowcharts",
    version: "1.0.0",
    title: "Flowchart",
    description: "Workflow trigger and condition steps on a dotted canvas.",
    Demo: FlowchartDemo,
    uxDoc: flowchartPattern,
  },
  {
    slug: "chat-bubble",
    category: "messages",
    version: "1.0.0",
    title: "Chat Bubble with Actions",
    description: "A message bubble with feedback thumbs, edit-and-resubmit, retry/regenerate, and a version stepper.",
    Demo: ChatBubbleDemo,
    uxDoc: chatBubblePattern,
  },
  {
    slug: "tool-approval",
    category: "permissions",
    version: "1.0.0",
    title: "Tool Approval",
    description: "A pending tool-call prompt with allow, always-allow, and deny actions.",
    Demo: ToolApprovalDemo,
    uxDoc: toolApprovalPattern,
  },
  {
    slug: "tool-call-chip",
    category: "loaders",
    version: "1.0.0",
    title: "Tool Call Chip",
    description: "An inline pill naming an in-flight tool call that resolves into a result summary.",
    Demo: ToolCallChipDemo,
    uxDoc: toolCallChipPattern,
  },
  {
    slug: "attachment-chip",
    category: "uploads",
    version: "1.0.0",
    title: "Attachment Chip",
    description: "A composer's file/image attachment tray with drag-drop, upload progress, and inline preview.",
    Demo: AttachmentTrayDemo,
    uxDoc: attachmentChipPattern,
  },
  {
    slug: "stop-generation-button",
    category: "buttons",
    version: "1.0.0",
    title: "Stop Generation Button",
    description: "A send button that morphs into a stop control mid-stream and back on completion.",
    Demo: StopGenerationButtonDemo,
    uxDoc: stopGenerationButtonPattern,
  },
  {
    slug: "terminal-stream",
    category: "code",
    version: "1.0.0",
    title: "Terminal Stream",
    description: "An auto-scrolling, collapsible panel streaming raw command output line by line.",
    Demo: TerminalStreamDemo,
    uxDoc: terminalStreamPattern,
  },
  {
    slug: "inline-citation",
    category: "text",
    version: "1.0.0",
    title: "Inline Citation",
    description: "A hoverable, clickable footnote-style source marker inline within text.",
    Demo: InlineCitationDemo,
    uxDoc: inlineCitationPattern,
  },
  {
    slug: "multi-agent-trace",
    category: "traces",
    version: "1.0.0",
    title: "Multi-Agent Trace",
    description: "A tree of parallel sub-agent tasks, each with its own status and step list.",
    Demo: MultiAgentTraceDemo,
    uxDoc: multiAgentTracePattern,
  },
  {
    slug: "sources-stack",
    category: "text",
    version: "1.0.0",
    title: "Sources Stack",
    description: "An overlapping stack of source favicons with a count, expanding into a linked source list.",
    Demo: SourcesStackDemo,
    uxDoc: sourcesStackPattern,
  },
  {
    slug: "source-trust-card",
    category: "text",
    version: "1.0.0",
    title: "Source Trust Card",
    description: "A paginated single-source card with a trust badge and domain pills for jumping between sources.",
    Demo: SourceTrustCardDemo,
    uxDoc: sourceTrustCardPattern,
  },
  {
    slug: "follow-up-list",
    category: "text",
    version: "1.0.0",
    title: "Follow-Up List",
    description: "A vertical list of suggested next questions shown after a response, each sendable with a tap.",
    Demo: FollowUpListDemo,
    uxDoc: followUpListPattern,
  },
  {
    slug: "selection-actions",
    category: "text",
    version: "1.0.0",
    title: "Selection Actions",
    description: "A floating toolbar on text selection for describing edits, explaining, or improving a passage.",
    Demo: SelectionActionsDemo,
    uxDoc: selectionActionsPattern,
  },
  {
    slug: "rate-limit",
    category: "errors",
    version: "1.0.0",
    title: "Rate Limit",
    description: "A quota-exceeded state with a live countdown to when the user can send again.",
    Demo: RateLimitDemo,
    uxDoc: rateLimitPattern,
  },
  {
    slug: "partial-response",
    category: "errors",
    version: "1.0.0",
    title: "Partial Response",
    description: "A cut-short assistant reply with Continue and Retry actions.",
    Demo: PartialResponseDemo,
    uxDoc: partialResponsePattern,
  },
  {
    slug: "response-compare",
    category: "compare",
    version: "1.0.0",
    title: "Response Compare",
    description: "A side-by-side pair of response panels with independent regenerate and a single preferred pick.",
    Demo: ResponseCompareDemo,
    uxDoc: responseComparePattern,
  },
  {
    slug: "confidence-indicator",
    category: "indicators",
    version: "1.0.0",
    title: "Confidence Indicator",
    description: "A badge or inline dot signaling how sure an AI answer or extraction is.",
    Demo: ConfidenceIndicatorDemo,
    uxDoc: confidenceIndicatorPattern,
  },
  {
    slug: "voice-waveform",
    category: "voice",
    version: "1.0.0",
    title: "Voice Waveform",
    description: "A live amplitude waveform while the AI listens or speaks.",
    Demo: VoiceWaveformDemo,
    uxDoc: voiceWaveformPattern,
  },
  {
    slug: "listening-state",
    category: "voice",
    version: "1.0.0",
    title: "Listening State",
    description: "A pulsing mic indicator showing the AI is actively listening.",
    Demo: ListeningStateDemo,
    uxDoc: listeningStatePattern,
  },
  {
    slug: "live-transcript",
    category: "voice",
    version: "1.0.0",
    title: "Live Transcript",
    description: "A streaming, speaker-labeled transcription of a voice conversation.",
    Demo: LiveTranscriptDemo,
    uxDoc: liveTranscriptPattern,
  },
  {
    slug: "command-palette",
    category: "navigation",
    version: "1.0.0",
    title: "Command Palette",
    description: "A searchable ⌘K overlay for jumping to sessions or running quick actions.",
    Demo: CommandPaletteDemo,
    uxDoc: commandPalettePattern,
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
