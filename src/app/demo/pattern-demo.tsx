"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Columns2, GitBranch, Gauge, LayoutGrid, Mic, RotateCcw, TerminalSquare } from "lucide-react";

import { ChatBubble } from "@/registry/messages/chat-bubble/component";
import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { ToolCallChip, type ToolCallKind, type ToolCallStatus } from "@/registry/loaders/tool-call-chip/component";
import { ExpandableTrace, type TraceStep } from "@/registry/traces/expandable-trace/component";
import { TerminalStream, type LogLine, type TerminalStatus } from "@/registry/code/terminal-stream/component";
import { DiffSummaryCard, type DiffFile } from "@/registry/code/diff-summary/component";
import { ToolApproval } from "@/registry/permissions/tool-approval/component";
import { MultiAgentTrace, type Agent } from "@/registry/traces/multi-agent-trace/component";
import { StreamingText, type StreamSegment } from "@/registry/text/streaming-text/component";
import { SourcesStack, type Source } from "@/registry/text/sources-stack/component";
import { FollowUpList } from "@/registry/text/follow-up-list/component";
import { SelectionActions } from "@/registry/text/selection-actions/component";
import { AttachmentTray, type Attachment } from "@/registry/uploads/attachment-chip/component";
import { Flowchart, type FlowchartNode } from "@/registry/flowcharts/trigger-condition/component";
import { InlineCitation, type CitationSource } from "@/registry/text/inline-citation/component";
import { RateLimit } from "@/registry/errors/rate-limit/component";
import { PartialResponse, type PartialResponseReason } from "@/registry/errors/partial-response/component";
import { PromptBarPro, type PromptBarItem } from "@/registry/composer/prompt-bar-pro/component";
import { ResponseCompare, type CompareResponse } from "@/registry/compare/response-compare/component";
import { ConfidenceIndicator } from "@/registry/indicators/confidence-indicator/component";
import { SourceTrustCard, type TrustedSource } from "@/registry/text/source-trust-card/component";
import { DiffTabs, type DiffTabFile } from "@/registry/code/diff-tabs/component";
import {
  CommandPaletteWindow,
  type CommandPaletteGroup,
  type CommandPaletteItem,
} from "@/registry/navigation/command-palette/component";
import { ListeningState } from "@/registry/voice/listening-state/component";
import { LiveTranscript, type TranscriptSegment } from "@/registry/voice/live-transcript/component";
import { VoiceWaveform } from "@/registry/voice/voice-waveform/component";
import { ShinyButton } from "@/registry/buttons/shiny-button/component";
import { SUGGESTIONS } from "./suggestions";
import { trackDemoPromptSubmitted } from "@/lib/analytics";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const COMMANDS: PromptBarItem[] = SUGGESTIONS.map((s) => ({
  id: s.id,
  label: `/${s.id}`,
  description: s.label,
}));

const SOURCES: PromptBarItem[] = [
  { id: "diff-summary", label: "Diff Summary" },
  { id: "terminal-stream", label: "Terminal Stream" },
  { id: "multi-agent-trace", label: "Multi-Agent Trace" },
  { id: "tool-approval", label: "Tool Approval" },
];

const GENERIC_REPLIES = [
  "Here's what I found — it lines up with what you described. Want me to go a level deeper?",
  "Noted. I can turn that into a task, a draft, or a quick trace of my reasoning — just say the word.",
  "Good question. Given what's already in the project, I'd start small and iterate rather than plan the whole thing up front.",
];

function pickReply(exclude?: string) {
  const options = GENERIC_REPLIES.filter((r) => r !== exclude);
  return options[Math.floor(Math.random() * options.length)] ?? GENERIC_REPLIES[0];
}

function text(content: string): StreamSegment[] {
  return [{ type: "text", content }];
}

const INTRO_SEGMENTS = text(
  "Hey — welcome to ai-patterns. Instead of describing the components, I'm just going to show you, live, right here in this conversation."
);

const TOOLCALL_INTRO_SEGMENTS = text(
  "First up — tool calls. When I go look something up, you get a live status chip like this one:"
);

const TRACE_INTRO_SEGMENTS = text(
  "For anything that takes a few steps of reasoning, I can show my work in a collapsible trace instead of a wall of text:"
);

const AGENTS_INTRO_SEGMENTS = text(
  "Bigger jobs get split across agents that run in parallel, each with its own status:"
);

const CODE_INTRO_SEGMENTS = text(
  "When I touch your codebase, you get a diff you can undo or expand, plus a live terminal stream while commands run:"
);

const SOURCES_INTRO_SEGMENTS: StreamSegment[] = [
  { type: "text", content: "Answers can cite sources inline as they stream — " },
  { type: "source", label: "docs" },
  { type: "text", content: " — and collapse into a linked source list underneath." },
];

const CITATION_COMBO_INTRO_SEGMENTS = text(
  "Individual claims can carry their own citation too — hover the small superscript for a quick preview, or for something richer, a full trust card:"
);

const OUTRO_SEGMENTS = text(
  "That's the core of it — and everything above is a real, working component, not a mockup. There's more where that came from. Want to keep going?"
);

const MORE_INTRO_SEGMENTS = text("Sure — here's more of the catalogue.");

const UPLOADS_INTRO_SEGMENTS = text(
  "The composer handles attachments too — drop a file in and its upload tracks inline:"
);

const FLOWCHART_INTRO_SEGMENTS = text(
  "Building an automation instead of a chat? Triggers and conditions get their own visual flow:"
);

const SELECTION_INTRO_SEGMENTS = text(
  "Answers don't have to be static, either — highlight any passage below and ask for a rewrite, or just hit Explain:"
);

const DIFFTABS_INTRO_SEGMENTS = text(
  "Bigger changes get their own tabbed diff instead of one long scroll — flip between files without losing your place:"
);

const COMPARE_INTRO_SEGMENTS = text(
  "Want two takes before picking one? I can draft both and let you choose:"
);

const CONFIDENCE_INTRO_SEGMENTS = text(
  "Not every claim deserves equal trust, either — a confidence indicator can sit right on the number in question:"
);

const TRUST_INTRO_SEGMENTS = text(
  "Sources can carry a trust reason of their own too, right alongside the citation:"
);

