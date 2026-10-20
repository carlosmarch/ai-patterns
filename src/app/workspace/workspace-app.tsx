"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  FlaskConical,
  History,
  LayoutGrid,
  ListChecks,
  Loader2,
  MessagesSquare,
  Package,
  Plug,
  Plus,
  Rocket,
  Search,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { registry, type RegistryEntry } from "@/registry";
import type { SkillExample } from "@/app/skill/skill-examples";
import { BackgroundTasksDrawer, type BackgroundTask } from "@/registry/agents/background-tasks/component";
import { CollaborativePresence } from "@/registry/collaboration/collaborative-presence/component";
import { CommandPalette, type CommandPaletteGroup, type CommandPaletteItem } from "@/registry/navigation/command-palette/component";
import { InviteMembers } from "@/registry/access/invite-members/component";
import { PromptBar } from "@/registry/composer/prompt-bar/component";
import { PromptBarPro } from "@/registry/composer/prompt-bar-pro/component";
import type { Agent } from "@/registry/traces/multi-agent-trace/component";
import type { AnalysisItem } from "@/registry/loaders/analysis-list/component";
import type { LogLine } from "@/registry/code/terminal-stream/component";
import type { StreamSegment } from "@/registry/text/streaming-text/component";

import {
  AGENT_ICON,
  AGENT_NAME,
  COMPOSER_COMMANDS,
  COMPOSER_SOURCES,
  COMPOSER_SUGGESTIONS,
  EXPLORE_FOLLOW_UPS,
  GUIDANCE_DIFF,
  GUIDANCE_ITEMS,
  GUIDANCE_QUESTIONS,
  INITIAL_TASKS,
  ORG_MEMBERS,
  ROLES,
  SKILL_BUILD_DIFF,
  SKILL_BUILD_SCRIPT,
  SPIKE_LIVE_AGENTS,
  SPIKE_SOURCES,
  STARTER_CARDS,
  TEAM,
  USER_NAME,
  WEEKLY_SOURCES,
  WEEKLY_TRACE,
  AUDIT_ITEMS,
  favicon,
  tickSpikeAgents,
} from "./data";
import { entryPath, findEntry, firstBullet, loadSource, matchEntry, relatedEntries, specSection } from "./catalogue";
import { PatternsView, SkillView } from "./library";
import { BlockView, nextId, seedThreads, type Block, type BlockBody, type BlockHandlers, type Thread } from "./thread";
import {
  CONNECTORS,
  ChangelogView,
  ConnectorsView,
  DeployView,
  InsightsView,
  MobileMenuButton,
  MobileMenuContext,
  PlaygroundView,
  SetupView,
  TrainView,
  WorkflowsView,
  type ConnectorDef,
  type PlaygroundTab,
  type TrainTab,
} from "./views";

type View =
  | "operator"
  | "train"
  | "playground"
  | "deploy"
  | "insights"
  | "changelog"
  | "patterns"
  | "skill"
  | "connectors"
  | "workflows"
  | "setup";

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Sub-pages, shown under the item while it's the current view. */
  children?: { id: string; label: string }[];
}

interface NavGroup {
  /** Shown above the group in the sidebar; the first group has none. */
  label?: string;
  items: NavItem[];
}

// Grouped by what you do here: use the agent, configure it, and browse the
// library it's built from. Settings sit at the bottom of the sidebar.
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: "operator", label: "Operator", icon: MessagesSquare },
      {
        id: "playground",
        label: "Playground",
        icon: FlaskConical,
        children: [
          { id: "chat", label: "Chat" },
          { id: "voice", label: "Voice" },
        ],
      },
      { id: "insights", label: "Insights", icon: ChartColumn },
    ],
  },
  {
    label: "Configure",
    items: [
      {
        id: "train",
        label: "Train",
        icon: BookOpen,
        children: [
          { id: "procedures", label: "Procedures" },
          { id: "guidelines", label: "Guidelines" },
        ],
      },
      { id: "workflows", label: "Workflows", icon: Workflow },
      { id: "deploy", label: "Deploy", icon: Rocket },
    ],
  },
  {
    // The catalogue and skill this workspace is built from, same as /patterns and /skill.
    label: "Library",
    items: [
      { id: "patterns", label: "Patterns", icon: LayoutGrid },
      { id: "skill", label: "Skill", icon: Package },
      { id: "changelog", label: "What's new", icon: History },
    ],
  },
];

const NAV_SETTINGS: NavItem[] = [
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "setup", label: "Setup", icon: ListChecks },
];

const NAV_ALL = [...NAV_GROUPS.flatMap((g) => g.items), ...NAV_SETTINGS];

// Shortcuts in the icon rail, in order; a divider sits between the groups.
const RAIL: View[][] = [
  ["operator", "patterns", "skill", "deploy"],
  ["connectors", "workflows"],
];

const WORKSPACES = [
  { id: "ai-patterns", name: "ai-patterns", color: "bg-violet-500" },
  { id: "origami-labs", name: "Origami Labs", color: "bg-sky-500" },
  { id: "personal", name: "Personal", color: "bg-emerald-500" },
];

const CANCELLED = Symbol("cancelled");

function text(content: string): StreamSegment[] {
  return [{ type: "text", content }];
}

function titleFrom(prompt: string) {
  const clean = prompt.replace(/[?.!]+$/, "");
  return clean.length > 40 ? `${clean.slice(0, 38).trimEnd()}…` : clean;
}

type Flow =
  | { kind: "spike" | "guidance" | "bulk" | "summary" | "explore" | "list" | "review" | "default" }
  | { kind: "pattern" | "scaffold"; entry: RegistryEntry; viaSkill?: boolean };

