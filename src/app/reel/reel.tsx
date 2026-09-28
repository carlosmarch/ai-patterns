"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
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
// Stage: a fixed canvas, 1920×1080 or 1080×1920 (/reel/vertical, for
// Instagram), scaled to fit the window.
// ---------------------------------------------------------------------------

interface Layout {
  vertical: boolean;
  W: number;
  H: number;
  /** Multiplies every scene's zoom. */
  zoom: number;
  /** Distance from the bottom edge to the newest feed item. */
  feedBottom: number;
  headlineBottom: number;
  bookendBottom: number;
  bookendHeadlineBottom: number;
  labelBottom: number;
  gutter: number;
  wordmarkTop: number;
  rest: { x: number; y: number };
}

const LANDSCAPE: Layout = {
  vertical: false,
  W: 1920,
  H: 1080,
  zoom: 1,
  feedBottom: 250,
  headlineBottom: 112,
  bookendBottom: 120,
  bookendHeadlineBottom: 190,
  labelBottom: 56,
  gutter: 88,
  wordmarkTop: 60,
  rest: { x: 1380, y: 800 },
};

// Instagram covers roughly the top 220px and bottom 380px with its own UI,
// so the headline and labels sit above that band.
const VERTICAL: Layout = {
  vertical: true,
  W: 1080,
  H: 1920,
  zoom: 0.9,
  feedBottom: 560,
  headlineBottom: 400,
  bookendBottom: 300,
  bookendHeadlineBottom: 470,
  labelBottom: 330,
  gutter: 72,
  wordmarkTop: 250,
  rest: { x: 800, y: 1320 },
};

const LayoutContext = React.createContext<Layout>(LANDSCAPE);
const useLayout = () => React.useContext(LayoutContext);

function useFitScale({ W, H }: Layout) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [W, H]);
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

function find(root: HTMLElement | null, selector: string, match?: RegExp) {
  const els = Array.from(root?.querySelectorAll<HTMLElement>(selector) ?? []);
  return match ? els.find((e) => match.test(e.textContent ?? "") || match.test(e.getAttribute("aria-label") ?? "")) : els[0];
}

/** Scales a component up without blurring text (CSS zoom re-lays out rather than resampling). */
function Zoom({ z = 1.7, width, children }: { z?: number; width?: number; children: React.ReactNode }) {
  const { zoom } = useLayout();
  return <div style={{ zoom: z * zoom, width }}>{children}</div>;
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
  const cursor = useCursor();
  useSteps([
    [200, () => cursor.to(find(ref.current, "[contenteditable=true]"))],
    [420, () => cursor.tap()],
    [2250, () => cursor.to(find(ref.current, "button", /Toggle dictation/)?.nextElementSibling ?? null)],
  ]);
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
  const ref = React.useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  useSteps([
    [550, () => cursor.to(find(ref.current, "button", /Show 2 more/))],
    [1000, () => {
      cursor.tap();
      find(ref.current, "button", /Show 2 more/)?.click();
    }],
  ]);
  return (
    <div ref={ref}>
      <Zoom z={2.1}>
        <DiffSummaryCard files={DIFF} visibleCount={3} timestamp="Just now" className="w-[460px]" />
      </Zoom>
    </div>
  );
}

function ApprovalScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const allow = () => find(ref.current, "button", /^\s*Allow\s*$/);
  useSteps([
    [700, () => cursor.to(allow())],
    [1250, () => {
      cursor.tap();
      allow()?.click();
    }],
  ]);
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
  const cursor = useCursor();
  const option = () => find(ref.current, "label, [role=radio], button", /Bold and punchy/);
  useSteps([
    [450, () => cursor.to(option())],
    [900, () => {
      cursor.tap();
      option()?.click();
    }],
  ]);
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
  const { vertical } = useLayout();
  const cursor = useCursor();
  const pick = () => find(ref.current, "[role=radio]", /Response B/);
  useSteps([
    [650, () => cursor.to(pick())],
    [1200, () => {
      cursor.tap();
      pick()?.click();
    }],
  ]);
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
          className={vertical ? "w-[640px]" : "w-[760px]"}
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
  const cursor = useCursor();
  useSteps([
    [250, () => cursor.to(find(ref.current, "input"))],
    [500, () => cursor.tap()],
    [1300, () => cursor.to(find(ref.current, "[role=option], button", /Multi-Agent Trace/))],
  ]);
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
  { id: "u2", name: "Marcus Webb", role: "Editor", initials: "MW", color: "bg-sky-500", isOnline: true },
  { id: "u3", name: "Priya Nair", role: "Editor", initials: "PN", color: "bg-amber-500", isOnline: true },
  { id: "u4", name: "James Okafor", role: "Viewer", initials: "JO", color: "bg-rose-500", isOnline: true },
  { id: "u5", name: "Lin Zhang", role: "Viewer", initials: "LZ", color: "bg-teal-500", isOnline: true },
];