const PALETTE_INTRO_SEGMENTS = text(
  "Need to jump somewhere fast? A command palette drops straight into the transcript — try selecting one:"
);

const VOICE_INTRO_SEGMENTS = text(
  "And if this were voice instead of text, the same exchange gets its own components — listening, live transcript, then a waveform while I answer:"
);

const SELECTION_PARAGRAPH =
  "Every block in this tour is a real registry component streaming into the transcript, not a canned screenshot — the same code you'd drop straight into your own chat interface.";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockSelectionRewrite(selection: string, instruction: string) {
  await delay(700);
  const lower = instruction.toLowerCase();

  if (lower.includes("formal")) {
    return selection.replace(/\bcanned\b/, "staged").replace(/\bdrop straight\b/, "integrate directly");
  }
  if (lower.includes("shorten") || lower.includes("clarity") || lower.includes("improve")) {
    return selection.replace(/\bstreaming into the transcript, not a canned screenshot\b/, "live, not a screenshot");
  }
  return selection;
}

async function mockSelectionExplain(selection: string) {
  await delay(400);
  void selection;
  return "This line is making the point that the whole tour runs the actual registry components live, so what you see here is exactly what ships in the code tab.";
}

const SKILL_INTRO_SEGMENTS = text(
  "And this whole catalogue also ships as a Claude Code skill, so your coding agent can reach for it directly:"
);

const SKILL_OUTRO_SEGMENTS = text(
  "From there, just ask it to design a screen — it'll shortlist patterns from here and scaffold the one that actually fits."
);

const MORE_OUTRO_SEGMENTS = text(
  "That's the whole registry. Replay from the top, browse the catalogue yourself, or keep chatting."
);

const CITATION_INTRO_SEGMENTS = text(
  "Long answers can cite sources inline as they're written, too — tap a number to see where it came from without leaving the page:"
);

const RATE_LIMIT_INTRO_SEGMENTS = text(
  "Every product has a ceiling somewhere. Here's what hitting it looks like instead of a raw error:"
);

const PARTIAL_RESPONSE_INTRO_SEGMENTS = text(
  "And when a response gets cut off, the partial content sticks around instead of vanishing — with a clear way back in:"
);

const DEMO_SOURCES: Source[] = [
  {
    title: "Tailwind CSS v4.0",
    domain: "tailwindcss.com",
    url: "https://tailwindcss.com/blog/tailwindcss-v4",
    faviconUrl: favicon("tailwindcss.com"),
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    url: "https://motion.dev",
    faviconUrl: favicon("motion.dev"),
  },
  {
    title: "React Docs — Thinking in React",
    domain: "react.dev",
    url: "https://react.dev/learn/thinking-in-react",
    faviconUrl: favicon("react.dev"),
  },
  {
    title: "MDN Web Docs",
    domain: "developer.mozilla.org",
    url: "https://developer.mozilla.org/",
    faviconUrl: favicon("developer.mozilla.org"),
  },
];

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

const CITATION_SOURCES: CitationSource[] = [
  {
    title: "Tailwind CSS v4.0",
    domain: "tailwindcss.com",
    snippet: "A ground-up rewrite of the framework, built for the modern web.",
    url: "https://tailwindcss.com/blog/tailwindcss-v4",
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    snippet: "A production-ready animation library for React and JavaScript.",
    url: "https://motion.dev",
  },
];

const COMPARE_RESPONSES: [CompareResponse, CompareResponse] = [
  {
    id: "a",
    label: "Response A",
    content:
      "The Confidence Indicator surfaces how sure the model is about one specific claim — a small badge or inline dot next to the number in question, not a blanket disclaimer at the top of the answer.",
  },
  {
    id: "b",
    label: "Response B",
    content:
      "Confidence Indicator shows certainty at a glance using color and a short label — high, medium, or low — so you know which parts of a response are worth double-checking.",
  },
];

const TRUST_SOURCES: TrustedSource[] = [
  {
    title: "Next.js Docs — App Router",
    domain: "nextjs.org",
    description:
      "The official Next.js documentation for the App Router — layouts, server components, and file-based routing.",
    url: "https://nextjs.org/docs/app",
    faviconUrl: favicon("nextjs.org"),
    trustReason: "is trusted for official framework documentation, maintained directly by the Next.js core team.",
  },
  {
    title: "Motion for React",
    domain: "motion.dev",
    description: "The animation library behind every looping sheen and staged transition in this registry.",
    url: "https://motion.dev",
    faviconUrl: favicon("motion.dev"),
  },
];

const DIFF_TABS_FILES: DiffTabFile[] = [
  {
    id: "component",
    name: "voice-waveform/component.tsx",
    additions: 5,
    deletions: 1,
    lines: [
      { type: "context", content: "  const active = levels ?? synthetic;" },
      { type: "remove", content: "  return (" },
      { type: "add", content: '  return (' },
      { type: "add", content: '    <div role="img" aria-label={STATE_LABEL[state]}>' },
    ],
  },
  {
    id: "pattern",
    name: "voice-waveform/pattern.ts",
    additions: 2,
    deletions: 0,
    lines: [
      { type: "context", content: "## Accessibility" },
      {
        type: "add",
        content: "- Bars are decorative; expose state through role=\"img\" and an aria-label instead of per-bar text.",
      },
    ],
  },
];

const PALETTE_GROUPS: CommandPaletteGroup[] = [
  {
    label: "Jump to a pattern",
    items: [
      { id: "compare/response-compare", label: "Response Compare", icon: Columns2 },
      { id: "indicators/confidence-indicator", label: "Confidence Indicator", icon: Gauge },
      { id: "text/source-trust-card", label: "Source Trust Card", icon: BadgeCheck },
      { id: "voice/live-transcript", label: "Live Transcript", icon: Mic },
    ],
  },
  {
    label: "Quick actions",
    items: [{ id: "browse-all", label: "Browse the full registry", icon: LayoutGrid }],
  },
];

const VOICE_SCRIPT: { speaker: TranscriptSegment["speaker"]; text: string }[] = [
  { speaker: "user", text: "Can I use these patterns for a voice assistant?" },
  { speaker: "assistant", text: "Yes — Listening State, Live Transcript, and Voice Waveform cover the whole exchange." },
];

