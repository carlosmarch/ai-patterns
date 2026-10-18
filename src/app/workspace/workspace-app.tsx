"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  History,
  LayoutGrid,
  ListChecks,
  Loader2,
  MessagesSquare,
  Plug,
  Plus,
  Rocket,
  Search,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
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
  tickSpikeAgents,
} from "./data";
import { BlockView, nextId, seedThreads, type Block, type BlockBody, type BlockHandlers, type Thread } from "./thread";
import { ChangelogView, ConnectorsView, MobileMenuButton, MobileMenuContext, DeployView, InsightsView, PlaygroundView, SetupView, TrainView, WorkflowsView } from "./views";

type View = "operator" | "train" | "playground" | "deploy" | "insights" | "changelog" | "connectors" | "workflows" | "setup";

const NAV_PRIMARY: { id: View; label: string; icon: React.ComponentType<{ className?: string }>; chevron?: boolean }[] = [
  { id: "operator", label: "Operator", icon: AGENT_ICON },
  { id: "train", label: "Train", icon: BookOpen, chevron: true },
  { id: "playground", label: "Playground", icon: FlaskConical },
  { id: "deploy", label: "Deploy", icon: Rocket, chevron: true },
  { id: "insights", label: "Insights", icon: ChartColumn, chevron: true },
  { id: "changelog", label: "Changelog", icon: History },
];

const NAV_SECONDARY: { id: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "connectors", label: "Connectors", icon: Plug },
  { id: "workflows", label: "Workflows", icon: Workflow },
  { id: "setup", label: "Setup", icon: ListChecks },
];

const CANCELLED = Symbol("cancelled");

function text(content: string): StreamSegment[] {
  return [{ type: "text", content }];
}

function titleFrom(prompt: string) {
  const clean = prompt.replace(/[?.!]+$/, "");
  return clean.length > 40 ? `${clean.slice(0, 38).trimEnd()}…` : clean;
}

// Which scripted flow a prompt should run. Anything unrecognized gets the
// generic research flow, so free-typed prompts still feel answered.
function flowFor(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("stop") || p.includes("drop-off") || p.includes("abandon")) return "spike";
  if (p.includes("guideline") || p.includes("guidance")) return "guidance";
  if (p.includes("skill") || p.includes("reference docs") || p.includes("rebuild")) return "bulk";
  if (p.includes("usage") || p.includes("summar") || p.includes("report")) return "summary";
  if (p.includes("what can you") || p.includes("capabilit")) return "explore";
  return "default";
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