// Which scripted flow a prompt should run. Prompts that name a pattern are
// answered from its real spec, ahead of the keyword flows, so "scaffold the
// stop generation button" isn't read as a Stop-click question. Anything
// unrecognized gets the generic research flow, so free-typed prompts still
// feel answered.
function flowFor(prompt: string): Flow {
  const p = prompt.toLowerCase();
  const entry = matchEntry(p);
  if (entry) return { kind: /^(scaffold|build|add|apply|swap)\b/.test(p) ? "scaffold" : "pattern", entry };
  if (p.includes("stop") || p.includes("drop-off") || p.includes("abandon")) return { kind: "spike" };
  if (p.includes("guideline") || p.includes("guidance")) return { kind: "guidance" };
  if (p.includes("skill") || p.includes("reference docs") || p.includes("rebuild")) return { kind: "bulk" };
  if (p.includes("usage") || p.includes("summar") || p.includes("report")) return { kind: "summary" };
  if (p.includes("what can you") || p.includes("capabilit")) return { kind: "explore" };
  if ((p.includes("list") || p.includes("catalogue")) && p.includes("pattern")) return { kind: "list" };
  if (p.includes("review my project") || p.includes("audit my project")) return { kind: "review" };
  return { kind: "default" };
}

/** The flow a skill example runs when it's handed to Origami from the Skill view. */
function flowForExample(example: SkillExample): Flow {
  const entry = findEntry(example.pattern);
  if (entry) return { kind: "pattern", entry, viaSkill: true };
  return { kind: example.mode === "review" ? "review" : "list" };
}

interface Runner {
  add: (block: BlockBody) => string;
  update: (id: string, patch: Partial<Block>) => void;
  remove: (id: string) => void;
  wait: (ms: number) => Promise<void>;
  think: (ms?: number) => Promise<void>;
  say: (segments: StreamSegment[]) => Promise<void>;
  tool: (opts: { toolKind: "search" | "file" | "code" | "network"; verb: string; target: string; result: string; duration?: number }) => Promise<void>;
  until: <T>(make: (resolve: (value: T) => void) => BlockBody) => Promise<{ id: string; value: T }>;
}

