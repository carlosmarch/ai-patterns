import type { ComponentType } from "react";

import AgentTriggersDemo from "./agents/agent-triggers/demo";
import AgentTriggersThumbnail from "./agents/agent-triggers/thumbnail";
import { pattern as agentTriggersPattern } from "./agents/agent-triggers/pattern";
import HumanInTheLoopDemo from "./agents/human-in-the-loop/demo";
import HumanInTheLoopThumbnail from "./agents/human-in-the-loop/thumbnail";
import { pattern as humanInTheLoopPattern } from "./agents/human-in-the-loop/pattern";
import BackgroundTasksDemo from "./agents/background-tasks/demo";
import BackgroundTasksThumbnail from "./agents/background-tasks/thumbnail";
import { pattern as backgroundTasksPattern } from "./agents/background-tasks/pattern";
import InstructionToolsDemo from "./agents/instruction-tools/demo";
import InstructionToolsThumbnail from "./agents/instruction-tools/thumbnail";
import { pattern as instructionToolsPattern } from "./agents/instruction-tools/pattern";
import CreateAgentDemo from "./agents/create-agent/demo";
import CreateAgentThumbnail from "./agents/create-agent/thumbnail";
import ProcedureBuilderDemo from "./agents/procedure-builder/demo";
import ProcedureBuilderThumbnail from "./agents/procedure-builder/thumbnail";
import { pattern as procedureBuilderPattern } from "./agents/procedure-builder/pattern";
import { pattern as createAgentPattern } from "./agents/create-agent/pattern";
import ShinyButtonDemo from "./buttons/shiny-button/demo";
import ShinyButtonThumbnail from "./buttons/shiny-button/thumbnail";
import { pattern as shinyButtonPattern } from "./buttons/shiny-button/pattern";
import ThinkingLoaderDemo from "./loaders/thinking-loader/demo";
import ThinkingLoaderThumbnail from "./loaders/thinking-loader/thumbnail";
import { pattern as thinkingLoaderPattern } from "./loaders/thinking-loader/pattern";
import ExpandableTraceDemo from "./traces/expandable-trace/demo";
import ExpandableTraceThumbnail from "./traces/expandable-trace/thumbnail";
import { pattern as expandableTracePattern } from "./traces/expandable-trace/pattern";
import StreamingTextDemo from "./text/streaming-text/demo";
import StreamingTextThumbnail from "./text/streaming-text/thumbnail";
import { pattern as streamingTextPattern } from "./text/streaming-text/pattern";
import PromptBarDemo from "./composer/prompt-bar/demo";
import PromptBarThumbnail from "./composer/prompt-bar/thumbnail";
import { pattern as promptBarPattern } from "./composer/prompt-bar/pattern";
import DiffSummaryCardDemo from "./code/diff-summary/demo";
import DiffSummaryCardThumbnail from "./code/diff-summary/thumbnail";
import { pattern as diffSummaryPattern } from "./code/diff-summary/pattern";
import DiffTabsDemo from "./code/diff-tabs/demo";
import DiffTabsThumbnail from "./code/diff-tabs/thumbnail";
import { pattern as diffTabsPattern } from "./code/diff-tabs/pattern";
import PromptBarProDemo from "./composer/prompt-bar-pro/demo";
import PromptBarProThumbnail from "./composer/prompt-bar-pro/thumbnail";
import { pattern as promptBarProPattern } from "./composer/prompt-bar-pro/pattern";
import FlowchartDemo from "./flowcharts/trigger-condition/demo";
import FlowchartThumbnail from "./flowcharts/trigger-condition/thumbnail";
import { pattern as flowchartPattern } from "./flowcharts/trigger-condition/pattern";
import ChatBubbleDemo from "./messages/chat-bubble/demo";
import ChatBubbleThumbnail from "./messages/chat-bubble/thumbnail";
import { pattern as chatBubblePattern } from "./messages/chat-bubble/pattern";
import ToolApprovalDemo from "./permissions/tool-approval/demo";
import ToolApprovalThumbnail from "./permissions/tool-approval/thumbnail";
import { pattern as toolApprovalPattern } from "./permissions/tool-approval/pattern";
import ConnectorPanelDemo from "./permissions/connector-panel/demo";
import ConnectorPanelThumbnail from "./permissions/connector-panel/thumbnail";
import { pattern as connectorPanelPattern } from "./permissions/connector-panel/pattern";
import ToolCallChipDemo from "./loaders/tool-call-chip/demo";
import ToolCallChipThumbnail from "./loaders/tool-call-chip/thumbnail";
import { pattern as toolCallChipPattern } from "./loaders/tool-call-chip/pattern";
import ImagePeekDemo from "./media/image-peek/demo";
import ImagePeekThumbnail from "./media/image-peek/thumbnail";
import { pattern as imagePeekPattern } from "./media/image-peek/pattern";
import AttachmentTrayDemo from "./uploads/attachment-chip/demo";
import AttachmentTrayThumbnail from "./uploads/attachment-chip/thumbnail";
import { pattern as attachmentChipPattern } from "./uploads/attachment-chip/pattern";
import StopGenerationButtonDemo from "./buttons/stop-generation-button/demo";
import StopGenerationButtonThumbnail from "./buttons/stop-generation-button/thumbnail";
import { pattern as stopGenerationButtonPattern } from "./buttons/stop-generation-button/pattern";
import TerminalStreamDemo from "./code/terminal-stream/demo";
import TerminalStreamThumbnail from "./code/terminal-stream/thumbnail";
import { pattern as terminalStreamPattern } from "./code/terminal-stream/pattern";
import InlineCitationDemo from "./text/inline-citation/demo";
import InlineCitationThumbnail from "./text/inline-citation/thumbnail";
import { pattern as inlineCitationPattern } from "./text/inline-citation/pattern";
import MultiAgentTraceDemo from "./traces/multi-agent-trace/demo";
import MultiAgentTraceThumbnail from "./traces/multi-agent-trace/thumbnail";
import { pattern as multiAgentTracePattern } from "./traces/multi-agent-trace/pattern";
import SourcesStackDemo from "./text/sources-stack/demo";
import SourcesStackThumbnail from "./text/sources-stack/thumbnail";
import { pattern as sourcesStackPattern } from "./text/sources-stack/pattern";
import SourceTrustCardDemo from "./text/source-trust-card/demo";
import SourceTrustCardThumbnail from "./text/source-trust-card/thumbnail";
import { pattern as sourceTrustCardPattern } from "./text/source-trust-card/pattern";
import FollowUpListDemo from "./text/follow-up-list/demo";
import FollowUpListThumbnail from "./text/follow-up-list/thumbnail";
import { pattern as followUpListPattern } from "./text/follow-up-list/pattern";
import SelectionActionsDemo from "./text/selection-actions/demo";
import SelectionActionsThumbnail from "./text/selection-actions/thumbnail";
import { pattern as selectionActionsPattern } from "./text/selection-actions/pattern";
import RefinementControlsDemo from "./text/refinement-controls/demo";
import RefinementControlsThumbnail from "./text/refinement-controls/thumbnail";
import { pattern as refinementControlsPattern } from "./text/refinement-controls/pattern";
import RateLimitDemo from "./errors/rate-limit/demo";
import RateLimitThumbnail from "./errors/rate-limit/thumbnail";
import { pattern as rateLimitPattern } from "./errors/rate-limit/pattern";
import PartialResponseDemo from "./errors/partial-response/demo";
import PartialResponseThumbnail from "./errors/partial-response/thumbnail";
import { pattern as partialResponsePattern } from "./errors/partial-response/pattern";
import GenerationErrorDemo from "./errors/generation-error/demo";
import GenerationErrorThumbnail from "./errors/generation-error/thumbnail";
import { pattern as generationErrorPattern } from "./errors/generation-error/pattern";
import ConsoleErrorCardDemo from "./errors/console-error-card/demo";
import ConsoleErrorCardThumbnail from "./errors/console-error-card/thumbnail";
import { pattern as consoleErrorCardPattern } from "./errors/console-error-card/pattern";
import ConnectivityErrorDemo from "./errors/connectivity-error/demo";
import ConnectivityErrorThumbnail from "./errors/connectivity-error/thumbnail";
import { pattern as connectivityErrorPattern } from "./errors/connectivity-error/pattern";
import ResponseCompareDemo from "./compare/response-compare/demo";
import ResponseCompareThumbnail from "./compare/response-compare/thumbnail";
import { pattern as responseComparePattern } from "./compare/response-compare/pattern";
import ConfidenceIndicatorDemo from "./indicators/confidence-indicator/demo";
import ConfidenceIndicatorThumbnail from "./indicators/confidence-indicator/thumbnail";
import { pattern as confidenceIndicatorPattern } from "./indicators/confidence-indicator/pattern";
import CriteriaDeterminationDemo from "./indicators/criteria-determination/demo";
import CriteriaDeterminationThumbnail from "./indicators/criteria-determination/thumbnail";
import { pattern as criteriaDeterminationPattern } from "./indicators/criteria-determination/pattern";
import VoiceWaveformDemo from "./voice/voice-waveform/demo";
import VoiceWaveformThumbnail from "./voice/voice-waveform/thumbnail";
import { pattern as voiceWaveformPattern } from "./voice/voice-waveform/pattern";
import ListeningStateDemo from "./voice/listening-state/demo";
import ListeningStateThumbnail from "./voice/listening-state/thumbnail";
import { pattern as listeningStatePattern } from "./voice/listening-state/pattern";
import LiveTranscriptDemo from "./voice/live-transcript/demo";
import LiveTranscriptThumbnail from "./voice/live-transcript/thumbnail";
import { pattern as liveTranscriptPattern } from "./voice/live-transcript/pattern";
import CommandPaletteDemo from "./navigation/command-palette/demo";
import CommandPaletteThumbnail from "./navigation/command-palette/thumbnail";
import { pattern as commandPalettePattern } from "./navigation/command-palette/pattern";
import CollaborativePresenceDemo from "./collaboration/collaborative-presence/demo";
import CollaborativePresenceThumbnail from "./collaboration/collaborative-presence/thumbnail";
import { pattern as collaborativePresencePattern } from "./collaboration/collaborative-presence/pattern";
import InviteMembersDemo from "./access/invite-members/demo";
import InviteMembersThumbnail from "./access/invite-members/thumbnail";
import { pattern as inviteMembersPattern } from "./access/invite-members/pattern";
import AnalysisListDemo from "./loaders/analysis-list/demo";
import AnalysisListThumbnail from "./loaders/analysis-list/thumbnail";
import { pattern as analysisListPattern } from "./loaders/analysis-list/pattern";
import SetupChecklistDemo from "./navigation/setup-checklist/demo";
import SetupChecklistThumbnail from "./navigation/setup-checklist/thumbnail";
import { pattern as setupChecklistPattern } from "./navigation/setup-checklist/pattern";
import PromptOnboardingDemo from "./onboarding/prompt-onboarding/demo";
import PromptOnboardingThumbnail from "./onboarding/prompt-onboarding/thumbnail";
import { pattern as promptOnboardingPattern } from "./onboarding/prompt-onboarding/pattern";

