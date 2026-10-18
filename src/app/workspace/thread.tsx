"use client";

import * as React from "react";
import { TerminalSquare } from "lucide-react";

import { AnalysisList, type AnalysisItem } from "@/registry/loaders/analysis-list/component";
import { AttachmentTray, type Attachment } from "@/registry/uploads/attachment-chip/component";
import { ChatBubble } from "@/registry/messages/chat-bubble/component";
import { ConfidenceIndicator } from "@/registry/indicators/confidence-indicator/component";
import { ConsoleErrorCard } from "@/registry/errors/console-error-card/component";
import { DiffSummaryCard, type DiffFile } from "@/registry/code/diff-summary/component";
import { DiffTabs } from "@/registry/code/diff-tabs/component";
import { ExpandableTrace, type TraceStep } from "@/registry/traces/expandable-trace/component";
import { FollowUpList } from "@/registry/text/follow-up-list/component";
import { GenerationError } from "@/registry/errors/generation-error/component";
import { HumanInTheLoop, type HitlQuestion } from "@/registry/agents/human-in-the-loop/component";
import { ImagePeek } from "@/registry/media/image-peek/component";
import { InlineCitation } from "@/registry/text/inline-citation/component";
import { MultiAgentTrace, type Agent } from "@/registry/traces/multi-agent-trace/component";
import { PartialResponse } from "@/registry/errors/partial-response/component";
import { RateLimit } from "@/registry/errors/rate-limit/component";
import { RefinementControls } from "@/registry/text/refinement-controls/component";
import { ResponseCompare } from "@/registry/compare/response-compare/component";
import { SelectionActions } from "@/registry/text/selection-actions/component";
import { SourceTrustCard } from "@/registry/text/source-trust-card/component";
import { SourcesStack, type Source } from "@/registry/text/sources-stack/component";
import { StreamingText, type StreamSegment } from "@/registry/text/streaming-text/component";
import { TerminalStream, type LogLine } from "@/registry/code/terminal-stream/component";
import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { ToolApproval, type ToolApprovalDecision as ApprovalDecision } from "@/registry/permissions/tool-approval/component";
import { ToolCallChip, type ToolCallKind, type ToolCallStatus } from "@/registry/loaders/tool-call-chip/component";

import {
  AUDIT_ATTACHMENT,
  AUDIT_DIFF_FILES,
  AUDIT_DIFF_TABS,
  AUDIT_ITEMS,
  AUDIT_MICROCOPY,
  AUDIT_SELECTION,
  AUDIT_TRUST_SOURCES,
  CONTRAST_ERROR,
  CONTRAST_PATCH,
  CONTRAST_SCREENSHOTS,
  CONTRAST_TERMINAL,
  COPY_RESPONSES,
  SPIKE_AGENTS,
  SPIKE_CITATIONS,
  SPIKE_SOURCES,
  TRANSLATE_PARTIAL,
  WEEKLY_CITATIONS,
  WEEKLY_SOURCES,
  WEEKLY_TRACE,
} from "./data";

// ---------------------------------------------------------------------------
// Thread model
// ---------------------------------------------------------------------------

