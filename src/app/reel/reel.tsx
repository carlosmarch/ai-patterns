"use client";

import * as React from "react";
import { AnimatePresence, motion, type TargetAndTransition } from "motion/react";
import {
  ArrowRight,
  Bot,
  Code2,
  Palette,
  FileText,
  GitBranch,
  LayoutGrid,
  Mic,
  Origami,
  Rocket,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";

import { PromptBarPro, type PromptBarItem, type SessionSuggestion } from "@/registry/composer/prompt-bar-pro/component";
import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { ToolCallChip, type ToolCallStatus } from "@/registry/loaders/tool-call-chip/component";
import { MultiAgentTrace, type Agent } from "@/registry/traces/multi-agent-trace/component";
import { TerminalStream, type LogLine } from "@/registry/code/terminal-stream/component";
import { DiffSummaryCard, type DiffFile } from "@/registry/code/diff-summary/component";
import { ToolApproval } from "@/registry/permissions/tool-approval/component";
import { HumanInTheLoop } from "@/registry/agents/human-in-the-loop/component";
import { StreamingText, type StreamSegment } from "@/registry/text/streaming-text/component";
import { ConfidenceIndicator } from "@/registry/indicators/confidence-indicator/component";
import { VoiceWaveform } from "@/registry/voice/voice-waveform/component";
import { LiveTranscript, type TranscriptSegment } from "@/registry/voice/live-transcript/component";
import { ResponseCompare } from "@/registry/compare/response-compare/component";
import { CommandPaletteWindow, type CommandPaletteGroup } from "@/registry/navigation/command-palette/component";
import { CollaborativePresence, type Collaborator } from "@/registry/collaboration/collaborative-presence/component";
import { RateLimit } from "@/registry/errors/rate-limit/component";
import { ShinyButton } from "@/registry/buttons/shiny-button/component";

// ---------------------------------------------------------------------------
// Stage: a fixed 1920×1080 canvas, scaled to fit the window.
// ---------------------------------------------------------------------------

const W = 1920;
const H = 1080;

function useFitScale() {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

// ---------------------------------------------------------------------------
// Scene helpers
// ---------------------------------------------------------------------------

/** Runs `[delay, fn]` steps relative to mount. */
function useSteps(steps: [number, () => void][]) {
  const ref = React.useRef(steps);
  React.useEffect(() => {
    const ids = ref.current.map(([ms, fn]) => window.setTimeout(fn, ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);
}

/** Types into the first editable element inside `root`, like a person would. */
function typeInto(root: HTMLElement | null, selector: string, text: string, charMs = 38) {
  const el = root?.querySelector<HTMLElement>(selector);
  if (!el) return () => {};
  el.focus();
  const ids = [...text].map((ch, i) =>
    window.setTimeout(() => {
      el.focus();
      document.execCommand("insertText", false, ch);
    }, i * charMs)
  );
  return () => ids.forEach((id) => window.clearTimeout(id));
}

function clickWhere(root: HTMLElement | null, selector: string, match?: RegExp) {
  const els = Array.from(root?.querySelectorAll<HTMLElement>(selector) ?? []);
  const el = match ? els.find((e) => match.test(e.textContent ?? "") || match.test(e.getAttribute("aria-label") ?? "")) : els[0];
  el?.click();
}

/** Scales a component up without blurring text (CSS zoom re-lays out rather than resampling). */
function Zoom({ z = 1.7, width, children }: { z?: number; width?: number; children: React.ReactNode }) {
  return <div style={{ zoom: z, width }}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const SUGGESTIONS: SessionSuggestion[] = [
  { id: "agent", label: "Design an agent that feels alive", icon: Sparkles },
  { id: "composer", label: "Build a composer for my chat app", icon: LayoutGrid },
  { id: "diff", label: "Show a pattern for reviewing a diff", icon: Code2 },
];
const PB_SOURCES: PromptBarItem[] = [
  { id: "figma", label: "Figma" },
  { id: "notion", label: "Notion" },
];
const PB_COMMANDS: PromptBarItem[] = [{ id: "ship", label: "/ship", description: "Ship it" }];

function PromptScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let cancel = () => {};
    const id = window.setTimeout(() => {
      cancel = typeInto(ref.current, "[contenteditable=true]", "Build AI interfaces people love to use", 34);
    }, 450);
    return () => {
      window.clearTimeout(id);
      cancel();
    };
  }, []);
  return (
    <div ref={ref}>
      <Zoom z={1.95}>
        <PromptBarPro
          suggestions={SUGGESTIONS}
          sources={PB_SOURCES}
          commands={PB_COMMANDS}
          placeholder="What should we build?"
          className="w-[560px]"
        />
      </Zoom>
    </div>
  );
}

function ThinkingScene() {
  return (
    <Zoom z={2.6}>
      <div className="w-[380px] rounded-2xl border bg-card shadow-2xl">
        <ThinkingLoader words={["Thinking", "Reasoning", "Designing"]} interval={650} />
      </div>
    </Zoom>
  );
}

function ToolCallsScene() {
  const [s, setS] = React.useState<ToolCallStatus[]>(["running", "running", "running"]);
  const set = (i: number) => () => setS((p) => p.map((v, j) => (j === i ? "success" : v)));
  useSteps([
    [700, set(0)],
    [1050, set(1)],
    [1400, set(2)],
  ]);
  const chips = [
    { kind: "search" as const, verb: "Searching", target: "the web", result: "Found 12 sources" },
    { kind: "file" as const, verb: "Reading", target: "brand-guide.pdf", result: "Read 24 pages" },
    { kind: "code" as const, verb: "Running", target: "tests", result: "All 48 passed" },
  ];
  return (
    <Zoom z={2.9}>
      <div className="flex flex-col items-start gap-3">
        {chips.map((c, i) => (
          <motion.div
            key={c.target}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 260, damping: 22 }}
          >
            <ToolCallChip {...c} status={s[i]} />
          </motion.div>
        ))}
      </div>
    </Zoom>
  );
}

function agentsAt(step: number): Agent[] {
  const st = (start: number, end: number) => (step >= end ? "done" : step >= start ? "running" : "queued") as Agent["status"];
  const root = st(0, 7);
  return [
    {
      id: "lead",
      name: "Lead agent",
      icon: Origami,
      status: root,
      currentStep: root === "running" ? "Coordinating sub-agents" : undefined,
      elapsedSeconds: step * 3,
      steps: root === "done" ? [{ label: "Launch plan ready" }] : [],
    },
    {
      id: "research",
      name: "Research agent",
      icon: Search,
      status: st(1, 4),
      currentStep: "Scanning 214 sources",
      elapsedSeconds: Math.max(0, Math.min(step, 4) - 1) * 3,
      steps: step >= 4 ? [{ label: "Summarized market", meta: "0.94" }] : [],
    },
    {
      id: "design",
      name: "Design agent",
      icon: Palette,
      status: st(2, 5),
      currentStep: "Composing the UI",
      elapsedSeconds: Math.max(0, Math.min(step, 5) - 2) * 3,
      steps: step >= 5 ? [{ label: "Generated 3 variants" }] : [],
    },
    {
      id: "ship",
      name: "Ship agent",
      icon: GitBranch,
      status: st(3, 6),
      currentStep: "Opening pull request",
      elapsedSeconds: Math.max(0, Math.min(step, 6) - 3) * 3,
      steps: step >= 6 ? [{ label: "Opened PR #128" }] : [],
    },
  ];
}

function AgentsScene() {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, 7)), 330);
    return () => window.clearInterval(id);
  }, []);
  return (
    <Zoom z={2}>
      <MultiAgentTrace agents={agentsAt(step)} className="w-[460px]" />
    </Zoom>
  );
}