export interface RegistryEntry {
  slug: string;
  category: string;
  title: string;
  description: string;
  Demo: ComponentType;
  /** A tiny, simplified wireframe of the pattern, used as its hero image on cards. */
  Thumbnail: ComponentType;
  /** A UX spec for the pattern, written for agents implementing or reusing it — not the code. */
  uxDoc: string;
}

export const registry: RegistryEntry[] = [
  {
    slug: "create-agent",
    category: "agents",
    title: "Create Agent",
    description: "A two-step wizard card for naming an agent, picking its icon, and selecting which event sources activate it.",
    Demo: CreateAgentDemo,
    Thumbnail: CreateAgentThumbnail,
    uxDoc: createAgentPattern,
  },
  {
    slug: "agent-triggers",
    category: "agents",
    title: "Agent Triggers",
    description: "A configuration panel for listing and toggling the external events that activate an agent, with a manual run control.",
    Demo: AgentTriggersDemo,
    Thumbnail: AgentTriggersThumbnail,
    uxDoc: agentTriggersPattern,
  },
  {
    slug: "human-in-the-loop",
    category: "agents",
    title: "Human in the Loop Question",
    description: "A compact dialog that pauses an agent mid-task to collect a structured choice — radio options, a free-text fallback, skip/continue controls, and multi-step pagination.",
    Demo: HumanInTheLoopDemo,
    Thumbnail: HumanInTheLoopThumbnail,
    uxDoc: humanInTheLoopPattern,
  },
  {
    slug: "background-tasks",
    category: "agents",
    title: "Background Tasks Drawer",
    description:
      "A side drawer that tracks an agent's background work live — running tasks with elapsed time, stats, and stop controls, plus an expandable history of finished commands and output.",
    Demo: BackgroundTasksDemo,
    Thumbnail: BackgroundTasksThumbnail,
    uxDoc: backgroundTasksPattern,
  },
  {
    slug: "instruction-tools",
    category: "agents",
    title: "Instruction Tool Insert",
    description:
      "A numbered instruction editor where typing / opens a two-step inline picker — choose a tool, then its connector or target — inserting an atomic, editable chip into the prose.",
    Demo: InstructionToolsDemo,
    Thumbnail: InstructionToolsThumbnail,
    uxDoc: instructionToolsPattern,
  },
  {
    slug: "procedure-builder",
    category: "agents",
    title: "Procedure Builder",
    description:
      "A doc-style editor for an agent's step-by-step procedure — a / step picker, IF / ELSE branches with plain-language or code conditions, section jumps, and escalate / switch actions.",
    Demo: ProcedureBuilderDemo,
    Thumbnail: ProcedureBuilderThumbnail,
    uxDoc: procedureBuilderPattern,
  },
  {
    slug: "multi-agent-trace",
    category: "traces",
    title: "Multi-Agent Trace",
    description: "A tree of parallel sub-agent tasks, each with its own status and step list.",
    Demo: MultiAgentTraceDemo,
    Thumbnail: MultiAgentTraceThumbnail,
    uxDoc: multiAgentTracePattern,
  },
  {
    slug: "shiny-button",
    category: "buttons",
    title: "Shiny Button",
    description: "A button with an animated light sweep across its surface.",
    Demo: ShinyButtonDemo,
    Thumbnail: ShinyButtonThumbnail,
    uxDoc: shinyButtonPattern,
  },
  {
    slug: "thinking-loader",
    category: "loaders",
    title: "Thinking Loader",
    description: "A loader with a shimmering label and a live elapsed-time counter.",
    Demo: ThinkingLoaderDemo,
    Thumbnail: ThinkingLoaderThumbnail,
    uxDoc: thinkingLoaderPattern,
  },
  {
    slug: "expandable-trace",
    category: "traces",
    title: "Expandable Trace",
    description: "A collapsible \"Thought for Xs\" summary that expands into a step-by-step trace.",
    Demo: ExpandableTraceDemo,
    Thumbnail: ExpandableTraceThumbnail,
    uxDoc: expandableTracePattern,
  },
  {
    slug: "streaming-text",
    category: "text",
    title: "Streaming Text",
    description: "A streamed answer with inline sources, actions, and follow-ups.",
    Demo: StreamingTextDemo,
    Thumbnail: StreamingTextThumbnail,
    uxDoc: streamingTextPattern,
  },
  {
    slug: "prompt-bar",
    category: "composer",
    title: "Prompt Bar",
    description: "A composer with @ sources, / commands, a model picker, and dictation.",
    Demo: PromptBarDemo,
    Thumbnail: PromptBarThumbnail,
    uxDoc: promptBarPattern,
  },
  {
    slug: "prompt-bar-pro",
    category: "composer",
    title: "Prompt Bar Pro",
    description:
      "A first-run composer with suggestion chips, @ sources, / commands, an environment picker, and an orchestrator picker.",
    Demo: PromptBarProDemo,
    Thumbnail: PromptBarProThumbnail,
    uxDoc: promptBarProPattern,
  },
  {
    slug: "diff-summary",
    category: "code",
    title: "Diff Summary Card",
    description: "A collapsed summary of a batch of file edits, with undo and an overflow list.",
    Demo: DiffSummaryCardDemo,
    Thumbnail: DiffSummaryCardThumbnail,
    uxDoc: diffSummaryPattern,
  },
  {
    slug: "diff-tabs",
    category: "code",
    title: "Diff Tabs",
    description: "Per-file chips that switch an inline diff viewer between a batch of changed files.",
    Demo: DiffTabsDemo,
    Thumbnail: DiffTabsThumbnail,
    uxDoc: diffTabsPattern,
  },
  {
    slug: "trigger-condition",
    category: "flowcharts",
    title: "Flowchart",
    description: "Workflow trigger and condition steps on a dotted canvas.",
    Demo: FlowchartDemo,
    Thumbnail: FlowchartThumbnail,
    uxDoc: flowchartPattern,
  },
  {
    slug: "chat-bubble",
    category: "messages",
    title: "Chat Bubble with Actions",
    description: "A message bubble with feedback thumbs, edit-and-resubmit, retry/regenerate, and a version stepper.",
    Demo: ChatBubbleDemo,
    Thumbnail: ChatBubbleThumbnail,
    uxDoc: chatBubblePattern,
  },
  {
    slug: "tool-approval",
    category: "permissions",
    title: "Tool Approval",
    description: "A pending tool-call prompt with allow, always-allow, and deny actions.",
    Demo: ToolApprovalDemo,
    Thumbnail: ToolApprovalThumbnail,
    uxDoc: toolApprovalPattern,
  },
  {
    slug: "connector-panel",
    category: "permissions",
    title: "Connector Panel",
    description:
      "A settings panel for connecting an app or MCP server — shows capabilities overview, groups tools by type, and lets users set per-tool permission levels.",
    Demo: ConnectorPanelDemo,
    Thumbnail: ConnectorPanelThumbnail,
    uxDoc: connectorPanelPattern,
  },
  {
    slug: "tool-call-chip",
    category: "loaders",
    title: "Tool Call Chip",
    description: "An inline pill naming an in-flight tool call that resolves into a result summary.",
    Demo: ToolCallChipDemo,
    Thumbnail: ToolCallChipThumbnail,
    uxDoc: toolCallChipPattern,
  },
  {
    slug: "attachment-chip",
    category: "uploads",
    title: "Attachment Chip",
    description: "A composer's file/image attachment tray with drag-drop, upload progress, and inline preview.",
    Demo: AttachmentTrayDemo,
    Thumbnail: AttachmentTrayThumbnail,
    uxDoc: attachmentChipPattern,
  },
  {
    slug: "image-peek",
    category: "media",
    title: "Image Peek",
    description: "A row of tiny image thumbnails that grows into an anchored preview card with a label, counter, and prev/next stepping.",
    Demo: ImagePeekDemo,
    Thumbnail: ImagePeekThumbnail,
    uxDoc: imagePeekPattern,
  },
  {
    slug: "stop-generation-button",
    category: "buttons",
    title: "Stop Generation Button",
    description: "A send button that morphs into a stop control mid-stream and back on completion.",
    Demo: StopGenerationButtonDemo,
    Thumbnail: StopGenerationButtonThumbnail,
    uxDoc: stopGenerationButtonPattern,
  },
  {
    slug: "terminal-stream",
    category: "code",
    title: "Terminal Stream",
    description: "An auto-scrolling, collapsible panel streaming raw command output line by line.",
    Demo: TerminalStreamDemo,
    Thumbnail: TerminalStreamThumbnail,
    uxDoc: terminalStreamPattern,
  },
  {
    slug: "inline-citation",
    category: "text",
    title: "Inline Citation",
    description: "A hoverable, clickable footnote-style source marker inline within text.",
    Demo: InlineCitationDemo,
    Thumbnail: InlineCitationThumbnail,
    uxDoc: inlineCitationPattern,
  },
  {
    slug: "sources-stack",
    category: "text",
    title: "Sources Stack",
    description: "An overlapping stack of source favicons with a count, expanding into a linked source list.",
    Demo: SourcesStackDemo,
    Thumbnail: SourcesStackThumbnail,
    uxDoc: sourcesStackPattern,
  },
  {
    slug: "source-trust-card",
    category: "text",
    title: "Source Trust Card",
    description: "A paginated single-source card with a trust badge and domain pills for jumping between sources.",
    Demo: SourceTrustCardDemo,
    Thumbnail: SourceTrustCardThumbnail,
    uxDoc: sourceTrustCardPattern,
  },
  {
    slug: "follow-up-list",
    category: "text",
    title: "Follow-Up List",
    description: "A vertical list of suggested next questions shown after a response, each sendable with a tap.",
    Demo: FollowUpListDemo,
    Thumbnail: FollowUpListThumbnail,
    uxDoc: followUpListPattern,
  },
  {
    slug: "selection-actions",
    category: "text",
    title: "Selection Actions",
    description: "A floating toolbar on text selection for describing edits, explaining, or improving a passage.",
    Demo: SelectionActionsDemo,
    Thumbnail: SelectionActionsThumbnail,
    uxDoc: selectionActionsPattern,
  },
  {
    slug: "refinement-controls",
    category: "text",
    title: "Refinement Controls",
    description:
      "One-tap adjustments (Rephrase, Shorten, More formal, Bulletize…) and a free-form instruction field docked under an AI output, with every result kept as a steppable version.",
    Demo: RefinementControlsDemo,
    Thumbnail: RefinementControlsThumbnail,
    uxDoc: refinementControlsPattern,
  },
  {
    slug: "rate-limit",
    category: "errors",
    title: "Rate Limit",
    description: "A quota-exceeded state with a live countdown to when the user can send again.",
    Demo: RateLimitDemo,
    Thumbnail: RateLimitThumbnail,
    uxDoc: rateLimitPattern,
  },
  {
    slug: "partial-response",
    category: "errors",
    title: "Partial Response",
    description: "A cut-short assistant reply with Continue and Retry actions.",
    Demo: PartialResponseDemo,
    Thumbnail: PartialResponseThumbnail,
    uxDoc: partialResponsePattern,
  },
  {
    slug: "generation-error",
    category: "errors",
    title: "Generation Error",
    description: "A console-style error card for a failed generation, with details and retry.",
    Demo: GenerationErrorDemo,
    Thumbnail: GenerationErrorThumbnail,
    uxDoc: generationErrorPattern,
  },
  {
    slug: "console-error-card",
    category: "errors",
    title: "Console Error Card",
    description: "A structured card surfacing a browser console error with a code frame, call stack, and navigation.",
    Demo: ConsoleErrorCardDemo,
    Thumbnail: ConsoleErrorCardThumbnail,
    uxDoc: consoleErrorCardPattern,
  },
  {
    slug: "connectivity-error",
    category: "errors",
    title: "Connectivity Error",
    description: "A dismissible card surfacing a network connection failure with a description and retry/details actions.",
    Demo: ConnectivityErrorDemo,
    Thumbnail: ConnectivityErrorThumbnail,
    uxDoc: connectivityErrorPattern,
  },
  {
    slug: "response-compare",
    category: "compare",
    title: "Response Compare",
    description: "A side-by-side pair of response panels with independent regenerate and a single preferred pick.",
    Demo: ResponseCompareDemo,
    Thumbnail: ResponseCompareThumbnail,
    uxDoc: responseComparePattern,
  },
  {
    slug: "confidence-indicator",
    category: "indicators",
    title: "Confidence Indicator",
    description: "A badge or inline dot signaling how sure an AI answer or extraction is.",
    Demo: ConfidenceIndicatorDemo,
    Thumbnail: ConfidenceIndicatorThumbnail,
    uxDoc: confidenceIndicatorPattern,
  },
  {
    slug: "criteria-determination",
    category: "indicators",
    title: "Criteria Determination",
    description:
      "An AI verdict backed by its criteria — grouped into missing, not met and met — where answering Yes/No on the gaps updates the determination live.",
    Demo: CriteriaDeterminationDemo,
    Thumbnail: CriteriaDeterminationThumbnail,
    uxDoc: criteriaDeterminationPattern,
  },
  {
    slug: "voice-waveform",
    category: "voice",
    title: "Voice Waveform",
    description: "A live amplitude waveform while the AI listens or speaks.",
    Demo: VoiceWaveformDemo,
    Thumbnail: VoiceWaveformThumbnail,
    uxDoc: voiceWaveformPattern,
  },
  {
    slug: "listening-state",
    category: "voice",
    title: "Listening State",
    description: "A pulsing mic indicator showing the AI is actively listening.",
    Demo: ListeningStateDemo,
    Thumbnail: ListeningStateThumbnail,
    uxDoc: listeningStatePattern,
  },
  {
    slug: "live-transcript",
    category: "voice",
    title: "Live Transcript",
    description: "A streaming, speaker-labeled transcription of a voice conversation.",
    Demo: LiveTranscriptDemo,
    Thumbnail: LiveTranscriptThumbnail,
    uxDoc: liveTranscriptPattern,
  },
  {
    slug: "command-palette",
    category: "navigation",
    title: "Command Palette",
    description: "A searchable ⌘K overlay for jumping to sessions or running quick actions.",
    Demo: CommandPaletteDemo,
    Thumbnail: CommandPaletteThumbnail,
    uxDoc: commandPalettePattern,
  },
  {
    slug: "collaborative-presence",
    category: "collaboration",
    title: "Collaborative Presence",
    description:
      "An avatar stack showing who has access to a shared record and who is actively viewing it right now.",
    Demo: CollaborativePresenceDemo,
    Thumbnail: CollaborativePresenceThumbnail,
    uxDoc: collaborativePresencePattern,
  },
  {
    slug: "invite-members",
    category: "access",
    title: "Invite Members",
    description:
      "A two-step modal for searching or emailing people to a record and assigning each a role, with a live current-members list.",
    Demo: InviteMembersDemo,
    Thumbnail: InviteMembersThumbnail,
    uxDoc: inviteMembersPattern,
  },
  {
    slug: "analysis-list",
    category: "loaders",
    title: "Analysis List",
    description: "A full-width indeterminate progress bar over a list whose items resolve from skeletons one by one.",
    Demo: AnalysisListDemo,
    Thumbnail: AnalysisListThumbnail,
    uxDoc: analysisListPattern,
  },
  {
    slug: "setup-checklist",
    category: "navigation",
    title: "Setup Checklist",
    description: "A stepped onboarding card with circular arc progress, dashed-circle pending states, and strikethrough for completed steps.",
    Demo: SetupChecklistDemo,
    Thumbnail: SetupChecklistThumbnail,
    uxDoc: setupChecklistPattern,
  },
  {
    slug: "prompt-onboarding",
    category: "onboarding",
    title: "Prompt-Driven Onboarding",
    description:
      "A setup screen that hands users a pre-filled prompt to paste into their AI coding agent, with a snippet fallback and a live listener that confirms the first event.",
    Demo: PromptOnboardingDemo,
    Thumbnail: PromptOnboardingThumbnail,
    uxDoc: promptOnboardingPattern,
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}
