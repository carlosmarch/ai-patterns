"use client";

import * as React from "react";
import {
  Bot,
  Check,
  Code2,
  FileText,
  GitBranch,
  Globe,
  LayoutGrid,
  Menu,
  Mic,
  MousePointer2,
  Plus,
  RotateCcw,
  SquareTerminal,
  Terminal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { AgentTriggers, DEFAULT_TRIGGERS } from "@/registry/agents/agent-triggers/component";
import { ChatBubble } from "@/registry/messages/chat-bubble/component";
import { ConnectivityError } from "@/registry/errors/connectivity-error/component";
import { ConnectorPanel } from "@/registry/permissions/connector-panel/component";
import { CreateAgent } from "@/registry/agents/create-agent/component";
import { Flowchart, type FlowchartNode } from "@/registry/flowcharts/trigger-condition/component";
import { InstructionTools } from "@/registry/agents/instruction-tools/component";
import { ListeningState } from "@/registry/voice/listening-state/component";
import { LiveTranscript, type TranscriptSegment } from "@/registry/voice/live-transcript/component";
import { ProcedureBuilder } from "@/registry/agents/procedure-builder/component";
import { PromptOnboarding, type CodingTool, type PromptOnboardingStatus } from "@/registry/onboarding/prompt-onboarding/component";
import { SetupChecklist, type SetupStep } from "@/registry/navigation/setup-checklist/component";
import { ShinyButton } from "@/registry/buttons/shiny-button/component";
import { StopGenerationButton } from "@/registry/buttons/stop-generation-button/component";
import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { VoiceWaveform } from "@/registry/voice/voice-waveform/component";

import {
  AGENT_ICON,
  AGENT_NAME,
  GUIDELINE_TOOLS,
  PROCEDURES,
  PROCEDURE_STEPS,
  PROCEDURE_TARGETS,
  SETUP_STEPS,
  SKILL_PROMPT,
  SKILL_SNIPPET,
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

// ---------------------------------------------------------------------------
// Train — procedures and guidelines
// ---------------------------------------------------------------------------

export function TrainView() {
  const [tab, setTab] = React.useState<"procedures" | "guidelines">("procedures");
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

export function PlaygroundView() {
  const [tab, setTab] = React.useState<"chat" | "voice">("chat");

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

const FLOW_NODES: FlowchartNode[] = [
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
        fieldOptions: [
          { id: "files", label: "files changed" },
          { id: "path", label: "path" },
        ],
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
        fieldOptions: [
          { id: "files", label: "files changed" },
          { id: "path", label: "path" },
        ],
        value: { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
        valueOptions: [
          { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
          { id: "skill", label: "plugins/ai-patterns/**", dotColor: "bg-violet-500" },
        ],
      },
    ],
  },
];

export function WorkflowsView() {
  return (
    <>
      <ViewHeader title="Workflows">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Live · ran 14 times this week
        </span>
      </ViewHeader>
      <Scroll className="px-6 py-6">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">PR review automation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Runs the “Review a pattern” procedure on large registry PRs.
            </p>
          </div>
          <Flowchart nodes={FLOW_NODES} className="w-full" />
        </div>
      </Scroll>
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

const CONNECTORS = [
  { id: "github", name: "GitHub", status: "Connected", detail: "carlosmarch/ai-patterns" },
  { id: "figma", name: "Figma", status: "Connected", detail: "2 files" },
  { id: "vercel", name: "Vercel Analytics", status: "Connected", detail: "ai-patterns.dev" },
  { id: "slack", name: "Slack", status: "Not connected", detail: "#design-requests" },
];

export function ConnectorsView() {
  return (
    <>
      <ViewHeader title="Connectors" />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 space-y-1 overflow-y-auto border-r p-3 xl:block">
          {CONNECTORS.map((c) => (
            <div key={c.id} className={cn("rounded-lg px-3 py-2", c.id === "github" && "bg-accent")}>
              <p className="flex items-center justify-between text-sm font-medium">
                {c.name}
                <span className={cn("text-[10px]", c.status === "Connected" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                  {c.status}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{c.detail}</p>
            </div>
          ))}
        </aside>
        <Scroll className="p-4 sm:p-6">
          <ConnectorPanel
            appName="GitHub"
            appDescription="Read the registry, open pull requests, and comment on reviews in carlosmarch/ai-patterns."
            appIcon={<GitHubMark className="size-5" />}
            verified
            overview={["Read pattern source and specs", "Open PRs with new or updated patterns", "Comment on pattern review PRs"]}
            links={[
              { label: "Repository", href: "https://github.com/carlosmarch/ai-patterns", icon: Globe },
              { label: "Docs", href: "https://docs.github.com/en/rest", icon: FileText },
            ]}
            toolGroups={[
              {
                id: "read",
                label: "Read-only tools",
                tools: [
                  { id: "get-file", name: "Get file contents", description: "Read a file such as a pattern's component.tsx or pattern.ts.", badge: "MCP", permission: "allow" },
                  { id: "search-code", name: "Search code", description: "Find where a pattern or prop is used across the registry.", badge: "MCP", permission: "allow" },
                  { id: "list-prs", name: "List pull requests", description: "See open pattern PRs and their review status.", badge: "MCP", permission: "allow" },
                ],
              },
              {
                id: "write",
                label: "Write tools",
                tools: [
                  { id: "create-pr", name: "Create pull request", description: "Open a PR with a new pattern or a spec update.", badge: "MCP", permission: "always-ask" },
                  { id: "comment", name: "Comment on a pull request", description: "Post review findings on a pattern PR.", badge: "MCP", permission: "always-ask" },
                  { id: "push", name: "Push files", description: "Commit changes directly to a branch.", badge: "MCP", permission: "always-ask" },
                ],
              },
              {
                id: "destructive",
                label: "Destructive tools",
                tools: [
                  { id: "merge", name: "Merge pull request", description: "Merge a PR into main. Pattern PRs should be merged by a person.", badge: "MCP", permission: "disable" },
                  { id: "delete-branch", name: "Delete branch", description: "Remove a branch after it's merged.", badge: "MCP", permission: "disable" },
                ],
              },
            ]}
            className="mx-auto h-[600px] max-w-2xl"
          />
        </Scroll>
      </div>
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
            <ConnectivityError
              title="Couldn't reach Vercel Analytics"
              onRetry={retry}
              onViewDetails={() => {}}
              className="w-full"
            />
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

export function SetupView({ onInvite, onDone }: { onInvite: () => void; onDone: (count: number) => void }) {
  const [status, setStatus] = React.useState<PromptOnboardingStatus>("waiting");
  const timer = React.useRef<number>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const steps: SetupStep[] = SETUP_STEPS.map((s) => {
    if (s.id === "skill") return { ...s, status: status === "received" ? "done" : "pending" };
    if (s.id === "team") return { ...s, onClick: onInvite };
    return s;
  });
  const doneCount = steps.filter((s) => s.status === "done").length;

  React.useEffect(() => onDone(doneCount), [doneCount, onDone]);

  function simulate() {
    if (status === "received") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("received"), 3000);
  }

  return (
    <>
      <ViewHeader title="Setup" />
      <Scroll className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 lg:flex-row">
          <SetupChecklist title="Get Origami ready" steps={steps} className="w-full shrink-0 lg:w-72" />
          <div className="w-full min-w-0 flex-1 space-y-3">
            <PromptOnboarding
              title="Install the skill in your coding agent"
              prompt={SKILL_PROMPT}
              snippet={SKILL_SNIPPET}
              hints={{
                prompt: "Paste this prompt into Claude Code or Cursor — it picks a pattern and builds it in your design system.",
                snippet: "Using Claude Code? Install the ai-patterns skill and ask for screens in plain language.",
              }}
              tools={CODING_TOOLS}
              status={status}
              statusLabels={{ waiting: "Waiting for your first pattern…", received: "First pattern added" }}
              alternatives={[
                { id: "browse", title: "Browse the catalogue", description: "Preview every pattern live", icon: LayoutGrid, onClick: () => window.open("/patterns", "_blank") },
                { id: "copy", title: "Copy a component", description: "Grab the code from any pattern's Code tab", icon: Terminal },
              ]}
              onCopy={simulate}
              onOpenIn={simulate}
              onSkip={() => {}}
              onFinish={() => {}}
            />
            {status === "received" && (
              <button
                type="button"
                onClick={() => setStatus("waiting")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Reset setup
              </button>
            )}
          </div>
        </div>
      </Scroll>
    </>
  );
}