const TERMINAL: Omit<LogLine, "id">[] = [
  { text: "$ npx ai-patterns add prompt-bar-pro", level: "default" },
  { text: "→ Resolving motion, radix, lucide", level: "info" },
  { text: "✓ components/prompt-bar-pro.tsx", level: "success" },
  { text: "✓ components/thinking-loader.tsx", level: "success" },
  { text: "✓ components/multi-agent-trace.tsx", level: "success" },
  { text: "✓ Ready in 1.2s — ship it.", level: "success" },
];

function TerminalScene() {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (n >= TERMINAL.length) return;
    const id = window.setTimeout(() => setN((c) => c + 1), n === 0 ? 350 : 220);
    return () => window.clearTimeout(id);
  }, [n]);
  const lines = TERMINAL.slice(0, n).map((l, i) => ({ ...l, id: String(i) }));
  return (
    <Zoom z={2.15}>
      <TerminalStream
        command="npx ai-patterns add prompt-bar-pro"
        lines={lines}
        status={n >= TERMINAL.length ? "done" : "running"}
        defaultOpen
        className="w-[500px]"
      />
    </Zoom>
  );
}

const DIFF: DiffFile[] = [
  { id: "1", name: "app/chat/page.tsx", additions: 48, deletions: 12 },
  { id: "2", name: "components/prompt-bar.tsx", additions: 136, deletions: 0 },
  { id: "3", name: "components/streaming-text.tsx", additions: 92, deletions: 0 },
  { id: "4", name: "components/tool-call-chip.tsx", additions: 64, deletions: 0 },
  { id: "5", name: "components/thinking-loader.tsx", additions: 51, deletions: 0 },
];

