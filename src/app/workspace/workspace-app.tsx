"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  ChartColumn,
  ChevronRight,
  Clock,
  FlaskConical,
  Globe,
  History,
  LayoutGrid,
  ListChecks,
  Lock,
  MessagesSquare,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Plus,
  Search,
  Share,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { registry, type RegistryEntry } from "@/registry";
import type { SkillExample } from "@/app/skill/skill-examples";
import { BackgroundTasksDrawer, type BackgroundTask } from "@/registry/agents/background-tasks/component";
import { CollaborativePresence } from "@/registry/collaboration/collaborative-presence/component";
import { CommandPalette, type CommandPaletteGroup, type CommandPaletteItem } from "@/registry/navigation/command-palette/component";
import { ArtifactPanel, ArtifactSplit } from "@/registry/messages/artifact-panel/component";
import { AutonomyModePicker } from "@/registry/composer/autonomy-mode/component";
import { ContextUsage } from "@/registry/indicators/context-usage/component";
import { DrawingIcon } from "@/registry/loaders/drawing-icon/component";
import { IncognitoToggle, TemporaryChatBanner } from "@/registry/composer/incognito-toggle/component";
import { ModelPicker } from "@/registry/composer/model-picker/component";
import { PromptBarPro } from "@/registry/composer/prompt-bar-pro/component";
import { PromptWizard } from "@/registry/composer/prompt-wizard/component";
import { QuickChatDock } from "@/registry/composer/quick-chat-dock/component";
import { ShareSessionDialog } from "@/registry/access/share-session/component";
import type { ClarifyingAnswers } from "@/registry/messages/clarifying-questions/component";
import type { AccessRequestDecision } from "@/registry/permissions/access-request/component";
import type { PlanStep } from "@/registry/agents/plan-review/component";
import type { Task } from "@/registry/agents/task-list/component";
import type { Agent } from "@/registry/traces/multi-agent-trace/component";
import type { AnalysisItem } from "@/registry/loaders/analysis-list/component";
import type { LogLine } from "@/registry/code/terminal-stream/component";
import type { RunStep } from "@/registry/agents/agent-run-card/component";
import type { StreamSegment } from "@/registry/text/streaming-text/component";

import {
  AGENT_ICON,
  AGENT_NAME,
  AUDIT_ATTACHMENT,
  AUDIT_ITEMS,
  AUTONOMY_CAPABILITIES,
  AUTONOMY_MODES,
  COMPOSER_COMMANDS,
  COMPOSER_SOURCES,
  CONTEXT_LIMIT,
  EXPLORE_FOLLOW_UPS,
  FIX_PLAN,
  FIX_PLAN_ALT,
  FIX_SOURCE,
  GUIDANCE_DIFF,
  GUIDANCE_ITEMS,
  GUIDANCE_MEMORY,
  GUIDANCE_QUESTIONS,
  JOURNEY,
  JOURNEY_PATTERNS,
  MODELS,
  RESEARCH_SOURCES,
  RESEARCH_THOUGHTS,
  SHIP_RUN,
  SKILL_BUILD_DIFF,
  SKILL_BUILD_SCRIPT,
  SPEC_PLAN,
  SPEC_QUESTIONS,
  SPEC_WIZARD_STEPS,
  SPIKE_LIVE_AGENTS,
  SPIKE_SOURCES,
  STARTER_CARDS,
  TEAM,
  USER_NAME,
  WEEKLY_SOURCES,
  WEEKLY_TRACE,
  buildSpecPrompt,
  contextSegments,
  favicon,
  specSource,
  specThoughts,
  tickSpikeAgents,
} from "./data";
import { entryPath, findEntry, firstBullet, loadSource, matchEntry, relatedEntries, specSection } from "./catalogue";
import { PatternsView, SkillView } from "./library";
import { InsightsView, type InsightsTab } from "./insights";
import { BlockView, nextId, segmentsText, toArtifact, type Block, type BlockBody, type BlockHandlers, type Thread } from "./thread";
import {
  CONNECTORS,
  ChangelogView,
  ConnectorsView,
  AgentsView,
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
  | "insights"
  | "train"
  | "playground"
  | "agents"
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
}

// Progressive disclosure, starting with the navigation: a new thread, search
// and the pattern Library are always one click away. Everything that
// configures the agent or reports on it is real, but it isn't what you need
// on day one — it waits behind More, which opens on its own when you land on
// one of those views (from ⌘K, Setup or a link).
const PRIMARY_NAV: NavItem[] = [{ id: "patterns", label: "Patterns", icon: LayoutGrid }];

const MORE_NAV: NavItem[] = [
  { id: "playground", label: "Playground", icon: FlaskConical },
  { id: "train", label: "Train", icon: BookOpen },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "insights", label: "Insights", icon: ChartColumn },
  { id: "skill", label: "Skill", icon: Package },
  { id: "changelog", label: "What's new", icon: History },
];

const NAV_SETUP: NavItem = { id: "setup", label: "Setup", icon: ListChecks };

const NAV_ALL: NavItem[] = [{ id: "operator", label: "Threads", icon: MessagesSquare }, ...PRIMARY_NAV, ...MORE_NAV, NAV_SETUP];