const PARTIAL_RESPONSE_CONTENT =
  "The ai-patterns skill gives any Claude Code session access to the full pattern library. Once installed, you can reference patterns by name in your prompts — for example, \"use the Streaming Text pattern for the assistant reply\" or \"wire up the Tool Approval pattern before each shell command\". The skill exposes each pattern's UX spec, component source, and demo so Claude can";

const DEMO_DIFF_FILES: DiffFile[] = [
  { id: "1", name: "src/app/demo/pattern-demo.tsx", additions: 482, deletions: 0 },
  { id: "2", name: "src/app/demo/page.tsx", additions: 24, deletions: 0 },
  { id: "3", name: "src/app/layout.tsx", additions: 3, deletions: 0 },
  { id: "4", name: "src/app/page.tsx", additions: 4, deletions: 1 },
  { id: "5", name: "CHANGELOG.md", additions: 6, deletions: 0 },
];

const BUILD_SCRIPT: Omit<LogLine, "id">[] = [
  { text: "$ npm run build", level: "default" },
  { text: "▲ Next.js 16.3.5 (Turbopack)", level: "info" },
  { text: "Creating an optimized production build ...", level: "default" },
  { text: "✓ Compiled successfully in 7.4s", level: "success" },
  { text: "Running TypeScript ...", level: "default" },
  { text: "✓ Finished TypeScript in 2.4s", level: "success" },
  { text: "Generating static pages (19/19)", level: "default" },
  { text: "✓ Build completed", level: "success" },
];

const INSTALL_SCRIPT: Omit<LogLine, "id">[] = [
  { text: "$ npm install lodash", level: "default" },
  { text: "added 1 package, and audited 214 packages in 1.4s", level: "default" },
  { text: "found 0 vulnerabilities", level: "default" },
  { text: "✓ Installed lodash@4.17.21", level: "success" },
];

const SKILL_INSTALL_SCRIPT: Omit<LogLine, "id">[] = [
  { text: "$ /plugin marketplace add carlosmarch/ai-patterns", level: "default" },
  { text: 'Added marketplace "ai-patterns"', level: "info" },
  { text: "$ /plugin install ai-patterns@ai-patterns", level: "default" },
  { text: "Installing ai-patterns ...", level: "default" },
  { text: '✓ Installed — try "Use ai-patterns to design this screen."', level: "success" },
];

const FLOWCHART_NODES: FlowchartNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    icon: GitBranch,
    title: "New pull request opened",
    description: "Trigger when a PR is opened against main",
  },
  {
    id: "condition-1",
    type: "condition",
    clauses: [
      {
        id: "clause-1",
        connector: "if",
        subject: { id: "pr", icon: GitBranch, label: "PR" },
        field: { id: "files", label: "files changed" },
        fieldOptions: [
          { id: "files", label: "files changed" },
          { id: "author", label: "author" },
        ],
        value: { id: "gt10", label: "> 10" },
        valueOptions: [
          { id: "gt10", label: "> 10" },
          { id: "gt50", label: "> 50" },
        ],
      },
    ],
  },
];

const TRACE_STEPS: TraceStep[] = [
  { label: "Weighing two ways to structure the flow" },
  { label: "Checking it against the existing patterns" },
  { label: "Picking the simpler option", meta: "fewer moving parts" },
  { label: "Drafting the final answer" },
];

const AGENTS_INITIAL: Agent[] = [
  {
    id: "research",
    name: "Research agent",
    status: "running",
    currentStep: "Searching recent changelogs",
    elapsedSeconds: 0,
    steps: [{ label: "Reading project docs" }],
  },
  { id: "code", name: "Code agent", status: "queued", elapsedSeconds: 0, steps: [] },
  { id: "review", name: "Review agent", status: "queued", elapsedSeconds: 0, steps: [] },
];

function tickAgents(prev: Agent[]): Agent[] {
  return prev.map((agent) => {
    if (agent.status === "done" || agent.status === "error") return agent;
    const elapsed = (agent.elapsedSeconds ?? 0) + 1;

    if (agent.id === "research") {
      if (elapsed >= 4) {
        return {
          ...agent,
          status: "done",
          currentStep: undefined,
          elapsedSeconds: elapsed,
          steps: [...agent.steps, { label: "Compiled findings", meta: "6 sources" }],
        };
      }
      return { ...agent, status: "running", elapsedSeconds: elapsed };
    }

    if (agent.id === "code") {
      if (elapsed < 2) return { ...agent, elapsedSeconds: elapsed };
      if (elapsed >= 6) {
        return {
          ...agent,
          status: "done",
          currentStep: undefined,
          elapsedSeconds: elapsed,
          steps: [...agent.steps, { label: "Opened a pull request" }],
        };
      }
      return {
        ...agent,
        status: "running",
        currentStep: "Editing component.tsx",
        elapsedSeconds: elapsed,
        steps: elapsed === 2 ? [{ label: "Reading component.tsx" }] : agent.steps,
      };
    }

    if (agent.id === "review") {
      if (elapsed < 5) return { ...agent, elapsedSeconds: elapsed };
      return {
        ...agent,
        status: "error",
        currentStep: undefined,
        elapsedSeconds: elapsed,
        steps: [...agent.steps, { label: "Lint check failed", meta: "2 errors" }],
      };
    }

    return agent;
  });
}

function estimateStreamMs(segments: StreamSegment[], speed = 18) {
  const chars = segments.reduce((n, s) => n + (s.type === "text" ? s.content.length : 6), 0);
  return chars * speed + 400;
}

// ---------------------------------------------------------------------------
// Transcript blocks
// ---------------------------------------------------------------------------

