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
import { AccessRequest, type AccessRequestDecision } from "@/registry/permissions/access-request/component";
import { AgentRunCard, type RunStep } from "@/registry/agents/agent-run-card/component";
import { AiDisclosureBadge } from "@/registry/indicators/ai-disclosure-badge/component";
import { ArtifactCard, type Artifact } from "@/registry/messages/artifact-panel/component";
import { CheckpointTimeline, type RestoredState } from "@/registry/agents/checkpoint-restore/component";
import { ClarifyingQuestions, type ClarifyingAnswers, type ClarifyingQuestion } from "@/registry/messages/clarifying-questions/component";
import { CodePreviewBlock } from "@/registry/code/code-preview/component";
import { ConversationBranches, type Branch } from "@/registry/messages/conversation-branches/component";
import { CostEstimate } from "@/registry/indicators/cost-estimate/component";
import { MemoryUpdatedNotice } from "@/registry/permissions/memory-panel/component";
import { PlanReview, type PlanStep } from "@/registry/agents/plan-review/component";
import { ResponseActions, type RegenerateOption, type ResponseRating } from "@/registry/messages/response-actions/component";
import { StreamOfThought, type Thought } from "@/registry/traces/stream-of-thought/component";
import { TaskList, type Task } from "@/registry/agents/task-list/component";
import { getCategories, registry } from "@/registry";

import { entryPath } from "./catalogue";
import {
  AGENT_NAME,
  AUDIT_ATTACHMENT,
  AUDIT_COST,
  CONTRAST_RUN,
  LOADER_CHECKPOINTS,
  NAME_BRANCHES,
  ORIGAMI_SVG,
  SPEC_PLAN_ALT,
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
  /** A clickable inventory of registry patterns, grouped by category — every pattern unless `paths` narrows it. */
  | { kind: "catalogue"; paths?: string[] }
  | { kind: "difftabs" }
  | { kind: "trust" }
  | { kind: "selection" }
  | { kind: "refine" }
  | { kind: "compare" }
  | { kind: "partial" }
  | { kind: "rate-limit"; resetAt: number }
  | { kind: "screenshots" }
  | { kind: "console-error" }
  | { kind: "clarify"; questions: ClarifyingQuestion[]; onDone?: (answers: ClarifyingAnswers) => void }
  | { kind: "plan"; steps: PlanStep[]; estimate?: string; onDone?: (steps: PlanStep[]) => void }
  | { kind: "tasks"; tasks: Task[]; live?: { onDone: (final: Task[]) => void } }
  | { kind: "thought"; thoughts: Thought[]; duration?: number; live?: { onDone: () => void } }
  | { kind: "artifact"; artifact: ArtifactData; generating?: boolean }
  | { kind: "access"; onDecision?: (decision: AccessRequestDecision) => void }
  | { kind: "cost"; onRun?: () => void }
  | { kind: "memory-notice"; text: string }
  | { kind: "run"; title: string; doneLabel: string; steps?: RunStep[]; elapsed?: number; live?: { onDone: (steps: RunStep[], elapsed: number) => void } }
  /** Copy, rate and regenerate under a finished answer; `prompt` is what a regenerate re-runs. */
  | { kind: "actions"; text: string; prompt: string }
  | { kind: "branches" }
  | { kind: "checkpoints" }
  | { kind: "code-preview" }
  );

/** A serializable artifact; previews are rendered from `source` when shown. */
export interface ArtifactData {
  id: string;
  title: string;
  kind: string;
  versions: { id: string; note?: string; source: string }[];
}

export type Block = BlockBody & { id: string };

export type ThreadGroup = "Today" | "Yesterday" | "Earlier";