function DiffScene() {
  return (
    <Zoom z={2.2}>
      <DiffSummaryCard files={DIFF} visibleCount={3} timestamp="Just now" className="w-[460px]" />
    </Zoom>
  );
}

function ApprovalScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  useSteps([[1350, () => clickWhere(ref.current, "button", /^\s*Allow\s*$/)]]);
  return (
    <div ref={ref}>
      <Zoom z={2.3}>
        <ToolApproval
          icon={Rocket}
          toolName="Deploy"
          summary="Ship the new chat UI to production"
          detail="vercel deploy --prod"
          className="w-[460px]"
        />
      </Zoom>
    </div>
  );
}

const HITL = [
  {
    id: "tone",
    question: "How should the launch post sound?",
    options: [
      { id: "bold", label: "Bold and punchy" },
      { id: "friendly", label: "Warm and friendly" },
      { id: "technical", label: "Deeply technical" },
    ],
    freeTextPlaceholder: "Something else...",
  },
];

function HitlScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  useSteps([[900, () => clickWhere(ref.current, "label, [role=radio], button", /Bold and punchy/)]]);
  return (
    <div ref={ref}>
      <Zoom z={2.1}>
        <HumanInTheLoop questions={HITL} className="w-[440px]" />
      </Zoom>
    </div>
  );
}

const STREAM: StreamSegment[] = [
  { type: "text", content: "40+ animated patterns for AI products — prompt bars, traces, approvals and voice. " },
  { type: "source", label: "ai-patterns" },
  { type: "text", content: " Copy, paste, and ship interfaces that feel alive." },
];

function StreamScene() {
  return (
    <Zoom z={2.15}>
      <div className="w-[480px] rounded-2xl border bg-card p-4 shadow-2xl">
        <StreamingText segments={STREAM} speed={13} followUps={["Browse the patterns", "Install the skill"]} />
      </div>
    </Zoom>
  );
}

function ConfidenceScene() {
  return (
    <Zoom z={2.6}>
      <div className="flex w-[400px] flex-col gap-4 rounded-2xl border bg-card p-5 shadow-2xl">
        <ConfidenceIndicator level="high" percentage={96} reason="Confirmed by three independent sources." />
        <p className="text-sm leading-relaxed">
          Teams ship AI features{" "}
          <span className="font-medium">
            3× faster
            <ConfidenceIndicator level="high" variant="dot" reason="Backed by usage data." className="ml-1" />
          </span>{" "}
          with ready-made patterns.
        </p>
      </div>
    </Zoom>
  );
}

const VOICE_SCRIPT: { speaker: TranscriptSegment["speaker"]; text: string }[] = [
  { speaker: "user", text: "Make my AI app feel magical." },
  { speaker: "assistant", text: "Done — motion is built in." },
];

function VoiceScene() {
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);
  const [speaking, setSpeaking] = React.useState(false);
  React.useEffect(() => {
    const ids: number[] = [];
    let t = 250;
    VOICE_SCRIPT.forEach(({ speaker, text }, turn) => {
      const id = `s${turn}`;
      const words = text.split(" ");
      if (speaker === "assistant") ids.push(window.setTimeout(() => setSpeaking(true), t));
      words.forEach((_, i) => {
        const partial = words.slice(0, i + 1).join(" ");
        ids.push(
          window.setTimeout(
            () => setSegments((p) => [...p.filter((s) => s.id !== id), { id, speaker, text: partial, final: false }]),
            t
          )
        );
        t += 95;
      });
      ids.push(window.setTimeout(() => setSegments((p) => p.map((s) => (s.id === id ? { ...s, final: true } : s))), t));
      t += 300;
    });
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);
  return (
    <Zoom z={2.15}>
      <div className="flex w-[440px] flex-col gap-3">
        <div className="flex items-center justify-center rounded-2xl border bg-card py-5 shadow-2xl">
          <VoiceWaveform state={speaking ? "speaking" : "listening"} className="w-full" />
        </div>
        <LiveTranscript segments={segments} />
      </div>
    </Zoom>
  );
}

function CompareScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  useSteps([[1250, () => clickWhere(ref.current, "[role=radio]", /Response B/)]]);
  return (
    <div ref={ref}>
      <Zoom z={1.6}>
        <ResponseCompare
          prompt="How fast can we ship the new chat UI?"
          responses={[
            {
              id: "a",
              label: "Response A",
              content: "From scratch: weeks of polish, edge cases and hand-tuned animation before it feels right.",
            },
            {
              id: "b",
              label: "Response B",
              content: "With ai-patterns: copy, paste, customize. Animated, accessible and live by lunch.",
            },
          ]}
          className="w-[760px]"
        />
      </Zoom>
    </div>
  );
}

const PALETTE: CommandPaletteGroup[] = [
  {
    label: "Patterns",
    items: [
      { id: "1", label: "Multi-Agent Trace", icon: Workflow, meta: "Traces" },
      { id: "2", label: "Create Agent", icon: Bot, meta: "Agents" },
      { id: "3", label: "Agent Triggers", icon: Bot, meta: "Agents" },
      { id: "4", label: "Human in the Loop", icon: Bot, meta: "Agents" },
      { id: "5", label: "Streaming Text", icon: FileText, meta: "Text" },
      { id: "6", label: "Voice Waveform", icon: Mic, meta: "Voice" },
    ],
  },
];

function PaletteScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let cancel = () => {};
    const id = window.setTimeout(() => (cancel = typeInto(ref.current, "input", "agent", 90)), 550);
    return () => {
      window.clearTimeout(id);
      cancel();
    };
  }, []);
  return (
    <div ref={ref}>
      <Zoom z={2}>
        <CommandPaletteWindow groups={PALETTE} placeholder="Search patterns" autoFocus={false} className="w-[480px]" />
      </Zoom>
    </div>
  );
}

const TEAM: Collaborator[] = [
  { id: "u1", name: "Sarah Chen", role: "Admin", initials: "SC", color: "bg-violet-500", isOnline: true },
  { id: "u2", name: "Marcus Webb", role: "Editor", initials: "MW", color: "bg-sky-500", isOnline: false },
  { id: "u3", name: "Priya Nair", role: "Editor", initials: "PN", color: "bg-amber-500", isOnline: true },
  { id: "u4", name: "James Okafor", role: "Viewer", initials: "JO", color: "bg-rose-500", isOnline: false },
  { id: "u5", name: "Lin Zhang", role: "Viewer", initials: "LZ", color: "bg-teal-500", isOnline: true },
];

function PresenceScene() {
  const [team, setTeam] = React.useState(TEAM);
  const online = (id: string) => () => setTeam((p) => p.map((c) => (c.id === id ? { ...c, isOnline: true } : c)));
  useSteps([
    [500, online("u2")],
    [900, online("u4")],
  ]);
  return (
    <Zoom z={3.6}>
      <CollaborativePresence collaborators={team} />
    </Zoom>
  );
}

function LimitScene() {
  return (
    <Zoom z={2.4}>
      <RateLimit
        label="Approaching weekly usage limit"
        resetTime="18:00"
        upgradeLabel="Get more usage"
        onUpgrade={() => {}}
        className="w-[500px]"
      />
    </Zoom>
  );
}