export function WorkspaceApp({ skillVersion }: { skillVersion: string }) {
  const [view, setView] = React.useState<View>("operator");
  const [threads, setThreads] = React.useState<Thread[]>(seedThreads);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState<Record<string, boolean>>({});
  const [query, setQuery] = React.useState("");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [tasksOpen, setTasksOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<BackgroundTask[]>(INITIAL_TASKS);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [trainTab, setTrainTab] = React.useState<TrainTab>("procedures");
  const [playgroundTab, setPlaygroundTab] = React.useState<PlaygroundTab>("chat");
  const [connectors, setConnectors] = React.useState<ConnectorDef[]>(CONNECTORS);
  const [skillDone, setSkillDone] = React.useState(false);
  const [teamDone, setTeamDone] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [patternPath, setPatternPath] = React.useState<string | null>(null);
  const [patternCategory, setPatternCategory] = React.useState<string | null>(null);
  const runsRef = React.useRef<Record<string, number>>({});

  const activeThread = threads.find((t) => t.id === activeId) ?? null;
  const runningTasks = tasks.filter((t) => t.status === "running").length;
  const setupDone = 2 + Number(skillDone) + Number(teamDone);

  // -------------------------------------------------------------------------
  // Thread state helpers
  // -------------------------------------------------------------------------

  const patchThread = React.useCallback((threadId: string, fn: (t: Thread) => Thread) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? fn(t) : t)));
  }, []);

  function stopRun(threadId: string) {
    runsRef.current[threadId] = (runsRef.current[threadId] ?? 0) + 1;
    setRunning((r) => ({ ...r, [threadId]: false }));
    patchThread(threadId, (t) => ({
      ...t,
      blocks: [
        ...t.blocks
          .filter((b) => b.kind !== "thinking")
          .map((b): Block => {
            if (b.kind === "tool" && b.status === "running") return { ...b, status: "error", result: `Stopped ${b.verb.toLowerCase()} ${b.target}`, onDone: undefined };
            if (b.kind === "stream" && !b.done) return { ...b, done: true, onDone: undefined };
            return b;
          }),
        { id: nextId("note"), kind: "note", text: "You stopped this response." },
      ],
    }));
  }

  function startRun(threadId: string, script: (r: Runner) => Promise<void>) {
    const token = (runsRef.current[threadId] ?? 0) + 1;
    runsRef.current[threadId] = token;
    const alive = () => runsRef.current[threadId] === token;
    setRunning((r) => ({ ...r, [threadId]: true }));

    const add: Runner["add"] = (block) => {
      if (!alive()) throw CANCELLED;
      const id = nextId("live");
      patchThread(threadId, (t) => ({ ...t, blocks: [...t.blocks, { ...block, id } as Block] }));
      return id;
    };
    const update: Runner["update"] = (id, patch) =>
      patchThread(threadId, (t) => ({ ...t, blocks: t.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)) }));
    const remove: Runner["remove"] = (id) => patchThread(threadId, (t) => ({ ...t, blocks: t.blocks.filter((b) => b.id !== id) }));
    const wait: Runner["wait"] = (ms) =>
      new Promise((resolve, reject) => window.setTimeout(() => (alive() ? resolve() : reject(CANCELLED)), ms));
    const until: Runner["until"] = (make) =>
      new Promise((resolve, reject) => {
        let id = "";
        id = add(make((value) => (alive() ? resolve({ id, value }) : reject(CANCELLED))));
      });

    const r: Runner = {
      add,
      update,
      remove,
      wait,
      until,
      async think(ms = 1000) {
        const id = add({ kind: "thinking" });
        try {
          await wait(ms);
        } finally {
          remove(id);
        }
      },
      async say(segments) {
        const { id } = await until<void>((done) => ({ kind: "stream", segments, onDone: () => done() }));
        update(id, { done: true, onDone: undefined } as Partial<Block>);
        await wait(200);
      },
      async tool(opts) {
        const { id } = await until<void>((done) => ({ kind: "tool", status: "running", ...opts, onDone: () => done() }));
        update(id, { status: "success", onDone: undefined } as Partial<Block>);
        await wait(250);
      },
    };

    script(r)
      .catch((e) => {
        if (e !== CANCELLED) throw e;
      })
      .finally(() => {
        if (alive()) setRunning((s) => ({ ...s, [threadId]: false }));
      });
  }

  // -------------------------------------------------------------------------
  // Flows
  // -------------------------------------------------------------------------

  async function explainPattern(r: Runner, entry: RegistryEntry) {
    const summary = specSection(entry.uxDoc, "Summary");
    const use = firstBullet(entry.uxDoc, "When to use");
    const avoid = firstBullet(entry.uxDoc, "When not to use");
    if (summary) await r.say(text(summary));
    if (use) await r.say(text(`Use it for: ${use}`));
    if (avoid) await r.say(text(`Skip it when: ${avoid}`));
    r.add({
      kind: "sources",
      sources: [
        { title: `${entry.title} — UX spec`, domain: "ai-patterns.dev", url: `/patterns/${entryPath(entry)}`, faviconUrl: favicon("github.com") },
        { title: "carlosmarch/ai-patterns", domain: "github.com", url: `https://github.com/carlosmarch/ai-patterns/tree/main/src/registry/${entryPath(entry)}`, faviconUrl: favicon("github.com") },
      ],
    });
    r.add({ kind: "followups", items: [`Scaffold ${entry.title}`, ...relatedEntries(entry).slice(0, 2).map((e) => `Tell me about ${e.title}`)] });
  }

  async function runFlow(r: Runner, flow: Flow) {
    switch (flow.kind) {
      case "pattern": {
        const { entry, viaSkill } = flow;
        await r.think(700);
        if (viaSkill) {
          await r.tool({ toolKind: "file", verb: "Reading", target: "reference/index.md", result: `Read ${registry.length} pattern summaries` });
          const runnerUp = relatedEntries(entry)[0];
          await r.tool({
            toolKind: "search",
            verb: "Shortlisting",
            target: "candidates",
            result: runnerUp ? `Shortlisted ${entry.title} over ${runnerUp.title}` : `Shortlisted ${entry.title}`,
          });
        } else {
          await r.tool({ toolKind: "search", verb: "Searching", target: "the registry", result: `Found ${entry.title} in ${entry.category}` });
        }
        const sections = entry.uxDoc.split("\n").filter((l) => l.startsWith("## ")).length;
        await r.tool({ toolKind: "file", verb: "Reading", target: `${entry.slug}.pattern.md`, result: `Read ${sections} sections` });
        if (viaSkill) await r.say(text(`I'd use ${entry.title} here. From its spec:`));
        await explainPattern(r, entry);
        return;
      }

      case "scaffold": {
        const { entry } = flow;
        const path = entryPath(entry);
        await r.think(700);
        await r.tool({ toolKind: "file", verb: "Reading", target: `${entry.slug}.pattern.md`, result: "Read Anatomy, Behavior, and Accessibility" });
        await r.tool({ toolKind: "code", verb: "Detecting", target: "the design system", result: "Next.js · Tailwind v4 · Radix · Motion" });
        const source = await loadSource(path).catch(() => null);
        const lines = source ? source.code.split("\n").length : 0;
        await r.tool({ toolKind: "file", verb: "Writing", target: `components/${entry.slug}.tsx`, result: lines ? `Wrote ${lines} lines` : "Wrote the component" });
        r.add({ kind: "diff", files: [{ id: "1", name: `src/components/${entry.slug}.tsx`, additions: lines, deletions: 0 }], timestamp: "just now" });
        await r.wait(300);
        await r.say(text(`Scaffolded ${entry.title} with its behavior and accessibility rules intact. Open it in Patterns to compare against the reference preview.`));
        r.add({ kind: "catalogue", paths: [path, ...relatedEntries(entry).map(entryPath)] });
        return;
      }

      case "list":
        await r.think(600);
        await r.tool({ toolKind: "file", verb: "Reading", target: "reference/index.md", result: `Read ${registry.length} pattern summaries` });
        await r.say(text("Here's everything in the catalogue, grouped by category. Pick one to open it:"));
        r.add({ kind: "catalogue" });
        r.add({ kind: "followups", items: ["Review my project", "Tell me about Thinking Loader"] });
        return;

      case "review": {
        await r.think(700);
        await r.say(text("Scanning for hand-rolled AI UI a catalogue pattern already covers. Read-only — I won't edit anything:"));
        const { id, value } = await r.until<AnalysisItem[]>((done) => ({
          kind: "analysis",
          items: AUDIT_ITEMS.map((item, i) => ({ ...item, status: i === 0 ? "loading" : "pending" })),
          live: { onDone: done },
        }));
        r.update(id, { items: value, live: undefined } as Partial<Block>);
        await r.say(text("Three swaps worth making, each backed by the pattern's When to use. The chat bubble is already up to spec."));
        r.add({
          kind: "catalogue",
          paths: ["buttons/stop-generation-button", "loaders/tool-call-chip", "loaders/thinking-loader"],
        });
        r.add({ kind: "followups", items: ["Swap the spinner for a Thinking Loader", "Tell me about Tool Call Chip"] });
        return;
      }

      case "summary":
        await r.think(900);
        await r.tool({ toolKind: "search", verb: "Searching", target: "copy events", result: "Read 18,240 events from Vercel Analytics" });
        await r.tool({ toolKind: "network", verb: "Fetching", target: "skill usage logs", result: "Fetched 1,312 skill sessions" });
        r.add({ kind: "trace", steps: WEEKLY_TRACE, duration: 9 });
        await r.wait(400);
        r.add({ kind: "rich", content: "weekly" });
        await r.wait(400);
        r.add({ kind: "sources", sources: WEEKLY_SOURCES });
        r.add({ kind: "followups", items: ["Which patterns have no copies at all?", "Schedule this every Monday"] });
        return;

      case "spike": {
        await r.think(800);
        await r.say(text("I'll split this across three sub-agents so we get replays, screen matching, and specs at once:"));
        const { id, value } = await r.until<Agent[]>((done) => ({
          kind: "agents",
          agents: SPIKE_LIVE_AGENTS,
          live: { tick: tickSpikeAgents, onDone: done },
        }));
        r.update(id, { agents: value, live: undefined } as Partial<Block>);
        await r.wait(300);
        r.add({ kind: "rich", content: "spike" });
        await r.wait(400);
        r.add({ kind: "sources", sources: SPIKE_SOURCES });
        r.add({ kind: "followups", items: ["Swap the spinner for a Thinking Loader", "Show me the Expandable Trace spec"] });
        return;
      }

      case "guidance": {
        await r.think(700);
        await r.say(text("Reading your design guidelines and checking each group against the registry specs…"));
        const { id, value } = await r.until<AnalysisItem[]>((done) => ({
          kind: "analysis",
          items: GUIDANCE_ITEMS.map((item, i) => ({ ...item, status: i === 0 ? "loading" : "pending" })),
          live: { onDone: done },
        }));
        r.update(id, { items: value, live: undefined } as Partial<Block>);
        await r.say(text("Found one conflict and one gap. Two quick questions before I change anything:"));
        const hitl = await r.until<void>((done) => ({ kind: "hitl", questions: GUIDANCE_QUESTIONS, onDone: () => done() }));
        r.remove(hitl.id);
        r.add({ kind: "note", text: "You answered 2 questions" });
        await r.think(900);
        r.add({ kind: "diff", files: GUIDANCE_DIFF, timestamp: "just now" });
        await r.wait(300);
        await r.say(text("Updated both guidelines. I'll apply them to every audit and spec from now on — they're live in Train › Guidelines."));
        return;
      }

      case "bulk":
        await r.think(700);
        await r.say(text("Three patterns changed since the last build, so the skill's reference docs are stale. That runs a script in the repo — I need your OK first:"));
        r.add({
          kind: "approval",
          action: "skill-build",
          toolName: "Bash",
          summary: "Rebuild the skill reference docs",
          detail: "npm run skill:build",
        });
        return;

      case "explore":
        await r.think(600);
        await r.say(
          text(
            "I'm your UX agent for AI products. I can audit a screen against the pattern catalogue, write and review UX specs, scaffold components in your design system, and report on which patterns people actually use. A few things to try:"
          )
        );
        r.add({ kind: "followups", items: EXPLORE_FOLLOW_UPS });
        return;

      default:
        await r.think(1100);
        await r.tool({ toolKind: "search", verb: "Searching", target: "the registry", result: "Found 6 related patterns" });
        await r.tool({ toolKind: "file", verb: "Reading", target: "their UX specs", result: "Read 6 specs" });
        await r.say([
          { type: "text", content: "Here's my take, based on the registry specs " },
          { type: "source", label: "ai-patterns.dev" },
          {
            type: "text",
            content:
              " — start from the pattern whose Behavior section matches your flow, then check its Accessibility section before you change anything. Want me to shortlist the top three and scaffold one?",
          },
        ]);
        r.add({ kind: "followups", items: ["Shortlist the top three", "Scaffold the best fit"] });
    }
  }

  function submitPrompt(prompt: string, flow: Flow = flowFor(prompt)) {
    const raw = prompt.trim();
    if (!raw) return;
    let threadId = activeThread?.id;

    if (!threadId || view !== "operator") {
      threadId = nextId("thread");
      const thread: Thread = { id: threadId, title: titleFrom(raw), group: "Today", blocks: [] };
      setThreads((prev) => [thread, ...prev]);
      setActiveId(threadId);
      setView("operator");
    } else if (running[threadId]) {
      return;
    }

    const id = threadId;
    patchThread(id, (t) => ({ ...t, blocks: [...t.blocks, { id: nextId("u"), kind: "user", text: raw }] }));
    startRun(id, (r) => runFlow(r, flow));
  }

  function upsertTask(task: BackgroundTask) {
    setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
  }

  function openPattern(path: string | null) {
    setPatternPath(path);
    setView("patterns");
    setMobileNav(false);
  }

  function openPatterns(category?: string) {
    setPatternCategory(category ?? null);
    openPattern(null);
  }

  const handlers: BlockHandlers = {
    onFollowUp: (prompt) => submitPrompt(prompt),
    onOpenPattern: openPattern,
    onUpgrade: () => setToast("Team plans unlock longer generations — ask your workspace admin."),
    onApproval(blockId, action, decision) {
      if (!activeThread) return;
      const threadId = activeThread.id;
      patchThread(threadId, (t) => ({
        ...t,
        badge: undefined,
        blocks: t.blocks.map((b) => (b.id === blockId ? ({ ...b, decided: decision } as Block) : b)),
      }));

      if (decision === "deny") {
        startRun(threadId, async (r) => {
          await r.say(text("Understood — I won't run it. The changes stay on the branch for you to review."));
        });
        return;
      }

      const isSkill = action === "skill-build";
      const taskId = nextId("task");
      upsertTask({
        id: taskId,
        title: isSkill ? "Rebuild skill reference docs" : "Build and push contrast fix",
        kind: "shell",
        kindLabel: "Bash",
        status: "running",
        elapsedSeconds: 0,
        activity: "Running",
        command: isSkill ? "npm run skill:build" : "npm run build && git push",
      });

      startRun(threadId, async (r) => {
        const script: Omit<LogLine, "id">[] = isSkill
          ? SKILL_BUILD_SCRIPT
          : [
              { text: "$ npm run build", level: "default" },
              { text: "✓ Compiled successfully in 7.2s", level: "success" },
              { text: "✓ Generating static pages (58/58)", level: "success" },
              { text: "$ git push origin fix/tool-approval-contrast", level: "default" },
              { text: "✓ Pushed 1 commit", level: "success" },
            ];
        const command = isSkill ? "npm run skill:build" : "npm run build && git push";
        const { id, value } = await r.until<LogLine[]>((done) => ({ kind: "terminal", command, lines: [], live: { script, onDone: done } }));
        r.update(id, { lines: value, live: undefined } as Partial<Block>);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: "done", activity: undefined, output: value.map((l) => l.text).join("\n") } : t))
        );
        if (isSkill) {
          r.add({ kind: "diff", files: SKILL_BUILD_DIFF, timestamp: "just now" });
          await r.wait(300);
          await r.say(text("Rebuilt — 47 specs are in the skill now, including the three new agent patterns. I bumped the plugin version too."));
        } else {
          await r.say(text("Pushed fix/tool-approval-contrast. Both contrast checks pass now — I'll comment on the PR when CI is green."));
        }
      });
    },
    onRetry(blockId) {
      if (!activeThread) return;
      const threadId = activeThread.id;
      patchThread(threadId, (t) => ({
        ...t,
        badge: undefined,
        blocks: t.blocks.map((b) => (b.id === blockId ? ({ ...b, retrying: true } as Block) : b)),
      }));
      startRun(threadId, async (r) => {
        await r.wait(1200);
        r.remove(blockId);
        await r.say(
          text(
            "Agent Handoff — Summary: a card that shows an agent passing a thread to a person, with why, what it already tried, and who picks it up next. When to use: the agent hits a limit it can't resolve, like a refund over policy. Related: Human in the Loop, Background Tasks Drawer."
          )
        );
        r.add({ kind: "followups", items: ["Write the Anatomy section", "Scaffold the component"] });
      });
    },
  };

  // -------------------------------------------------------------------------
  // Background tasks tick, command palette, toast
  // -------------------------------------------------------------------------

  React.useEffect(() => {
    if (runningTasks === 0) return;
    const id = window.setInterval(
      () => setTasks((prev) => prev.map((t) => (t.status === "running" ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 } : t))),
      1000
    );
    return () => window.clearInterval(id);
  }, [runningTasks]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Capture and stop here so the site header's own ⌘K palette,
        // still mounted under this full-screen app, doesn't open too.
        e.stopPropagation();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const paletteGroups: CommandPaletteGroup[] = [
    {
      label: "Actions",
      items: [
        { id: "action:new", label: "New thread", icon: Plus },
        { id: "action:tasks", label: "Show background tasks", icon: Clock, meta: runningTasks ? `${runningTasks} running` : undefined },
        { id: "action:registry", label: "Browse the pattern registry", icon: LayoutGrid },
      ],
    },
    {
      label: "Threads",
      items: threads.slice(0, 6).map((t) => ({ id: `thread:${t.id}`, label: t.title, icon: MessagesSquare, meta: t.group })),
    },
    {
      label: "Go to",
      items: NAV_ALL.map((n) => ({ id: `view:${n.id}`, label: n.label, icon: n.icon })),
    },
    {
      label: "Patterns",
      items: registry.map((e) => ({ id: `pattern:${entryPath(e)}`, label: e.title, icon: LayoutGrid, meta: e.category })),
    },
  ];

  function onPaletteSelect(item: CommandPaletteItem) {
    setPaletteOpen(false);
    const [type, value] = item.id.split(":");
    if (type === "pattern") {
      openPattern(value);
    } else if (type === "thread") {
      setView("operator");
      setActiveId(value);
    } else if (type === "view") {
      navigate(value as View);
    } else if (value === "new") {
      setView("operator");
      setActiveId(null);
    } else if (value === "tasks") {
      setTasksOpen(true);
    } else if (value === "registry") {
      openPatterns();
    }
  }

  const openMobileNav = React.useCallback(() => setMobileNav(true), []);

  function navigate(next: View, sub?: string) {
    setView(next);
    if (next === "patterns") setPatternPath(null);
    if (next === "train" && sub) setTrainTab(sub as TrainTab);
    if (next === "playground" && sub) setPlaygroundTab(sub as PlaygroundTab);
    setMobileNav(false);
  }

  function openThread(id: string | null) {
    setView("operator");
    setActiveId(id);
    setMobileNav(false);
  }

  const visibleThreads = threads.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()));

  const navSidebar = (
    <NavSidebar
      view={view}
      subView={view === "train" ? trainTab : view === "playground" ? playgroundTab : undefined}
      onNavigate={navigate}
      setupDone={setupDone}
      onToast={setToast}
    />
  );
  const threadList = (
    <ThreadList
      threads={visibleThreads}
      activeId={activeId}
      running={running}
      query={query}
      onQuery={setQuery}
      onOpen={openThread}
      onScheduled={() => setTasksOpen(true)}
      scheduledCount={runningTasks}
    />
  );

  return (
    <MobileMenuContext.Provider value={openMobileNav}>
      <div className="flex h-full w-full gap-2 bg-muted/60 p-2 text-foreground dark:bg-black">
        <IconRail
          view={view}
          onNavigate={navigate}
          onSearch={() => setPaletteOpen(true)}
          onHome={() => openThread(null)}
        />

        <div className="hidden md:flex">{navSidebar}</div>

        <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm">
          {view === "operator" && <div className="hidden lg:flex">{threadList}</div>}

          <section className="flex min-w-0 flex-1 flex-col">
            {view === "operator" ? (
              <>
                <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
                  <MobileMenuButton />
                  <h2 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{activeThread?.title ?? "New thread"}</h2>
                  <div className="flex shrink-0 items-center gap-3">
                    {/* Fixed-size slot so the presence panel floats over the thread
                        instead of stretching the 64px header. */}
                    <div className="relative hidden h-8 w-[7.5rem] xl:block">
                      <CollaborativePresence
                        collaborators={TEAM}
                        visibleCap={3}
                        className="absolute right-0 top-0 z-30"
                      />
                    </div>
                    <div className="hidden sm:block">
                      <InviteMembers
                        trigger="share"
                        roles={ROLES}
                        orgMembers={ORG_MEMBERS}
                        initialAssignees={[
                          { id: "carlos", name: "Carlos March", email: "carlos@ai-patterns.dev", status: "confirmed", roleId: "admin" },
                          { id: "ana", name: "Ana López", email: "ana@ai-patterns.dev", status: "confirmed", roleId: "editor" },
                        ]}
                        defaultMessage="Join me in the Origami workspace — we're auditing our AI screens against the pattern catalogue."
                      />
                    </div>
                    <TasksButton count={runningTasks} onClick={() => setTasksOpen((o) => !o)} />
                  </div>
                </div>
                {activeThread ? (
                  <ThreadPane
                    thread={activeThread}
                    generating={!!running[activeThread.id]}
                    handlers={handlers}
                    onSubmit={submitPrompt}
                    onStop={() => stopRun(activeThread.id)}
                  />
                ) : (
                  <NewThread
                    threads={threads}
                    runningTasks={runningTasks}
                    onSubmit={submitPrompt}
                    onOpenThread={openThread}
                    onOpenTasks={() => setTasksOpen(true)}
                  />
                )}
              </>
            ) : view === "train" ? (
              <TrainView tab={trainTab} onTabChange={setTrainTab} />
            ) : view === "playground" ? (
              <PlaygroundView tab={playgroundTab} onTabChange={setPlaygroundTab} />
            ) : view === "deploy" ? (
              <DeployView />
            ) : view === "insights" ? (
              <InsightsView />
            ) : view === "changelog" ? (
              <ChangelogView />
            ) : view === "patterns" ? (
              <PatternsView
                selected={patternPath}
                onSelect={setPatternPath}
                category={patternCategory}
                onCategory={setPatternCategory}
                onAsk={(entry) => submitPrompt(`Tell me about ${entry.title}`, { kind: "pattern", entry })}
              />
            ) : view === "skill" ? (
              <SkillView
                version={skillVersion}
                onOpenPatterns={openPatterns}
                onTry={(example) => submitPrompt(example.prompt, flowForExample(example))}
              />
            ) : view === "connectors" ? (
              <ConnectorsView connectors={connectors} setConnectors={setConnectors} onToast={setToast} />
            ) : view === "workflows" ? (
              <WorkflowsView slackConnected={!!connectors.find((c) => c.id === "slack")?.connected} onToast={setToast} />
            ) : (
              <SetupView
                connectors={connectors}
                skillDone={skillDone}
                teamDone={teamDone}
                onSkillDone={setSkillDone}
                onTeamDone={() => setTeamDone(true)}
                onOpenConnectors={() => navigate("connectors")}
                onOpenPattern={openPattern}
                onExit={() => openThread(null)}
                onToast={setToast}
              />
            )}
          </section>

          {/* Above the header's floating presence panel (z-30) so avatars don't poke through the drawer. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-40 flex w-full justify-end">
            <BackgroundTasksDrawer
              open={tasksOpen}
              onClose={() => setTasksOpen(false)}
              tasks={tasks}
              onStop={(id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "stopped", activity: undefined } : t)))}
              onClearFinished={() => setTasks((prev) => prev.filter((t) => t.status === "running"))}
              className="pointer-events-auto"
            />
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          groups={paletteGroups}
          placeholder="Search threads, screens, and actions…"
          emptyLabel="No matches"
          onSelect={onPaletteSelect}
        />

        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex bg-black/40 md:hidden"
              onClick={() => setMobileNav(false)}
            >
              <motion.div
                initial={{ x: -24 }}
                animate={{ x: 0 }}
                exit={{ x: -24 }}
                onClick={(e) => e.stopPropagation()}
                className="flex h-full max-w-[85vw] flex-col gap-2 overflow-y-auto bg-muted p-2"
              >
                {navSidebar}
                {view === "operator" && <div className="flex rounded-2xl border bg-background">{threadList}</div>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileMenuContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

function RailButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
        active && "bg-background text-foreground shadow-sm"
      )}
    >
      {children}
    </button>
  );
}

function IconRail({ view, onNavigate, onSearch, onHome }: { view: View; onNavigate: (v: View) => void; onSearch: () => void; onHome: () => void }) {
  return (
    <nav aria-label="Product" className="hidden w-12 shrink-0 flex-col items-center gap-2 py-2 sm:flex">
      <button
        type="button"
        onClick={onHome}
        title="New thread"
        aria-label="New thread"
        className="mb-3 flex size-10 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
      >
        <AGENT_ICON className="size-5" />
      </button>
      {RAIL.map((group, i) => (
        <React.Fragment key={group.join()}>
          {i > 0 && <div className="my-1 h-px w-6 bg-border" />}
          {group.map((id) => {
            const n = NAV_ALL.find((item) => item.id === id)!;
            return (
              <RailButton key={n.id} label={n.label} active={view === n.id} onClick={() => onNavigate(n.id)}>
                <n.icon className="size-5" />
              </RailButton>
            );
          })}
        </React.Fragment>
      ))}
      <div className="mt-auto flex flex-col items-center gap-2">
        <RailButton label="Search (⌘K)" onClick={onSearch}>
          <Search className="size-5" />
        </RailButton>
        <Link
          href="/"
          title="Back to AI Patterns"
          aria-label="Back to AI Patterns"
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>
    </nav>
  );
}

function NavSidebar({
  view,
  subView,
  onNavigate,
  setupDone,
  onToast,
}: {
  view: View;
  subView?: string;
  onNavigate: (v: View, sub?: string) => void;
  setupDone: number;
  onToast: (message: string) => void;
}) {
  function item(n: NavItem, extra?: React.ReactNode) {
    const active = view === n.id;
    return (
      <div key={n.id}>
        <button
          type="button"
          onClick={() => onNavigate(n.id)}
          aria-current={active ? "page" : undefined}
          aria-expanded={n.children ? active : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            active ? "bg-background font-medium shadow-sm ring-1 ring-border" : "hover:bg-accent"
          )}
        >
          <n.icon className="size-4" />
          <span className="flex-1 text-left">{n.label}</span>
          {extra}
          {n.children && <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", active && "rotate-90")} />}
        </button>
        <AnimatePresence initial={false}>
          {n.children && active && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l py-0.5 pl-2">
                {n.children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onNavigate(n.id, c.id)}
                    aria-current={subView === c.id ? "page" : undefined}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                      subView === c.id ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col overflow-y-auto rounded-2xl border bg-background p-3 shadow-sm">
      <h1 className="px-2 pb-4 pt-2 text-xl font-semibold tracking-tight">UX Agent</h1>
      <WorkspaceSwitcher onToast={onToast} />
      {NAV_GROUPS.map((group, i) => (
        <nav key={group.label ?? i} aria-label={group.label ?? "Agent"} className={cn("flex flex-col gap-0.5", i > 0 && "mt-5")}>
          {group.label && <p className="px-3 pb-1.5 text-xs text-muted-foreground">{group.label}</p>}
          {group.items.map((n) =>
            item(n, n.id === "patterns" ? <span className="text-xs tabular-nums text-muted-foreground">{registry.length}</span> : undefined)
          )}
        </nav>
      ))}
      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => onNavigate("patterns")}
          className="mb-3 w-full rounded-xl border border-dashed p-3 text-left transition-colors hover:bg-accent/60 [@media(max-height:760px)]:hidden"
        >
          <span className="block text-xs font-medium">A demo built from ai-patterns</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Every screen here uses the {registry.length} patterns in the Library.
          </span>
        </button>
        <nav aria-label="Settings" className="flex flex-col gap-0.5 border-t pt-3">
          {NAV_SETTINGS.map((n) =>
            item(
              n,
              n.id === "setup" && setupDone < 4 ? (
                <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">{setupDone}/4</span>
              ) : undefined
            )
          )}
        </nav>
      </div>
    </aside>
  );
}

function WorkspaceSwitcher({ onToast }: { onToast: (message: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(WORKSPACES[0].id);
  const ref = React.useRef<HTMLDivElement>(null);
  const workspace = WORKSPACES.find((w) => w.id === current)!;

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <span className={cn("flex size-6 items-center justify-center rounded-md text-white", workspace.color)}>
          <LayoutGrid className="size-3.5" />
        </span>
        <span className="flex-1 truncate text-left">{workspace.name}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-x-0 top-full z-50 mt-1 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
          >
            <p className="px-2.5 py-1.5 text-xs text-muted-foreground">Workspaces</p>
            {WORKSPACES.map((w) => (
              <button
                key={w.id}
                type="button"
                role="menuitemradio"
                aria-checked={w.id === current}
                onClick={() => {
                  setOpen(false);
                  if (w.id === current) return;
                  setCurrent(w.id);
                  onToast(`Switched to ${w.name}.`);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
              >
                <span className={cn("flex size-5 items-center justify-center rounded text-white", w.color)}>
                  <LayoutGrid className="size-3" />
                </span>
                <span className="flex-1 text-left">{w.name}</span>
                {w.id === current && <Check className="size-4 text-muted-foreground" />}
              </button>
            ))}
            <div className="my-1 border-t" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onToast("New workspaces need an admin — we sent a request to Carlos March.");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="size-4" />
              Create workspace
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThreadList({
  threads,
  activeId,
  running,
  query,
  onQuery,
  onOpen,
  onScheduled,
  scheduledCount,
}: {
  threads: Thread[];
  activeId: string | null;
  running: Record<string, boolean>;
  query: string;
  onQuery: (q: string) => void;
  onOpen: (id: string | null) => void;
  onScheduled: () => void;
  scheduledCount: number;
}) {
  const groups = (["Today", "Yesterday", "Earlier"] as const)
    .map((g) => ({ group: g, items: threads.filter((t) => t.group === g) }))
    .filter((g) => g.items.length);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <h2 className="text-lg font-semibold tracking-tight">Operator</h2>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">Beta</span>
      </div>
      <div className="px-3">
        <label className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring/40">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search threads"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => onOpen(null)}
          className={cn("mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent", activeId === null && "bg-accent font-medium")}
        >
          <Plus className="size-4" />
          New thread
        </button>
        <button type="button" onClick={onScheduled} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent">
          <Clock className="size-4" />
          <span className="flex-1 text-left">Scheduled</span>
          {scheduledCount > 0 && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />}
        </button>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {groups.map(({ group, items }) => (
          <div key={group} className="mb-3">
            <p className="px-3 py-2 text-xs text-muted-foreground">{group}</p>
            {items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpen(t.id)}
                aria-current={activeId === t.id ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  activeId === t.id && "bg-accent font-medium"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{t.title}</span>
                {running[t.id] ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-label="Working" />
                ) : t.badge ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      t.badge === "Failed"
                        ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                    )}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
        {groups.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No threads match “{query}”.</p>}
      </div>
    </aside>
  );
}

function TasksButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
    >
      <ListChecks className="size-3.5" />
      {count > 0 ? `${count} running` : "Tasks"}
      {count > 0 && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Operator panes
// ---------------------------------------------------------------------------

// Read the clock on the client only, so the server render and hydration agree.
function subscribeNever() {
  return () => {};
}

function useGreeting() {
  return React.useSyncExternalStore(
    subscribeNever,
    () => {
      const now = new Date();
      const h = now.getHours();
      const part = h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      return `${part} · ${now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
    },
    () => null
  );
}

function firstPrompt(thread: Thread) {
  const user = thread.blocks.find((b) => b.kind === "user");
  return user && user.kind === "user" ? user.text : "No messages yet";
}

function NewThread({
  threads,
  runningTasks,
  onSubmit,
  onOpenThread,
  onOpenTasks,
}: {
  threads: Thread[];
  runningTasks: number;
  onSubmit: (prompt: string) => void;
  onOpenThread: (id: string) => void;
  onOpenTasks: () => void;
}) {
  const greeting = useGreeting();
  const attention = threads.filter((t) => t.badge);
  const recent = threads.filter((t) => !t.badge && t.blocks.length > 0).slice(0, 6);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 pb-12 pt-10 sm:px-8 lg:pt-[8vh]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        >
          <motion.span
            initial={{ rotate: -12, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm"
          >
            <AGENT_ICON className="size-7" />
          </motion.span>
          <p className="mt-5 h-5 text-sm text-muted-foreground">{greeting}</p>
          <h3 className="mt-1 text-balance font-serif text-3xl tracking-tight sm:text-5xl">Hey {USER_NAME}, what&apos;s on your mind?</h3>

          {(attention.length > 0 || runningTasks > 0) && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {attention.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onOpenThread(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    t.badge === "Failed"
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                      : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  )}
                >
                  {t.badge === "Failed" ? <CircleAlert className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
                  {t.badge}: {t.title}
                </button>
              ))}
              {runningTasks > 0 && (
                <button
                  type="button"
                  onClick={onOpenTasks}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {runningTasks} background {runningTasks === 1 ? "task" : "tasks"} running
                </button>
              )}
            </div>
          )}

          <PromptBar
            placeholder="Ask anything — / for commands, @ for sources"
            sources={COMPOSER_SOURCES}
            commands={COMPOSER_COMMANDS}
            models={[
              { id: "fast", label: `${AGENT_NAME} Fast` },
              { id: "deep", label: `${AGENT_NAME} Deep research` },
            ]}
            onSubmit={onSubmit}
            className="mt-8 w-full text-left"
          />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {COMPOSER_SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSubmit(s.label)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {s.icon && <s.icon className="size-3.5" />}
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        <section aria-labelledby="start-with" className="mt-12">
          <h4 id="start-with" className="mb-3 text-sm font-medium text-muted-foreground">
            Start with
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {STARTER_CARDS.map((card, i) => (
              <motion.button
                key={card.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                onClick={() => onSubmit(card.prompt)}
                className="group flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-colors hover:bg-accent/60"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <card.icon className="size-4.5" />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{card.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{card.description}</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  Ask {AGENT_NAME}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section aria-labelledby="recent" className="mt-10">
            <h4 id="recent" className="mb-3 text-sm font-medium text-muted-foreground">
              Pick up where you left off
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onOpenThread(t.id)}
                  className="flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-accent/60"
                >
                  <MessagesSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{firstPrompt(t)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{t.group}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ThreadPane({
  thread,
  generating,
  handlers,
  onSubmit,
  onStop,
}: {
  thread: Thread;
  generating: boolean;
  handlers: BlockHandlers;
  onSubmit: (prompt: string) => void;
  onStop: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const lastThread = React.useRef(thread.id);

  React.useEffect(() => {
    const switched = lastThread.current !== thread.id;
    lastThread.current = thread.id;
    if (switched) {
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.id, thread.blocks.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-6 py-8">
          {thread.blocks.map((block) => (
            <BlockView key={block.id} block={block} handlers={handlers} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="shrink-0 border-t bg-background/80 px-6 pb-5 pt-4 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl">
          <PromptBarPro
            key={thread.id}
            suggestions={COMPOSER_SUGGESTIONS}
            visibleCount={2}
            sources={COMPOSER_SOURCES}
            commands={COMPOSER_COMMANDS}
            environments={[
              { id: "repo", label: "carlosmarch/ai-patterns" },
              { id: "figma", label: "Figma · Chat screen v2" },
            ]}
            orchestrators={[
              { id: "origami", label: AGENT_NAME },
              { id: "reviewer", label: "Spec reviewer" },
            ]}
            placeholder={`Reply to ${AGENT_NAME}…`}
            onSubmit={onSubmit}
            generating={generating}
            onStop={onStop}
          />
        </div>
      </div>
    </div>
  );
}