export function WorkspaceApp() {
  const [view, setView] = React.useState<View>("operator");
  const [threads, setThreads] = React.useState<Thread[]>(seedThreads);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState<Record<string, boolean>>({});
  const [query, setQuery] = React.useState("");
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [tasksOpen, setTasksOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState<BackgroundTask[]>(INITIAL_TASKS);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [setupDone, setSetupDone] = React.useState(2);
  const [toast, setToast] = React.useState<string | null>(null);
  const runsRef = React.useRef<Record<string, number>>({});

  const activeThread = threads.find((t) => t.id === activeId) ?? null;
  const runningTasks = tasks.filter((t) => t.status === "running").length;

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

  async function runFlow(r: Runner, flow: ReturnType<typeof flowFor>) {
    switch (flow) {
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

  function submitPrompt(prompt: string) {
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
    startRun(id, (r) => runFlow(r, flowFor(raw)));
  }

  function upsertTask(task: BackgroundTask) {
    setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
  }

  const handlers: BlockHandlers = {
    onFollowUp: submitPrompt,
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
      items: [...NAV_PRIMARY, ...NAV_SECONDARY].map((n) => ({ id: `view:${n.id}`, label: n.label, icon: n.icon })),
    },
  ];

  function onPaletteSelect(item: CommandPaletteItem) {
    setPaletteOpen(false);
    const [type, value] = item.id.split(":");
    if (type === "thread") {
      setView("operator");
      setActiveId(value);
    } else if (type === "view") {
      setView(value as View);
    } else if (value === "new") {
      setView("operator");
      setActiveId(null);
    } else if (value === "tasks") {
      setTasksOpen(true);
    } else if (value === "registry") {
      window.open("/patterns", "_blank");
    }
  }

  const openMobileNav = React.useCallback(() => setMobileNav(true), []);

  function navigate(next: View) {
    setView(next);
    setMobileNav(false);
  }

  function openThread(id: string | null) {
    setView("operator");
    setActiveId(id);
    setMobileNav(false);
  }

  const visibleThreads = threads.filter((t) => t.title.toLowerCase().includes(query.trim().toLowerCase()));

  const navSidebar = (
    <NavSidebar view={view} onNavigate={navigate} setupDone={setupDone} />
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
                  <NewThread onSubmit={submitPrompt} />
                )}
              </>
            ) : view === "train" ? (
              <TrainView />
            ) : view === "playground" ? (
              <PlaygroundView />
            ) : view === "deploy" ? (
              <DeployView />
            ) : view === "insights" ? (
              <InsightsView />
            ) : view === "changelog" ? (
              <ChangelogView />
            ) : view === "connectors" ? (
              <ConnectorsView />
            ) : view === "workflows" ? (
              <WorkflowsView />
            ) : (
              <SetupView
                onInvite={() => {
                  navigate("operator");
                  setToast("Invite teammates with the Invite button in the thread header.");
                }}
                onDone={setSetupDone}
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

function IconRail({ view, onNavigate, onSearch }: { view: View; onNavigate: (v: View) => void; onSearch: () => void }) {
  return (
    <nav aria-label="Product" className="hidden w-12 shrink-0 flex-col items-center gap-2 py-2 sm:flex">
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
        <AGENT_ICON className="size-5" />
      </span>
      <RailButton label="Operator" active={view === "operator"} onClick={() => onNavigate("operator")}>
        <MessagesSquare className="size-5" />
      </RailButton>
      <RailButton label="Train" active={view === "train"} onClick={() => onNavigate("train")}>
        <BookOpen className="size-5" />
      </RailButton>
      <RailButton label="Insights" active={view === "insights"} onClick={() => onNavigate("insights")}>
        <ChartColumn className="size-5" />
      </RailButton>
      <RailButton label="Deploy" active={view === "deploy"} onClick={() => onNavigate("deploy")}>
        <Rocket className="size-5" />
      </RailButton>
      <RailButton label="Connectors" active={view === "connectors"} onClick={() => onNavigate("connectors")}>
        <Plug className="size-5" />
      </RailButton>
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

function NavSidebar({ view, onNavigate, setupDone }: { view: View; onNavigate: (v: View) => void; setupDone: number }) {
  function item(n: { id: View; label: string; icon: React.ComponentType<{ className?: string }>; chevron?: boolean }, extra?: React.ReactNode) {
    const active = view === n.id;
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => onNavigate(n.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
          active ? "bg-background font-medium shadow-sm ring-1 ring-border" : "hover:bg-accent"
        )}
      >
        <n.icon className="size-4" />
        <span className="flex-1 text-left">{n.label}</span>
        {extra}
        {n.chevron && <ChevronRight className="size-3.5 text-muted-foreground" />}
      </button>
    );
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col rounded-2xl border bg-background p-3 shadow-sm">
      <h1 className="px-2 pb-4 pt-2 text-xl font-semibold tracking-tight">UX Agent</h1>
      <button
        type="button"
        className="mb-4 flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-500 text-white">
          <LayoutGrid className="size-3.5" />
        </span>
        <span className="flex-1 text-left">ai-patterns</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>
      <nav aria-label="Workspace" className="flex flex-col gap-0.5">
        {NAV_PRIMARY.map((n) => item(n))}
      </nav>
      <div className="my-4 border-t" />
      <nav aria-label="Settings" className="flex flex-col gap-0.5">
        {NAV_SECONDARY.map((n) =>
          item(
            n,
            n.id === "setup" && setupDone < 4 ? (
              <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">{setupDone}/4</span>
            ) : undefined
          )
        )}
      </nav>
    </aside>
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

function NewThread({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-12 pt-[10vh]">
        <AGENT_ICON className="size-12" />
        <p className="mt-6 text-center font-serif text-3xl tracking-tight sm:text-5xl">Hey {USER_NAME}, what&apos;s on your mind?</p>
        <PromptBar
          placeholder="Ask anything…"
          sources={COMPOSER_SOURCES}
          commands={COMPOSER_COMMANDS}
          models={[
            { id: "fast", label: `${AGENT_NAME} Fast` },
            { id: "deep", label: `${AGENT_NAME} Deep research` },
          ]}
          onSubmit={onSubmit}
          className="mt-10 w-full"
        />
        <div className="mt-6 w-full space-y-3">
          {STARTER_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onSubmit(card.prompt)}
              className="flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-colors hover:bg-accent/60"
            >
              <card.icon className="mt-0.5 size-5 shrink-0" />
              <span>
                <span className="block font-medium">{card.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{card.description}</span>
              </span>
            </button>
          ))}
        </div>
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