export type BlockBody =
  (
  | { kind: "user"; text: string; attachment?: Attachment }
  | { kind: "assistant"; text: string; versions?: string[] }
  | { kind: "stream"; segments: StreamSegment[]; done?: boolean; onDone?: () => void }
  | { kind: "note"; text: string }
  | { kind: "thinking" }
  | {
      kind: "tool";
      toolKind: ToolCallKind;
      verb: string;
      target: string;
      result: string;
      status: ToolCallStatus;
      duration?: number;
      onDone?: () => void;
    }
  | { kind: "trace"; steps: TraceStep[]; duration: number; defaultOpen?: boolean }
  | { kind: "agents"; agents: Agent[]; live?: { tick: (agents: Agent[]) => Agent[]; onDone: (final: Agent[]) => void } }
  | { kind: "analysis"; items: AnalysisItem[]; live?: { onDone: (final: AnalysisItem[]) => void } }
  | { kind: "terminal"; command: string; lines: LogLine[]; live?: { script: Omit<LogLine, "id">[]; onDone: (final: LogLine[]) => void } }
  | { kind: "sources"; sources: Source[] }
  | { kind: "followups"; items: string[] }
  | { kind: "diff"; files: DiffFile[]; timestamp?: string }
  | { kind: "approval"; action: string; toolName: string; summary: string; detail: string; decided?: ApprovalDecision }
  | { kind: "hitl"; questions: HitlQuestion[]; onDone: () => void }
  | { kind: "gen-error"; action: string; retrying?: boolean }
  | { kind: "rich"; content: "weekly" | "spike" }
  | { kind: "difftabs" }
  | { kind: "trust" }
  | { kind: "selection" }
  | { kind: "refine" }
  | { kind: "compare" }
  | { kind: "partial" }
  | { kind: "rate-limit"; resetAt: number }
  | { kind: "screenshots" }
  | { kind: "console-error" }
  );

export type Block = BlockBody & { id: string };

export type ThreadGroup = "Today" | "Yesterday" | "Earlier";

export interface Thread {
  id: string;
  title: string;
  group: ThreadGroup;
  blocks: Block[];
  badge?: string;
}

