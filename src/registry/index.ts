import type { ComponentType } from "react";

import type { SeenIn } from "@/lib/teams";
import type { PatternJob } from "./jobs";

import PromptEnhancerDemo from "./composer/prompt-enhancer/demo";
import PromptEnhancerThumbnail from "./composer/prompt-enhancer/thumbnail";
import { pattern as promptEnhancerPattern } from "./composer/prompt-enhancer/pattern";
import PromptTemplateDemo from "./composer/prompt-template/demo";
import PromptTemplateThumbnail from "./composer/prompt-template/thumbnail";
import { pattern as promptTemplatePattern } from "./composer/prompt-template/pattern";
import ClarifyingQuestionsDemo from "./messages/clarifying-questions/demo";
import ClarifyingQuestionsThumbnail from "./messages/clarifying-questions/thumbnail";
import { pattern as clarifyingQuestionsPattern } from "./messages/clarifying-questions/pattern";
import ConversationBranchesDemo from "./messages/conversation-branches/demo";
import ConversationBranchesThumbnail from "./messages/conversation-branches/thumbnail";
import { pattern as conversationBranchesPattern } from "./messages/conversation-branches/pattern";
import PlanReviewDemo from "./agents/plan-review/demo";
import PlanReviewThumbnail from "./agents/plan-review/thumbnail";
import { pattern as planReviewPattern } from "./agents/plan-review/pattern";

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
import TaskListDemo from "./agents/task-list/demo";
import TaskListThumbnail from "./agents/task-list/thumbnail";
import { pattern as taskListPattern } from "./agents/task-list/pattern";
import WaitTimeHandoffDemo from "./agents/wait-time-handoff/demo";
import WaitTimeHandoffThumbnail from "./agents/wait-time-handoff/thumbnail";
import { pattern as waitTimeHandoffPattern } from "./agents/wait-time-handoff/pattern";
import AgentRunCardDemo from "./agents/agent-run-card/demo";
import AgentRunCardThumbnail from "./agents/agent-run-card/thumbnail";
import { pattern as agentRunCardPattern } from "./agents/agent-run-card/pattern";
import { pattern as createAgentPattern } from "./agents/create-agent/pattern";
import ShinyButtonDemo from "./buttons/shiny-button/demo";
import ShinyButtonThumbnail from "./buttons/shiny-button/thumbnail";
import { pattern as shinyButtonPattern } from "./buttons/shiny-button/pattern";
import ThinkingLoaderDemo from "./loaders/thinking-loader/demo";
import ThinkingLoaderThumbnail from "./loaders/thinking-loader/thumbnail";
import { pattern as thinkingLoaderPattern } from "./loaders/thinking-loader/pattern";
import DrawingIconDemo from "./loaders/drawing-icon/demo";
import DrawingIconThumbnail from "./loaders/drawing-icon/thumbnail";
import { pattern as drawingIconPattern } from "./loaders/drawing-icon/pattern";
import ExpandableTraceDemo from "./traces/expandable-trace/demo";
import ExpandableTraceThumbnail from "./traces/expandable-trace/thumbnail";
import { pattern as expandableTracePattern } from "./traces/expandable-trace/pattern";
import StreamOfThoughtDemo from "./traces/stream-of-thought/demo";
import StreamOfThoughtThumbnail from "./traces/stream-of-thought/thumbnail";
import { pattern as streamOfThoughtPattern } from "./traces/stream-of-thought/pattern";
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
import CodePreviewDemo from "./code/code-preview/demo";
import CodePreviewThumbnail from "./code/code-preview/thumbnail";
import { pattern as codePreviewPattern } from "./code/code-preview/pattern";
import PromptBarProDemo from "./composer/prompt-bar-pro/demo";
import PromptBarProThumbnail from "./composer/prompt-bar-pro/thumbnail";
import { pattern as promptBarProPattern } from "./composer/prompt-bar-pro/pattern";
import QuickChatDockDemo from "./composer/quick-chat-dock/demo";
import QuickChatDockThumbnail from "./composer/quick-chat-dock/thumbnail";
import { pattern as quickChatDockPattern } from "./composer/quick-chat-dock/pattern";
import MessageQueueDemo from "./composer/message-queue/demo";
import MessageQueueThumbnail from "./composer/message-queue/thumbnail";
import { pattern as messageQueuePattern } from "./composer/message-queue/pattern";
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
import AgentSetupPillDemo from "./onboarding/agent-setup-pill/demo";
import AgentSetupPillThumbnail from "./onboarding/agent-setup-pill/thumbnail";
import { pattern as agentSetupPillPattern } from "./onboarding/agent-setup-pill/pattern";
import DescribeFiltersDemo from "./tables/describe-filters/demo";
import DescribeFiltersThumbnail from "./tables/describe-filters/thumbnail";
import { pattern as describeFiltersPattern } from "./tables/describe-filters/pattern";
import AiFillDrawerDemo from "./tables/ai-fill-drawer/demo";
import AiFillDrawerThumbnail from "./tables/ai-fill-drawer/thumbnail";
import { pattern as aiFillDrawerPattern } from "./tables/ai-fill-drawer/pattern";
import NaturalLanguageQueryDemo from "./tables/natural-language-query/demo";
import NaturalLanguageQueryThumbnail from "./tables/natural-language-query/thumbnail";
import { pattern as naturalLanguageQueryPattern } from "./tables/natural-language-query/pattern";
import AiReviewPanelDemo from "./review/ai-review-panel/demo";
import AiReviewPanelThumbnail from "./review/ai-review-panel/thumbnail";
import { pattern as aiReviewPanelPattern } from "./review/ai-review-panel/pattern";
import VoiceOrbDemo from "./voice/voice-orb/demo";
import VoiceOrbThumbnail from "./voice/voice-orb/thumbnail";
import { pattern as voiceOrbPattern } from "./voice/voice-orb/pattern";
import ModelPickerDemo from "./composer/model-picker/demo";
import ModelPickerThumbnail from "./composer/model-picker/thumbnail";
import { pattern as modelPickerPattern } from "./composer/model-picker/pattern";
import IncognitoToggleDemo from "./composer/incognito-toggle/demo";
import IncognitoToggleThumbnail from "./composer/incognito-toggle/thumbnail";
import { pattern as incognitoTogglePattern } from "./composer/incognito-toggle/pattern";
import MemoryPanelDemo from "./permissions/memory-panel/demo";
import MemoryPanelThumbnail from "./permissions/memory-panel/thumbnail";
import { pattern as memoryPanelPattern } from "./permissions/memory-panel/pattern";
import AiDisclosureBadgeDemo from "./indicators/ai-disclosure-badge/demo";
import AiDisclosureBadgeThumbnail from "./indicators/ai-disclosure-badge/thumbnail";
import { pattern as aiDisclosureBadgePattern } from "./indicators/ai-disclosure-badge/pattern";
import CostEstimateDemo from "./indicators/cost-estimate/demo";
import CostEstimateThumbnail from "./indicators/cost-estimate/thumbnail";
import { pattern as costEstimatePattern } from "./indicators/cost-estimate/pattern";
import ContextUsageDemo from "./indicators/context-usage/demo";
import ContextUsageThumbnail from "./indicators/context-usage/thumbnail";
import { pattern as contextUsagePattern } from "./indicators/context-usage/pattern";