interface ChatBlock {
  id: string;
  kind: "chat";
  role: "user" | "assistant";
  content: string;
  regenerating?: boolean;
}
interface NoteBlock {
  id: string;
  kind: "note";
  content: string;
}
interface ThinkingBlock {
  id: string;
  kind: "thinking";
}
interface ToolCallBlock {
  id: string;
  kind: "tool-call";
  toolKind: ToolCallKind;
  verb: string;
  target: string;
  result: string;
  duration?: number;
  onDone?: () => void;
}
interface TraceBlock {
  id: string;
  kind: "trace";
  steps: TraceStep[];
  duration: number;
}
interface TerminalBlock {
  id: string;
  kind: "terminal";
  command: string;
  script: Omit<LogLine, "id">[];
  onDone?: () => void;
}
interface DiffBlock {
  id: string;
  kind: "diff";
  files: DiffFile[];
}
interface ApprovalBlock {
  id: string;
  kind: "approval";
  toolName: string;
  summary: string;
  detail?: string;
  onAllow: () => void;
  onDeny: () => void;
}
interface AgentsBlock {
  id: string;
  kind: "agents";
  onDone?: () => void;
}
interface StreamingBlock {
  id: string;
  kind: "streaming";
  segments: StreamSegment[];
  followUps?: string[];
}
interface SourcesBlock {
  id: string;
  kind: "sources";
  sources: Source[];
}
interface AttachmentBlock {
  id: string;
  kind: "attachment";
  onDone?: () => void;
}
interface FlowchartBlock {
  id: string;
  kind: "flowchart";
  nodes: FlowchartNode[];
}
interface SelectionBlock {
  id: string;
  kind: "selection";
}
interface FollowUpsBlock {
  id: string;
  kind: "followups";
  suggestions: string[];
}
interface CitationBlock {
  id: string;
  kind: "citation";
}
interface CitationComboBlock {
  id: string;
  kind: "citationCombo";
}
interface RateLimitBlock {
  id: string;
  kind: "ratelimit";
  resetAt: Date;
}
interface PartialBlock {
  id: string;
  kind: "partial";
  content: string;
  reason: PartialResponseReason;
}
interface CompareBlock {
  id: string;
  kind: "compare";
}
interface ConfidenceBlock {
  id: string;
  kind: "confidence";
}
interface TrustBlock {
  id: string;
  kind: "trust";
}
interface DiffTabsBlock {
  id: string;
  kind: "difftabs";
}
interface PaletteBlock {
  id: string;
  kind: "palette";
  onSelect: (item: CommandPaletteItem) => void;
}
interface VoiceBlock {
  id: string;
  kind: "voice";
  onDone?: () => void;
}
interface CtaBlock {
  id: string;
  kind: "cta";
  label: string;
  onClick: () => void;
}

type Block =
  | ChatBlock
  | NoteBlock
  | ThinkingBlock
  | ToolCallBlock
  | TraceBlock
  | TerminalBlock
  | DiffBlock
  | ApprovalBlock
  | AgentsBlock
  | StreamingBlock
  | SourcesBlock
  | AttachmentBlock
  | FlowchartBlock
  | SelectionBlock
  | FollowUpsBlock
  | CitationBlock
  | RateLimitBlock
  | PartialBlock
  | CitationComboBlock
  | CompareBlock
  | ConfidenceBlock
  | TrustBlock
  | DiffTabsBlock
  | PaletteBlock
  | VoiceBlock
  | CtaBlock;

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref;
}

// ---------------------------------------------------------------------------
// Live wrappers — self-contained animation, notify the transcript when done
// ---------------------------------------------------------------------------

function LiveToolCallChip({
  toolKind,
  verb,
  target,
  result,
  duration = 1500,
  onDone,
}: {
  toolKind: ToolCallKind;
  verb: string;
  target: string;
  result: string;
  duration?: number;
  onDone?: () => void;
}) {
  const [status, setStatus] = React.useState<ToolCallStatus>("running");
  const onDoneRef = useLatest(onDone);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setStatus("success");
      onDoneRef.current?.();
    }, duration);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <ToolCallChip kind={toolKind} verb={verb} target={target} status={status} result={result} className="w-full max-w-md" />
  );
}

function LiveTerminalStream({
  command,
  script,
  lineDelay = 380,
  onDone,
}: {
  command: string;
  script: Omit<LogLine, "id">[];
  lineDelay?: number;
  onDone?: () => void;
}) {
  const [lines, setLines] = React.useState<LogLine[]>([]);
  const onDoneRef = useLatest(onDone);
  const status: TerminalStatus = lines.length >= script.length ? "done" : "running";

  React.useEffect(() => {
    if (lines.length >= script.length) {
      onDoneRef.current?.();
      return;
    }
    const t = window.setTimeout(() => {
      setLines((prev) => [...prev, { ...script[prev.length], id: String(prev.length) }]);
    }, lineDelay);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, script, lineDelay]);

  return <TerminalStream command={command} lines={lines} status={status} className="w-full max-w-md" />;
}

