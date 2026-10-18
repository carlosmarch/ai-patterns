"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  ChartColumn,
  Check,
  CircleCheck,
  CircleDashed,
  CircleX,
  Code2,
  FileText,
  GitBranch,
  Globe,
  LayoutGrid,
  Link2,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Search,
  SquareTerminal,
  Terminal,
  Unplug,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { AgentTriggers, DEFAULT_TRIGGERS } from "@/registry/agents/agent-triggers/component";
import { ChatBubble } from "@/registry/messages/chat-bubble/component";
import { ConnectivityError } from "@/registry/errors/connectivity-error/component";
import { ConnectorPanel, type ConnectorLink, type ConnectorToolGroup, type ToolPermission } from "@/registry/permissions/connector-panel/component";
import { CreateAgent } from "@/registry/agents/create-agent/component";
import { Flowchart, type FlowchartNode } from "@/registry/flowcharts/trigger-condition/component";
import { InviteMembers } from "@/registry/access/invite-members/component";
import { InstructionTools } from "@/registry/agents/instruction-tools/component";
import { ListeningState } from "@/registry/voice/listening-state/component";
import { LiveTranscript, type TranscriptSegment } from "@/registry/voice/live-transcript/component";
import { ProcedureBuilder } from "@/registry/agents/procedure-builder/component";
import { PromptOnboarding, type CodingTool } from "@/registry/onboarding/prompt-onboarding/component";
import { SetupChecklist, type SetupStep } from "@/registry/navigation/setup-checklist/component";
import { ShinyButton } from "@/registry/buttons/shiny-button/component";
import { StopGenerationButton } from "@/registry/buttons/stop-generation-button/component";
import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { VoiceWaveform } from "@/registry/voice/voice-waveform/component";

import {
  AGENT_ICON,
  AGENT_NAME,
  GUIDELINE_TOOLS,
  ORG_MEMBERS,
  PROCEDURES,
  PROCEDURE_STEPS,
  PROCEDURE_TARGETS,
  ROLES,
  SETUP_STEPS,
  SKILL_PROMPT,
  SKILL_SNIPPET,
  TEAM,
  favicon,
} from "./data";

// ---------------------------------------------------------------------------
// Shared chrome
// ---------------------------------------------------------------------------

/** Opens the nav drawer on small screens, where the sidebars are hidden. */
export const MobileMenuContext = React.createContext<() => void>(() => {});

export function MobileMenuButton() {
  const open = React.useContext(MobileMenuContext);
  return (
    <button type="button" onClick={open} aria-label="Open menu" className="-ml-2 flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-accent md:hidden">
      <Menu className="size-5" />
    </button>
  );
}

export function ViewHeader({ title, badge, children }: { title: string; badge?: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileMenuButton />
        <h2 className="truncate text-lg font-semibold tracking-tight">{title}</h2>
        {badge && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">{badge}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div role="tablist" className="flex gap-1 rounded-lg bg-muted p-1">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-md px-3 py-1 text-sm transition-colors",
            value === item.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Scroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto", className)}>{children}</div>;
}

function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            exit={{ y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className={cn("w-full rounded-2xl border bg-background p-5 shadow-xl", className)}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Train — procedures and guidelines
// ---------------------------------------------------------------------------

export type TrainTab = "procedures" | "guidelines";
export type PlaygroundTab = "chat" | "voice";

export function TrainView({ tab, onTabChange: setTab }: { tab: TrainTab; onTabChange: (tab: TrainTab) => void }) {
  const [selected, setSelected] = React.useState(PROCEDURES[0].id);
  const [saved, setSaved] = React.useState(true);
  // The builder reports its initial steps on mount; only later edits count as unsaved.
  const mountedChange = React.useRef(false);
  const procedure = PROCEDURES.find((p) => p.id === selected)!;

  return (
    <>
      <ViewHeader title="Train">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "procedures", label: "Procedures" },
            { id: "guidelines", label: "Guidelines" },
          ]}
        />
      </ViewHeader>
      {tab === "procedures" ? (
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 xl:flex">
            {PROCEDURES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  mountedChange.current = false;
                  setSaved(true);
                  setSelected(p.id);
                }}
                className={cn(
                  "rounded-lg px-3 py-2 text-left transition-colors",
                  selected === p.id ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn("size-1.5 rounded-full", p.live ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                  {p.title}
                </span>
                <span className="mt-0.5 block pl-3.5 text-xs text-muted-foreground">{p.usage}</span>
              </button>
            ))}
          </aside>
          <Scroll className="px-6 py-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{procedure.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {AGENT_NAME} follows these steps whenever a thread matches this procedure.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saved}
                  onClick={() => setSaved(true)}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
              <ProcedureBuilder
                key={selected}
                agentName={AGENT_NAME}
                initialSteps={selected === "review" ? PROCEDURE_STEPS : []}
                targets={PROCEDURE_TARGETS}
                onChange={() => {
                  if (mountedChange.current) setSaved(false);
                  mountedChange.current = true;
                }}
              />
            </div>
          </Scroll>
        </div>
      ) : (
        <Scroll className="px-6 py-6">
          <div className="mx-auto max-w-2xl space-y-4 pb-56">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Design guidelines</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                House rules {AGENT_NAME} applies to every audit and spec. Type <span className="font-mono">/</span> to
                reference a tool.
              </p>
            </div>
            <InstructionTools
              tools={GUIDELINE_TOOLS}
              defaultSteps={[
                "Before suggesting a new component, search the registry for an existing pattern that fits. ",
                "Every loading state must resolve into a result — never leave a spinner on screen after the work ends.",
                "Respect reduced motion: shimmer and sweep effects turn into a static label.",
              ]}
              className="rounded-2xl border bg-card p-4"
            />
          </div>
        </Scroll>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Playground — try the agent as a user would
// ---------------------------------------------------------------------------

interface PlaygroundMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const PLAYGROUND_REPLIES = [
  "For a 30-second tool call, use a Tool Call Chip that resolves into its result, and a Thinking Loader before the first token. Want me to scaffold both?",
  "Tool Approval fits here — show the exact command, then Allow, Always allow, or Deny. Keep the deny path one click away.",
  "I'd reach for Refinement Controls: one-tap Shorten, Rephrase, and More formal under the output, with every result kept as a version.",
];

const VOICE_SCRIPT: { speaker: TranscriptSegment["speaker"]; text: string }[] = [
  { speaker: "user", text: "Which pattern should I use while the agent is listening?" },
  { speaker: "assistant", text: "Listening State while the mic is open, a Live Transcript as you talk, then a Voice Waveform while I answer." },
];

export function PlaygroundView({ tab, onTabChange: setTab }: { tab: PlaygroundTab; onTabChange: (tab: PlaygroundTab) => void }) {

  return (
    <>
      <ViewHeader title="Playground" badge="Preview">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "chat", label: "Chat" },
            { id: "voice", label: "Voice" },
          ]}
        />
      </ViewHeader>
      {tab === "chat" ? <ChatPlayground /> : <VoicePlayground />}
    </>
  );
}

function ChatPlayground() {
  const [messages, setMessages] = React.useState<PlaygroundMessage[]>([
    { id: 0, role: "user", text: "My agent runs a tool that takes ~30s. What should the UI show?" },
    { id: 1, role: "assistant", text: PLAYGROUND_REPLIES[0] },
  ]);
  const [draft, setDraft] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const timer = React.useRef<number>(undefined);
  const bottom = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  React.useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [messages.length, generating]);

  function send() {
    const text = draft.trim();
    if (!text || generating) return;
    setDraft("");
    setMessages((m) => [...m, { id: m.length, role: "user", text }]);
    setGenerating(true);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: m.length, role: "assistant", text: PLAYGROUND_REPLIES[(m.length / 2) % PLAYGROUND_REPLIES.length | 0] }]);
      setGenerating(false);
    }, 2200);
  }

  function stop() {
    window.clearTimeout(timer.current);
    setGenerating(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center bg-muted/30 p-4 sm:p-8">
      <div className="flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background">
            <AGENT_ICON className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium">{AGENT_NAME}</p>
            <p className="text-xs text-muted-foreground">Testing with unpublished changes</p>
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} content={m.text} />
          ))}
          {generating && <ThinkingLoader className="w-full" />}
          <div ref={bottom} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t p-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask as a user would…"
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <StopGenerationButton
            state={generating ? "generating" : "idle"}
            disabled={!generating && !draft.trim()}
            onSubmit={send}
            onStop={stop}
          />
        </form>
      </div>
    </div>
  );
}