function IntroScene() {
  return (
    <div className="flex flex-col items-center gap-8 text-white">
      <motion.div
        initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="grid size-32 place-items-center rounded-[2.2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl"
      >
        <Origami className="size-16" strokeWidth={1.5} />
      </motion.div>
      <h1 className="text-[150px] leading-none font-semibold tracking-[-0.05em]">
        {"AI Patterns".split("").map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: 80, opacity: 0, filter: "blur(12px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.15 + i * 0.035, type: "spring", stiffness: 220, damping: 20 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </h1>
    </div>
  );
}

function OutroScene() {
  return (
    <div className="flex flex-col items-center gap-12 text-white">
      <h2 className="text-center text-[120px] leading-[0.95] font-semibold tracking-[-0.05em]">
        {["Copy.", "Paste.", "Ship."].map((w, i) => (
          <motion.span
            key={w}
            className="mx-4 inline-block"
            initial={{ y: 90, opacity: 0, filter: "blur(14px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.1 + i * 0.22, type: "spring", stiffness: 200, damping: 20 }}
          >
            {w}
          </motion.span>
        ))}
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.85, type: "spring", stiffness: 220, damping: 20 }}
      >
        <Zoom z={2.2}>
          <ShinyButton className="whitespace-nowrap">
            <span className="flex items-center gap-2">
              Browse 40+ patterns <ArrowRight className="size-4" />
            </span>
          </ShinyButton>
        </Zoom>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

type Style = "rise" | "slide" | "zoom";

interface Scene {
  id: string;
  /** Registry title shown in the corner. */
  name?: string;
  category?: string;
  /** Marketing line, typed in under the UI. */
  headline?: string;
  ms: number;
  style: Style;
  /** Background accent hues [a, b, c]. */
  hues: [string, string, string];
  Render: React.ComponentType;
}

const SCENES: Scene[] = [
  { id: "intro", ms: 2100, style: "zoom", hues: ["#7c3aed", "#2563eb", "#db2777"], Render: IntroScene, headline: "Motion-ready UI for AI products." },
  { id: "prompt", name: "Prompt Bar Pro", category: "Composer", headline: "Start with a better prompt.", ms: 3000, style: "rise", hues: ["#6d28d9", "#0ea5e9", "#9333ea"], Render: PromptScene },
  { id: "thinking", name: "Thinking Loader", category: "Loaders", headline: "Show it thinking.", ms: 1700, style: "zoom", hues: ["#4f46e5", "#7c3aed", "#0891b2"], Render: ThinkingScene },
  { id: "tools", name: "Tool Call Chip", category: "Loaders", headline: "Every tool call, live.", ms: 2000, style: "slide", hues: ["#0891b2", "#2563eb", "#10b981"], Render: ToolCallsScene },
  { id: "agents", name: "Multi-Agent Trace", category: "Traces", headline: "Orchestrate agents in parallel.", ms: 2700, style: "rise", hues: ["#7c3aed", "#db2777", "#2563eb"], Render: AgentsScene },
  { id: "terminal", name: "Terminal Stream", category: "Code", headline: "Stream every command.", ms: 2300, style: "slide", hues: ["#059669", "#0f766e", "#2563eb"], Render: TerminalScene },
  { id: "diff", name: "Diff Summary", category: "Code", headline: "Review changes at a glance.", ms: 1800, style: "zoom", hues: ["#16a34a", "#0891b2", "#4f46e5"], Render: DiffScene },
  { id: "approval", name: "Tool Approval", category: "Permissions", headline: "Keep humans in control.", ms: 2200, style: "rise", hues: ["#ea580c", "#db2777", "#7c3aed"], Render: ApprovalScene },
  { id: "hitl", name: "Human in the Loop", category: "Agents", headline: "Ask before acting.", ms: 2000, style: "slide", hues: ["#d97706", "#ea580c", "#9333ea"], Render: HitlScene },
  { id: "stream", name: "Streaming Text", category: "Text", headline: "Answers that stream.", ms: 2700, style: "rise", hues: ["#2563eb", "#7c3aed", "#0ea5e9"], Render: StreamScene },
  { id: "confidence", name: "Confidence Indicator", category: "Indicators", headline: "Show how sure it is.", ms: 1800, style: "zoom", hues: ["#10b981", "#0891b2", "#65a30d"], Render: ConfidenceScene },
  { id: "voice", name: "Voice Waveform", category: "Voice", headline: "Just talk to it.", ms: 2500, style: "slide", hues: ["#0284c7", "#6366f1", "#06b6d4"], Render: VoiceScene },
  { id: "compare", name: "Response Compare", category: "Compare", headline: "Let users pick the best.", ms: 2300, style: "rise", hues: ["#9333ea", "#2563eb", "#db2777"], Render: CompareScene },
  { id: "palette", name: "Command Palette", category: "Navigation", headline: "Jump anywhere, instantly.", ms: 2000, style: "zoom", hues: ["#4338ca", "#7c3aed", "#0f172a"], Render: PaletteScene },
  { id: "presence", name: "Collaborative Presence", category: "Collaboration", headline: "Build it together.", ms: 1700, style: "slide", hues: ["#db2777", "#f59e0b", "#7c3aed"], Render: PresenceScene },
  { id: "limit", name: "Rate Limit", category: "Errors", headline: "Even the limits look good.", ms: 1800, style: "rise", hues: ["#dc2626", "#ea580c", "#9333ea"], Render: LimitScene },
  { id: "outro", ms: 2800, style: "zoom", hues: ["#7c3aed", "#2563eb", "#db2777"], Render: OutroScene, headline: "ai-patterns — the motion layer for AI apps." },
];

const PATTERN_COUNT = SCENES.filter((s) => s.name).length;

const ENTER: Record<Style, TargetAndTransition> = {
  rise: { opacity: 0, y: 160, scale: 0.86, rotateX: 24, filter: "blur(18px)" },
  slide: { opacity: 0, x: 520, rotateY: -28, scale: 0.9, filter: "blur(18px)" },
  zoom: { opacity: 0, scale: 1.22, filter: "blur(24px)" },
};
const EXIT: Record<Style, TargetAndTransition> = {
  rise: { opacity: 0, y: -140, scale: 1.05, rotateX: -16, filter: "blur(16px)" },
  slide: { opacity: 0, x: -520, rotateY: 28, scale: 0.9, filter: "blur(16px)" },
  zoom: { opacity: 0, scale: 0.7, filter: "blur(18px)" },
};
const SHOW: TargetAndTransition = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  filter: "blur(0px)",
  // A lingering filter would stop the glass cards from blurring the background.
  transitionEnd: { filter: "none" },
};

// ---------------------------------------------------------------------------
// Chrome: background, typed headline, progress
// ---------------------------------------------------------------------------

function Background({ hues }: { hues: [string, string, string] }) {
  const blobs = [
    { size: 1100, x: [-260, -120, -260], y: [-240, -120, -240], left: -120, top: -220 },
    { size: 1000, x: [0, -140, 0], y: [0, 120, 0], left: 1100, top: 300 },
    { size: 800, x: [0, 160, 0], y: [0, -100, 0], left: 500, top: 620 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06060b]">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: b.size, height: b.size, left: b.left, top: b.top, filter: "blur(140px)" }}
          animate={{ x: b.x, y: b.y, backgroundColor: hues[i], opacity: i === 2 ? 0.45 : 0.6 }}
          transition={{
            x: { duration: 14 + i * 3, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 12 + i * 4, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 0.9, ease: "easeInOut" },
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black, transparent)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

function Typed({ text, delay = 250, charMs = 30 }: { text: string; delay?: number; charMs?: number }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let i = 0;
    let id = window.setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < text.length) id = window.setTimeout(tick, charMs);
    }, delay);
    return () => window.clearTimeout(id);
  }, [text, delay, charMs]);
  return (
    <span>
      {text.slice(0, n)}
      <motion.span
        className="ml-1 inline-block h-[0.85em] w-[0.08em] translate-y-[0.1em] bg-current align-baseline"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Reel
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __reel?: { startedAt: number; endedAt?: number; totalMs: number };
    __reelPlay?: () => void;
  }
}