export interface RegistryEntry {
  slug: string;
  category: string;
  /** When the pattern joined the catalogue, as a UTC ISO timestamp (minute precision). Drives the "New" tag — see `getNewEntries`. */
  added: string;
  /** What the pattern does for the user — the cross-category "job" facet (see ./jobs.ts). */
  job: PatternJob;
  title: string;
  description: string;
  Demo: ComponentType;
  /** A tiny, simplified wireframe of the pattern, used as its hero image on cards. */
  Thumbnail: ComponentType;
  /** A UX spec for the pattern, written for agents implementing or reusing it — not the code. */
  uxDoc: string;
  /** Products this pattern ships in, each with a public page (docs, help center, changelog) showing it. Empty when no source was found. */
  seenIn: SeenIn[];
}

export const registry: RegistryEntry[] = [
  {
    slug: "create-agent",
    category: "agents",
    added: "2026-09-15T08:55Z",
    job: "start",
    title: "Create Agent",
    description: "A two-step wizard card for naming an agent, picking its icon, and selecting which event sources activate it.",
    Demo: CreateAgentDemo,
    Thumbnail: CreateAgentThumbnail,
    uxDoc: createAgentPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/custom-agents" },
    ],
  },
  {
    slug: "agent-triggers",
    category: "agents",
    added: "2026-09-15T08:39Z",
    job: "steer",
    title: "Agent Triggers",
    description: "A configuration panel for listing and toggling the external events that activate an agent, with a manual run control.",
    Demo: AgentTriggersDemo,
    Thumbnail: AgentTriggersThumbnail,
    uxDoc: agentTriggersPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/custom-agents" },
      { team: "cursor", source: "https://docs.cursor.com/slack" },
    ],
  },
  {
    slug: "human-in-the-loop",
    category: "agents",
    added: "2026-09-15T11:23Z",
    job: "oversee",
    title: "Human in the Loop Question",
    description: "A compact dialog that pauses an agent mid-task to collect a structured choice — radio options, a free-text fallback, skip/continue controls, and multi-step pagination.",
    Demo: HumanInTheLoopDemo,
    Thumbnail: HumanInTheLoopThumbnail,
    uxDoc: humanInTheLoopPattern,
    seenIn: [
      { team: "claude", source: "https://code.claude.com/docs/en/agent-sdk/user-input" },
    ],
  },
  {
    slug: "background-tasks",
    category: "agents",
    added: "2026-10-08T08:53Z",
    job: "oversee",
    title: "Background Tasks Drawer",
    description:
      "A side drawer that tracks an agent's background work live — running tasks with elapsed time, stats, and stop controls, plus an expandable history of finished commands and output.",
    Demo: BackgroundTasksDemo,
    Thumbnail: BackgroundTasksThumbnail,
    uxDoc: backgroundTasksPattern,
    seenIn: [
      { team: "cursor", source: "https://cursor.com/help/ai-features/background-agents" },
    ],
  },
  {
    slug: "instruction-tools",
    category: "agents",
    added: "2026-10-18T20:44Z",
    job: "ask",
    title: "Instruction Tool Insert",
    description:
      "A numbered instruction editor where typing / opens a two-step inline picker — choose a tool, then its connector or target — inserting an atomic, editable chip into the prose.",
    Demo: InstructionToolsDemo,
    Thumbnail: InstructionToolsThumbnail,
    uxDoc: instructionToolsPattern,
    seenIn: [
      { team: "intercom", source: "https://fin.ai/help/en/articles/13976221-how-to-use-data-connectors-in-fin-procedures" },
    ],
  },
  {
    slug: "procedure-builder",
    category: "agents",
    added: "2026-10-18T20:45Z",
    job: "steer",
    title: "Procedure Builder",
    description:
      "A doc-style editor for an agent's step-by-step procedure — a / step picker, IF / ELSE branches with plain-language or code conditions, section jumps, and escalate / switch actions.",
    Demo: ProcedureBuilderDemo,
    Thumbnail: ProcedureBuilderThumbnail,
    uxDoc: procedureBuilderPattern,
    seenIn: [
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/13449439-building-fin-procedures" },
    ],
  },
  {
    slug: "task-list",
    category: "agents",
    added: "2026-11-04T14:20Z",
    job: "oversee",
    title: "Task List",
    description:
      "A live, agent-authored plan — an ordered list of steps marked pending, in progress, or completed as the agent works through them.",
    Demo: TaskListDemo,
    Thumbnail: TaskListThumbnail,
    uxDoc: taskListPattern,
    seenIn: [
      { team: "claude", source: "https://code.claude.com/docs/en/interactive-mode#task-list" },
      { team: "cursor", source: "https://cursor.com/changelog/1-2" },
    ],
  },
  {
    slug: "agent-run-card",
    category: "agents",
    added: "2026-11-05T14:21Z",
    job: "oversee",
    title: "Agent Run Card",
    description:
      "A compact run card with the agent's current step and a timer, a segmented progress bar, and a list of finished steps that stacks up as it reads, edits, tests and pushes.",
    Demo: AgentRunCardDemo,
    Thumbnail: AgentRunCardThumbnail,
    uxDoc: agentRunCardPattern,
    seenIn: [],
  },
  {
    slug: "wait-time-handoff",
    category: "agents",
    added: "2026-11-04T16:20Z",
    job: "oversee",
    title: "Wait Time Handoff",
    description:
      "A collapsible settings card for what an agent does when the customer goes quiet — a wait duration, a Team / Workflow handoff target, the handoff message, and a working-hours option.",
    Demo: WaitTimeHandoffDemo,
    Thumbnail: WaitTimeHandoffThumbnail,
    uxDoc: waitTimeHandoffPattern,
    seenIn: [
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/7155449-customer-or-teammate-has-been-unresponsive" },
    ],
  },
  {
    slug: "plan-review",
    category: "agents",
    added: "2026-11-07T23:13Z",
    job: "oversee",
    title: "Plan Review",
    description:
      "An editable plan shown before an agent runs — reword, reorder, remove or add steps, or ask for a new plan — that locks once approved.",
    Demo: PlanReviewDemo,
    Thumbnail: PlanReviewThumbnail,
    uxDoc: planReviewPattern,
    seenIn: [
      { team: "cursor", source: "https://cursor.com/docs/agent/plan-mode" },
      { team: "replit", source: "https://docs.replit.com/features/agent/plan-mode" },
      { team: "zapier", source: "https://help.zapier.com/hc/en-us/articles/15703650952077-Use-the-power-of-AI-to-generate-Zap-workflows" },
    ],
  },
  {
    slug: "multi-agent-trace",
    category: "traces",
    added: "2026-09-12T06:58Z",
    job: "oversee",
    title: "Multi-Agent Trace",
    description: "A tree of parallel sub-agent tasks, each with its own status and step list.",
    Demo: MultiAgentTraceDemo,
    Thumbnail: MultiAgentTraceThumbnail,
    uxDoc: multiAgentTracePattern,
    seenIn: [
      { team: "claude", source: "https://claude.com/blog/how-and-when-to-use-subagents-in-claude-code" },
    ],
  },
  {
    slug: "shiny-button",
    category: "buttons",
    added: "2026-09-11T19:54Z",
    job: "start",
    title: "Shiny Button",
    description: "A button with an animated light sweep across its surface.",
    Demo: ShinyButtonDemo,
    Thumbnail: ShinyButtonThumbnail,
    uxDoc: shinyButtonPattern,
    seenIn: [],
  },
  {
    slug: "thinking-loader",
    category: "loaders",
    added: "2026-09-11T19:59Z",
    job: "oversee",
    title: "Thinking Loader",
    description: "A loader with a shimmering label and a live elapsed-time counter.",
    Demo: ThinkingLoaderDemo,
    Thumbnail: ThinkingLoaderThumbnail,
    uxDoc: thinkingLoaderPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/10574485-using-extended-thinking" },
    ],
  },
  {
    slug: "drawing-icon",
    category: "loaders",
    added: "2026-11-05T11:03Z",
    job: "oversee",
    title: "Drawing Icon",
    description: "A line icon that draws itself stroke by stroke while the step it stands for is running.",
    Demo: DrawingIconDemo,
    Thumbnail: DrawingIconThumbnail,
    uxDoc: drawingIconPattern,
    seenIn: [
      { team: "chatgpt", source: "https://chatgpt.com" },
    ],
  },
  {
    slug: "expandable-trace",
    category: "traces",
    added: "2026-09-11T19:59Z",
    job: "oversee",
    title: "Expandable Trace",
    description: "A collapsible \"Thought for Xs\" summary that expands into a step-by-step trace.",
    Demo: ExpandableTraceDemo,
    Thumbnail: ExpandableTraceThumbnail,
    uxDoc: expandableTracePattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/10574485-using-extended-thinking" },
    ],
  },
  {
    slug: "stream-of-thought",
    category: "traces",
    added: "2026-11-07T22:34Z",
    job: "oversee",
    title: "Stream of Thought",
    description: "A live, timed header over reasoning that streams in as a step timeline, then folds into a \"Thought for Ns\" trace when the answer starts.",
    Demo: StreamOfThoughtDemo,
    Thumbnail: StreamOfThoughtThumbnail,
    uxDoc: streamOfThoughtPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/11909943-gpt-5-5-in-chatgpt" },
      { team: "lovable", source: "https://docs.lovable.dev/features/agent-mode" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search" },
    ],
  },
  {
    slug: "streaming-text",
    category: "text",
    added: "2026-09-11T20:22Z",
    job: "oversee",
    title: "Streaming Text",
    description: "A streamed answer with inline sources, actions, and follow-ups.",
    Demo: StreamingTextDemo,
    Thumbnail: StreamingTextThumbnail,
    uxDoc: streamingTextPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
    ],
  },
  {
    slug: "prompt-bar",
    category: "composer",
    added: "2026-09-11T20:37Z",
    job: "ask",
    title: "Prompt Bar",
    description: "A composer with @ sources, / commands, a model picker, and dictation.",
    Demo: PromptBarDemo,
    Thumbnail: PromptBarThumbnail,
    uxDoc: promptBarPattern,
    seenIn: [
      { team: "cursor", source: "https://cursor.com/docs/context/symbols" },
      { team: "claude", source: "https://claude.com/download" },
    ],
  },
  {
    slug: "prompt-bar-pro",
    category: "composer",
    added: "2026-09-11T21:03Z",
    job: "ask",
    title: "Prompt Bar Pro",
    description:
      "A first-run composer with suggestion chips, @ sources, / commands, an environment picker, and an orchestrator picker.",
    Demo: PromptBarProDemo,
    Thumbnail: PromptBarProThumbnail,
    uxDoc: promptBarProPattern,
    seenIn: [
      { team: "cursor", source: "https://cursor.com/docs/context/symbols" },
    ],
  },
  {
    slug: "quick-chat-dock",
    category: "composer",
    added: "2026-11-04T13:15Z",
    job: "ask",
    title: "Quick Chat Dock",
    description:
      "A hidden bottom-edge handle that wakes into an action dock on hover and summons a floating prompt bar.",
    Demo: QuickChatDockDemo,
    Thumbnail: QuickChatDockThumbnail,
    uxDoc: quickChatDockPattern,
    seenIn: [
      { team: "mixpanel", source: "https://docs.mixpanel.com/docs/mixpanel-agent" },
    ],
  },
  {
    slug: "message-queue",
    category: "composer",
    added: "2026-11-04T15:38Z",
    job: "ask",
    title: "Message Queue",
    description:
      "A composer that keeps working mid-turn: ⌘Enter queues follow-ups above the input to send now, edit, or auto-send when the agent finishes.",
    Demo: MessageQueueDemo,
    Thumbnail: MessageQueueThumbnail,
    uxDoc: messageQueuePattern,
    seenIn: [
      { team: "claude", source: "https://code.claude.com/docs/en/interactive-mode" },
      { team: "replit", source: "https://docs.replit.com/features/agent/steer-and-queue-messages" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/13600190-what-s-new-in-advanced-deep-research" },
    ],
  },
  {
    slug: "model-picker",
    category: "composer",
    added: "2026-11-07T22:47Z",
    job: "steer",
    title: "Model Picker",
    description:
      "A composer chip that opens a list of models, each with a one-line description, plan-locked options that lead to an upgrade, and an extended-thinking switch.",
    Demo: ModelPickerDemo,
    Thumbnail: ModelPickerThumbnail,
    uxDoc: modelPickerPattern,
    seenIn: [
      { team: "cursor", source: "https://docs.cursor.com/models" },
      { team: "chatgpt", source: "https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt" },
      { team: "claude", source: "https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings" },
      { team: "gemini", source: "https://support.google.com/gemini/answer/18648722?hl=en" },
      { team: "v0", source: "https://v0.app/changelog" },
    ],
  },
  {
    slug: "incognito-toggle",
    category: "composer",
    added: "2026-11-07T22:47Z",
    job: "trust",
    title: "Incognito Toggle",
    description:
      "A header control that starts a temporary chat, with a persistent banner stating exactly what won't be saved, remembered or used for training.",
    Demo: IncognitoToggleDemo,
    Thumbnail: IncognitoToggleThumbnail,
    uxDoc: incognitoTogglePattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/8914046-temporary-chat-faq" },
      { team: "gemini", source: "https://blog.google/products-and-platforms/products/gemini/temporary-chats-privacy-controls/" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/12639758-incognito-mode-troubleshooting" },
    ],
  },
  {
    slug: "prompt-enhancer",
    category: "composer",
    added: "2026-11-07T23:13Z",
    job: "steer",
    title: "Prompt Enhancer",
    description:
      "An Enhance button that rewrites a short prompt into a specific one in place, highlighting what it added, with one-click undo.",
    Demo: PromptEnhancerDemo,
    Thumbnail: PromptEnhancerThumbnail,
    uxDoc: promptEnhancerPattern,
    seenIn: [],
  },
  {
    slug: "prompt-template",
    category: "composer",
    added: "2026-11-07T23:13Z",
    job: "start",
    title: "Prompt Template",
    description:
      "A prompt written as a sentence with inline blanks — free-text slots that grow as you type and choice slots — that runs once the blanks are filled.",
    Demo: PromptTemplateDemo,
    Thumbnail: PromptTemplateThumbnail,
    uxDoc: promptTemplatePattern,
    seenIn: [
      { team: "zapier", source: "https://help.zapier.com/hc/en-us/articles/44821650010637-Use-a-guided-template" },
    ],
  },
  {
    slug: "diff-summary",
    category: "code",
    added: "2026-09-11T20:48Z",
    job: "trust",
    title: "Diff Summary Card",
    description: "A collapsed summary of a batch of file edits, with undo and an overflow list.",
    Demo: DiffSummaryCardDemo,
    Thumbnail: DiffSummaryCardThumbnail,
    uxDoc: diffSummaryPattern,
    seenIn: [
      { team: "cursor", source: "https://docs.cursor.com/agent/review" },
      { team: "zed", source: "https://zed.dev/docs/ai/agent-panel" },
    ],
  },
  {
    slug: "diff-tabs",
    category: "code",
    added: "2026-09-12T21:18Z",
    job: "trust",
    title: "Diff Tabs",
    description: "Per-file chips that switch an inline diff viewer between a batch of changed files.",
    Demo: DiffTabsDemo,
    Thumbnail: DiffTabsThumbnail,
    uxDoc: diffTabsPattern,
    seenIn: [
      { team: "zed", source: "https://zed.dev/docs/ai/agent-panel" },
      { team: "cursor", source: "https://docs.cursor.com/agent/review" },
    ],
  },
  {
    slug: "code-preview",
    category: "code",
    added: "2026-11-05T11:03Z",
    job: "trust",
    title: "Code Preview Block",
    description: "A code block that flips between the source and a sandboxed live rendering of it.",
    Demo: CodePreviewDemo,
    Thumbnail: CodePreviewThumbnail,
    uxDoc: codePreviewPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it" },
    ],
  },
  {
    slug: "trigger-condition",
    category: "flowcharts",
    added: "2026-09-11T21:12Z",
    job: "steer",
    title: "Flowchart",
    description: "Workflow trigger and condition steps on a dotted canvas.",
    Demo: FlowchartDemo,
    Thumbnail: FlowchartThumbnail,
    uxDoc: flowchartPattern,
    seenIn: [
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/7846212-how-to-use-branches-in-workflows" },
    ],
  },
  {
    slug: "chat-bubble",
    category: "messages",
    added: "2026-09-11T22:23Z",
    job: "trust",
    title: "Chat Bubble with Actions",
    description: "A message bubble with feedback thumbs, edit-and-resubmit, retry/regenerate, and a version stepper.",
    Demo: ChatBubbleDemo,
    Thumbnail: ChatBubbleThumbnail,
    uxDoc: chatBubblePattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/8142208-chatgpt-ios-and-android-app-faq" },
      { team: "claude", source: "https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on" },
    ],
  },
  {
    slug: "clarifying-questions",
    category: "messages",
    added: "2026-11-07T23:13Z",
    job: "start",
    title: "Clarifying Questions",
    description:
      "A short card of questions before an ambiguous task, each pre-filled with the assistant's suggested answer, that collapses into a summary once started.",
    Demo: ClarifyingQuestionsDemo,
    Thumbnail: ClarifyingQuestionsThumbnail,
    uxDoc: clarifyingQuestionsPattern,
    seenIn: [
      { team: "chatgpt", source: "https://openai.com/index/introducing-deep-research/" },
    ],
  },
  {
    slug: "conversation-branches",
    category: "messages",
    added: "2026-11-07T23:13Z",
    job: "steer",
    title: "Conversation Branches",
    description:
      "Editing a sent message creates a new branch instead of overwriting it, with a ‹ 2 / 3 › switcher that swaps the message and its reply together.",
    Demo: ConversationBranchesDemo,
    Thumbnail: ConversationBranchesThumbnail,
    uxDoc: conversationBranchesPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/6825453-chatgpt-release-notes" },
    ],
  },
  {
    slug: "tool-approval",
    category: "permissions",
    added: "2026-09-11T22:24Z",
    job: "oversee",
    title: "Tool Approval",
    description: "A pending tool-call prompt with allow, always-allow, and deny actions.",
    Demo: ToolApprovalDemo,
    Thumbnail: ToolApprovalThumbnail,
    uxDoc: toolApprovalPattern,
    seenIn: [
      { team: "claude", source: "https://code.claude.com/docs/en/permissions" },
      { team: "warp", source: "https://docs.warp.dev/agents/local-agents/interacting-with-agents/terminal-and-agent-modes" },
      { team: "notion", source: "https://www.notion.com/help/choose-how-notion-agent-asks-for-your-approval" },
    ],
  },
  {
    slug: "connector-panel",
    category: "permissions",
    added: "2026-09-15T20:37Z",
    job: "steer",
    title: "Connector Panel",
    description:
      "A settings panel for connecting an app or MCP server — shows capabilities overview, groups tools by type, and lets users set per-tool permission levels.",
    Demo: ConnectorPanelDemo,
    Thumbnail: ConnectorPanelThumbnail,
    uxDoc: connectorPanelPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/11176164" },
      { team: "chatgpt", source: "https://developers.openai.com/api/docs/guides/developer-mode" },
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/11461635-add-mcp-connectors-for-popular-apps-or-custom-mcps" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/collections/18799295-connectors-integrations" },
    ],
  },
  {
    slug: "memory-panel",
    category: "permissions",
    added: "2026-11-07T22:47Z",
    job: "trust",
    title: "Memory Panel",
    description:
      "A panel listing what the assistant remembers about the user — edit or forget each memory with undo, switch memory off, forget all — plus a memory-updated notice for the chat.",
    Demo: MemoryPanelDemo,
    Thumbnail: MemoryPanelThumbnail,
    uxDoc: memoryPanelPattern,
    seenIn: [
      { team: "chatgpt", source: "https://openai.com/index/memory-and-new-controls-for-chatgpt/" },
      { team: "gemini", source: "https://support.google.com/gemini/answer/18617127?hl=en&co=GENIE.Platform%3DDesktop" },
    ],
  },
  {
    slug: "tool-call-chip",
    category: "loaders",
    added: "2026-09-12T06:37Z",
    job: "oversee",
    title: "Tool Call Chip",
    description: "An inline pill naming an in-flight tool call that resolves into a result summary.",
    Demo: ToolCallChipDemo,
    Thumbnail: ToolCallChipThumbnail,
    uxDoc: toolCallChipPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
      { team: "claude", source: "https://support.claude.com/en/articles/10684626-enable-and-use-web-search" },
    ],
  },
  {
    slug: "attachment-chip",
    category: "uploads",
    added: "2026-09-12T06:37Z",
    job: "ask",
    title: "Attachment Chip",
    description: "A composer's file/image attachment tray with drag-drop, upload progress, and inline preview.",
    Demo: AttachmentTrayDemo,
    Thumbnail: AttachmentTrayThumbnail,
    uxDoc: attachmentChipPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/8241126-upload-files-to-claude" },
      { team: "figma", source: "https://help.figma.com/hc/en-us/articles/31304529835671-Attach-files-to-a-prompt-in-the-Figma-agent-and-Figma-Make" },
      { team: "lovable", source: "https://docs.lovable.dev/tips-tricks/using-images" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads" },
    ],
  },
  {
    slug: "image-peek",
    category: "media",
    added: "2026-10-07T07:49Z",
    job: "trust",
    title: "Image Peek",
    description: "A row of tiny image thumbnails that grows into an anchored preview card with a label, counter, and prev/next stepping.",
    Demo: ImagePeekDemo,
    Thumbnail: ImagePeekThumbnail,
    uxDoc: imagePeekPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
    ],
  },
  {
    slug: "stop-generation-button",
    category: "buttons",
    added: "2026-09-12T06:58Z",
    job: "oversee",
    title: "Stop Generation Button",
    description: "A send button that morphs into a stop control mid-stream and back on completion.",
    Demo: StopGenerationButtonDemo,
    Thumbnail: StopGenerationButtonThumbnail,
    uxDoc: stopGenerationButtonPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/7996703-troubleshooting-chatgpt-error-messages" },
      { team: "gemini", source: "https://support.google.com/googlebook/answer/18429222" },
    ],
  },
  {
    slug: "terminal-stream",
    category: "code",
    added: "2026-09-12T06:58Z",
    job: "oversee",
    title: "Terminal Stream",
    description: "An auto-scrolling, collapsible panel streaming raw command output line by line.",
    Demo: TerminalStreamDemo,
    Thumbnail: TerminalStreamThumbnail,
    uxDoc: terminalStreamPattern,
    seenIn: [
      { team: "warp", source: "https://docs.warp.dev/agents/local-agents/agent-context/blocks-as-context" },
    ],
  },
  {
    slug: "inline-citation",
    category: "text",
    added: "2026-09-12T06:58Z",
    job: "trust",
    title: "Inline Citation",
    description: "A hoverable, clickable footnote-style source marker inline within text.",
    Demo: InlineCitationDemo,
    Thumbnail: InlineCitationThumbnail,
    uxDoc: inlineCitationPattern,
    seenIn: [
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work" },
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
      { team: "intercom", source: "https://fin.ai/help/en/articles/13975900-copilot-explained" },
      { team: "notion", source: "https://www.notion.com/help/enterprise-search" },
    ],
  },
  {
    slug: "sources-stack",
    category: "text",
    added: "2026-09-12T07:50Z",
    job: "trust",
    title: "Sources Stack",
    description: "An overlapping stack of source favicons with a count, expanding into a linked source list.",
    Demo: SourcesStackDemo,
    Thumbnail: SourcesStackThumbnail,
    uxDoc: sourcesStackPattern,
    seenIn: [
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9237897-chatgpt-search" },
      { team: "notion", source: "https://www.notion.com/help/enterprise-search" },
    ],
  },
  {
    slug: "source-trust-card",
    category: "text",
    added: "2026-09-12T23:08Z",
    job: "trust",
    title: "Source Trust Card",
    description: "A paginated single-source card with a trust badge and domain pills for jumping between sources.",
    Demo: SourceTrustCardDemo,
    Thumbnail: SourceTrustCardThumbnail,
    uxDoc: sourceTrustCardPattern,
    seenIn: [{ team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels" }],
  },
  {
    slug: "follow-up-list",
    category: "text",
    added: "2026-09-12T12:42Z",
    job: "start",
    title: "Follow-Up List",
    description: "A vertical list of suggested next questions shown after a response, each sendable with a tap.",
    Demo: FollowUpListDemo,
    Thumbnail: FollowUpListThumbnail,
    uxDoc: followUpListPattern,
    seenIn: [],
  },
  {
    slug: "selection-actions",
    category: "text",
    added: "2026-09-12T13:51Z",
    job: "ask",
    title: "Selection Actions",
    description: "A floating toolbar on text selection for describing edits, explaining, or improving a passage.",
    Demo: SelectionActionsDemo,
    Thumbnail: SelectionActionsThumbnail,
    uxDoc: selectionActionsPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/guides/notion-ai-for-docs" },
      { team: "gemini", source: "https://support.google.com/gemini/answer/14262426" },
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it" },
      { team: "figma", source: "https://help.figma.com/hc/en-us/articles/42009840449175-Edit-a-Figma-Make-file" },
      { team: "copilot", source: "https://docs.github.com/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide" },
      { team: "lovable", source: "https://docs.lovable.dev/features/visual-edit" },
    ],
  },
  {
    slug: "refinement-controls",
    category: "text",
    added: "2026-10-18T20:14Z",
    job: "steer",
    title: "Refinement Controls",
    description:
      "One-tap adjustments (Rephrase, Shorten, More formal, Bulletize…) and a free-form instruction field docked under an AI output, with every result kept as a steppable version.",
    Demo: RefinementControlsDemo,
    Thumbnail: RefinementControlsThumbnail,
    uxDoc: refinementControlsPattern,
    seenIn: [
      { team: "gemini", source: "https://support.google.com/gemini/answer/14262426" },
      { team: "chatgpt", source: "https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it" },
      { team: "notion", source: "https://www.notion.com/help/guides/notion-ai-for-docs" },
      { team: "perplexity", source: "https://www.perplexity.ai/help-center/en/articles/12802813-how-do-i-change-to-my-preferred-ai-model" },
    ],
  },
  {
    slug: "rate-limit",
    category: "errors",
    added: "2026-09-12T14:20Z",
    job: "recover",
    title: "Rate Limit",
    description: "A quota-exceeded state with a live countdown to when the user can send again.",
    Demo: RateLimitDemo,
    Thumbnail: RateLimitThumbnail,
    uxDoc: rateLimitPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/12466728-understand-claude-error-messages" },
    ],
  },
  {
    slug: "partial-response",
    category: "errors",
    added: "2026-09-12T14:20Z",
    job: "recover",
    title: "Partial Response",
    description: "A cut-short assistant reply with Continue and Retry actions.",
    Demo: PartialResponseDemo,
    Thumbnail: PartialResponseThumbnail,
    uxDoc: partialResponsePattern,
    seenIn: [],
  },
  {
    slug: "generation-error",
    category: "errors",
    added: "2026-09-14T09:58Z",
    job: "recover",
    title: "Generation Error",
    description: "A console-style error card for a failed generation, with details and retry.",
    Demo: GenerationErrorDemo,
    Thumbnail: GenerationErrorThumbnail,
    uxDoc: generationErrorPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/12466728-understand-claude-error-messages" },
    ],
  },
  {
    slug: "console-error-card",
    category: "errors",
    added: "2026-09-14T10:42Z",
    job: "recover",
    title: "Console Error Card",
    description: "A structured card surfacing a browser console error with a code frame, call stack, and navigation.",
    Demo: ConsoleErrorCardDemo,
    Thumbnail: ConsoleErrorCardThumbnail,
    uxDoc: consoleErrorCardPattern,
    seenIn: [
      { team: "lovable", source: "https://docs.lovable.dev/tips-tricks/troubleshooting" },
      { team: "v0", source: "https://v0.app/docs/deployments" },
    ],
  },
  {
    slug: "connectivity-error",
    category: "errors",
    added: "2026-09-14T10:42Z",
    job: "recover",
    title: "Connectivity Error",
    description: "A dismissible card surfacing a network connection failure with a description and retry/details actions.",
    Demo: ConnectivityErrorDemo,
    Thumbnail: ConnectivityErrorThumbnail,
    uxDoc: connectivityErrorPattern,
    seenIn: [
      { team: "claude", source: "https://support.claude.com/en/articles/10366432-i-m-getting-an-api-connection-error-how-can-i-fix-it" },
    ],
  },
  {
    slug: "response-compare",
    category: "compare",
    added: "2026-09-12T20:41Z",
    job: "trust",
    title: "Response Compare",
    description: "A side-by-side pair of response panels with independent regenerate and a single preferred pick.",
    Demo: ResponseCompareDemo,
    Thumbnail: ResponseCompareThumbnail,
    uxDoc: responseComparePattern,
    seenIn: [
      { team: "lmarena", source: "https://lmarena.ai/faq" },
    ],
  },
  {
    slug: "confidence-indicator",
    category: "indicators",
    added: "2026-09-12T20:49Z",
    job: "trust",
    title: "Confidence Indicator",
    description: "A badge or inline dot signaling how sure an AI answer or extraction is.",
    Demo: ConfidenceIndicatorDemo,
    Thumbnail: ConfidenceIndicatorThumbnail,
    uxDoc: confidenceIndicatorPattern,
    seenIn: [
      { team: "box", source: "https://blog.box.com/confidence-scores-box-ai-extract-know-when-rely-your-extractions" },
    ],
  },
  {
    slug: "ai-disclosure-badge",
    category: "indicators",
    added: "2026-11-07T22:47Z",
    job: "trust",
    title: "AI Disclosure Badge",
    description:
      "An AI-generated label in chip, image-overlay and inline forms that opens a provenance card: model, time, and whether a person edited it.",
    Demo: AiDisclosureBadgeDemo,
    Thumbnail: AiDisclosureBadgeThumbnail,
    uxDoc: aiDisclosureBadgePattern,
    seenIn: [
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/11712008-ai-agent-disclosure" },
      { team: "zapier", source: "https://help.zapier.com/hc/en-us/articles/27915202201357-Add-a-disclosure-message-to-your-chatbot" },
    ],
  },
  {
    slug: "cost-estimate",
    category: "indicators",
    added: "2026-11-07T22:47Z",
    job: "oversee",
    title: "Cost Estimate",
    description:
      "A pre-run estimate of what a task will cost, with a live balance meter, a low-balance warning, a top-up when the balance can't cover it and a breakdown.",
    Demo: CostEstimateDemo,
    Thumbnail: CostEstimateThumbnail,
    uxDoc: costEstimatePattern,
    seenIn: [
      { team: "elevenlabs", source: "https://help.elevenlabs.io/hc/en-us/articles/30725662424849-How-much-does-GenFM-cost" },
    ],
  },
  {
    slug: "context-usage",
    category: "indicators",
    added: "2026-11-07T23:06Z",
    job: "oversee",
    title: "Context Usage",
    description:
      "A context-window meter: tokens used against the limit, a segmented bar of what fills it, a legend to inspect each source and a Compact action to free space.",
    Demo: ContextUsageDemo,
    Thumbnail: ContextUsageThumbnail,
    uxDoc: contextUsagePattern,
    seenIn: [{ team: "claude", source: "https://code.claude.com/docs/en/slash-commands" }],
  },
  {
    slug: "voice-waveform",
    category: "voice",
    added: "2026-09-12T21:05Z",
    job: "ask",
    title: "Voice Waveform",
    description: "A live amplitude waveform while the AI listens or speaks.",
    Demo: VoiceWaveformDemo,
    Thumbnail: VoiceWaveformThumbnail,
    uxDoc: voiceWaveformPattern,
    seenIn: [
      { team: "gemini", source: "https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DAndroid" },
      { team: "claude", source: "https://claude.com/download" },
    ],
  },
  {
    slug: "voice-orb",
    category: "voice",
    added: "2026-11-07T22:09Z",
    job: "oversee",
    title: "Voice Orb",
    description: "A 3D particle sphere that breathes and spins with the voice conversation.",
    Demo: VoiceOrbDemo,
    Thumbnail: VoiceOrbThumbnail,
    uxDoc: voiceOrbPattern,
    seenIn: [
      { team: "elevenlabs", source: "https://ui.elevenlabs.io/docs/components/orb" },
      { team: "chatgpt", source: "https://help.openai.com/en/articles/8400625-voice-mode" },
    ],
  },
  {
    slug: "listening-state",
    category: "voice",
    added: "2026-09-12T21:05Z",
    job: "ask",
    title: "Listening State",
    description: "A pulsing mic indicator showing the AI is actively listening.",
    Demo: ListeningStateDemo,
    Thumbnail: ListeningStateThumbnail,
    uxDoc: listeningStatePattern,
    seenIn: [
      { team: "gemini", source: "https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DAndroid" },
    ],
  },
  {
    slug: "live-transcript",
    category: "voice",
    added: "2026-09-12T21:05Z",
    job: "ask",
    title: "Live Transcript",
    description: "A streaming, speaker-labeled transcription of a voice conversation.",
    Demo: LiveTranscriptDemo,
    Thumbnail: LiveTranscriptThumbnail,
    uxDoc: liveTranscriptPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/ai-meeting-notes" },
      { team: "elevenlabs", source: "https://elevenlabs.io/docs/overview/capabilities/speech-to-text" },
    ],
  },
  {
    slug: "command-palette",
    category: "navigation",
    added: "2026-09-12T22:10Z",
    job: "ask",
    title: "Command Palette",
    description: "A searchable ⌘K overlay for jumping to sessions or running quick actions.",
    Demo: CommandPaletteDemo,
    Thumbnail: CommandPaletteThumbnail,
    uxDoc: commandPalettePattern,
    seenIn: [
      { team: "linear", source: "https://linear.app/enablement/guide/navigating-linear" },
    ],
  },
  {
    slug: "collaborative-presence",
    category: "collaboration",
    added: "2026-09-14T08:33Z",
    job: "oversee",
    title: "Collaborative Presence",
    description:
      "An avatar stack showing who has access to a shared record and who is actively viewing it right now.",
    Demo: CollaborativePresenceDemo,
    Thumbnail: CollaborativePresenceThumbnail,
    uxDoc: collaborativePresencePattern,
    seenIn: [
      { team: "figma", source: "https://help.figma.com/hc/en-us/articles/29638316371479-See-viewer-history-for-your-files" },
    ],
  },
  {
    slug: "invite-members",
    category: "access",
    added: "2026-09-14T08:33Z",
    job: "start",
    title: "Invite Members",
    description:
      "A two-step modal for searching or emailing people to a record and assigning each a role, with a live current-members list.",
    Demo: InviteMembersDemo,
    Thumbnail: InviteMembersThumbnail,
    uxDoc: inviteMembersPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/sharing-and-permissions" },
    ],
  },
  {
    slug: "analysis-list",
    category: "loaders",
    added: "2026-09-14T11:04Z",
    job: "oversee",
    title: "Analysis List",
    description: "A full-width indeterminate progress bar over a list whose items resolve from skeletons one by one.",
    Demo: AnalysisListDemo,
    Thumbnail: AnalysisListThumbnail,
    uxDoc: analysisListPattern,
    seenIn: [
      { team: "gemini", source: "https://blog.google/products-and-platforms/products/gemini/tips-how-to-use-deep-research/" },
    ],
  },
  {
    slug: "setup-checklist",
    category: "navigation",
    added: "2026-09-14T21:42Z",
    job: "start",
    title: "Setup Checklist",
    description: "A stepped onboarding card with circular arc progress, dashed-circle pending states, and strikethrough for completed steps.",
    Demo: SetupChecklistDemo,
    Thumbnail: SetupChecklistThumbnail,
    uxDoc: setupChecklistPattern,
    seenIn: [
      { team: "intercom", source: "https://www.intercom.com/help/en/articles/6661022-getting-started-with-checklists" },
    ],
  },
  {
    slug: "prompt-onboarding",
    category: "onboarding",
    added: "2026-10-18T15:39Z",
    job: "start",
    title: "Prompt-Driven Onboarding",
    description:
      "A setup screen that hands users a pre-filled prompt to paste into their AI coding agent, with a snippet fallback and a live listener that confirms the first event.",
    Demo: PromptOnboardingDemo,
    Thumbnail: PromptOnboardingThumbnail,
    uxDoc: promptOnboardingPattern,
    seenIn: [
      { team: "posthog", source: "https://posthog.com/docs/error-tracking/installation" },
      { team: "sentry", source: "https://github.com/getsentry/sentry-for-ai" },
    ],
  },
  {
    slug: "agent-setup-pill",
    category: "onboarding",
    added: "2026-11-06T21:56Z",
    job: "start",
    title: "Agent Setup Pill",
    description:
      "A floating pill that copies a setup prompt for the user's AI coding agent in one click — outcome label, a row of supported agents, a tooltip that says what the click does, and a separate dismiss button.",
    Demo: AgentSetupPillDemo,
    Thumbnail: AgentSetupPillThumbnail,
    uxDoc: agentSetupPillPattern,
    seenIn: [
      { team: "cloudflare", source: "https://developers.cloudflare.com/" },
    ],
  },
  {
    slug: "describe-filters",
    category: "tables",
    added: "2026-11-03T10:55Z",
    job: "ask",
    title: "Describe Filters",
    description:
      "A Describe button in a table toolbar that turns a plain-language request into removable filter chips — column filters where a column exists, marked semantic matches where none does.",
    Demo: DescribeFiltersDemo,
    Thumbnail: DescribeFiltersThumbnail,
    uxDoc: describeFiltersPattern,
    seenIn: [
      { team: "linear", source: "https://linear.app/docs/filters" },
    ],
  },
  {
    slug: "ai-fill-drawer",
    category: "tables",
    added: "2026-11-03T12:17Z",
    job: "ask",
    title: "AI Fill Drawer",
    description:
      "A record drawer of key/value fields where the model fills the empty values — each arrives as a sourced suggestion to accept, edit or reject.",
    Demo: AiFillDrawerDemo,
    Thumbnail: AiFillDrawerThumbnail,
    uxDoc: aiFillDrawerPattern,
    seenIn: [
      { team: "notion", source: "https://www.notion.com/help/autofill" },
      { team: "linear", source: "https://linear.app/docs/triage-intelligence" },
      { team: "coda", source: "https://help.coda.io/en/articles/7988177-coda-ai-features" },
    ],
  },
  {
    slug: "natural-language-query",
    category: "tables",
    added: "2026-11-03T13:07Z",
    job: "ask",
    title: "Natural Language Query",
    description:
      "A SQL-first query bar that also takes plain language — the mode badge flips to Ask, and Enter translates the request into a visible, editable WHERE clause before running it.",
    Demo: NaturalLanguageQueryDemo,
    Thumbnail: NaturalLanguageQueryThumbnail,
    uxDoc: naturalLanguageQueryPattern,
    seenIn: [
      { team: "supabase", source: "https://supabase.com/features/sql-editor" },
      { team: "mongodb", source: "https://www.mongodb.com/ko-kr/docs/v8.3/natural-language-to-mongodb/" },
    ],
  },
  {
    slug: "ai-review-panel",
    category: "review",
    added: "2026-11-04T16:18Z",
    job: "trust",
    title: "AI Review Panel",
    description:
      "A side panel for checking extracted values one by one — each field shows its value, the model's reasoning and verbatim evidence that highlights in the source, with accept, dismiss and apply-all-pending.",
    Demo: AiReviewPanelDemo,
    Thumbnail: AiReviewPanelThumbnail,
    uxDoc: aiReviewPanelPattern,
    seenIn: [{ team: "datamaran", source: "https://www.datamaran.com/" }],
  },
];