function VoicePlayground() {
  const [phase, setPhase] = React.useState<"idle" | "listening" | "transcript" | "speaking">("idle");
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);

  React.useEffect(() => {
    if (phase !== "listening") return;
    const t = window.setTimeout(() => setPhase("transcript"), 1600);
    return () => window.clearTimeout(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "transcript") return;
    let cancelled = false;
    (async () => {
      for (let turn = 0; turn < VOICE_SCRIPT.length; turn++) {
        const { speaker, text } = VOICE_SCRIPT[turn];
        const words = text.split(" ");
        for (let i = 1; i <= words.length; i++) {
          if (cancelled) return;
          const partial = words.slice(0, i).join(" ");
          setSegments((prev) => [...prev.filter((s) => s.id !== `v${turn}`), { id: `v${turn}`, speaker, text: partial, final: i === words.length }]);
          await new Promise((r) => setTimeout(r, 70));
        }
      }
      if (!cancelled) setPhase("speaking");
    })();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  function start() {
    setSegments([]);
    setPhase("listening");
  }

  return (
    <Scroll className="bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border bg-background p-6">
          {phase === "idle" && (
            <>
              <VoiceWaveform state="idle" className="w-full" />
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Mic className="size-4" />
                Start a test call
              </button>
            </>
          )}
          {phase === "listening" && <ListeningState label="Listening…" onStop={() => setPhase("idle")} />}
          {phase === "transcript" && <VoiceWaveform state="listening" className="w-full" />}
          {phase === "speaking" && (
            <>
              <VoiceWaveform state="speaking" className="w-full" />
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" />
                End call
              </button>
            </>
          )}
        </div>
        {segments.length > 0 && <LiveTranscript segments={segments} active={phase === "transcript"} />}
      </div>
    </Scroll>
  );
}

// ---------------------------------------------------------------------------
// Deploy — agents and what triggers them
// ---------------------------------------------------------------------------

const AGENTS = [
  { id: "origami", name: AGENT_NAME, description: "Audits screens, writes specs, ships patterns", status: "Live" },
  { id: "reviewer", name: "Spec reviewer", description: "Reviews every pattern PR against the spec template", status: "Live" },
  { id: "triage", name: "Request triage", description: "Labels and routes pattern requests", status: "Draft" },
];

export function DeployView() {
  const [creating, setCreating] = React.useState(false);
  const [agents, setAgents] = React.useState(AGENTS);
  const [selected, setSelected] = React.useState(AGENTS[0].id);
  const [deployed, setDeployed] = React.useState(false);
  const agent = agents.find((a) => a.id === selected) ?? agents[0];

  return (
    <>
      <ViewHeader title="Deploy">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          <Plus className="size-4" />
          New agent
        </button>
        {deployed ? (
          <span className="flex items-center gap-1.5 px-3 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Deployed
          </span>
        ) : (
          <ShinyButton onClick={() => setDeployed(true)}>Deploy changes</ShinyButton>
        )}
      </ViewHeader>
      <Scroll className="px-6 py-6">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[16rem_1fr]">
          <div className="space-y-2">
            <p className="px-1 text-xs font-medium text-muted-foreground">Agents</p>
            {agents.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected === a.id ? "border-foreground/20 bg-accent" : "hover:bg-accent/60"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {a.id === "origami" ? <AGENT_ICON className="size-4" /> : <Bot className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {a.name}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px]",
                        a.status === "Live" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {a.status}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{a.description}</span>
                </span>
              </button>
            ))}
          </div>
          <AgentTriggers
            key={agent.id}
            title={`${agent.name} triggers`}
            description="Events that start a new thread for this agent"
            agent={{ name: agent.name, icon: agent.id === "origami" ? AGENT_ICON : Bot }}
            triggers={DEFAULT_TRIGGERS.map((t) => ({ ...t, event: t.event.replace("AI-Patterns", agent.name) }))}
            onToggle={() => setDeployed(false)}
          />
        </div>
      </Scroll>

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setCreating(false)}
          >
            <motion.div initial={{ y: 8 }} animate={{ y: 0 }} exit={{ y: 8 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xs">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCreating(false)}
                className="absolute -top-10 right-0 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
              <CreateAgent
                onCreateAgent={(payload) => {
                  const id = `agent-${agents.length}`;
                  setAgents((prev) => [...prev, { id, name: payload.name || "Untitled agent", description: "Just created", status: "Draft" }]);
                  setSelected(id);
                  setDeployed(false);
                  setCreating(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

const PR_FIELDS = [
  { id: "files", label: "files changed" },
  { id: "path", label: "path" },
];

const PR_REVIEW_NODES: FlowchartNode[] = [
  {
    id: "trigger",
    type: "trigger",
    icon: GitBranch,
    title: "Pull request opened",
    description: "On carlosmarch/ai-patterns, against main",
  },
  {
    id: "condition",
    type: "condition",
    clauses: [
      {
        id: "c1",
        connector: "if",
        subject: { id: "pr", icon: GitBranch, label: "PR" },
        field: { id: "files", label: "files changed" },
        fieldOptions: PR_FIELDS,
        value: { id: "gt10", label: "> 10", dotColor: "bg-amber-500" },
        valueOptions: [
          { id: "gt10", label: "> 10", dotColor: "bg-amber-500" },
          { id: "gt50", label: "> 50", dotColor: "bg-red-500" },
        ],
      },
      {
        id: "c2",
        connector: "and",
        subject: { id: "pr-2", icon: GitBranch, label: "PR" },
        field: { id: "path", label: "path" },
        fieldOptions: PR_FIELDS,
        value: { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
        valueOptions: [
          { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
          { id: "skill", label: "plugins/ai-patterns/**", dotColor: "bg-violet-500" },
        ],
      },
    ],
  },
];

const WEEKLY_NODES: FlowchartNode[] = [
  { id: "trigger", type: "trigger", icon: CalendarClock, title: "Every Monday at 9:00", description: "Europe/Madrid · runs as Origami" },
  {
    id: "condition",
    type: "condition",
    clauses: [
      {
        id: "c1",
        connector: "if",
        subject: { id: "analytics", icon: ChartColumn, label: "Analytics" },
        field: { id: "events", label: "copy events" },
        fieldOptions: [
          { id: "events", label: "copy events" },
          { id: "views", label: "page views" },
        ],
        value: { id: "gt1000", label: "> 1,000", dotColor: "bg-emerald-500" },
        valueOptions: [
          { id: "gt0", label: "> 0", dotColor: "bg-muted-foreground" },
          { id: "gt1000", label: "> 1,000", dotColor: "bg-emerald-500" },
        ],
      },
    ],
  },
];

const TRIAGE_NODES: FlowchartNode[] = [
  { id: "trigger", type: "trigger", icon: MessageSquare, title: "New message in #design-requests", description: "Slack · top-level messages only" },
  {
    id: "condition",
    type: "condition",
    clauses: [
      {
        id: "c1",
        connector: "if",
        subject: { id: "msg", icon: MessageSquare, label: "Message" },
        field: { id: "contains", label: "mentions" },
        fieldOptions: [
          { id: "contains", label: "mentions" },
          { id: "author", label: "author" },
        ],
        value: { id: "pattern", label: "a pattern", dotColor: "bg-violet-500" },
        valueOptions: [
          { id: "pattern", label: "a pattern", dotColor: "bg-violet-500" },
          { id: "screen", label: "a screen", dotColor: "bg-sky-500" },
        ],
      },
      {
        id: "c2",
        connector: "or",
        subject: { id: "msg-2", icon: MessageSquare, label: "Message" },
        field: { id: "contains", label: "mentions" },
        fieldOptions: [
          { id: "contains", label: "mentions" },
          { id: "author", label: "author" },
        ],
        value: { id: "origami", label: "@Origami", dotColor: "bg-amber-500" },
        valueOptions: [{ id: "origami", label: "@Origami", dotColor: "bg-amber-500" }],
      },
    ],
  },
];

type RunStatus = "running" | "success" | "skipped" | "failed";

interface WorkflowRun {
  id: string;
  label: string;
  when: string;
  status: RunStatus;
}

interface WorkflowDef {
  id: string;
  name: string;
  description: string;
  live: boolean;
  runsThisWeek: number;
  nodes: FlowchartNode[];
  runs: WorkflowRun[];
}

const WORKFLOWS: WorkflowDef[] = [
  {
    id: "pr-review",
    name: "PR review automation",
    description: "Runs the “Review a pattern” procedure on large registry PRs.",
    live: true,
    runsThisWeek: 14,
    nodes: PR_REVIEW_NODES,
    runs: [
      { id: "r1", label: "#94 Keep header avatars below the drawer", when: "2h ago", status: "skipped" },
      { id: "r2", label: "#91 Add /workspace", when: "Yesterday", status: "success" },
      { id: "r3", label: "#90 Wireframe hero images", when: "Yesterday", status: "success" },
      { id: "r4", label: "#88 Procedure Builder", when: "Oct 15", status: "failed" },
    ],
  },
  {
    id: "weekly",
    name: "Weekly usage report",
    description: "Summarizes pattern usage and posts it to the team every Monday.",
    live: true,
    runsThisWeek: 1,
    nodes: WEEKLY_NODES,
    runs: [
      { id: "r1", label: "Week 42 report", when: "Today, 9:00", status: "success" },
      { id: "r2", label: "Week 41 report", when: "Oct 13", status: "success" },
    ],
  },
  {
    id: "triage",
    name: "Design request triage",
    description: "Labels pattern requests from Slack and drafts a first reply.",
    live: false,
    runsThisWeek: 0,
    nodes: TRIAGE_NODES,
    runs: [],
  },
];

const RUN_STATUS: Record<RunStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  running: { label: "Running", icon: Loader2, className: "animate-spin text-muted-foreground" },
  success: { label: "Succeeded", icon: CircleCheck, className: "text-emerald-600 dark:text-emerald-400" },
  skipped: { label: "Skipped — conditions not met", icon: CircleDashed, className: "text-muted-foreground" },
  failed: { label: "Failed", icon: CircleX, className: "text-red-600 dark:text-red-400" },
};

export function WorkflowsView({ slackConnected, onToast }: { slackConnected: boolean; onToast: (message: string) => void }) {
  const [workflows, setWorkflows] = React.useState(WORKFLOWS);
  const [selected, setSelected] = React.useState(WORKFLOWS[0].id);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const workflow = workflows.find((w) => w.id === selected) ?? workflows[0];
  const isRunning = workflow.runs.some((r) => r.status === "running");

  function patch(id: string, fn: (w: WorkflowDef) => WorkflowDef) {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? fn(w) : w)));
  }

  function runNow() {
    const id = workflow.id;
    const runId = `run-${Date.now()}`;
    patch(id, (w) => ({ ...w, runs: [{ id: runId, label: "Manual run", when: "Just now", status: "running" }, ...w.runs] }));
    timers.current.push(
      window.setTimeout(() => {
        patch(id, (w) => ({
          ...w,
          runsThisWeek: w.runsThisWeek + 1,
          runs: w.runs.map((r) => (r.id === runId ? { ...r, status: "success" } : r)),
        }));
      }, 2400)
    );
  }

  function create() {
    const id = `workflow-${workflows.length}`;
    setWorkflows((prev) => [
      ...prev,
      {
        id,
        name: "Untitled workflow",
        description: "Draft — pick a trigger and conditions, then turn it on.",
        live: false,
        runsThisWeek: 0,
        runs: [],
        nodes: [
          { id: "trigger", type: "trigger", icon: Play, title: "Run manually", description: "From this page or with /run in a thread" },
          {
            id: "condition",
            type: "condition",
            clauses: [{ ...(PR_REVIEW_NODES[1] as Extract<FlowchartNode, { type: "condition" }>).clauses[0], id: "c1" }],
          },
        ],
      },
    ]);
    setSelected(id);
  }

  return (
    <>
      <ViewHeader title="Workflows">
        <button
          type="button"
          onClick={create}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New workflow</span>
        </button>
      </ViewHeader>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 gap-1 overflow-x-auto border-b p-3 md:w-72 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
          {workflows.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelected(w.id)}
              aria-current={w.id === workflow.id ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-lg px-3 py-2 text-left transition-colors md:w-full",
                w.id === workflow.id ? "bg-accent" : "hover:bg-accent/60"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={cn("size-1.5 shrink-0 rounded-full", w.live ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                <span className="truncate">{w.name}</span>
              </span>
              <span className="mt-0.5 hidden pl-3.5 text-xs text-muted-foreground md:block">
                {w.live ? `Live · ${w.runsThisWeek} ${w.runsThisWeek === 1 ? "run" : "runs"} this week` : "Paused"}
              </span>
            </button>
          ))}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col xl:overflow-y-auto">
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-5 sm:px-6">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight">{workflow.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={workflow.live}
                  onClick={() => {
                    if (!workflow.live && workflow.id === "triage" && !slackConnected) {
                      onToast("Connect Slack in Connectors first — this workflow listens to #design-requests.");
                      return;
                    }
                    patch(workflow.id, (w) => ({ ...w, live: !w.live }));
                  }}
                  className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  <span className={cn("relative h-4 w-7 rounded-full transition-colors", workflow.live ? "bg-emerald-500" : "bg-muted-foreground/30")}>
                    <span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-all", workflow.live ? "left-3.5" : "left-0.5")} />
                  </span>
                  {workflow.live ? "Live" : "Paused"}
                </button>
                <button
                  type="button"
                  disabled={!workflow.live || isRunning}
                  title={workflow.live ? undefined : "Turn the workflow on to run it"}
                  onClick={runNow}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  {isRunning ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  Run now
                </button>
              </div>
            </div>
            {/* grow, not flex-1: the canvas sets its own height from the nodes, so it must never shrink below it. */}
            <Flowchart key={workflow.id} nodes={workflow.nodes} className="min-h-[420px] shrink-0 grow rounded-none border-x-0 border-b-0" />
          </div>

          <aside className="shrink-0 border-t bg-background p-4 sm:p-6 xl:w-80 xl:overflow-y-auto xl:border-l xl:border-t-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Runs this week</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{workflow.runsThisWeek}</p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Success rate</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {(() => {
                    const finished = workflow.runs.filter((r) => r.status === "success" || r.status === "failed");
                    return finished.length ? `${Math.round((finished.filter((r) => r.status === "success").length / finished.length) * 100)}%` : "—";
                  })()}
                </p>
              </div>
            </div>
            <p className="mb-2 mt-6 text-xs font-medium text-muted-foreground">Recent runs</p>
            {workflow.runs.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                No runs yet. {workflow.live ? "Run it now to test it." : "Turn it on to start running."}
              </p>
            ) : (
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {workflow.runs.map((run) => {
                    const meta = RUN_STATUS[run.status];
                    return (
                      <motion.li
                        key={run.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-accent/60"
                      >
                        <meta.icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} aria-label={meta.label} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{run.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {run.when} · {meta.label}
                          </span>
                        </span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export interface ConnectorDef {
  id: string;
  name: string;
  domain: string;
  description: string;
  detail: string;
  connected: boolean;
  verified?: boolean;
  overview: string[];
  links: ConnectorLink[];
  toolGroups: ConnectorToolGroup[];
}

function mcp(id: string, name: string, description: string, permission: ToolPermission) {
  return { id, name, description, badge: "MCP", permission };
}

export const CONNECTORS: ConnectorDef[] = [
  {
    id: "github",
    name: "GitHub",
    domain: "github.com",
    description: "Read the registry, open pull requests, and comment on reviews in carlosmarch/ai-patterns.",
    detail: "carlosmarch/ai-patterns",
    connected: true,
    verified: true,
    overview: ["Read pattern source and specs", "Open PRs with new or updated patterns", "Comment on pattern review PRs"],
    links: [
      { label: "Repository", href: "https://github.com/carlosmarch/ai-patterns", icon: Globe },
      { label: "Docs", href: "https://docs.github.com/en/rest", icon: FileText },
    ],
    toolGroups: [
      {
        id: "read",
        label: "Read-only tools",
        tools: [
          mcp("get-file", "Get file contents", "Read a file such as a pattern's component.tsx or pattern.ts.", "allow"),
          mcp("search-code", "Search code", "Find where a pattern or prop is used across the registry.", "allow"),
          mcp("list-prs", "List pull requests", "See open pattern PRs and their review status.", "allow"),
        ],
      },
      {
        id: "write",
        label: "Write tools",
        tools: [
          mcp("create-pr", "Create pull request", "Open a PR with a new pattern or a spec update.", "always-ask"),
          mcp("comment", "Comment on a pull request", "Post review findings on a pattern PR.", "always-ask"),
          mcp("push", "Push files", "Commit changes directly to a branch.", "always-ask"),
        ],
      },
      {
        id: "destructive",
        label: "Destructive tools",
        tools: [
          mcp("merge", "Merge pull request", "Merge a PR into main. Pattern PRs should be merged by a person.", "disable"),
          mcp("delete-branch", "Delete branch", "Remove a branch after it's merged.", "disable"),
        ],
      },
    ],
  },
  {
    id: "figma",
    name: "Figma",
    domain: "figma.com",
    description: "Read frames from your design files so audits compare the real screen, not a screenshot.",
    detail: "2 files",
    connected: true,
    verified: true,
    overview: ["Read frames and components", "Match layers to registry patterns", "Leave comments on frames"],
    links: [
      { label: "Chat screen v2", href: "https://figma.com", icon: Globe },
      { label: "Docs", href: "https://www.figma.com/developers/api", icon: FileText },
    ],
    toolGroups: [
      {
        id: "read",
        label: "Read-only tools",
        tools: [
          mcp("get-frame", "Get frame", "Read a frame's layers, text, and auto-layout.", "allow"),
          mcp("get-components", "List components", "See the components a file uses and where.", "allow"),
          mcp("export", "Export image", "Render a frame to PNG for side-by-side audits.", "allow"),
        ],
      },
      {
        id: "write",
        label: "Write tools",
        tools: [mcp("comment", "Comment on a frame", "Pin audit findings to the layer they're about.", "always-ask")],
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel Analytics",
    domain: "vercel.com",
    description: "Count Code tab copies, previews, and installs on ai-patterns.dev for the weekly usage report.",
    detail: "ai-patterns.dev",
    connected: true,
    overview: ["Read page and event analytics", "Group events by pattern", "No write access"],
    links: [
      { label: "Dashboard", href: "https://vercel.com/analytics", icon: Globe },
      { label: "Docs", href: "https://vercel.com/docs/analytics", icon: FileText },
    ],
    toolGroups: [
      {
        id: "read",
        label: "Read-only tools",
        tools: [
          mcp("events", "Query events", "Read custom events such as copy and install.", "allow"),
          mcp("pages", "Query page views", "Read views per pattern page.", "allow"),
        ],
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    domain: "slack.com",
    description: "Pick up pattern requests from #design-requests and post the weekly usage report.",
    detail: "#design-requests",
    connected: false,
    verified: true,
    overview: ["Read messages in channels you pick", "Post reports and replies", "Never reads DMs"],
    links: [{ label: "Docs", href: "https://api.slack.com", icon: FileText }],
    toolGroups: [
      {
        id: "read",
        label: "Read-only tools",
        tools: [mcp("history", "Read channel history", "Read messages in #design-requests.", "allow")],
      },
      {
        id: "write",
        label: "Write tools",
        tools: [mcp("post", "Post a message", "Share reports and answers in a channel.", "always-ask")],
      },
    ],
  },
];

/** Connectors you can add from the catalogue. They start disconnected. */
const CONNECTOR_CATALOGUE: ConnectorDef[] = [
  {
    id: "linear",
    name: "Linear",
    domain: "linear.app",
    description: "Turn audit findings into issues and track pattern requests.",
    detail: "Not set up",
    connected: false,
    verified: true,
    overview: ["Create and update issues", "Read project status"],
    links: [{ label: "Docs", href: "https://linear.app/developers", icon: FileText }],
    toolGroups: [
      { id: "read", label: "Read-only tools", tools: [mcp("issues", "List issues", "Read issues in a team.", "allow")] },
      { id: "write", label: "Write tools", tools: [mcp("create", "Create issue", "File a finding as an issue.", "always-ask")] },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    domain: "notion.so",
    description: "Read research notes and publish specs to your team wiki.",
    detail: "Not set up",
    connected: false,
    overview: ["Read pages you share", "Publish specs as pages"],
    links: [{ label: "Docs", href: "https://developers.notion.com", icon: FileText }],
    toolGroups: [
      { id: "read", label: "Read-only tools", tools: [mcp("search", "Search pages", "Find research and notes.", "allow")] },
      { id: "write", label: "Write tools", tools: [mcp("publish", "Create page", "Publish a spec to the wiki.", "always-ask")] },
    ],
  },
  {
    id: "posthog",
    name: "PostHog",
    domain: "posthog.com",
    description: "Watch session replays and funnels when investigating a UX drop-off.",
    detail: "Not set up",
    connected: false,
    overview: ["Read session replays", "Query funnels and events"],
    links: [{ label: "Docs", href: "https://posthog.com/docs/api", icon: FileText }],
    toolGroups: [
      {
        id: "read",
        label: "Read-only tools",
        tools: [mcp("replays", "List replays", "Find sessions by event.", "allow"), mcp("funnels", "Query funnel", "Measure drop-off between steps.", "allow")],
      },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    domain: "atlassian.com",
    description: "File accessibility findings in the right project.",
    detail: "Not set up",
    connected: false,
    overview: ["Create issues", "Read sprint boards"],
    links: [{ label: "Docs", href: "https://developer.atlassian.com", icon: FileText }],
    toolGroups: [
      { id: "write", label: "Write tools", tools: [mcp("create", "Create issue", "File a finding in a project.", "always-ask")] },
    ],
  },
];

function ConnectorIcon({ connector, className }: { connector: ConnectorDef; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  if (connector.id === "github") return <GitHubMark className={className} />;
  if (failed) {
    return (
      <span aria-hidden className={cn("flex items-center justify-center rounded-sm bg-muted text-[10px] font-semibold text-muted-foreground", className)}>
        {connector.name[0]}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={favicon(connector.domain)} alt="" onError={() => setFailed(true)} className={cn("rounded-sm", className)} />;
}

export function ConnectorsView({
  connectors,
  setConnectors,
  onToast,
}: {
  connectors: ConnectorDef[];
  setConnectors: React.Dispatch<React.SetStateAction<ConnectorDef[]>>;
  onToast: (message: string) => void;
}) {
  const [selected, setSelected] = React.useState(CONNECTORS[0].id);
  const [connecting, setConnecting] = React.useState<string | null>(null);
  const [catalogueOpen, setCatalogueOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const timer = React.useRef<number>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const connector = connectors.find((c) => c.id === selected) ?? connectors[0];
  const visible = connectors.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const available = CONNECTOR_CATALOGUE.filter((c) => !connectors.some((x) => x.id === c.id));
  const connectedCount = connectors.filter((c) => c.connected).length;

  function setConnected(id: string, connected: boolean) {
    setConnectors((prev) => prev.map((c) => (c.id === id ? { ...c, connected, detail: connected && c.detail === "Not set up" ? "1 workspace" : c.detail } : c)));
  }

  function connect(id: string) {
    setConnecting(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setConnected(id, true);
      setConnecting(null);
      onToast(`${connectors.find((c) => c.id === id)?.name} is connected — ${AGENT_NAME} can use it in new threads.`);
    }, 1400);
  }

  function add(def: ConnectorDef) {
    setConnectors((prev) => [...prev, def]);
    setSelected(def.id);
    setCatalogueOpen(false);
  }

  return (
    <>
      <ViewHeader title="Connectors">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {connectedCount} of {connectors.length} connected
        </span>
        <button
          type="button"
          onClick={() => setCatalogueOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          <Plus className="size-4" />
          Add connector
        </button>
      </ViewHeader>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col gap-2 border-b p-3 md:w-72 md:border-b-0 md:border-r">
          <label className="hidden items-center gap-2 rounded-full border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring/40 md:flex">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search connectors"
              aria-label="Search connectors"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-y-auto">
            {visible.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                aria-current={c.id === connector.id ? "true" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors md:w-full",
                  c.id === connector.id ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <ConnectorIcon connector={c} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{c.name}</span>
                    <span
                      className={cn("size-1.5 shrink-0 rounded-full", c.connected ? "bg-emerald-500" : "bg-muted-foreground/40")}
                      aria-label={c.connected ? "Connected" : "Not connected"}
                    />
                  </span>
                  <span className="hidden truncate text-xs text-muted-foreground md:block">{c.connected ? c.detail : "Not connected"}</span>
                </span>
              </button>
            ))}
            {visible.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No connectors match “{query}”.</p>}
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {connector.connected ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check className="size-4" />
                  Connected · {connector.detail}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConnected(connector.id, false);
                    onToast(`Disconnected ${connector.name}.`);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Unplug className="size-4" />
                  Disconnect
                </button>
              </div>
              <ConnectorPanel
                key={connector.id}
                appName={connector.name}
                appDescription={connector.description}
                appIcon={<ConnectorIcon connector={connector} className="size-5" />}
                verified={connector.verified}
                overview={connector.overview}
                links={connector.links}
                toolGroups={connector.toolGroups}
                onAddConnector={() => setCatalogueOpen(true)}
                className="min-h-[520px] flex-1 shadow-sm"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-lg rounded-2xl border bg-card p-6 text-center sm:p-8">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-background">
                  <ConnectorIcon connector={connector} className="size-7" />
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Connect {connector.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{connector.description}</p>
                <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
                  {connector.overview.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-muted-foreground">
                  {connector.toolGroups.reduce((n, g) => n + g.tools.length, 0)} tools · you choose which ones {AGENT_NAME} can use after connecting
                </p>
                <button
                  type="button"
                  disabled={connecting === connector.id}
                  onClick={() => connect(connector.id)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
                >
                  {connecting === connector.id ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
                  {connecting === connector.id ? "Waiting for authorization…" : `Connect ${connector.name}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={catalogueOpen} onClose={() => setCatalogueOpen(false)} title="Add a connector" className="max-w-lg">
        {available.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">You&apos;ve added every connector in the catalogue.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {available.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => add(c)}
                className="flex items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-accent/60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <ConnectorIcon connector={c} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

const TOP_PATTERNS = [
  { name: "Streaming Text", copies: 1204, change: "+6%" },
  { name: "Prompt Bar Pro", copies: 988, change: "+38%" },
  { name: "Tool Approval", copies: 731, change: "+4%" },
  { name: "Thinking Loader", copies: 702, change: "+11%" },
  { name: "Procedure Builder", copies: 214, change: "New" },
];

export function InsightsView() {
  const [state, setState] = React.useState<"error" | "loading" | "ready">("error");
  const [details, setDetails] = React.useState(false);

  function retry() {
    setState("loading");
    window.setTimeout(() => setState("ready"), 1200);
  }

  return (
    <>
      <ViewHeader title="Insights">
        <span className="text-sm text-muted-foreground">Oct 11 – Oct 17</span>
      </ViewHeader>
      <Scroll className="px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {state === "error" && (
            <>
              <ConnectivityError
                title="Couldn't reach Vercel Analytics"
                detailsLabel={details ? "Hide details" : "View details"}
                onRetry={retry}
                onViewDetails={() => setDetails((d) => !d)}
                className="w-full"
              />
              {details && (
                <pre className="overflow-x-auto rounded-xl border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {`GET https://vercel.com/api/web/insights/events?projectId=ai-patterns&from=2026-10-11
→ 504 Gateway Timeout after 30.0s
x-vercel-id: mad1::iad1::8f2kd-1760781600000

The analytics API didn't answer in time. Your data is safe — retrying usually works.`}
                </pre>
              )}
            </>
          )}
          {state === "loading" && <ThinkingLoader words={["Loading usage", "Counting copies"]} />}
          {state === "ready" && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Code tab copies", value: "6,912", sub: "+14% vs. last week" },
                  { label: "Skill sessions", value: "1,312", sub: "+22% vs. last week" },
                  { label: "Threads with Origami", value: "248", sub: "93% resolved without edits" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border bg-card">
                <p className="border-b px-4 py-3 text-sm font-medium">Most-copied patterns</p>
                <ul>
                  {TOP_PATTERNS.map((p) => (
                    <li key={p.name} className="flex items-center gap-3 border-b px-4 py-2.5 text-sm last:border-0">
                      <span className="flex-1">{p.name}</span>
                      <span className="w-16 text-right tabular-nums text-muted-foreground">{p.copies.toLocaleString("en-US")}</span>
                      <span className="w-12 text-right text-xs text-emerald-600 dark:text-emerald-400">{p.change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </Scroll>
    </>
  );
}

// ---------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------

const CHANGES = [
  { date: "Oct 17", title: "Procedure Builder added", body: "Doc-style procedures with IF / ELSE branches. Origami uses it for “Review a pattern”." },
  { date: "Oct 16", title: "Instruction Tool Insert added", body: "Type / in any guideline to reference a tool inline." },
  { date: "Oct 15", title: "Refinement Controls added", body: "One-tap Shorten, Rephrase, and More formal on any AI output, with versions." },
  { date: "Oct 12", title: "Prompt-Driven Onboarding", body: "Setup now hands you a prompt for your coding agent instead of a wall of docs." },
];

export function ChangelogView() {
  return (
    <>
      <ViewHeader title="Changelog" />
      <Scroll className="px-6 py-6">
        <ol className="mx-auto max-w-xl space-y-6 border-l pl-6">
          {CHANGES.map((c) => (
            <li key={c.title} className="relative">
              <span className="absolute -left-[29px] top-1.5 size-2.5 rounded-full border-2 border-background bg-foreground" />
              <p className="text-xs text-muted-foreground">{c.date}</p>
              <p className="mt-0.5 font-medium">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ol>
      </Scroll>
    </>
  );
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const CODING_TOOLS: CodingTool[] = [
  { id: "claude-code", label: "Claude Code", icon: SquareTerminal },
  { id: "cursor", label: "Cursor", icon: MousePointer2 },
  { id: "vscode", label: "VS Code", icon: Code2 },
];

export function SetupView({
  skillDone,
  teamDone,
  onSkillDone,
  onTeamDone,
  onOpenConnectors,
  onExit,
  onToast,
  connectors,
}: {
  connectors: ConnectorDef[];
  skillDone: boolean;
  teamDone: boolean;
  onSkillDone: (done: boolean) => void;
  onTeamDone: () => void;
  onOpenConnectors: () => void;
  onExit: () => void;
  onToast: (message: string) => void;
}) {
  const [waiting, setWaiting] = React.useState(false);
  const timer = React.useRef<number>(undefined);
  const skillRef = React.useRef<HTMLDivElement>(null);
  const teamRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  function focus(ref: React.RefObject<HTMLDivElement | null>) {
    const el = ref.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.animate([{ boxShadow: "0 0 0 0 transparent" }, { boxShadow: "0 0 0 4px var(--color-ring)" }, { boxShadow: "0 0 0 0 transparent" }], {
      duration: 900,
      easing: "ease-out",
    });
  }

  const steps: SetupStep[] = SETUP_STEPS.map((s) => {
    if (s.id === "connect") return { ...s, onClick: onOpenConnectors };
    if (s.id === "skill") return { ...s, status: skillDone ? "done" : "pending", onClick: () => focus(skillRef) };
    if (s.id === "team") return { ...s, status: teamDone ? "done" : "pending", onClick: () => focus(teamRef) };
    return s;
  });

  // Copying the prompt or opening it in a coding tool stands in for the agent
  // adding its first pattern a few seconds later.
  function simulate() {
    if (skillDone || waiting) return;
    setWaiting(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setWaiting(false);
      onSkillDone(true);
    }, 3000);
  }

  return (
    <>
      <ViewHeader title="Setup">
        <span className="text-sm text-muted-foreground">
          {steps.filter((s) => s.status === "done").length} of {steps.length} done
        </span>
      </ViewHeader>
      <Scroll className="p-4 sm:p-6">
        <div className="grid w-full items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <SetupChecklist title={`Get ${AGENT_NAME} ready`} steps={steps} className="w-full" />
            <div ref={teamRef} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Your team</p>
                  <p className="text-xs text-muted-foreground">
                    {TEAM.length} members · {TEAM.filter((m) => m.isOnline).length} online
                  </p>
                </div>
                <InviteMembers
                  trigger="share"
                  roles={ROLES}
                  orgMembers={ORG_MEMBERS}
                  initialAssignees={[
                    { id: "carlos", name: "Carlos March", email: "carlos@ai-patterns.dev", status: "confirmed", roleId: "admin" },
                    { id: "ana", name: "Ana López", email: "ana@ai-patterns.dev", status: "confirmed", roleId: "editor" },
                  ]}
                  defaultMessage={`Join me in the ${AGENT_NAME} workspace — we're auditing our AI screens against the pattern catalogue.`}
                  onSend={(chips) => {
                    if (chips.length === 0) return;
                    onTeamDone();
                    onToast(`Invited ${chips.length} ${chips.length === 1 ? "person" : "people"}.`);
                  }}
                />
              </div>
              <ul className="mt-3 space-y-2">
                {TEAM.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 text-sm">
                    <span className={cn("relative flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-white", m.color)}>
                      {m.initials}
                      {m.isOnline && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div ref={skillRef} className="min-w-0 space-y-3 rounded-2xl">
            <PromptOnboarding
              title="Install the skill in your coding agent"
              prompt={SKILL_PROMPT}
              snippet={SKILL_SNIPPET}
              hints={{
                prompt: "Paste this prompt into Claude Code or Cursor — it picks a pattern and builds it in your design system.",
                snippet: "Using Claude Code? Install the ai-patterns skill and ask for screens in plain language.",
              }}
              tools={CODING_TOOLS}
              status={skillDone ? "received" : "waiting"}
              statusLabels={{ waiting: waiting ? "Listening for your first pattern…" : "Waiting for your first pattern…", received: "First pattern added" }}
              alternatives={[
                { id: "browse", title: "Browse the catalogue", description: "Preview every pattern live", icon: LayoutGrid, onClick: () => window.open("/patterns", "_blank") },
                {
                  id: "copy",
                  title: "Copy a component",
                  description: "Grab the code from any pattern's Code tab",
                  icon: Terminal,
                  onClick: () => window.open("/patterns/buttons/shiny-button", "_blank"),
                },
              ]}
              onCopy={simulate}
              onOpenIn={(tool) => {
                simulate();
                onToast(`Opening the prompt in ${tool.label}…`);
              }}
              onSkip={() => {
                onToast("Skipped for now — finish it any time from Setup.");
                onExit();
              }}
              onFinish={() => {
                onToast(teamDone ? `You're all set — ${AGENT_NAME} is ready.` : "Skill installed. Invite your team when you're ready.");
                onExit();
              }}
            />
            {skillDone && (
              <button
                type="button"
                onClick={() => onSkillDone(false)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Reset setup
              </button>
            )}
          </div>

          <div className="space-y-4 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 2xl:col-span-1 2xl:block 2xl:space-y-4">
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-sm font-medium">What {AGENT_NAME} can reach</p>
              <ul className="mt-3 space-y-2.5">
                {connectors.map((c) => (
                  <li key={c.id} className="flex items-center gap-2.5 text-sm">
                    <span className="flex size-7 items-center justify-center rounded-lg border bg-background">
                      <ConnectorIcon connector={c} className="size-3.5" />
                    </span>
                    <span className="flex-1">{c.name}</span>
                    <span className={cn("text-xs", c.connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                      {c.connected ? "Connected" : "Not connected"}
                    </span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={onOpenConnectors} className="mt-3 text-xs font-medium text-primary hover:underline">
                Manage connectors
              </button>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <p className="text-sm font-medium">Learn the basics</p>
              <ul className="mt-2 space-y-1">
                {[
                  { label: "Browse all patterns", href: "/patterns" },
                  { label: "Read a UX spec", href: "/patterns/loaders/thinking-loader" },
                  { label: "The skill on GitHub", href: "https://github.com/carlosmarch/ai-patterns/tree/main/plugins/ai-patterns" },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="-mx-2 flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                    >
                      {l.label}
                      <ArrowUpRight className="size-3.5 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Scroll>
    </>
  );
}