function LiveMultiAgentTrace({ onDone }: { onDone?: () => void }) {
  const [agents, setAgents] = React.useState<Agent[]>(AGENTS_INITIAL);
  const onDoneRef = useLatest(onDone);
  const notifiedRef = React.useRef(false);

  React.useEffect(() => {
    const id = window.setInterval(() => setAgents(tickAgents), 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    const allResolved = agents.every((a) => a.status === "done" || a.status === "error");
    if (allResolved && !notifiedRef.current) {
      notifiedRef.current = true;
      onDoneRef.current?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  return <MultiAgentTrace agents={agents} className="w-full max-w-md" />;
}

function LiveAttachmentTray({ onDone }: { onDone?: () => void }) {
  const [attachment, setAttachment] = React.useState<Attachment>({
    id: "1",
    name: "brand-guidelines.pdf",
    size: 2_400_000,
    progress: 0,
    status: "uploading",
  });
  const onDoneRef = useLatest(onDone);

  React.useEffect(() => {
    if (attachment.status !== "uploading") return;
    const t = window.setTimeout(() => {
      setAttachment((prev) => {
        const progress = Math.min(100, prev.progress + 22);
        return progress >= 100 ? { ...prev, progress, status: "done" } : { ...prev, progress };
      });
    }, 260);
    return () => window.clearTimeout(t);
  }, [attachment.status, attachment.progress]);

  React.useEffect(() => {
    if (attachment.status === "done") onDoneRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.status]);

  return <AttachmentTray attachments={[attachment]} className="w-full max-w-sm" />;
}

function HoverTrustCitation({ index, source }: { index: number; source: TrustedSource }) {
  const [open, setOpen] = React.useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="mx-0.5 inline-flex size-4 -translate-y-1.5 items-center justify-center rounded-full bg-muted align-super text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {index}
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2">
          <SourceTrustCard sources={[source]} />
        </span>
      )}
    </span>
  );
}

function LiveVoiceExchange({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = React.useState<"listening" | "transcript" | "speaking">("listening");
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);
  const onDoneRef = useLatest(onDone);

  React.useEffect(() => {
    if (phase !== "listening") return;
    const t = window.setTimeout(() => setPhase("transcript"), 1400);
    return () => window.clearTimeout(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "transcript") return;
    let cancelled = false;

    async function run() {
      for (let turn = 0; turn < VOICE_SCRIPT.length; turn++) {
        const { speaker, text: line } = VOICE_SCRIPT[turn];
        const id = `voice-${turn}`;
        const words = line.split(" ");
        for (let i = 1; i <= words.length; i++) {
          if (cancelled) return;
          const partial = words.slice(0, i).join(" ");
          setSegments((prev) => [
            ...prev.filter((s) => s.id !== id),
            { id, speaker, text: partial, final: i === words.length },
          ]);
          await delay(55);
        }
      }
      if (!cancelled) setPhase("speaking");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "speaking") return;
    const t = window.setTimeout(() => onDoneRef.current?.(), 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "listening") {
    return (
      <div className="flex w-full max-w-sm items-center justify-center rounded-2xl border bg-card py-8">
        <ListeningState label="Listening…" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <LiveTranscript segments={segments} active={phase === "transcript"} />
      {phase === "speaking" && (
        <div className="flex items-center justify-center rounded-2xl border bg-card py-4">
          <VoiceWaveform state="speaking" className="w-full" />
        </div>
      )}
    </div>
  );
}

function LivePartialResponse({ content, reason }: { content: string; reason: PartialResponseReason }) {
  const [resuming, setResuming] = React.useState(false);
  const [key, setKey] = React.useState(0);

  function handleResume() {
    setResuming(true);
    window.setTimeout(() => {
      setResuming(false);
      setKey((k) => k + 1);
    }, 1200);
  }

  function handleRetry() {
    setResuming(false);
    setKey((k) => k + 1);
  }

  return (
    <PartialResponse
      key={key}
      content={content}
      reason={reason}
      onResume={handleResume}
      onRetry={handleRetry}
      resuming={resuming}
      className="w-full max-w-md"
    />
  );
}

// ---------------------------------------------------------------------------
// The playground
// ---------------------------------------------------------------------------

type StepFn = (runId: number, done: () => void) => void;

export function PatternDemo() {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [generating, setGenerating] = React.useState(false);
  const runIdRef = React.useRef(0);
  const timeoutsRef = React.useRef<number[]>([]);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const composerRef = React.useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = React.useState(0);

  const clearTimers = React.useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const schedule = React.useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  }, []);

  function addBlock(block: Block) {
    setBlocks((prev) => [...prev, block]);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function isCurrent(runId: number) {
    return runIdRef.current === runId;
  }

  function beginRun() {
    clearTimers();
    runIdRef.current += 1;
    setGenerating(true);
    return runIdRef.current;
  }

  function endRun(runId: number) {
    if (isCurrent(runId)) setGenerating(false);
  }

  function stopGeneration() {
    clearTimers();
    runIdRef.current += 1;
    setGenerating(false);
    setBlocks((prev) => [
      ...prev.filter((b) => b.kind !== "thinking"),
      { id: nextId("note"), kind: "note", content: "Stopped generating." },
    ]);
  }

  // Runs a list of steps back to back under one generation run, so Stop
  // (which bumps runIdRef) cancels whatever's left in the queue.
  function runSteps(steps: StepFn[], runId: number = beginRun()) {
    function go(i: number) {
      if (!isCurrent(runId)) return;
      if (i >= steps.length) {
        endRun(runId);
        return;
      }
      steps[i](runId, () => go(i + 1));
    }
    go(0);
    return runId;
  }

  function thinking(ms = 900): StepFn {
    return (runId, done) => {
      const id = nextId("think");
      addBlock({ id, kind: "thinking" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        removeBlock(id);
        done();
      }, ms);
    };
  }

  function pause(ms: number): StepFn {
    return (runId, done) => {
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, ms);
    };
  }

  function say(segments: StreamSegment[], followUps?: string[]): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("stream"), kind: "streaming", segments, followUps });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, estimateStreamMs(segments));
    };
  }

  function showToolCall(opts: {
    toolKind: ToolCallKind;
    verb: string;
    target: string;
    result: string;
    duration?: number;
  }): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("tool"),
        kind: "tool-call",
        ...opts,
        onDone: () => {
          if (!isCurrent(runId)) return;
          done();
        },
      });
    };
  }

  function showTrace(steps: TraceStep[], duration: number): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("trace"), kind: "trace", steps, duration });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showAgents(): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("agents"),
        kind: "agents",
        onDone: () => {
          if (!isCurrent(runId)) return;
          done();
        },
      });
    };
  }

  function showDiff(files: DiffFile[]): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("diff"), kind: "diff", files });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showTerminal(command: string, script: Omit<LogLine, "id">[]): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("terminal"),
        kind: "terminal",
        command,
        script,
        onDone: () => {
          if (!isCurrent(runId)) return;
          done();
        },
      });
    };
  }

  function showSources(sources: Source[]): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("sources"), kind: "sources", sources });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showAttachment(): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("attachment"),
        kind: "attachment",
        onDone: () => {
          if (!isCurrent(runId)) return;
          done();
        },
      });
    };
  }

  function showFlowchart(nodes: FlowchartNode[]): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("flowchart"), kind: "flowchart", nodes });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showSelectionActions(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("selection"), kind: "selection" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showFollowUps(suggestions: string[]): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("followups"), kind: "followups", suggestions });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showCitation(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("citation"), kind: "citation" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showCitationCombo(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("citation-combo"), kind: "citationCombo" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showRateLimit(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("ratelimit"), kind: "ratelimit", resetAt: new Date(Date.now() + 4 * 60 * 1000) });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showPartial(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("partial"), kind: "partial", content: PARTIAL_RESPONSE_CONTENT, reason: "interrupted" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showCompare(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("compare"), kind: "compare" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showConfidence(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("confidence"), kind: "confidence" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showTrust(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("trust"), kind: "trust" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showDiffTabs(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("difftabs"), kind: "difftabs" });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showPalette(): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("palette"),
        kind: "palette",
        onSelect: (item) => {
          if (item.id === "browse-all") {
            router.push("/patterns");
            return;
          }
          router.push(`/patterns/${item.id}`);
        },
      });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 400);
    };
  }

  function showVoice(): StepFn {
    return (runId, done) => {
      addBlock({
        id: nextId("voice"),
        kind: "voice",
        onDone: () => {
          if (!isCurrent(runId)) return;
          done();
        },
      });
    };
  }

  function showCta(label: string, onClick: () => void): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("cta"), kind: "cta", label, onClick });
      schedule(() => {
        if (!isCurrent(runId)) return;
        done();
      }, 300);
    };
  }

  function addUserMessage(content: string) {
    addBlock({ id: nextId("u"), kind: "chat", role: "user", content });
  }

  function handleEditUser(id: string, next: string) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      return prev.slice(0, idx + 1).map((b) => (b.id === id ? { ...b, content: next } : b));
    });
    appendAssistantReply();
  }

  function handleRegenerate(id: string) {
    let previous = "";
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id && b.kind === "chat") {
          previous = b.content;
          return { ...b, content: "Thinking…", regenerating: true };
        }
        return b;
      })
    );
    const runId = beginRun();
    schedule(() => {
      if (!isCurrent(runId)) return;
      setBlocks((prev) =>
        prev.map((b) => (b.id === id && b.kind === "chat" ? { ...b, content: pickReply(previous), regenerating: false } : b))
      );
      endRun(runId);
    }, 700);
  }

  function appendAssistantReply() {
    const runId = beginRun();
    const thinkId = nextId("think");
    addBlock({ id: thinkId, kind: "thinking" });
    schedule(() => {
      if (!isCurrent(runId)) return;
      removeBlock(thinkId);
      addBlock({ id: nextId("a"), kind: "chat", role: "assistant", content: pickReply() });
      endRun(runId);
    }, 1100);
  }

  function runReplyFlow(userText: string) {
    addUserMessage(userText);
    appendAssistantReply();
  }

  function runTour() {
    runSteps([
      say(INTRO_SEGMENTS),
      pause(300),
      say(TOOLCALL_INTRO_SEGMENTS),
      showToolCall({
        toolKind: "search",
        verb: "Searching",
        target: "open PRs and CI status",
        result: "Searched — 3 open PRs, CI green",
        duration: 1600,
      }),
      pause(400),
      say(TRACE_INTRO_SEGMENTS),
      showTrace(TRACE_STEPS, 6),
      pause(400),
      say(AGENTS_INTRO_SEGMENTS),
      showAgents(),
      pause(400),
      say(CODE_INTRO_SEGMENTS),
      showToolCall({
        toolKind: "code",
        verb: "Editing",
        target: "5 files for the demo page",
        result: "Edited 5 files",
        duration: 1300,
      }),
      showDiff(DEMO_DIFF_FILES),
      showTerminal("npm run build", BUILD_SCRIPT),
      pause(400),
      say(SOURCES_INTRO_SEGMENTS),
      showSources(DEMO_SOURCES),
      pause(400),
      say(CITATION_COMBO_INTRO_SEGMENTS),
      showCitationCombo(),
      pause(400),
      say(OUTRO_SEGMENTS),
      showFollowUps(["Show me more patterns", "Show me a diff", "Give me a slow answer"]),
    ]);
  }

  function runMoreTour(userText: string) {
    addUserMessage(userText);
    runSteps([
      say(MORE_INTRO_SEGMENTS),
      pause(300),
      say(UPLOADS_INTRO_SEGMENTS),
      showAttachment(),
      pause(400),
      say(FLOWCHART_INTRO_SEGMENTS),
      showFlowchart(FLOWCHART_NODES),
      pause(400),
      say(SELECTION_INTRO_SEGMENTS),
      showSelectionActions(),
      pause(400),
      say(DIFFTABS_INTRO_SEGMENTS),
      showDiffTabs(),
      pause(400),
      say(COMPARE_INTRO_SEGMENTS),
      showCompare(),
      pause(400),
      say(CONFIDENCE_INTRO_SEGMENTS),
      showConfidence(),
      pause(400),
      say(TRUST_INTRO_SEGMENTS),
      showTrust(),
      pause(400),
      say(PALETTE_INTRO_SEGMENTS),
      showPalette(),
      pause(400),
      say(VOICE_INTRO_SEGMENTS),
      showVoice(),
      pause(500),
      say(SKILL_INTRO_SEGMENTS),
      showTerminal("/plugin install ai-patterns@ai-patterns", SKILL_INSTALL_SCRIPT),
      say(SKILL_OUTRO_SEGMENTS),
      pause(300),
      say(MORE_OUTRO_SEGMENTS),
      showCta("Browse the full registry", () => router.push("/patterns")),
      showFollowUps(["Replay from the start", "Compare two answers", "Talk instead of type"]),
    ]);
  }

  function runSkillFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(700),
      say(SKILL_INTRO_SEGMENTS),
      showTerminal("/plugin install ai-patterns@ai-patterns", SKILL_INSTALL_SCRIPT),
      say(SKILL_OUTRO_SEGMENTS),
    ]);
  }

  function runTourFlow(userText: string) {
    addUserMessage(userText);
    runTour();
  }

  function runDiffFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(900),
      showToolCall({
        toolKind: "code",
        verb: "Editing",
        target: "5 files for the demo page",
        result: "Edited 5 files",
        duration: 1400,
      }),
      showDiff(DEMO_DIFF_FILES),
      say(text("Done — mostly additive changes, nothing destructive. Want me to open a PR?")),
    ]);
  }

  function runTerminalFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(700),
      showTerminal("npm run build", BUILD_SCRIPT),
      say(text("Build's green. Ready to deploy whenever you are.")),
    ]);
  }

  function runTraceFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(900),
      showTrace(TRACE_STEPS, 6),
      say(text("Landed on the simplest option that still covers the edge cases we talked about.")),
    ]);
  }

  function runAgentsFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(700),
      showAgents(),
      say(text("Research and coding wrapped up cleanly — review flagged a couple of lint errors to fix before merging.")),
    ]);
  }

  function runApproveFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(700),
      (runId, done) => {
        addBlock({
          id: nextId("approval"),
          kind: "approval",
          toolName: "Bash",
          summary: "Run a shell command",
          detail: "npm install lodash",
          onAllow: () => {
            runSteps([showTerminal("npm install lodash", INSTALL_SCRIPT), say(text("Installed. You're set to commit."))]);
          },
          onDeny: () => {
            addBlock({ id: nextId("a"), kind: "chat", role: "assistant", content: "Understood — I won't run that command." });
          },
        });
        done();
      },
    ]);
  }

  function runToolsFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      thinking(700),
      showToolCall({
        toolKind: "search",
        verb: "Searching",
        target: "how the composer menu filters items",
        result: "Searched — 2 matches",
        duration: 1300,
      }),
      showToolCall({
        toolKind: "file",
        verb: "Reading",
        target: "prompt-bar/component.tsx",
        result: "Read 297 lines",
        duration: 1200,
      }),
      say(text("Found it — the menu filters on a case-insensitive substring match against the label.")),
    ]);
  }

  function runSourcesFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(900), say(SOURCES_INTRO_SEGMENTS), showSources(DEMO_SOURCES)]);
  }

  function runStopFlow(userText: string) {
    addUserMessage(userText);
    runSteps([
      // long thinking phase on purpose — plenty of time to hit Stop below.
      thinking(5000),
      showToolCall({
        toolKind: "network",
        verb: "Fetching",
        target: "changelogs across a dozen dependencies",
        result: "Fetched 12 changelogs",
        duration: 2200,
      }),
      say(text("Here's the full rundown of what changed across all twelve packages…")),
    ]);
  }

  function runUploadsFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(UPLOADS_INTRO_SEGMENTS), showAttachment()]);
  }

  function runFlowchartFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(FLOWCHART_INTRO_SEGMENTS), showFlowchart(FLOWCHART_NODES)]);
  }

  function runSelectionFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(SELECTION_INTRO_SEGMENTS), showSelectionActions()]);
  }

  function runCitationFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(CITATION_INTRO_SEGMENTS), showCitation()]);
  }

  function runRateLimitFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(RATE_LIMIT_INTRO_SEGMENTS), showRateLimit()]);
  }

  function runPartialFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(PARTIAL_RESPONSE_INTRO_SEGMENTS), showPartial()]);
  }

  function runDiffTabsFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(DIFFTABS_INTRO_SEGMENTS), showDiffTabs()]);
  }

  function runCompareFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(900), say(COMPARE_INTRO_SEGMENTS), showCompare()]);
  }

  function runConfidenceFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(CONFIDENCE_INTRO_SEGMENTS), showConfidence()]);
  }

  function runTrustFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(700), say(TRUST_INTRO_SEGMENTS), showTrust()]);
  }

  function runPaletteFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(500), say(PALETTE_INTRO_SEGMENTS), showPalette()]);
  }

  function runVoiceFlow(userText: string) {
    addUserMessage(userText);
    runSteps([thinking(500), say(VOICE_INTRO_SEGMENTS), showVoice()]);
  }

  function dispatchSuggestion(id: string, label: string) {
    switch (id) {
      case "tour":
        return runTourFlow(label);
      case "diff":
        return runDiffFlow(label);
      case "terminal":
        return runTerminalFlow(label);
      case "trace":
        return runTraceFlow(label);
      case "agents":
        return runAgentsFlow(label);
      case "approve":
        return runApproveFlow(label);
      case "tools":
        return runToolsFlow(label);
      case "sources":
        return runSourcesFlow(label);
      case "citation":
        return runCitationFlow(label);
      case "stop":
        return runStopFlow(label);
      case "uploads":
        return runUploadsFlow(label);
      case "flowchart":
        return runFlowchartFlow(label);
      case "selection":
        return runSelectionFlow(label);
      case "ratelimit":
        return runRateLimitFlow(label);
      case "partial":
        return runPartialFlow(label);
      case "difftabs":
        return runDiffTabsFlow(label);
      case "compare":
        return runCompareFlow(label);
      case "confidence":
        return runConfidenceFlow(label);
      case "trust":
        return runTrustFlow(label);
      case "palette":
        return runPaletteFlow(label);
      case "voice":
        return runVoiceFlow(label);
      case "more":
        return runMoreTour(label);
      case "skill":
        return runSkillFlow(label);
      default:
        return runReplyFlow(label);
    }
  }

  function replay() {
    clearTimers();
    runIdRef.current += 1;
    setGenerating(false);
    setBlocks([]);
    schedule(() => runTour(), 150);
  }

  function handleSubmit(value: string) {
    if (generating) return;
    const raw = value.trim();
    if (!raw) return;

    if (raw.toLowerCase() === "replay from the start") {
      replay();
      return;
    }

    const command = COMMANDS.find((c) => c.label.toLowerCase() === raw.toLowerCase());
    const suggestion =
      SUGGESTIONS.find((s) => s.label.toLowerCase() === raw.toLowerCase()) ??
      (command ? SUGGESTIONS.find((s) => s.id === command.id) : undefined);
    const trimmed = suggestion?.label ?? raw;

    trackDemoPromptSubmitted({ is_suggestion: !!suggestion, suggestion_id: suggestion?.id });

    if (!suggestion) {
      runReplyFlow(trimmed);
      return;
    }

    dispatchSuggestion(suggestion.id, trimmed);
  }

  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    const flowId = searchParams.get("flow");
    const question = searchParams.get("q");
    const suggestion = flowId ? SUGGESTIONS.find((s) => s.id === flowId) : undefined;

    if (suggestion || question) {
      schedule(() => (suggestion ? dispatchSuggestion(suggestion.id, suggestion.label) : runReplyFlow(question!)), 0);
      router.replace("/demo", { scroll: false });
    } else {
      schedule(() => runTour(), 0);
    }
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setComposerHeight(entries[0].contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [blocks.length]);

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={replay}
          className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Replay
        </button>
      </div>

      <div className="space-y-5 pb-8">
        {blocks.map((block) => (
          <BlockView
            key={block.id}
            block={block}
            onEditUser={handleEditUser}
            onRegenerate={handleRegenerate}
            onSelectFollowUp={handleSubmit}
          />
        ))}
        <div ref={bottomRef} style={{ scrollMarginBottom: composerHeight + 24 }} />
      </div>

      <div
        ref={composerRef}
        className="sticky bottom-0 -mx-6 space-y-2 bg-gradient-to-t from-background from-65% to-transparent px-6 pb-6 pt-10"
      >
        <PromptBarPro
          suggestions={SUGGESTIONS}
          visibleCount={4}
          sources={SOURCES}
          commands={COMMANDS}
          placeholder="Ask about a pattern, or try one below…"
          onSubmit={handleSubmit}
          generating={generating}
          onStop={stopGeneration}
        />
      </div>
    </div>
  );
}