export function getRegistryEntry(category: string, slug: string) {
  return registry.find((entry) => entry.category === category && entry.slug === slug);
}

/** How many of the most recently added patterns carry the "New" tag. */
export const NEW_COUNT = 10;

/** The `NEW_COUNT` most recently added patterns, newest first (ties keep registry order). */
export const newEntries: RegistryEntry[] = [...registry]
  .sort((a, b) => b.added.localeCompare(a.added))
  .slice(0, NEW_COUNT);

const NEW_SET = new Set(newEntries);

export function isNewEntry(entry: RegistryEntry) {
  return NEW_SET.has(entry);
}

export function getEntriesByJob(job: PatternJob) {
  return registry.filter((entry) => entry.job === job);
}

export function getCategories() {
  return Array.from(new Set(registry.map((entry) => entry.category)));
}

/** The patterns before and after this one in registry order (no wrap-around). */
export function getAdjacentEntries(category: string, slug: string) {
  const index = registry.findIndex((entry) => entry.category === category && entry.slug === slug);
  if (index === -1) return { prev: undefined, next: undefined };
  return { prev: registry[index - 1], next: registry[index + 1] };
}

export function getEntryHref(entry: Pick<RegistryEntry, "category" | "slug">) {
  return `/patterns/${entry.category}/${entry.slug}`;
}

export interface RelatedEntry {
  entry: RegistryEntry;
  /** One sentence on when to use the related pattern instead of, or as well as, this one. */
  reason: string;
}

/** The top-level "- " bullets of one "## <heading>" section of the pattern's spec. */
export function getSpecList(entry: RegistryEntry, heading: string): string[] {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const section = entry.uxDoc.split(new RegExp(`^## ${escaped}\\s*$`, "m"))[1]?.split(/^## /m)[0] ?? "";
  return [...section.matchAll(/^- (.+)$/gm)].map(([, item]) => item.trim());
}

/**
 * The patterns listed in this pattern's "Related patterns" spec section, in
 * order. Each bullet reads "- **<Title>** — <when to use it instead or as well>".
 */
export function getRelatedEntries(entry: RegistryEntry): RelatedEntry[] {
  const section = entry.uxDoc.split(/^## Related patterns\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const related: RelatedEntry[] = [];
  for (const [, title, reason] of section.matchAll(/^- \*\*(.+?)\*\* — (.+)$/gm)) {
    const match = registry.find((e) => e.title === title);
    if (match && match !== entry) related.push({ entry: match, reason: reason.trim() });
  }
  return related;
}