// Presence is static on purpose: its avatars re-sort with layout animations
// when someone comes online, and those miscalculate under the scene's zoom.
function PresenceScene() {
  const ref = React.useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  useSteps([[700, () => cursor.to(find(ref.current, "span, div", /^SC$/))]]);
  return (
    <div ref={ref} className="pb-2">
      <Zoom z={3.6}>
        <CollaborativePresence collaborators={TEAM} />
      </Zoom>
    </div>
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
  const { vertical } = useLayout();
  return (
    <div className="flex flex-col items-center gap-12 text-white">
      <h2
        className={
          vertical
            ? "flex flex-col items-center text-[150px] leading-[1] font-semibold tracking-[-0.05em]"
            : "text-center text-[120px] leading-[0.95] font-semibold tracking-[-0.05em]"
        }
      >
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

interface Scene {
  id: string;
  /** Registry title shown in the corner. */
  name?: string;
  category?: string;
  /** Marketing line, typed in under the UI. */
  headline?: string;
  ms: number;
  Render: React.ComponentType;
}

const SCENES: Scene[] = [
  { id: "intro", ms: 2100, Render: IntroScene, headline: "Motion-ready UI for AI products." },
  { id: "prompt", name: "Prompt Bar Pro", category: "Composer", headline: "Start with a better prompt.", ms: 3000, Render: PromptScene },
  { id: "thinking", name: "Thinking Loader", category: "Loaders", headline: "Show it thinking.", ms: 1700, Render: ThinkingScene },
  { id: "tools", name: "Tool Call Chip", category: "Loaders", headline: "Every tool call, live.", ms: 2000, Render: ToolCallsScene },
  { id: "agents", name: "Multi-Agent Trace", category: "Traces", headline: "Orchestrate agents in parallel.", ms: 2700, Render: AgentsScene },
  { id: "terminal", name: "Terminal Stream", category: "Code", headline: "Stream every command.", ms: 2300, Render: TerminalScene },
  { id: "diff", name: "Diff Summary", category: "Code", headline: "Review changes at a glance.", ms: 1800, Render: DiffScene },
  { id: "approval", name: "Tool Approval", category: "Permissions", headline: "Keep humans in control.", ms: 2200, Render: ApprovalScene },
  { id: "hitl", name: "Human in the Loop", category: "Agents", headline: "Ask before acting.", ms: 2000, Render: HitlScene },
  { id: "stream", name: "Streaming Text", category: "Text", headline: "Answers that stream.", ms: 2700, Render: StreamScene },
  { id: "confidence", name: "Confidence Indicator", category: "Indicators", headline: "Show how sure it is.", ms: 1800, Render: ConfidenceScene },
  { id: "voice", name: "Voice Waveform", category: "Voice", headline: "Just talk to it.", ms: 2500, Render: VoiceScene },
  { id: "compare", name: "Response Compare", category: "Compare", headline: "Let users pick the best.", ms: 2300, Render: CompareScene },
  { id: "palette", name: "Command Palette", category: "Navigation", headline: "Jump anywhere, instantly.", ms: 2000, Render: PaletteScene },
  { id: "presence", name: "Collaborative Presence", category: "Collaboration", headline: "Build it together.", ms: 1700, Render: PresenceScene },
  { id: "limit", name: "Rate Limit", category: "Errors", headline: "Even the limits look good.", ms: 1800, Render: LimitScene },
  { id: "outro", ms: 2800, Render: OutroScene, headline: "ai-patterns — the motion layer for AI apps." },
];

const PATTERN_COUNT = SCENES.filter((s) => s.name).length;

// ---------------------------------------------------------------------------
// Chrome: background, typed headline, progress
// ---------------------------------------------------------------------------

// Muted glows that sit behind the floating UI: blue, violet, peach.
const PALETTES: [string, string, string][] = [
  ["#3563d4", "#6a4fd8", "#d9785e"],
  ["#6a4fd8", "#2f7fd0", "#c9657f"],
  ["#2f7fd0", "#5b4fd0", "#d98a5e"],
  ["#4a4fd8", "#8a4fc8", "#3a9fb0"],
];

function Background({ hues }: { hues: [string, string, string] }) {
  const { W, H } = useLayout();
  // Positions are fractions of the stage so the glows frame either format.
  const blobs = [
    { size: 900, left: 0.135 * W, top: 0.39 * H, x: [0, 60, 0], y: [0, -40, 0], opacity: 0.55 },
    { size: 820, left: 0.32 * W, top: -0.055 * H, x: [0, -50, 0], y: [0, 50, 0], opacity: 0.5 },
    { size: 860, left: 0.52 * W, top: 0.35 * H, x: [0, -70, 0], y: [0, -30, 0], opacity: 0.45 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#05050a]">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: b.size, height: b.size, left: b.left, top: b.top, filter: "blur(170px)", opacity: b.opacity }}
          animate={{ x: b.x, y: b.y, backgroundColor: hues[i] }}
          transition={{
            x: { duration: 11 + i * 3, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 9 + i * 4, repeat: Infinity, ease: "easeInOut" },
            backgroundColor: { duration: 1.2, ease: "easeInOut" },
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 35%, rgba(3,3,8,0.92) 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

/** Scenes own their timelines; memoizing keeps the reel's own re-renders out of them. */
const SceneBody = React.memo(function SceneBody({ Render }: { Render: React.ComponentType }) {
  return <Render />;
});

// ---------------------------------------------------------------------------
// Feed: patterns arrive at the bottom like chat messages and push the
// earlier ones up, where they dim and fade out.
// ---------------------------------------------------------------------------

const FEED_DEPTH = 3;

function FeedItem({ latest, children }: { latest: boolean; children: React.ReactNode }) {
  return (
    // Growing from zero height is what pushes the earlier items up.
    <motion.div
      className="flex w-full items-end justify-center"
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      transition={{ type: "spring", stiffness: 110, damping: 20, mass: 1 }}
    >
      <motion.div
        className="pt-14"
        initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          style={{ originY: 1 }}
          animate={{ opacity: latest ? 1 : 0.35, scale: latest ? 1 : 0.94 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: latest ? [0, -8, 0] : 0 }}
            transition={latest ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Cursor: scenes point it at the element they're about to use.
// ---------------------------------------------------------------------------

interface CursorApi {
  to: (el: Element | null | undefined) => void;
  tap: () => void;
  rest: () => void;
}

const CursorContext = React.createContext<CursorApi>({ to: () => {}, tap: () => {}, rest: () => {} });
const useCursor = () => React.useContext(CursorContext);

function useCursorState(stage: React.RefObject<HTMLDivElement | null>, scale: number, REST: Layout["rest"]) {
  const tx = useMotionValue(REST.x);
  const ty = useMotionValue(REST.y);
  const x = useSpring(tx, { stiffness: 90, damping: 18, mass: 0.9 });
  const y = useSpring(ty, { stiffness: 90, damping: 18, mass: 0.9 });
  const [taps, setTaps] = React.useState(0);
  const scaleRef = React.useRef(scale);
  React.useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const api = React.useMemo<CursorApi>(
    () => ({
      to: (el) => {
        const root = stage.current?.getBoundingClientRect();
        const r = el?.getBoundingClientRect();
        if (!root || !r) return;
        tx.set((r.left + r.width * 0.55 - root.left) / scaleRef.current);
        ty.set((r.top + r.height * 0.6 - root.top) / scaleRef.current);
      },
      tap: () => setTaps((t) => t + 1),
      rest: () => {
        tx.set(REST.x);
        ty.set(REST.y);
      },
    }),
    [stage, tx, ty, REST.x, REST.y]
  );
  return { api, x, y, taps };
}

function Cursor({ x, y, taps, visible }: { x: MotionValue<number>; y: MotionValue<number>; taps: number; visible: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{ x, y }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.svg
        key={taps}
        width="34"
        height="44"
        viewBox="0 0 17 22"
        className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        style={{ originX: 0, originY: 0 }}
        initial={{ scale: taps ? 0.78 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
      >
        <path d="M1 1v17.5l4.6-4.4 3 6.9 3-1.3-3-6.8H15L1 1z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
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

export function Reel({ vertical = false }: { vertical?: boolean }) {
  const layout = vertical ? VERTICAL : LANDSCAPE;
  const { W, H } = layout;
  const scale = useFitScale(layout);
  const [index, setIndex] = React.useState(0);
  const [cycle, setCycle] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const record = React.useRef(false);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const cursor = useCursorState(stageRef, scale, layout.rest);

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
  const feed = SCENES.slice(0, index + 1)
    .filter((s) => s.name)
    .slice(-FEED_DEPTH);

  // Park the cursor between scenes; the next scene moves it where it needs it.
  const { rest } = cursor.api;
  React.useEffect(() => rest(), [index, rest]);

  return (
    <LayoutContext.Provider value={layout}>
    <CursorContext.Provider value={cursor.api}>
    <div className="dark fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black">
      <style>{STAGE_CSS}</style>
      <div
        ref={stageRef}
        className="reel-stage relative shrink-0 overflow-hidden text-foreground"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        <Background hues={PALETTES[index % PALETTES.length]} />

        {/* Wordmark */}
        <div
          className="absolute flex items-center gap-3 text-[24px] font-semibold tracking-tight text-white/55"
          style={{ top: layout.wordmarkTop, left: layout.gutter }}
        >
          <Origami className="size-7" />
          AI Patterns
        </div>

        {/* UI: a chat-like feed, newest pattern at the bottom */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            bottom: layout.feedBottom,
            maskImage: layout.vertical
              ? "linear-gradient(to bottom, transparent 12%, black 45%)"
              : "linear-gradient(to bottom, transparent 4%, black 40%)",
          }}
        >
          <AnimatePresence>
            {playing && !isBookend && (
              <motion.div
                key={`feed-${cycle}`}
                className="absolute inset-x-0 bottom-0 flex flex-col items-center"
                exit={{ opacity: 0, y: -80, filter: "blur(12px)", transition: { duration: 0.4, ease: "easeIn" } }}
              >
                {feed.map((s) => (
                  <FeedItem key={`${cycle}-${s.id}`} latest={s.id === scene.id}>
                    <SceneBody Render={s.Render} />
                  </FeedItem>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Intro / outro */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-center" style={{ bottom: layout.bookendBottom }}>
          <AnimatePresence>
            {playing && isBookend && (
              <motion.div
                key={`${cycle}-${scene.id}`}
                className="absolute"
                initial={{ opacity: 0, scale: 1.06, filter: "blur(16px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                exit={{ opacity: 0, scale: 0.94, filter: "blur(12px)", transition: { duration: 0.3 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
              ? "absolute inset-x-0 text-center text-[46px] font-medium tracking-tight text-white/75"
              : "absolute inset-x-0 text-center text-[60px] leading-[1.1] font-medium tracking-[-0.035em] text-white/90"
          }
          style={{
            bottom: isBookend ? layout.bookendHeadlineBottom : layout.headlineBottom,
            paddingInline: layout.gutter,
          }}
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
        <div
          className="absolute flex items-end justify-between text-white"
          style={{ left: layout.gutter, right: layout.gutter, bottom: layout.labelBottom }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cycle}-${scene.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4 text-[22px]"
            >
              {playing && scene.name && (
                <>
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 font-medium text-white/70 backdrop-blur-md">
                    {scene.category}
                  </span>
                  <span className="text-white/45">{scene.name}</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="font-mono text-[22px] tabular-nums text-white/40">
            {isBookend ? `${PATTERN_COUNT} patterns` : `${String(patternNo).padStart(2, "0")} / ${PATTERN_COUNT}`}
          </div>
        </div>

        <Cursor x={cursor.x} y={cursor.y} taps={cursor.taps} visible={playing && !isBookend} />
      </div>
    </div>
    </CursorContext.Provider>
    </LayoutContext.Provider>
  );
}

// Floating theme: the patterns keep their own solid dark surfaces and hover
// over the background on a deep, soft shadow; no frosted glass.
const STAGE_CSS = `
html, body { overflow: hidden; }
.reel-stage {
  --background: oklch(0.17 0.012 280);
  --card: oklch(0.19 0.012 280);
  --popover: oklch(0.21 0.012 280);
  --border: oklch(1 0 0 / 0.1);
}
.reel-stage :is(.bg-card, .bg-background, .bg-popover) {
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.04) inset,
    0 50px 120px -30px rgb(0 0 0 / 0.85),
    0 18px 40px -20px rgb(0 0 0 / 0.6);
}
.reel-stage :is(.bg-card, .bg-background, .bg-popover) :is(.bg-card, .bg-background) {
  box-shadow: none;
}
`;
