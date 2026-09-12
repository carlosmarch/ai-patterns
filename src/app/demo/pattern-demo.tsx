"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bot,
  Code2,
  GitBranch,
  Globe,
  LayoutGrid,
  Loader2,
  PackagePlus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  TerminalSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";

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
import { StopGenerationButton } from "@/registry/buttons/stop-generation-button/component";
import { ShinyButton } from "@/registry/buttons/shiny-button/component";
import { AttachmentTray, type Attachment } from "@/registry/uploads/attachment-chip/component";
import { Flowchart, type FlowchartNode } from "@/registry/flowcharts/trigger-condition/component";
import { PromptBarPro, type SessionSuggestion } from "@/registry/composer/prompt-bar-pro/component";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const SUGGESTIONS: SessionSuggestion[] = [
  { id: "diff", label: "Show me a diff", icon: Code2 },
  { id: "terminal", label: "Stream a terminal run", icon: TerminalSquare },
  { id: "trace", label: "Show your reasoning", icon: Sparkles },
  { id: "agents", label: "Run a multi-agent workflow", icon: Bot },
  { id: "approve", label: "Ask permission first", icon: ShieldCheck },
  { id: "tools", label: "Chain a couple of tool calls", icon: Search },
  { id: "sources", label: "Cite your sources", icon: Globe },
  { id: "stop", label: "Give me a slow answer", icon: Square },
  { id: "more", label: "Show me more patterns", icon: LayoutGrid },
  { id: "skill", label: "How do I install this?", icon: PackagePlus },
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

const SHINY_INTRO_SEGMENTS = text("Even a plain call-to-action can carry a little delight:");

const SKILL_INTRO_SEGMENTS = text(
  "And this whole catalogue also ships as a Claude Code skill, so your coding agent can reach for it directly:"
);

const SKILL_OUTRO_SEGMENTS = text(
  "From there, just ask it to design a screen — it'll shortlist patterns from here and scaffold the one that actually fits."
);

const MORE_OUTRO_SEGMENTS = text(
  "That's the whole registry. Replay from the top, browse the catalogue yourself, or keep chatting."
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
interface ShinyBlock {
  id: string;
  kind: "shiny";
}
interface FollowUpsBlock {
  id: string;
  kind: "followups";
  suggestions: string[];
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
  | ShinyBlock
  | FollowUpsBlock;

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

  function showShinyButton(): StepFn {
    return (runId, done) => {
      addBlock({ id: nextId("shiny"), kind: "shiny" });
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
      say(SHINY_INTRO_SEGMENTS),
      showShinyButton(),
      pause(500),
      say(SKILL_INTRO_SEGMENTS),
      showTerminal("/plugin install ai-patterns@ai-patterns", SKILL_INSTALL_SCRIPT),
      say(SKILL_OUTRO_SEGMENTS),
      pause(300),
      say(MORE_OUTRO_SEGMENTS),
      showFollowUps(["Replay from the start", "Show me a diff", "Ask permission first"]),
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

  function replay() {
    clearTimers();
    runIdRef.current += 1;
    setGenerating(false);
    setBlocks([]);
    schedule(() => runTour(), 150);
  }

  function handleSubmit(value: string) {
    if (generating) return;
    const trimmed = value.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === "replay from the start") {
      replay();
      return;
    }

    const suggestion = SUGGESTIONS.find((s) => s.label.toLowerCase() === trimmed.toLowerCase());

    if (!suggestion) {
      runReplyFlow(trimmed);
      return;
    }

    switch (suggestion.id) {
      case "diff":
        return runDiffFlow(trimmed);
      case "terminal":
        return runTerminalFlow(trimmed);
      case "trace":
        return runTraceFlow(trimmed);
      case "agents":
        return runAgentsFlow(trimmed);
      case "approve":
        return runApproveFlow(trimmed);
      case "tools":
        return runToolsFlow(trimmed);
      case "sources":
        return runSourcesFlow(trimmed);
      case "stop":
        return runStopFlow(trimmed);
      case "more":
        return runMoreTour(trimmed);
      case "skill":
        return runSkillFlow(trimmed);
    }
  }

  React.useEffect(() => {
    schedule(() => runTour(), 0);
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
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="mx-auto flex w-fit items-center gap-2 rounded-full bg-card py-1 pl-3 pr-1 text-xs text-muted-foreground shadow-sm"
            >
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Generating
              <StopGenerationButton state="generating" onStop={stopGeneration} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(generating && "pointer-events-none opacity-50")}>
          <PromptBarPro
            suggestions={SUGGESTIONS}
            visibleCount={4}
            placeholder="Ask about a pattern, or try one below…"
            onSubmit={handleSubmit}
          />
        </div>
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
    case "shiny":
      return <ShinyButton>Ship it</ShinyButton>;
    case "followups":
      return <FollowUpList suggestions={block.suggestions} onSelect={onSelectFollowUp} className="w-full max-w-md" />;
  }
}