export interface Thread {
  id: string;
  title: string;
  group: ThreadGroup;
  blocks: Block[];
  badge?: string;
  /** Archived threads swap the composer for an unarchive banner. */
  archived?: boolean;
  /** Temporary threads aren't kept once you leave them. */
  temporary?: boolean;
  visibility?: "private" | "public";
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
        b({ kind: "assistant", text: "I fixed the three components that don't match their spec — open View changes to flip through the files:" }),
        b({ kind: "difftabs" }),
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
      id: "naming",
      title: "Name the handoff pattern",
      group: "Yesterday",
      blocks: [b({ kind: "branches" })],
    },
    {
      id: "loader-checkpoints",
      title: "Thinking Loader polish",
      group: "Yesterday",
      blocks: [
        b({ kind: "checkpoints" }),
        b({ kind: "note", text: "Hover a checkpoint and choose Restore to undo the shimmer change." }),
      ],
    },
    {
      id: "favicon",
      title: "Animate the Origami mark",
      group: "Yesterday",
      blocks: [
        b({ kind: "user", text: "Animate the Origami mark for the loading state — SVG only, no JS" }),
        b({
          kind: "thought",
          duration: 6,
          thoughts: [
            { title: "Keeping it static-safe", body: "It's for a static export, so CSS keyframes inside the SVG — no script, works as an <img>." },
            { title: "Drawing, not spinning", body: "Fold each stroke in with stroke-dashoffset, staggered, the same rhythm as Drawing Icon." },
          ],
        }),
        b({ kind: "assistant", text: "Each fold draws in, holds, then erases — and it stops under reduced motion. Flip to Preview to watch it:" }),
        b({ kind: "code-preview" }),
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
      id: "roadmap",
      title: "Q3 catalogue roadmap",
      group: "Earlier",
      archived: true,
      blocks: [
        b({ kind: "user", text: "Which categories should we grow in Q3?" }),
        b({
          kind: "assistant",
          text: "Voice and agents — both had more requests than patterns. I'd add a voice relay and an agent run card first; they shipped in October.",
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

function LiveThought({ block }: { block: Extract<Block, { kind: "thought" }> }) {
  const [shown, setShown] = React.useState<Thought[]>(block.live ? [] : block.thoughts);
  const live = useLatest(block.live);

  React.useEffect(() => {
    if (!live.current) return;
    const script = block.thoughts;
    const words = script.map((t) => t.body.split(" "));
    let index = 0;
    let count = 0;
    const id = window.setInterval(() => {
      count += 2;
      if (count >= words[index].length) {
        if (index === script.length - 1) {
          window.clearInterval(id);
          setShown(script);
          live.current?.onDone();
          return;
        }
        index += 1;
        count = 0;
      }
      setShown([...script.slice(0, index), { title: script[index].title, body: words[index].slice(0, count).join(" ") }]);
    }, 70);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StreamOfThought
      thoughts={shown}
      thinking={!!block.live && shown !== block.thoughts}
      durationSeconds={block.duration}
      className="w-full max-w-md"
    />
  );
}

function LiveTasks({ block }: { block: Extract<Block, { kind: "tasks" }> }) {
  const [tasks, setTasks] = React.useState(block.tasks);
  const live = useLatest(block.live);

  React.useEffect(() => {
    if (!live.current) return;
    const active = tasks.findIndex((t) => t.status === "in_progress");
    if (active === -1) {
      live.current.onDone(tasks);
      return;
    }
    const t = window.setTimeout(
      () =>
        setTasks((prev) =>
          prev.map((task, i) =>
            i === active ? { ...task, status: "completed" } : i === active + 1 ? { ...task, status: "in_progress" } : task
          )
        ),
      1100
    );
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  return <TaskList tasks={tasks} label="Origami's plan" className="w-full max-w-md" />;
}

/** Simulated seconds per real second, so the run plays in a few seconds. */
const RUN_SPEED = 4;

function LiveRun({ block }: { block: Extract<Block, { kind: "run" }> }) {
  const [steps, setSteps] = React.useState<RunStep[]>(
    () =>
      block.steps ??
      CONTRAST_RUN.map((s, i): RunStep => ({ id: s.id, kind: s.kind, label: s.label, activeLabel: s.activeLabel, detail: s.detail, status: i === 0 ? "running" : "pending" }))
  );
  const [elapsed, setElapsed] = React.useState(block.elapsed ?? 0);
  const stepStart = React.useRef(0);
  const live = useLatest(block.live);
  const running = steps.some((s) => s.status === "running");

  React.useEffect(() => {
    if (!running || !live.current) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000 / RUN_SPEED);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  React.useEffect(() => {
    if (!live.current) return;
    const index = steps.findIndex((s) => s.status === "running");
    if (index === -1) {
      live.current.onDone(steps, elapsed);
      return;
    }
    const took = elapsed - stepStart.current;
    if (took < (CONTRAST_RUN.find((s) => s.id === steps[index].id)?.duration ?? 4)) return;
    stepStart.current = elapsed;
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: "done", durationSeconds: took } : i === index + 1 ? { ...s, status: "running" } : s))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, steps]);

  return <AgentRunCard title={block.title} steps={steps} elapsedSeconds={elapsed} doneLabel={block.doneLabel} className="w-full max-w-md" />;
}

const REGENERATE_OPTIONS: RegenerateOption[] = [
  { id: "concise", label: "More concise", hint: "Same answer, fewer words" },
  { id: "swift", label: "Try with Swift", hint: "Quicker, less detail" },
];

function AnswerActions({ block, handlers }: { block: Extract<Block, { kind: "actions" }>; handlers: BlockHandlers }) {
  const [rating, setRating] = React.useState<ResponseRating>(null);
  return (
    <ResponseActions
      text={block.text}
      rating={rating}
      onRate={setRating}
      onFeedback={() => handlers.onToast("Thanks — that goes straight to the Origami team.")}
      onRegenerate={() => handlers.onRegenerate(block.id, block.prompt)}
      regenerateOptions={REGENERATE_OPTIONS}
      onShare={() => "https://ai-patterns.app/workspace/s/7f3a9c2e"}
      className="-ml-2 -mt-3"
    />
  );
}

/** The summary is the receipt; View changes opens the per-file diffs right under it, as one piece. */
function AuditChanges() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full max-w-md space-y-2">
      <DiffSummaryCard files={AUDIT_DIFF_FILES} timestamp="2h ago" onViewChanges={() => setOpen((o) => !o)} className="w-full" />
      {open && <DiffTabs files={AUDIT_DIFF_TABS} className="w-full" />}
    </div>
  );
}

function NamingBranches() {
  const [branches, setBranches] = React.useState<Branch[]>(NAME_BRANCHES);
  const [active, setActive] = React.useState(NAME_BRANCHES.length - 1);
  return (
    <ConversationBranches
      branches={branches}
      active={active}
      onActiveChange={setActive}
      onEdit={(prompt) => {
        const id = `n${Date.now()}`;
        setBranches((prev) => [...prev, { id, prompt }]);
        setActive(branches.length);
        window.setTimeout(() => {
          setBranches((prev) =>
            prev.map((x) => (x.id === id ? { ...x, response: "“Handoff Card” — it says what's on screen, and it sorts next to Human in the Loop in the agents category." } : x))
          );
        }, 1200);
      }}
      className="w-full"
    />
  );
}

function LoaderCheckpoints() {
  const [restored, setRestored] = React.useState<RestoredState | null>(null);
  return (
    <CheckpointTimeline
      turns={LOADER_CHECKPOINTS}
      restored={restored}
      onRestore={setRestored}
      onRedo={() => setRestored(null)}
      untrackedNote="Restores files Origami changed. Builds and pushes stay as they are."
      className="w-full"
    />
  );
}

/** Renders the small markdown subset artifact sources use. */
export function ArtifactDoc({ source }: { source: string }) {
  return (
    <div className="max-w-prose space-y-2 text-sm leading-relaxed">
      <AiDisclosureBadge
        details={{ model: "Atlas", generatedAt: "Just now", note: "Drafted from the spec template. Review before it ships." }}
        className="mb-1"
      />
      {source.split("\n").map((line, i) => {
        if (line.startsWith("# ")) return <h4 key={i} className="text-base font-semibold">{line.slice(2)}</h4>;
        if (line.startsWith("## ")) return <h5 key={i} className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{line.slice(3)}</h5>;
        if (line.startsWith("- ")) return <p key={i} className="pl-3 text-muted-foreground">• {line.slice(2)}</p>;
        if (!line.trim()) return null;
        return (
          <p key={i} className="text-muted-foreground">
            {line.split(/\*\*(.+?)\*\*/).map((part, j) => (j % 2 ? <strong key={j} className="text-foreground">{part}</strong> : part))}
          </p>
        );
      })}
    </div>
  );
}

export function toArtifact(data: ArtifactData): Artifact {
  return { ...data, versions: data.versions.map((v) => ({ ...v, preview: <ArtifactDoc source={v.source} /> })) };
}

/**
 * The agent's replies read as plain text — the same voice as streamed answers —
 * so seeded and live threads look alike. Bubbles are for the person's messages.
 */
function AgentReply({ versions, text }: { versions?: string[]; text: string }) {
  const [index, setIndex] = React.useState(versions ? versions.length - 1 : 0);
  return (
    <div className="w-full max-w-md space-y-1">
      <p className="text-sm leading-relaxed text-foreground/90">{versions?.[index] ?? text}</p>
      {versions && versions.length > 1 && (
        <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <button
            type="button"
            aria-label="Previous version"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className="rounded px-1 hover:text-foreground disabled:opacity-40"
          >
            ‹
          </button>
          <span aria-live="polite">
            {index + 1}/{versions.length}
          </span>
          <button
            type="button"
            aria-label="Next version"
            disabled={index === versions.length - 1}
            onClick={() => setIndex((i) => i + 1)}
            className="rounded px-1 hover:text-foreground disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function PartialTranslation() {
  const [resuming, setResuming] = React.useState(false);
  const [key, setKey] = React.useState(0);
  return (
    <PartialResponse
      key={key}
      content={TRANSLATE_PARTIAL}
      reason="error"
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

function CatalogueList({ paths, onOpen }: { paths?: string[]; onOpen: (path: string) => void }) {
  const entries = paths ? registry.filter((e) => paths.includes(entryPath(e))) : registry;
  const groups = getCategories()
    .map((category) => ({ category, items: entries.filter((e) => e.category === category) }))
    .filter((g) => g.items.length);
  const ordered = groups.flatMap((g) => g.items);

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-4">
      <p className="text-sm font-medium">
        {entries.length} patterns in {groups.length} categories
      </p>
      <div className="mt-3 space-y-3">
        {groups.map((g) => (
          <div key={g.category}>
            <p className="text-xs font-medium capitalize text-muted-foreground">{g.category}</p>
            <ol className="mt-1 flex flex-wrap gap-1.5">
              {g.items.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => onOpen(entryPath(e))}
                    className="rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:bg-accent"
                  >
                    <span className="tabular-nums text-muted-foreground">{ordered.indexOf(e) + 1}.</span> {e.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

export interface BlockHandlers {
  onFollowUp: (text: string) => void;
  onApproval: (blockId: string, action: string, decision: ApprovalDecision) => void;
  onRetry: (blockId: string, action: string) => void;
  onUpgrade: () => void;
  onOpenPattern: (path: string) => void;
  onRegenerate: (blockId: string, prompt: string) => void;
  onManageMemory: () => void;
  onToast: (message: string) => void;
  /** Set by the thread pane: which artifact block is open in the side panel. */
  openArtifactId?: string | null;
  onOpenArtifact?: (blockId: string) => void;
}

export function BlockView({ block, handlers }: { block: Block; handlers: BlockHandlers }) {
  switch (block.kind) {
    case "user":
      return (
        <div className="flex flex-col items-end gap-2">
          {block.attachment && <AttachmentTray attachments={[block.attachment]} className="w-auto border-0 bg-transparent p-0" />}
          <ChatBubble role="user" content={block.text} />
        </div>
      );
    case "assistant":
      return <AgentReply versions={block.versions} text={block.text} />;
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
    case "catalogue":
      return <CatalogueList paths={block.paths} onOpen={handlers.onOpenPattern} />;
    case "difftabs":
      return <AuditChanges />;
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
    case "clarify":
      return (
        <ClarifyingQuestions
          intro="Three quick questions — I've picked my best guess for each."
          questions={block.questions}
          onSubmit={(answers) => block.onDone?.(answers)}
          submitLabel="Start drafting"
          className="w-full max-w-md"
        />
      );
    case "plan":
      return (
        <PlanReview
          title="Plan for the spec"
          steps={block.steps}
          estimate={block.estimate}
          onApprove={(steps) => block.onDone?.(steps)}
          onRegenerate={() => new Promise((resolve) => window.setTimeout(() => resolve(SPEC_PLAN_ALT), 1000))}
          approveLabel="Approve and draft"
          className="w-full max-w-md"
        />
      );
    case "tasks":
      return <LiveTasks key={block.live ? "live" : "static"} block={block} />;
    case "thought":
      return <LiveThought key={block.live ? "live" : "static"} block={block} />;
    case "artifact":
      return (
        <ArtifactCard
          artifact={toArtifact(block.artifact)}
          version={block.artifact.versions.length - 1}
          generating={block.generating}
          open={handlers.openArtifactId === block.id}
          onOpen={() => handlers.onOpenArtifact?.(block.id)}
          className="w-full max-w-md"
        />
      );
    case "access":
      return (
        <AccessRequest
          title="Widen network access?"
          target={{ name: "Origami research", scope: "This workspace" }}
          requester={AGENT_NAME}
          reason="I need to read Linear's, Cursor's and Claude's changelogs and docs — they're outside the allowed domains."
          changes={[
            { id: "hosts", label: "Allowed domains", from: "12 domains", to: "+ linear.app, cursor.com, claude.com", widens: true },
            { id: "mode", label: "Access", from: "Read registry only", to: "Read public web pages" },
          ]}
          impact="Applies to this thread and to the weekly research scout until you remove it in Connectors."
          approveLabel="Allow these domains"
          onDecision={(d) => block.onDecision?.(d)}
          className="w-full max-w-md"
        />
      );
    case "cost":
      return (
        <CostEstimate
          min={AUDIT_COST.min}
          max={AUDIT_COST.max}
          balance={AUDIT_COST.balance}
          duration="~2 min"
          breakdown={AUDIT_COST.breakdown}
          actionLabel="Run the audit"
          onRun={() => block.onRun?.()}
          onTopUp={handlers.onUpgrade}
          className="w-full max-w-md"
        />
      );
    case "memory-notice":
      return <MemoryUpdatedNotice text={block.text} onManage={handlers.onManageMemory} />;
    case "run":
      return <LiveRun key={block.live ? "live" : "static"} block={block} />;
    case "actions":
      return <AnswerActions block={block} handlers={handlers} />;
    case "branches":
      return <NamingBranches />;
    case "checkpoints":
      return <LoaderCheckpoints />;
    case "code-preview":
      return <CodePreviewBlock code={ORIGAMI_SVG} lang="svg" defaultView="preview" className="w-full max-w-xl" />;
  }
}

function WeeklyFindings() {
  return (
    <div className="w-full max-w-md space-y-3 text-sm leading-relaxed text-foreground/90">
      <AiDisclosureBadge
        variant="inline"
        details={{ model: "Atlas", generatedAt: "Today, 9:00", note: "Counts come from analytics; the trend call is a judgement." }}
      />
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