let idCounter = 0;
export function nextId(prefix = "b") {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function segmentsText(segments: StreamSegment[]) {
  return segments.map((s) => (s.type === "text" ? s.content : "")).join("");
}

// ---------------------------------------------------------------------------
// Seeded history
// ---------------------------------------------------------------------------

function b(block: BlockBody): Block {
  return { id: nextId("seed"), ...block };
}

export function seedThreads(): Thread[] {
  return [
    {
      id: "weekly",
      title: "Weekly pattern usage report",
      group: "Today",
      blocks: [
        b({ kind: "user", text: "Summarize pattern usage this week" }),
        b({ kind: "tool", toolKind: "search", verb: "Searching", target: "copy events", result: "Read 18,240 events from Vercel Analytics", status: "success" }),
        b({ kind: "tool", toolKind: "network", verb: "Fetching", target: "skill usage logs", result: "Fetched 1,312 skill sessions", status: "success" }),
        b({ kind: "trace", steps: WEEKLY_TRACE, duration: 14 }),
        b({ kind: "rich", content: "weekly" }),
        b({ kind: "sources", sources: WEEKLY_SOURCES }),
        b({ kind: "followups", items: ["Which patterns have no copies at all?", "Schedule this every Monday", "Compare with last month"] }),
      ],
    },
    {
      id: "audit",
      title: "Chat screen UX audit",
      group: "Today",
      blocks: [
        b({ kind: "user", text: "Audit our chat screen against the catalogue", attachment: AUDIT_ATTACHMENT }),
        b({ kind: "tool", toolKind: "file", verb: "Reading", target: "chat-screen-v2.png and src/components", result: "Matched 4 components to registry patterns", status: "success" }),
        b({ kind: "analysis", items: AUDIT_ITEMS }),
        b({ kind: "selection" }),
        b({ kind: "trust" }),
        b({ kind: "assistant", text: "I fixed the three components that don't match their spec. Flip through the files:" }),
        b({ kind: "difftabs" }),
        b({ kind: "diff", files: AUDIT_DIFF_FILES, timestamp: "2h ago" }),
        b({ kind: "assistant", text: "Your generation error copy is also long and vague. Here's a starting point — tune it with the controls below." }),
        b({ kind: "refine" }),
      ],
    },
    {
      id: "spike",
      title: "Stop clicks on long answers",
      group: "Today",
      blocks: [
        b({ kind: "user", text: "Why are users stopping long answers?" }),
        b({ kind: "agents", agents: SPIKE_AGENTS }),
        b({ kind: "rich", content: "spike" }),
        b({ kind: "sources", sources: SPIKE_SOURCES }),
        b({ kind: "followups", items: ["Swap the spinner for a Thinking Loader", "Show me the Expandable Trace spec", "Which other screens have this?"] }),
      ],
    },
    {
      id: "contrast",
      title: "Tool Approval dark-mode contrast",
      group: "Today",
      badge: "Needs approval",
      blocks: [
        b({ kind: "user", text: "Tool Approval fails contrast in dark mode — can you fix it?" }),
        b({ kind: "tool", toolKind: "network", verb: "Capturing", target: "light and dark screenshots", result: "Captured 3 screenshots", status: "success" }),
        b({ kind: "screenshots" }),
        b({ kind: "terminal", command: "npx axe --tags wcag2aa", lines: CONTRAST_TERMINAL }),
        b({ kind: "console-error" }),
        b({
          kind: "assistant",
          text: "Two problems, one cause: the component reads the theme with matchMedia during render, so the server picks light colors and dark mode gets 2.9:1 on Deny. I moved the colors to dark: variants — no JS — which fixes the hydration error too.",
        }),
        b({ kind: "diff", files: CONTRAST_PATCH, timestamp: "12 min ago" }),
        b({
          kind: "approval",
          action: "push-contrast",
          toolName: "Bash",
          summary: "Rebuild and push the fix",
          detail: "npm run build && git push origin fix/tool-approval-contrast",
        }),
      ],
    },
    {
      id: "copy",
      title: "Empty-state copy for Prompt Bar",
      group: "Today",
      blocks: [
        b({ kind: "user", text: "Give me two options for the Prompt Bar placeholder" }),
        b({ kind: "compare" }),
        b({ kind: "user", text: "Go with Inviting, but make it shorter" }),
        b({
          kind: "assistant",
          text: "Ask about a pattern, or describe your screen.",
          versions: [
            "Ask about a pattern, or describe the screen you're designing.",
            "Ask about a pattern, or describe your screen.",
          ],
        }),
      ],
    },
    {
      id: "translate",
      title: "Translate UX specs to Spanish",
      group: "Today",
      blocks: [
        b({ kind: "user", text: "Translate the loader and permission specs to Spanish" }),
        b({ kind: "partial" }),
        b({ kind: "rate-limit", resetAt: Date.now() + 4 * 60 * 1000 }),
      ],
    },
    {
      id: "handoff",
      title: "Draft spec: Agent Handoff",
      group: "Yesterday",
      badge: "Failed",
      blocks: [
        b({ kind: "user", text: "Draft a UX spec for an Agent Handoff pattern — an agent passing a thread to a human" }),
        b({ kind: "tool", toolKind: "search", verb: "Searching", target: "the registry for related patterns", result: "Found Human in the Loop and Background Tasks", status: "success" }),
        b({ kind: "gen-error", action: "handoff-spec" }),
      ],
    },
    {
      id: "checklist",
      title: "Setup checklist microcopy",
      group: "Yesterday",
      blocks: [
        b({ kind: "user", text: "Is “Run your first agent task” clear enough for a setup step?" }),
        b({
          kind: "assistant",
          text: "Mostly. “Agent task” is jargon for a first-run user — try “Ask your agent for something”. It names the action and the outcome, and it matches the verb-first style of the other steps.",
        }),
      ],
    },
    {
      id: "flowchart",
      title: "PR review automation",
      group: "Earlier",
      blocks: [
        b({ kind: "user", text: "Review every PR that touches src/registry" }),
        b({
          kind: "assistant",
          text: "Done — I set up a workflow that runs my “Review a pattern” procedure when a PR changes more than 10 files under src/registry/**. You can edit it in Workflows.",
        }),
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Live wrappers — animate, then hand the final state back to the thread
// ---------------------------------------------------------------------------

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref;
}

function LiveToolCall({ block }: { block: Extract<Block, { kind: "tool" }> }) {
  const onDone = useLatest(block.onDone);
  React.useEffect(() => {
    if (block.status !== "running") return;
    const t = window.setTimeout(() => onDone.current?.(), block.duration ?? 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.status]);

  return (
    <ToolCallChip kind={block.toolKind} verb={block.verb} target={block.target} status={block.status} result={block.result} className="w-full max-w-md" />
  );
}

function LiveAgents({ block }: { block: Extract<Block, { kind: "agents" }> }) {
  const [agents, setAgents] = React.useState(block.agents);
  const live = useLatest(block.live);
  const notified = React.useRef(false);

  React.useEffect(() => {
    if (!block.live) return;
    const id = window.setInterval(() => setAgents((prev) => live.current?.tick(prev) ?? prev), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (notified.current || !live.current) return;
    if (agents.every((a) => a.status === "done" || a.status === "error")) {
      notified.current = true;
      live.current.onDone(agents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  return <MultiAgentTrace agents={agents} className="w-full max-w-md" />;
}

function LiveAnalysis({ block }: { block: Extract<Block, { kind: "analysis" }> }) {
  const [items, setItems] = React.useState(block.items);
  const live = useLatest(block.live);
  const analyzing = items.some((i) => i.status !== "done");

  React.useEffect(() => {
    if (!live.current) return;
    const loading = items.findIndex((i) => i.status === "loading");
    if (loading === -1) {
      live.current.onDone(items);
      return;
    }
    const t = window.setTimeout(() => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === loading ? { ...item, status: "done" as const } : i === loading + 1 ? { ...item, status: "loading" as const } : item
        )
      );
    }, 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <AnalysisList items={items} analyzing={analyzing} className="w-full max-w-md" />;
}

function LiveTerminal({ block }: { block: Extract<Block, { kind: "terminal" }> }) {
  const [lines, setLines] = React.useState(block.lines);
  const live = useLatest(block.live);
  const total = block.live?.script.length ?? lines.length;
  const hasError = lines.some((l) => l.level === "error");

  React.useEffect(() => {
    const script = live.current?.script;
    if (!script) return;
    if (lines.length >= script.length) {
      live.current?.onDone(lines);
      return;
    }
    const t = window.setTimeout(() => setLines((prev) => [...prev, { ...script[prev.length], id: String(prev.length) }]), 380);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  return (
    <TerminalStream
      command={block.command}
      lines={lines}
      status={lines.length < total ? "running" : hasError ? "error" : "done"}
      className="w-full max-w-md"
    />
  );
}

function VersionedBubble({ versions, text }: { versions?: string[]; text: string }) {
  const [index, setIndex] = React.useState(versions ? versions.length - 1 : 0);
  return (
    <ChatBubble
      role="assistant"
      content={versions?.[index] ?? text}
      versionIndex={versions ? index : undefined}
      versionCount={versions?.length}
      onVersionChange={setIndex}
    />
  );
}

function PartialTranslation() {
  const [resuming, setResuming] = React.useState(false);
  const [key, setKey] = React.useState(0);
  return (
    <PartialResponse
      key={key}
      content={TRANSLATE_PARTIAL}
      reason="interrupted"
      resuming={resuming}
      onResume={() => {
        setResuming(true);
        window.setTimeout(() => {
          setResuming(false);
          setKey((k) => k + 1);
        }, 1200);
      }}
      onRetry={() => setKey((k) => k + 1)}
      className="w-full max-w-md"
    />
  );
}

function ContrastConsoleError() {
  const [open, setOpen] = React.useState(true);
  if (!open) return <p className="text-xs text-muted-foreground">Console error dismissed.</p>;
  return (
    <ConsoleErrorCard
      type="error"
      message={CONTRAST_ERROR.message}
      frame={CONTRAST_ERROR.frame}
      stack={CONTRAST_ERROR.stack}
      current={1}
      total={1}
      onClose={() => setOpen(false)}
      onCopy={() => navigator.clipboard?.writeText(CONTRAST_ERROR.message).catch(() => {})}
      className="w-full max-w-xl"
    />
  );
}

function StaticSegments({ segments }: { segments: StreamSegment[] }) {
  return (
    <p className="w-full max-w-md text-sm leading-relaxed text-foreground/90">
      {segments.map((s, i) =>
        s.type === "text" ? (
          <React.Fragment key={i}>{s.content}</React.Fragment>
        ) : (
          <span key={i} className="mx-0.5 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 align-middle text-[10px] font-medium text-muted-foreground">
            {s.label}
          </span>
        )
      )}
    </p>
  );
}

async function mockRewrite(selection: string, instruction: string) {
  await new Promise((r) => setTimeout(r, 700));
  const lower = instruction.toLowerCase();
  if (lower.includes("short")) return selection.replace(/, but three of its loading states never resolve:.*$/, " — but three loading states never resolve.");
  if (lower.includes("formal")) return selection.replace("covers the happy path well", "handles the primary flow adequately");
  return selection.replace("never resolve", "get stuck");
}

async function mockExplain() {
  await new Promise((r) => setTimeout(r, 400));
  return "“Never resolve” means the component has no end state: once the work finishes, nothing on screen tells the user it's done — so they wait, or hit Stop.";
}

async function mockRefine(text: string, instruction: string) {
  await new Promise((r) => setTimeout(r, 800));
  const lower = instruction.toLowerCase();
  if (lower.includes("short")) return "Couldn't finish that answer. Try again.";
  if (lower.includes("formal")) return "We were unable to complete this response. Please try again, or contact support if the issue continues.";
  if (lower.includes("bullet")) return "• Couldn't finish this answer\n• Your message is saved\n• Try again in a moment";
  if (lower.includes("friend") || lower.includes("casual")) return "Hmm, that one didn't come through. Give it another try?";
  return "I couldn't finish that answer. Your message is saved — try again in a moment.";
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

export interface BlockHandlers {
  onFollowUp: (text: string) => void;
  onApproval: (blockId: string, action: string, decision: ApprovalDecision) => void;
  onRetry: (blockId: string, action: string) => void;
  onUpgrade: () => void;
}

export function BlockView({ block, handlers }: { block: Block; handlers: BlockHandlers }) {
  switch (block.kind) {
    case "user":
      return (
        <div className="flex flex-col items-end gap-2">
          {block.attachment && <AttachmentTray attachments={[block.attachment]} className="w-full max-w-xs" />}
          <ChatBubble role="user" content={block.text} />
        </div>
      );
    case "assistant":
      return <VersionedBubble versions={block.versions} text={block.text} />;
    case "stream":
      return block.done ? (
        <StaticSegments segments={block.segments} />
      ) : (
        <StreamingText segments={block.segments} speed={14} onComplete={block.onDone} className="w-full max-w-md" />
      );
    case "note":
      return <p className="text-center text-xs text-muted-foreground">{block.text}</p>;
    case "thinking":
      return <ThinkingLoader words={["Thinking", "Reading the registry", "Checking specs", "Drafting"]} className="w-full max-w-sm" />;
    case "tool":
      return <LiveToolCall block={block} />;
    case "trace":
      return <ExpandableTrace steps={block.steps} durationSeconds={block.duration} defaultOpen={block.defaultOpen} className="w-full max-w-md" />;
    case "agents":
      return <LiveAgents key={block.live ? "live" : "static"} block={block} />;
    case "analysis":
      return <LiveAnalysis key={block.live ? "live" : "static"} block={block} />;
    case "terminal":
      return <LiveTerminal key={block.live ? "live" : "static"} block={block} />;
    case "sources":
      return <SourcesStack sources={block.sources} />;
    case "followups":
      return <FollowUpList suggestions={block.items} onSelect={handlers.onFollowUp} className="w-full max-w-md" />;
    case "diff":
      return <DiffSummaryCard files={block.files} timestamp={block.timestamp} className="w-full max-w-md" />;
    case "approval":
      if (block.decided) {
        return (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TerminalSquare className="size-3.5" />
            {block.decided === "deny" ? "You denied" : "You allowed"} <code className="rounded bg-muted px-1 py-0.5">{block.detail}</code>
          </p>
        );
      }
      return (
        <ToolApproval
          icon={TerminalSquare}
          toolName={block.toolName}
          summary={block.summary}
          detail={block.detail}
          onDecision={(decision) => handlers.onApproval(block.id, block.action, decision)}
          className="w-full max-w-md"
        />
      );
    case "hitl":
      return <HumanInTheLoop questions={block.questions} onDone={block.onDone} className="w-full max-w-sm" />;
    case "gen-error":
      return (
        <GenerationError
          reason="timeout"
          errorCode="ERR_MODEL_TIMEOUT"
          retrying={block.retrying}
          onRetry={() => handlers.onRetry(block.id, block.action)}
          className="w-full max-w-md"
        />
      );
    case "rich":
      return block.content === "weekly" ? <WeeklyFindings /> : <SpikeFindings />;
    case "difftabs":
      return <DiffTabs files={AUDIT_DIFF_TABS} className="w-full max-w-md" />;
    case "trust":
      return <SourceTrustCard sources={AUDIT_TRUST_SOURCES} />;
    case "selection":
      return <SelectionActions text={AUDIT_SELECTION} onRewrite={mockRewrite} onExplain={mockExplain} className="w-full max-w-md" />;
    case "refine":
      return <RefinementControls text={AUDIT_MICROCOPY} onRefine={mockRefine} className="w-full max-w-md" />;
    case "compare":
      return <ResponseCompare prompt="Two options for the Prompt Bar placeholder" responses={COPY_RESPONSES} className="w-full" />;
    case "partial":
      return <PartialTranslation />;
    case "rate-limit":
      return (
        <RateLimit
          label="You've hit this hour's limit for long generations"
          resetAt={new Date(block.resetAt)}
          upgradeLabel="Upgrade to Team"
          onUpgrade={handlers.onUpgrade}
          className="w-full max-w-md"
        />
      );
    case "screenshots":
      return (
        <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
          <span className="truncate text-sm text-muted-foreground">Tool Approval · light, dark, contrast check</span>
          <ImagePeek images={CONTRAST_SCREENSHOTS} />
        </div>
      );
    case "console-error":
      return <ContrastConsoleError />;
  }
}

function WeeklyFindings() {
  return (
    <div className="w-full max-w-md space-y-3 text-sm leading-relaxed text-foreground/90">
      <p>
        Streaming Text was the most-copied pattern again with 1,204 copies
        <InlineCitation index={1} source={WEEKLY_CITATIONS[0]} />, and Prompt Bar Pro climbed 38% week over week. The
        skill shortlisted Thinking Loader in 64% of “design a chat screen” requests
        <InlineCitation index={2} source={WEEKLY_CITATIONS[1]} />
        <ConfidenceIndicator level="high" variant="dot" reason="Counted directly from skill logs." className="ml-1" />.
      </p>
      <p>
        The three new agent patterns — Procedure Builder, Instruction Tool Insert, and Refinement Controls — are early but
        trending up. I&apos;d expect at least one to break into the top 10 next week.
      </p>
      <ConfidenceIndicator level="medium" percentage={58} reason="Only five days of data since they shipped." />
    </div>
  );
}

function SpikeFindings() {
  return (
    <div className="w-full max-w-md space-y-3 text-sm leading-relaxed text-foreground/90">
      <p>
        It&apos;s the blank wait, not the answers. Stop clicks on answers over 20 seconds jumped 38%, and 71% happen before
        the first token arrives
        <InlineCitation index={1} source={SPIKE_CITATIONS[0]} />. The chat screen shows a bare spinner during that time, so a
        slow start reads as a hang.
      </p>
      <p>
        Swapping it for a Thinking Loader with an elapsed-time counter
        <InlineCitation index={2} source={SPIKE_CITATIONS[1]} /> — and an Expandable Trace once the wait passes 10s — should
        recover most of these sessions
        <ConfidenceIndicator level="medium" variant="dot" reason="Based on the same change in two similar products, not tested here yet." className="ml-1" />.
      </p>
    </div>
  );
}