function BlockView({
  block,
  onEditUser,
  onRegenerate,
  onSelectFollowUp,
}: {
  block: Block;
  onEditUser: (id: string, next: string) => void;
  onRegenerate: (id: string) => void;
  onSelectFollowUp: (suggestion: string) => void;
}) {
  switch (block.kind) {
    case "chat":
      return (
        <ChatBubble
          role={block.role}
          content={block.content}
          onEditSubmit={block.role === "user" ? (next) => onEditUser(block.id, next) : undefined}
          onRegenerate={block.role === "assistant" ? () => onRegenerate(block.id) : undefined}
        />
      );
    case "note":
      return <p className="text-center text-xs text-muted-foreground">{block.content}</p>;
    case "thinking":
      return <ThinkingLoader className="w-full max-w-sm" />;
    case "tool-call":
      return (
        <LiveToolCallChip
          toolKind={block.toolKind}
          verb={block.verb}
          target={block.target}
          result={block.result}
          duration={block.duration}
          onDone={block.onDone}
        />
      );
    case "trace":
      return <ExpandableTrace steps={block.steps} durationSeconds={block.duration} defaultOpen className="w-full max-w-md" />;
    case "terminal":
      return <LiveTerminalStream command={block.command} script={block.script} onDone={block.onDone} />;
    case "diff":
      return <DiffSummaryCard files={block.files} className="w-full max-w-md" />;
    case "approval":
      return (
        <ToolApproval
          icon={TerminalSquare}
          toolName={block.toolName}
          summary={block.summary}
          detail={block.detail}
          className="w-full max-w-md"
          onDecision={(decision) => (decision === "deny" ? block.onDeny() : block.onAllow())}
        />
      );
    case "agents":
      return <LiveMultiAgentTrace onDone={block.onDone} />;
    case "streaming":
      return <StreamingText segments={block.segments} followUps={block.followUps} className="w-full max-w-md" />;
    case "sources":
      return <SourcesStack sources={block.sources} />;
    case "attachment":
      return <LiveAttachmentTray onDone={block.onDone} />;
    case "flowchart":
      return <Flowchart nodes={block.nodes} className="w-full max-w-md" />;
    case "selection":
      return <SelectionActions text={SELECTION_PARAGRAPH} onRewrite={mockSelectionRewrite} onExplain={mockSelectionExplain} className="w-full max-w-md" />;
    case "followups":
      return <FollowUpList suggestions={block.suggestions} onSelect={onSelectFollowUp} className="w-full max-w-md" />;
    case "citation":
      return (
        <p className="w-full max-w-md text-sm leading-relaxed text-foreground/90">
          Tailwind v4 moved its configuration into CSS itself, dropping the old{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">tailwind.config.js</code> file entirely
          <InlineCitation index={1} source={CITATION_SOURCES[0]} />. Motion, formerly Framer Motion, now ships a
          smaller core bundle aimed specifically at this kind of micro-interaction
          <InlineCitation index={2} source={CITATION_SOURCES[1]} />.
        </p>
      );
    case "citationCombo":
      return (
        <div className="w-full max-w-md text-sm leading-relaxed text-foreground/90">
          Tailwind v4 is a ground-up rewrite of the framework
          <InlineCitation index={1} source={CITATION_SOURCES[0]} />, and every animation on this page runs on
          Motion
          <HoverTrustCitation index={2} source={TRUST_SOURCES[1]} />.
        </div>
      );
    case "ratelimit":
      return (
        <RateLimit
          label="Approaching weekly usage limit"
          resetAt={block.resetAt}
          upgradeLabel="Get more usage"
          onUpgrade={() => {}}
          onDismiss={() => {}}
          className="w-full max-w-md"
        />
      );
    case "partial":
      return <LivePartialResponse content={block.content} reason={block.reason} />;
    case "compare":
      return (
        <ResponseCompare
          prompt="Draft a one-line description of the Confidence Indicator pattern."
          responses={COMPARE_RESPONSES}
          className="w-full"
        />
      );
    case "confidence":
      return (
        <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border bg-card p-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            The rate limit card reads{" "}
            <span className="font-medium">
              &ldquo;Resets in 4 minutes&rdquo;
              <ConfidenceIndicator
                level="high"
                variant="dot"
                reason="Computed directly from the resetAt prop, not estimated."
                className="ml-1"
              />
            </span>
            {" "}— but whether people actually read it before retrying is{" "}
            <ConfidenceIndicator level="low" variant="dot" reason="No usage data on this yet — it's a guess." className="ml-0.5" />
            .
          </p>
          <ConfidenceIndicator
            level="medium"
            reason="Based on the two similar patterns we shipped last quarter."
            percentage={61}
          />
        </div>
      );
    case "trust":
      return <SourceTrustCard sources={TRUST_SOURCES} />;
    case "difftabs":
      return <DiffTabs files={DIFF_TABS_FILES} className="w-full max-w-md" />;
    case "palette":
      return (
        <CommandPaletteWindow
          groups={PALETTE_GROUPS}
          placeholder="Search patterns…"
          emptyLabel="No matches"
          onSelect={block.onSelect}
          className="w-full max-w-md"
        />
      );
    case "voice":
      return <LiveVoiceExchange onDone={block.onDone} />;
    case "cta":
      return (
        <div className="flex w-full max-w-md justify-start">
          <ShinyButton onClick={block.onClick}>{block.label}</ShinyButton>
        </div>
      );
  }
}