const CANCELLED = Symbol("cancelled");

function text(content: string): StreamSegment[] {
  return [{ type: "text", content }];
}

function titleFrom(prompt: string) {
  const clean = prompt.replace(/[?.!]+$/, "");
  return clean.length > 40 ? `${clean.slice(0, 38).trimEnd()}…` : clean;
}

type Flow =
  | { kind: "audit" | "fix" | "ship" }
  | { kind: "spike" | "guidance" | "bulk" | "summary" | "explore" | "list" | "review" | "research" | "default" }
  | { kind: "spec"; topic: string }
  | { kind: "pattern" | "scaffold"; entry: RegistryEntry; viaSkill?: boolean };

// Which scripted flow a prompt should run. Prompts that name a pattern are
// answered from its real spec, ahead of the keyword flows, so "scaffold the
// stop generation button" isn't read as a Stop-click question. Anything
// unrecognized gets the generic research flow, so free-typed prompts still
// feel answered.
function flowFor(prompt: string): Flow {
  const p = prompt.toLowerCase();
  // The guided journey's three steps come first, so "Ship it" is never read as something else.
  if (p === JOURNEY.audit.toLowerCase() || /\baudit\b.*\bscreen\b/.test(p)) return { kind: "audit" };
  if (p === JOURNEY.fix.toLowerCase()) return { kind: "fix" };
  if (p === JOURNEY.ship.toLowerCase()) return { kind: "ship" };
  const entry = matchEntry(p);
  const spec = prompt.match(/\b(?:draft|write)\b.*?\bspec\b(?:\s+for)?\s+(?:an?\s+|the\s+)?(.+?)(?:\s+pattern)?(?:[,.:—]|$)/i);
  if (spec && !entry) return { kind: "spec", topic: spec[1].replace(/^(?:pattern|a pattern)\s+/i, "").replace(/\b\w/g, (c) => c.toUpperCase()) };
  if (entry) return { kind: /^(scaffold|build|add|apply|swap)\b/.test(p) ? "scaffold" : "pattern", entry };
  if (p.includes("research") || p.includes("competitor") || p.includes("other products")) return { kind: "research" };
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
  /** The text of the last thing `say` streamed, for Copy under the answer. */
  lastText: () => string;
}