export function Reel() {
  const scale = useFitScale();
  const [index, setIndex] = React.useState(0);
  const [cycle, setCycle] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const record = React.useRef(false);

  // `?record` waits for scripts/record-reel.mjs to call __reelPlay() and
  // plays through once instead of looping.
  React.useEffect(() => {
    record.current = new URLSearchParams(window.location.search).has("record");
    const play = () => {
      window.__reel = { startedAt: Date.now(), totalMs: SCENES.reduce((t, s) => t + s.ms, 0) };
      setPlaying(true);
    };
    if (record.current) window.__reelPlay = play;
    else play();
  }, []);

  React.useEffect(() => {
    if (done || !playing) return;
    const id = window.setTimeout(() => {
      if (index < SCENES.length - 1) return setIndex(index + 1);
      if (record.current) {
        if (window.__reel) window.__reel.endedAt = Date.now();
        return setDone(true);
      }
      setIndex(0);
      setCycle((c) => c + 1);
    }, SCENES[index].ms);
    return () => window.clearTimeout(id);
  }, [index, done, playing]);

  const scene = SCENES[index];
  const patternNo = SCENES.slice(0, index + 1).filter((s) => s.name).length;
  const isBookend = !scene.name;

  return (
    <div className="dark fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black">
      <style>{GLASS_CSS}</style>
      <div
        className="reel-stage relative shrink-0 overflow-hidden text-foreground"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        <Background hues={scene.hues} />

        {/* Top bar */}
        <div className="absolute inset-x-[88px] top-[64px] flex items-center justify-between text-white/80">
          <div className="flex items-center gap-3 text-[26px] font-semibold tracking-tight">
            <Origami className="size-8" />
            AI Patterns
          </div>
          <div className="font-mono text-[20px] tracking-wide text-white/50">ai-patterns / motion reel</div>
        </div>

        {/* UI */}
        <div
          className="absolute inset-x-0 flex items-center justify-center"
          style={{ top: isBookend ? 0 : 140, bottom: isBookend ? 120 : 260, perspective: 1800 }}
        >
          <AnimatePresence>
            {playing && (
            <motion.div
              key={`${cycle}-${scene.id}`}
              className="absolute"
              initial={ENTER[scene.style]}
              animate={SHOW}
              exit={{ ...EXIT[scene.style], transition: { duration: 0.35, ease: [0.64, 0, 0.78, 0] } }}
              transition={{ type: "spring", stiffness: 150, damping: 21, mass: 0.9, delay: 0.12 }}
            >
              <scene.Render />
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Typed marketing line */}
        <div
          className={
            isBookend
              ? "absolute inset-x-0 bottom-[190px] text-center text-[46px] font-medium tracking-tight text-white/75"
              : "absolute inset-x-0 bottom-[120px] text-center text-[68px] font-semibold tracking-[-0.035em] text-white"
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cycle}-${scene.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)", transition: { duration: 0.18 } }}
              transition={{ duration: 0.3 }}
            >
              {playing && scene.headline && <Typed text={scene.headline} delay={isBookend ? 700 : 280} charMs={isBookend ? 28 : 32} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pattern label */}
        <div className="absolute inset-x-[88px] bottom-[56px] flex items-end justify-between text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cycle}-${scene.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4 text-[22px]"
            >
              {scene.name && (
                <>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-medium backdrop-blur-md">
                    {scene.category}
                  </span>
                  <span className="text-white/70">{scene.name}</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="font-mono text-[22px] tabular-nums text-white/60">
            {isBookend ? `${PATTERN_COUNT} patterns` : `${String(patternNo).padStart(2, "0")} / ${PATTERN_COUNT}`}
          </div>
        </div>

        {/* Progress */}
        <div className="absolute inset-x-[88px] bottom-[34px] flex gap-1.5">
          {SCENES.map((s, i) => (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                key={`${cycle}-${i === index}`}
                className="h-full origin-left bg-white/80"
                initial={{ scaleX: i < index ? 1 : 0 }}
                animate={{ scaleX: i <= index ? 1 : 0 }}
                transition={{ duration: i === index ? s.ms / 1000 : 0, ease: "linear" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Glass theme: every card-like surface turns translucent and blurs the
// gradient behind it, so the UI floats on top of the background.
const GLASS_CSS = `
html, body { overflow: hidden; }
.reel-stage {
  --background: oklch(0.18 0.02 280 / 0.55);
  --card: oklch(0.2 0.02 280 / 0.5);
  --popover: oklch(0.2 0.02 280 / 0.85);
  --muted: oklch(1 0 0 / 0.07);
  --secondary: oklch(1 0 0 / 0.08);
  --accent: oklch(1 0 0 / 0.1);
  --border: oklch(1 0 0 / 0.16);
  --input: oklch(1 0 0 / 0.18);
  --muted-foreground: oklch(0.82 0.01 280);
}
.reel-stage :is(.bg-card, .bg-background, .bg-popover) {
  backdrop-filter: blur(28px) saturate(1.5);
  -webkit-backdrop-filter: blur(28px) saturate(1.5);
  box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.08);
}
`;
