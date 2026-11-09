"use client";

import * as React from "react";
import { ArrowRight, TerminalSquare } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { AnalysisList, type AnalysisItem } from "@/registry/loaders/analysis-list/component";
import { AttachmentTray, type Attachment } from "@/registry/uploads/attachment-chip/component";
import { ChatBubble } from "@/registry/messages/chat-bubble/component";
import { ConfidenceIndicator } from "@/registry/indicators/confidence-indicator/component";
import { DiffSummaryCard, type DiffFile } from "@/registry/code/diff-summary/component";
import { DiffTabs } from "@/registry/code/diff-tabs/component";
import { ExpandableTrace, type TraceStep } from "@/registry/traces/expandable-trace/component";
import { FollowUpList } from "@/registry/text/follow-up-list/component";
import { HumanInTheLoop, type HitlQuestion } from "@/registry/agents/human-in-the-loop/component";
import { InlineCitation } from "@/registry/text/inline-citation/component";
import { MultiAgentTrace, type Agent } from "@/registry/traces/multi-agent-trace/component";
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
import { ClarifyingQuestions, type ClarifyingAnswers, type ClarifyingQuestion } from "@/registry/messages/clarifying-questions/component";
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
  AUDIT_COST,
  AUDIT_DIFF_TABS,
  SPIKE_CITATIONS,
  WEEKLY_CITATIONS,
  type RunScript,
} from "./data";

// ---------------------------------------------------------------------------
// Thread model
// ---------------------------------------------------------------------------

export type BlockBody =
  (
  | { kind: "user"; text: string; attachment?: Attachment }
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
  | { kind: "rich"; content: "weekly" | "spike" }
  /** A clickable inventory of registry patterns, grouped by category — every pattern unless `paths` narrows it. */
  | { kind: "catalogue"; paths?: string[] }
  | { kind: "clarify"; questions: ClarifyingQuestion[]; onDone?: (answers: ClarifyingAnswers) => void }
  | {
      kind: "plan";
      steps: PlanStep[];
      estimate?: string;
      title?: string;
      approveLabel?: string;
      /** What Regenerate swaps in. */
      alternative?: PlanStep[];
      onDone?: (steps: PlanStep[]) => void;
    }
  | { kind: "tasks"; tasks: Task[]; live?: { onDone: (final: Task[]) => void } }
  | { kind: "thought"; thoughts: Thought[]; duration?: number; live?: { onDone: () => void } }
  | { kind: "artifact"; artifact: ArtifactData; generating?: boolean }
  | { kind: "access"; onDecision?: (decision: AccessRequestDecision) => void }
  | { kind: "cost"; onRun?: () => void }
  | { kind: "memory-notice"; text: string }
  | {
      kind: "run";
      title: string;
      doneLabel: string;
      script: RunScript;
      steps?: RunStep[];
      elapsed?: number;
      live?: { onDone: (steps: RunStep[], elapsed: number) => void };
    }
  /** The closing card of a journey: every pattern the thread just used, as links into the Library. */
  | { kind: "recap"; paths: string[] }
  /** Copy, rate and regenerate under a finished answer; `prompt` is what a regenerate re-runs. */
  | { kind: "actions"; text: string; prompt: string }
  );

/** A serializable artifact; previews are rendered from `source` when shown. */
export interface ArtifactData {
  id: string;
  title: string;
  kind: string;
  versions: { id: string; note?: string; source: string }[];
  /** "diff" previews the audit's per-file changes; "doc" (default) renders `source` as markdown. */
  view?: "doc" | "diff";
}

export type Block = BlockBody & { id: string };

export interface Thread {
  id: string;
  title: string;
  blocks: Block[];
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
      block.script.map((s, i): RunStep => ({ id: s.id, kind: s.kind, label: s.label, activeLabel: s.activeLabel, detail: s.detail, status: i === 0 ? "running" : "pending" }))
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
    if (took < (block.script.find((s) => s.id === steps[index].id)?.duration ?? 4)) return;
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

/** The audit's fixes, file by file — what the Changes artifact previews. */
function ArtifactChanges() {
  return (
    <div className="space-y-4">
      <AiDisclosureBadge
        details={{ model: "Atlas", generatedAt: "Just now", note: "Each change follows its pattern's Behavior and Accessibility sections. Review before it ships." }}
      />
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        Three components brought up to their pattern spec. Nothing is pushed until you approve it.
      </p>
      <DiffTabs files={AUDIT_DIFF_TABS} className="w-full" />
    </div>
  );
}

export function toArtifact(data: ArtifactData): Artifact {
  return {
    ...data,
    versions: data.versions.map((v) => ({ ...v, preview: data.view === "diff" ? <ArtifactChanges /> : <ArtifactDoc source={v.source} /> })),
  };
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
  onUpgrade: () => void;
  onOpenPattern: (path: string) => void;
  onOpenLibrary?: () => void;
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
    case "rich":
      return block.content === "weekly" ? <WeeklyFindings /> : <SpikeFindings />;
    case "catalogue":
      return <CatalogueList paths={block.paths} onOpen={handlers.onOpenPattern} />;
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
          title={block.title}
          steps={block.steps}
          estimate={block.estimate}
          onApprove={(steps) => block.onDone?.(steps)}
          onRegenerate={block.alternative ? () => new Promise((resolve) => window.setTimeout(() => resolve(block.alternative!), 1000)) : undefined}
          approveLabel={block.approveLabel}
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
    case "recap":
      return <PatternRecap paths={block.paths} onOpen={handlers.onOpenPattern} onLibrary={handlers.onOpenLibrary} />;
  }
}

/**
 * The reveal at the end of the journey: the thread you just watched was built
 * from catalogue patterns, and each one is a link into the Library.
 */
function PatternRecap({ paths, onOpen, onLibrary }: { paths: string[]; onOpen: (path: string) => void; onLibrary?: () => void }) {
  const reduce = useReducedMotion();
  const entries = paths.map((p) => registry.find((e) => entryPath(e) === p)).filter((e): e is (typeof registry)[number] => !!e);
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-5"
    >
      {/* A slow sheen across the card, once — the "oh, it was all patterns" moment. */}
      {!reduce && (
        <motion.span
          aria-hidden
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ delay: 0.25 + entries.length * 0.07, duration: 1.1, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent"
        />
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Behind the scenes</p>
      <p className="mt-1 text-base font-semibold tracking-tight">
        This thread was built from {entries.length} patterns
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Every card you just used is in the catalogue, ready to copy.</p>
      <ol className="mt-4 flex flex-wrap gap-1.5">
        {entries.map((e, i) => (
          <motion.li
            key={e.slug}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.25, ease: "easeOut" }}
          >
            <button
              type="button"
              onClick={() => onOpen(entryPath(e))}
              className="rounded-full border bg-background px-2.5 py-1 text-xs transition-colors hover:bg-accent"
            >
              {e.title}
            </button>
          </motion.li>
        ))}
      </ol>
      {onLibrary && (
        <button
          type="button"
          onClick={onLibrary}
          className="group mt-4 flex items-center gap-1 text-sm font-medium"
        >
          Browse all {registry.length} in the Library
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </motion.div>
  );
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