export function WorkspaceApp({ skillVersion }: { skillVersion: string }) {
  const [view, setView] = React.useState<View>("operator");
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [tasksOpen, setTasksOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<BackgroundTask[]>([]);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [trainTab, setTrainTab] = React.useState<TrainTab>("procedures");
  const [playgroundTab, setPlaygroundTab] = React.useState<PlaygroundTab>("chat");
  const [connectors, setConnectors] = React.useState<ConnectorDef[]>(CONNECTORS);
  const [skillDone, setSkillDone] = React.useState(false);
  const [teamDone, setTeamDone] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [patternPath, setPatternPath] = React.useState<string | null>(null);
  const [patternCategory, setPatternCategory] = React.useState<string | null>(null);
  const [insightsTab, setInsightsTab] = React.useState<InsightsTab>("usage");
  const [temporary, setTemporary] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
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

    let last = "";
    const r: Runner = {
      lastText: () => last,
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
        last = segmentsText(segments);
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
        { title: `${entry.title} — UX spec`, domain: "ai-patterns.app", url: `/patterns/${entryPath(entry)}`, faviconUrl: favicon("github.com") },
        { title: "carlosmarch/ai-patterns", domain: "github.com", url: `https://github.com/carlosmarch/ai-patterns/tree/main/src/registry/${entryPath(entry)}`, faviconUrl: favicon("github.com") },
      ],
    });
    r.add({ kind: "followups", items: [`Scaffold ${entry.title}`, ...relatedEntries(entry).slice(0, 2).map((e) => `Tell me about ${e.title}`)] });
  }

  async function runFlow(r: Runner, flow: Flow) {
    switch (flow.kind) {
      // ---- The guided journey: each step ends on exactly one obvious next step.
      case "audit": {
        await r.think(900);
        await r.tool({ toolKind: "file", verb: "Reading", target: "chat-screen-v2.png", result: "Found 4 AI components on screen" });
        await r.tool({ toolKind: "search", verb: "Matching", target: "them to the catalogue", result: `Compared against ${registry.length} pattern specs` });
        const { id, value } = await r.until<AnalysisItem[]>((done) => ({
          kind: "analysis",
          items: AUDIT_ITEMS.map((item, i) => ({ ...item, status: i === 0 ? "loading" : "pending" })),
          live: { onDone: done },
        }));
        r.update(id, { items: value, live: undefined } as Partial<Block>);
        await r.say(text("Three of the four drift from their spec, and each has a pattern that fixes it. The chat bubble is already up to spec."));
        r.add({ kind: "catalogue", paths: ["buttons/stop-generation-button", "loaders/tool-call-chip", "loaders/thinking-loader"] });
        r.add({ kind: "followups", items: [JOURNEY.fix] });
        return;
      }

      case "fix": {
        await r.think(700);
        await r.say(text("Here's my plan. Edit or reorder any step before I touch the code:"));
        const plan = await r.until<PlanStep[]>((done) => ({
          kind: "plan",
          title: "Plan for the fixes",
          steps: FIX_PLAN,
          alternative: FIX_PLAN_ALT,
          estimate: "~30 s · 3 files",
          approveLabel: "Approve and fix",
          onDone: done,
        }));
        await r.wait(500);
        r.remove(plan.id);
        const tasks = await r.until<Task[]>((done) => ({
          kind: "tasks",
          tasks: plan.value.map((step, i) => ({ id: step.id, label: step.text, status: i === 0 ? "in_progress" : "pending" })),
          live: { onDone: done },
        }));
        r.update(tasks.id, { tasks: tasks.value, live: undefined } as Partial<Block>);
        // The artifact panel slides open on its own while the changes are written.
        const artifact = { id: "chat-fixes", title: "Chat screen fixes", kind: "3 files changed", view: "diff" as const, versions: [{ id: "v1", note: "3 files · +6 −3", source: FIX_SOURCE }] };
        const artifactId = r.add({ kind: "artifact", artifact, generating: true });
        await r.wait(1800);
        r.update(artifactId, { generating: false } as Partial<Block>);
        await r.say(text("Done. Flip through the three files in the panel. Nothing ships until you say so."));
        r.add({ kind: "followups", items: [JOURNEY.ship] });
        return;
      }

      case "ship":
        await r.think(500);
        await r.say(text("Shipping builds the app and pushes a branch, so I need your OK first:"));
        r.add({
          kind: "approval",
          action: "ship",
          toolName: "Bash",
          summary: "Build, check and push the fixes",
          detail: "npm run build && git push origin fix/chat-screen-patterns",
        });
        return;

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
        await r.say(text("A full audit reads every component in src/. Here's what it'll cost before I start:"));
        const cost = await r.until<void>((done) => ({ kind: "cost", onRun: () => done() }));
        r.remove(cost.id);
        r.add({ kind: "note", text: "You started the audit · 36 credits" });
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
        r.add({ kind: "memory-notice", text: GUIDANCE_MEMORY });
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

      case "spec": {
        const { topic } = flow;
        await r.think(600);
        await r.say(text(`I'll draft the ${topic} spec in the catalogue's eight-section template. First:`));
        const clarify = await r.until<ClarifyingAnswers>((done) => ({ kind: "clarify", questions: SPEC_QUESTIONS, onDone: done }));
        r.update(clarify.id, { onDone: undefined } as Partial<Block>);
        const thought = await r.until<void>((done) => ({ kind: "thought", thoughts: specThoughts(topic), live: { onDone: () => done() } }));
        r.update(thought.id, { live: undefined, duration: 7 } as Partial<Block>);
        const plan = await r.until<PlanStep[]>((done) => ({ kind: "plan", steps: SPEC_PLAN, estimate: "~1 min · 12 credits", onDone: done }));
        // Once approved, the plan *becomes* the progress list — one card, not a plan followed by a copy of it.
        await r.wait(500);
        r.remove(plan.id);
        const tasks = await r.until<Task[]>((done) => ({
          kind: "tasks",
          tasks: plan.value.map((step, i) => ({ id: step.id, label: step.text, status: i === 0 ? "in_progress" : "pending" })),
          live: { onDone: done },
        }));
        r.update(tasks.id, { tasks: tasks.value, live: undefined } as Partial<Block>);
        const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const draft = { id: "v1", note: "First draft", source: specSource(topic) };
        const artifactId = r.add({ kind: "artifact", artifact: { id: slug, title: `${topic} — UX spec`, kind: "Spec", versions: [draft] }, generating: true });
        await r.wait(1600);
        r.update(artifactId, {
          generating: false,
          artifact: { id: slug, title: `${topic} — UX spec`, kind: "Spec", versions: [draft, { id: "v2", note: "Tightened after self-review", source: specSource(topic, true) }] },
        } as Partial<Block>);
        await r.say(text(`Drafted ${topic} and tightened it to the essentials — both versions are in the panel. Tell me which sections to expand before it goes to review.`));
        r.add({ kind: "followups", items: ["Tell me about Human in the Loop", "Review my guidelines"] });
        return;
      }

      case "research": {
        await r.think(600);
        await r.say(text("The products worth checking publish their changes outside the domains I'm allowed to read. I need your OK first:"));
        const access = await r.until<AccessRequestDecision>((done) => ({ kind: "access", onDecision: done }));
        r.update(access.id, { onDecision: undefined } as Partial<Block>);
        if (access.value === "deny") {
          await r.say(text("Understood — I'll stick to the registry. Agent Run Card and Task List are the closest patterns we already ship."));
          return;
        }
        await r.tool({ toolKind: "network", verb: "Fetching", target: "3 changelogs", result: "Read 41 entries from the last 90 days" });
        const thought = await r.until<void>((done) => ({ kind: "thought", thoughts: RESEARCH_THOUGHTS, live: { onDone: () => done() } }));
        r.update(thought.id, { live: undefined, duration: 9 } as Partial<Block>);
        await r.say([
          { type: "text", content: "All three show a step list while the agent runs and fold it into a summary when it's done — that's Agent Run Card " },
          { type: "source", label: "linear.app" },
          { type: "text", content: ". Only Cursor lets you stop a single step, which nothing in the catalogue covers yet." },
        ]);
        r.add({ kind: "sources", sources: RESEARCH_SOURCES });
        r.add({ kind: "followups", items: ["Draft a spec for Step Stop Control", "Tell me about Agent Run Card"] });
        return;
      }

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
          { type: "source", label: "ai-patterns.app" },
          {
            type: "text",
            content:
              " — start from the pattern whose Behavior section matches your flow, then check its Accessibility section before you change anything. Want me to shortlist the top three and scaffold one?",
          },
        ]);
        r.add({ kind: "followups", items: ["Shortlist the top three", "Scaffold the best fit"] });
    }
  }

  // Runs a flow, then puts Copy / rate / regenerate under the answer.
  function answer(threadId: string, prompt: string, flow: Flow) {
    startRun(threadId, async (r) => {
      await runFlow(r, flow);
      const said = r.lastText();
      if (!said) return;
      // A turn that ends waiting on your permission isn't an answer yet, so nothing to copy or rate.
      if (flow.kind === "ship" || flow.kind === "bulk") return;
      // Actions belong to the answer, so they go above any follow-up suggestions, not after them.
      const actions: Block = { id: nextId("actions"), kind: "actions", text: said, prompt };
      patchThread(threadId, (t) => {
        const last = t.blocks[t.blocks.length - 1];
        return last?.kind === "followups"
          ? { ...t, blocks: [...t.blocks.slice(0, -1), actions, last] }
          : { ...t, blocks: [...t.blocks, actions] };
      });
    });
  }

  function submitPrompt(prompt: string, flow: Flow = flowFor(prompt)) {
    const raw = prompt.trim();
    if (!raw) return;
    let threadId = activeThread?.id;

    if (!threadId || view !== "operator") {
      threadId = nextId("thread");
      const title = flow.kind === "audit" ? "Chat screen audit" : titleFrom(raw);
      const thread: Thread = { id: threadId, title, blocks: [], temporary: temporary || undefined };
      setThreads((prev) => [thread, ...prev.filter((t) => !t.temporary)]);
      setActiveId(threadId);
      setView("operator");
      setTemporary(false);
    } else if (running[threadId]) {
      return;
    }

    const id = threadId;
    // The audit is about a screen, so the screenshot rides along with the prompt.
    const attachment = flow.kind === "audit" ? AUDIT_ATTACHMENT : undefined;
    // Suggestions are spent once you reply, so they leave instead of piling up in the history.
    patchThread(id, (t) => ({
      ...t,
      blocks: [...t.blocks.filter((b) => b.kind !== "followups"), { id: nextId("u"), kind: "user", text: raw, attachment }],
    }));
    answer(id, raw, flow);
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
    onToast: setToast,
    onManageMemory: () => navigate("train", "memory"),
    onRegenerate(blockId, prompt) {
      if (!activeThread || running[activeThread.id]) return;
      const threadId = activeThread.id;
      patchThread(threadId, (t) => ({
        ...t,
        blocks: [...t.blocks.filter((b) => b.id !== blockId), { id: nextId("note"), kind: "note", text: "Regenerated" }],
      }));
      answer(threadId, prompt, flowFor(prompt));
    },
    onUpgrade: () => setToast("Team plans unlock longer generations — ask your workspace admin."),
    onOpenLibrary: () => openPatterns(),
    onApproval(blockId, action, decision) {
      if (!activeThread) return;
      const threadId = activeThread.id;
      patchThread(threadId, (t) => ({
        ...t,
        blocks: t.blocks.map((b) => (b.id === blockId ? ({ ...b, decided: decision } as Block) : b)),
      }));

      if (decision === "deny") {
        startRun(threadId, async (r) => {
          await r.say(text("Understood — I won't run it. The changes stay on the branch for you to review."));
        });
        return;
      }

      const isSkill = action === "skill-build";
      const command = isSkill ? "npm run skill:build" : "npm run build && git push";
      const taskId = nextId("task");
      // The first background job is what brings the Tasks button into the header.
      upsertTask({
        id: taskId,
        title: isSkill ? "Rebuild skill reference docs" : "Ship chat screen fixes",
        kind: "shell",
        kindLabel: "Bash",
        status: "running",
        elapsedSeconds: 0,
        activity: "Running",
        command,
      });

      startRun(threadId, async (r) => {
        let output: string;
        if (isSkill) {
          const { id, value } = await r.until<LogLine[]>((done) => ({
            kind: "terminal",
            command,
            lines: [],
            live: { script: SKILL_BUILD_SCRIPT, onDone: done },
          }));
          r.update(id, { lines: value, live: undefined } as Partial<Block>);
          output = value.map((l) => l.text).join("\n");
        } else {
          // A multi-step run reads better as a run card than as raw logs.
          const { id, value } = await r.until<{ steps: RunStep[]; elapsed: number }>((done) => ({
            kind: "run",
            title: "Ship the chat screen fixes",
            doneLabel: "Shipped the chat screen fixes",
            script: SHIP_RUN,
            live: { onDone: (steps, elapsed) => done({ steps, elapsed }) },
          }));
          r.update(id, { steps: value.steps, elapsed: value.elapsed, live: undefined } as Partial<Block>);
          output = value.steps.map((s) => `${s.label} · ${s.detail}`).join("\n");
        }
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "done", activity: undefined, output } : t)));
        if (isSkill) {
          r.add({ kind: "diff", files: SKILL_BUILD_DIFF, timestamp: "just now" });
          await r.wait(300);
          await r.say(text("Rebuilt — 47 specs are in the skill now, including the three new agent patterns. I bumped the plugin version too."));
          return;
        }
        await r.say(text("Shipped. PR #128 is open with all three fixes, and I'll tell you when CI is green."));
        await r.wait(500);
        r.add({ kind: "recap", paths: JOURNEY_PATTERNS });
        r.add({ kind: "followups", items: ["Draft a spec for Step Stop Control", "Why are users stopping long answers?"] });
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
        ...(tasks.length
          ? [{ id: "action:tasks", label: "Show background tasks", icon: Clock, meta: runningTasks ? `${runningTasks} running` : undefined }]
          : []),
        { id: "action:registry", label: "Browse the pattern registry", icon: LayoutGrid },
      ],
    },
    ...(threads.length
      ? [{ label: "Threads", items: threads.slice(0, 6).map((t) => ({ id: `thread:${t.id}`, label: t.title, icon: MessagesSquare })) }]
      : []),
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
    if (next === "insights" && sub) setInsightsTab(sub as InsightsTab);
    setMobileNav(false);
  }

  function openThread(id: string | null) {
    // Temporary threads are dropped as soon as you leave them — that's the promise.
    setThreads((prev) => prev.filter((t) => !t.temporary || t.id === id));
    setView("operator");
    setActiveId(id);
    setMobileNav(false);
  }

  const hasAnswer = !!activeThread?.blocks.some((b) => b.kind === "actions" || b.kind === "recap");
  const shared = activeThread?.visibility === "public";

  const navSidebar = (
    <NavSidebar
      view={view}
      onNavigate={(v) => navigate(v)}
      onNewThread={() => openThread(null)}
      onSearch={() => setPaletteOpen(true)}
      threads={threads}
      activeId={view === "operator" ? activeId : null}
      running={running}
      onOpenThread={openThread}
      setupDone={setupDone}
      onCollapse={() => setCollapsed(true)}
    />
  );

  return (
    <MobileMenuContext.Provider value={openMobileNav}>
      <div className="flex h-full w-full gap-2 bg-muted/60 p-2 text-foreground dark:bg-black">
        {/* The rail is the collapsed sidebar: shown instead of it, never beside it. */}
        <IconRail
          view={view}
          onNavigate={(v) => navigate(v)}
          onSearch={() => setPaletteOpen(true)}
          onHome={() => openThread(null)}
          onExpand={() => setCollapsed(false)}
          setupDone={setupDone}
          className={collapsed ? "sm:flex" : "sm:flex md:hidden"}
        />

        {!collapsed && <div className="hidden md:flex">{navSidebar}</div>}

        <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <section className="flex min-w-0 flex-1 flex-col">
            {view === "operator" ? (
              <>
                <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
                  <MobileMenuButton />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h2
                      key={activeThread?.id ?? "new"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight"
                    >
                      {activeThread?.title ?? "New thread"}
                    </motion.h2>
                  </AnimatePresence>
                  {/* Header controls appear the first time they have something to act on. */}
                  <div className="flex shrink-0 items-center gap-2">
                    <AnimatePresence initial={false}>
                      {shared && (
                        // Fixed-size slot so the presence panel floats over the thread instead of stretching the header.
                        <Reveal key="presence" className="relative hidden h-8 w-[7.5rem] xl:block">
                          <CollaborativePresence collaborators={TEAM} visibleCap={3} className="absolute right-0 top-0 z-30" />
                        </Reveal>
                      )}
                      {!activeThread && (
                        <Reveal key="temporary">
                          <IncognitoToggle active={temporary} onActiveChange={setTemporary} label="Temporary" />
                        </Reveal>
                      )}
                      {activeThread && hasAnswer && !activeThread.temporary && (
                        <Reveal key="share">
                          <ShareThreadButton
                            thread={activeThread}
                            onVisibility={(visibility) => {
                              patchThread(activeThread.id, (t) => ({ ...t, visibility }));
                              if (visibility === "public") setToast("Link copied — Ana and James can follow along now.");
                            }}
                          />
                        </Reveal>
                      )}
                      {tasks.length > 0 && (
                        <Reveal key="tasks">
                          <TasksButton count={runningTasks} onClick={() => setTasksOpen((o) => !o)} />
                        </Reveal>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {activeThread ? (
                  <ThreadPane
                    key={activeThread.id}
                    thread={activeThread}
                    generating={!!running[activeThread.id]}
                    handlers={handlers}
                    onSubmit={submitPrompt}
                    onStop={() => stopRun(activeThread.id)}
                  />
                ) : (
                  <NewThread onSubmit={submitPrompt} temporary={temporary} onTemporary={setTemporary} />
                )}
              </>
            ) : view === "train" ? (
              <TrainView tab={trainTab} onTabChange={setTrainTab} />
            ) : view === "playground" ? (
              <PlaygroundView tab={playgroundTab} onTabChange={setPlaygroundTab} />
            ) : view === "insights" ? (
              <InsightsView tab={insightsTab} onTabChange={setInsightsTab} onToast={setToast} />
            ) : view === "agents" ? (
              <AgentsView onToast={setToast} />
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

          {/* Ask Origami from any other view; a question opens a new thread. */}
          {view !== "operator" && view !== "playground" && (
            <QuickChatDock
              placeholder={`Ask ${AGENT_NAME} about this page…`}
              onSubmit={(value) => submitPrompt(value)}
              onOpenAgent={(draft) => (draft.trim() ? submitPrompt(draft) : openThread(null))}
            />
          )}

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

/** Header controls fade and scale in the first time they're needed, so new chrome is noticed, not sprung. */
function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function IconRail({
  view,
  onNavigate,
  onSearch,
  onHome,
  onExpand,
  setupDone,
  className,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onSearch: () => void;
  onHome: () => void;
  onExpand: () => void;
  setupDone: number;
  className?: string;
}) {
  return (
    <nav aria-label="Product" className={cn("hidden w-12 shrink-0 flex-col items-center gap-1 overflow-y-auto py-2", className)}>
      <button
        type="button"
        onClick={onHome}
        title="New thread"
        aria-label="New thread"
        className="mb-3 flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
      >
        <AGENT_ICON className="size-5" />
      </button>
      <RailButton label="Search (⌘K)" onClick={onSearch}>
        <Search className="size-5" />
      </RailButton>
      {PRIMARY_NAV.map((n) => (
        <RailButton key={n.id} label={n.label} active={view === n.id} onClick={() => onNavigate(n.id)}>
          <n.icon className="size-5" />
        </RailButton>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1 pt-3">
        <RailButton label={setupDone < 4 ? `Setup (${setupDone}/4)` : "Setup"} active={view === "setup"} onClick={() => onNavigate("setup")}>
          <ListChecks className="size-5" />
        </RailButton>
        <Link
          href="/"
          title="Back to AI Patterns"
          aria-label="Back to AI Patterns"
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="hidden md:block">
          <RailButton label="Expand sidebar" onClick={onExpand}>
            <PanelLeftOpen className="size-5" />
          </RailButton>
        </span>
      </div>
    </nav>
  );
}

function NavSidebar({
  view,
  onNavigate,
  onNewThread,
  onSearch,
  threads,
  activeId,
  running,
  onOpenThread,
  setupDone,
  onCollapse,
}: {
  view: View;
  onNavigate: (v: View) => void;
  onNewThread: () => void;
  onSearch: () => void;
  threads: Thread[];
  activeId: string | null;
  running: Record<string, boolean>;
  onOpenThread: (id: string) => void;
  setupDone: number;
  onCollapse: () => void;
}) {
  const inMore = MORE_NAV.some((n) => n.id === view);
  const [moreOpen, setMoreOpen] = React.useState(inMore);
  // Landing on a view behind More (from ⌘K or a link) opens it, so you can see where you are.
  const [lastInMore, setLastInMore] = React.useState(inMore);
  if (inMore !== lastInMore) {
    setLastInMore(inMore);
    if (inMore) setMoreOpen(true);
  }
  const reduce = useReducedMotion();

  function item(n: NavItem, extra?: React.ReactNode) {
    const active = view === n.id;
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => onNavigate(n.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
          active ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
      >
        <n.icon className="size-4" />
        <span className="flex-1 text-left">{n.label}</span>
        {extra}
      </button>
    );
  }

  const rowClass = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground";

  return (
    <aside className="flex w-60 shrink-0 flex-col overflow-y-auto rounded-2xl border bg-background p-3 shadow-sm">
      <div className="flex shrink-0 items-center gap-2 px-1 pb-4 pt-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <AGENT_ICON className="size-4" />
        </span>
        <h1 className="flex-1 text-lg font-semibold tracking-tight">{AGENT_NAME}</h1>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <nav aria-label="Agent" className="flex shrink-0 flex-col gap-0.5">
        <button
          type="button"
          onClick={onNewThread}
          aria-current={view === "operator" && activeId === null ? "page" : undefined}
          className={cn(
            "mb-1 flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent",
            view === "operator" && activeId === null && "bg-accent"
          )}
        >
          <Plus className="size-4" />
          New thread
        </button>
        <button type="button" onClick={onSearch} className={rowClass}>
          <Search className="size-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="font-sans text-[11px] text-muted-foreground/70">⌘K</kbd>
        </button>
        {PRIMARY_NAV.map((n) =>
          item(n, n.id === "patterns" ? <span className="text-xs tabular-nums text-muted-foreground">{registry.length}</span> : undefined)
        )}
        <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen} className={rowClass}>
          <ChevronRight className={cn("size-4 transition-transform", moreOpen && "rotate-90")} />
          <span className="flex-1 text-left">More</span>
        </button>
        <AnimatePresence initial={false}>
          {moreOpen && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="ml-[1.375rem] flex flex-col gap-0.5 border-l pl-2">{MORE_NAV.map((n) => item(n))}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Recents doesn't exist until there's something to come back to. */}
      <AnimatePresence initial={false}>
        {threads.length > 0 && (
          <motion.section
            aria-label="Recent threads"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex shrink-0 flex-col"
          >
            <p className="px-3 pb-1.5 text-xs text-muted-foreground">Recents</p>
            <ul className="flex flex-col gap-0.5">
              <AnimatePresence initial={false}>
                {threads.map((t) => (
                  <motion.li
                    key={t.id}
                    layout
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenThread(t.id)}
                      aria-current={activeId === t.id ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent/60",
                        activeId === t.id ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      {running[t.id] ? (
                        <DrawingIcon icon="origami" size={14} label="Working" className="shrink-0 text-muted-foreground" />
                      ) : t.temporary ? (
                        <span className="shrink-0 rounded-full border border-dashed px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Temporary</span>
                      ) : null}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="mt-auto flex shrink-0 flex-col gap-0.5 pt-5">
        {setupDone < 4 && (
          <button
            type="button"
            onClick={() => onNavigate("setup")}
            aria-current={view === "setup" ? "page" : undefined}
            className={cn("mb-2 rounded-xl border p-3 text-left transition-colors hover:bg-accent/60", view === "setup" && "bg-accent")}
          >
            <span className="flex items-center justify-between text-sm font-medium">
              Finish setting up
              <span className="text-xs tabular-nums text-muted-foreground">{setupDone}/4</span>
            </span>
            <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="block h-full rounded-full bg-foreground"
                initial={false}
                animate={{ width: `${(setupDone / 4) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </span>
          </button>
        )}
        <Link href="/" className={rowClass}>
          <ArrowLeft className="size-4" />
          Back to AI Patterns
        </Link>
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

const COMPOSER_PROPS = {
  // Suggestions live in the starter cards on Home and in each answer's follow-ups, not above the composer.
  suggestions: [],
  sources: COMPOSER_SOURCES,
  commands: COMPOSER_COMMANDS,
  environments: [
    { id: "repo", label: "carlosmarch/ai-patterns" },
    { id: "figma", label: "Figma · Chat screen v2" },
  ],
  orchestrators: [
    { id: "origami", label: AGENT_NAME },
    { id: "reviewer", label: "Spec reviewer" },
  ],
};

/**
 * Home asks one question and offers three ways in. The first card is the
 * guided journey, so it says "Start here"; the spec card swaps the composer
 * for the guided wizard in place rather than starting a thread with no input.
 */
function NewThread({
  onSubmit,
  temporary,
  onTemporary,
}: {
  onSubmit: (prompt: string) => void;
  temporary: boolean;
  onTemporary: (temporary: boolean) => void;
}) {
  const greeting = useGreeting();
  const [wizard, setWizard] = React.useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <motion.span
            initial={reduce ? false : { rotate: -12, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm"
          >
            <AGENT_ICON className="size-6" />
          </motion.span>
          <p className="mt-5 h-5 text-sm text-muted-foreground">{greeting}</p>
          <h3 className="mt-1 text-balance font-serif text-3xl tracking-tight sm:text-4xl">
            {wizard ? "Let's draft a pattern spec" : <>Hey {USER_NAME}, what are we designing?</>}
          </h3>
        </motion.div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <TemporaryChatBanner
            active={temporary}
            description="This thread won't appear in your history or train Origami's memory, and it's gone when you leave it."
            onExit={() => onTemporary(false)}
          />
          <AnimatePresence mode="wait" initial={false}>
            {wizard ? (
              <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <PromptWizard title="New pattern spec" steps={SPEC_WIZARD_STEPS} build={buildSpecPrompt} onSubmit={(prompt) => onSubmit(prompt)} submitLabel="Draft the spec" />
                <button
                  type="button"
                  onClick={() => setWizard(false)}
                  className="mx-auto flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to ask anything
                </button>
              </motion.div>
            ) : (
              <motion.div key="ask" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <PromptBarPro {...COMPOSER_PROPS} placeholder="Ask anything — / for commands, @ for sources" onSubmit={onSubmit} className="w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {!wizard && (
            <motion.section
              aria-labelledby="start-with"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-10"
            >
              <h4 id="start-with" className="sr-only">
                Start with
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {STARTER_CARDS.map((card, i) => {
                  const lead = i === 0;
                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                      onClick={() => (card.prompt ? onSubmit(card.prompt) : setWizard(true))}
                      className={cn(
                        "group relative flex h-full flex-col items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-sm",
                        lead && "border-foreground/20 shadow-sm"
                      )}
                    >
                      <span className="flex w-full items-center justify-between">
                        <span className={cn("flex size-8 items-center justify-center rounded-lg", lead ? "bg-foreground text-background" : "bg-muted")}>
                          <card.icon className="size-4" />
                        </span>
                        {lead && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Start here</span>}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{card.title}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">{card.description}</span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ShareThreadButton({ thread, onVisibility }: { thread: Thread; onVisibility: (v: "private" | "public") => void }) {
  const [open, setOpen] = React.useState(false);
  const visibility = thread.visibility ?? "private";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent sm:flex"
      >
        {visibility === "public" ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
        <Share className="size-3.5" />
        Share
      </button>
      <ShareSessionDialog
        open={open}
        onOpenChange={setOpen}
        visibility={visibility}
        onVisibilityChange={(next) => new Promise<void>((resolve) => window.setTimeout(() => (onVisibility(next), resolve()), 500))}
        shareUrl={`https://ai-patterns.app/workspace/s/${thread.id}`}
        title="Share this thread"
        exposureWarning="This thread reads from carlosmarch/ai-patterns and Figma. Anyone with the link sees the files and screens Origami quoted."
        policyNote="Shared threads are read-only. Turn sharing off any time to break the link."
      />
    </>
  );
}

function contextShare(blocks: number) {
  return contextSegments(blocks).reduce((n, seg) => n + seg.tokens, 0) / CONTEXT_LIMIT;
}

function ContextButton({ blocks }: { blocks: number }) {
  const [open, setOpen] = React.useState(false);
  const [compacted, setCompacted] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const segments = contextSegments(compacted ? Math.round(blocks * 0.2) : blocks);
  const used = segments.reduce((n, s) => n + s.tokens, 0);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Context window: ${Math.round((used / CONTEXT_LIMIT) * 100)}% used`}
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <span className="relative h-1.5 w-8 overflow-hidden rounded-full bg-muted">
          <span className="absolute inset-y-0 left-0 rounded-full bg-foreground/60" style={{ width: `${Math.min(100, (used / CONTEXT_LIMIT) * 100)}%` }} />
        </span>
        {Math.round((used / CONTEXT_LIMIT) * 100)}%
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full right-0 z-50 mb-2 w-80 shadow-xl"
          >
            <ContextUsage
              segments={segments}
              limit={CONTEXT_LIMIT}
              title="Thread context"
              onCompact={() => new Promise<void>((resolve) => window.setTimeout(() => (setCompacted(true), resolve()), 900))}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
  const [model, setModel] = React.useState("atlas");
  const [thinking, setThinking] = React.useState(false);
  const [autonomy, setAutonomy] = React.useState("confirm");
  const [artifactId, setArtifactId] = React.useState<string | null>(null);
  const [artifactVersion, setArtifactVersion] = React.useState(0);

  const artifactBlock = thread.blocks.find((b): b is Extract<Block, { kind: "artifact" }> => b.kind === "artifact" && b.id === artifactId);
  const lastArtifact = [...thread.blocks].reverse().find((b) => b.kind === "artifact");

  // Open a new artifact as soon as Origami starts writing it, and follow its newest version.
  const artifactSig = lastArtifact?.kind === "artifact" ? `${lastArtifact.id}:${lastArtifact.artifact.versions.length}:${!!lastArtifact.generating}` : "";
  const [seenSig, setSeenSig] = React.useState(artifactSig);
  if (artifactSig !== seenSig && lastArtifact?.kind === "artifact") {
    setSeenSig(artifactSig);
    if (lastArtifact.generating) setArtifactId(lastArtifact.id);
    if (lastArtifact.generating || lastArtifact.id === artifactId) setArtifactVersion(lastArtifact.artifact.versions.length - 1);
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread.blocks.length]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const paneHandlers: BlockHandlers = {
    ...handlers,
    openArtifactId: artifactId,
    onOpenArtifact: (id) => {
      const block = thread.blocks.find((b) => b.id === id);
      setArtifactId(id);
      if (block?.kind === "artifact") setArtifactVersion(block.artifact.versions.length - 1);
    },
  };

  const composer = (
    <div className="mx-auto w-full max-w-2xl">
      <PromptBarPro
        {...COMPOSER_PROPS}
        placeholder={`Reply to ${AGENT_NAME}…`}
        onSubmit={onSubmit}
        generating={generating}
        onStop={onStop}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <ModelPicker
            models={MODELS}
            value={model}
            onChange={setModel}
            thinking={thinking}
            onThinkingChange={setThinking}
            thinkingLabel="Think longer"
            onUpgrade={handlers.onUpgrade}
          />
          <AutonomyModePicker modes={AUTONOMY_MODES} capabilities={AUTONOMY_CAPABILITIES} value={autonomy} onChange={setAutonomy} />
        </div>
        {/* The context meter only shows up once the thread is long enough for it to matter. */}
        <AnimatePresence>{contextShare(thread.blocks.length) >= 0.5 && <Reveal key="context"><ContextButton blocks={thread.blocks.length} /></Reveal>}</AnimatePresence>
      </div>
    </div>
  );

  const chat = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-5 px-6 py-8">
          {thread.blocks.map((block) => (
            <BlockView key={block.id} block={block} handlers={paneHandlers} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="shrink-0 border-t bg-background/80 px-6 pb-4 pt-4 backdrop-blur">
        {composer}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1">
      <ArtifactSplit
        open={!!artifactBlock}
        chat={chat}
        panel={
          artifactBlock ? (
            <ArtifactPanel
              key="panel"
              artifact={toArtifact(artifactBlock.artifact)}
              version={Math.min(artifactVersion, artifactBlock.artifact.versions.length - 1)}
              onVersionChange={setArtifactVersion}
              onClose={() => setArtifactId(null)}
              generating={artifactBlock.generating}
            />
          ) : null
        }
      />
    </div>
  );
}
