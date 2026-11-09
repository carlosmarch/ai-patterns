import {
  ArrowUp,
  BookOpenCheck,
  Braces,
  Eye,
  PenTool,
  FileCode2,
  GitPullRequest,
  Layers,
  MousePointerClick,
  Search,
  Sparkles,
  Tag,
  TerminalSquare,
  TrendingDown,
  Origami,
} from "lucide-react";

import type { ComponentType } from "react";

import type { Agent } from "@/registry/traces/multi-agent-trace/component";
import type { AnalysisItem } from "@/registry/loaders/analysis-list/component";
import type { Attachment } from "@/registry/uploads/attachment-chip/component";
import type { CitationSource } from "@/registry/text/inline-citation/component";
import type { Collaborator } from "@/registry/collaboration/collaborative-presence/component";
import type { DiffFile } from "@/registry/code/diff-summary/component";
import type { DiffTabFile } from "@/registry/code/diff-tabs/component";
import type { HitlQuestion } from "@/registry/agents/human-in-the-loop/component";
import type { InstructionTool } from "@/registry/agents/instruction-tools/component";
import type { LogLine } from "@/registry/code/terminal-stream/component";
import type { ProcedureStep } from "@/registry/agents/procedure-builder/component";
import type { PromptBarItem } from "@/registry/composer/prompt-bar-pro/component";
import type { Source } from "@/registry/text/sources-stack/component";
import type { TraceStep } from "@/registry/traces/expandable-trace/component";
import type { AutonomyMode, Capability } from "@/registry/composer/autonomy-mode/component";
import type { ClarifyingQuestion } from "@/registry/messages/clarifying-questions/component";
import type { ContextSegment } from "@/registry/indicators/context-usage/component";
import type { ContextSource } from "@/registry/composer/context-chips/component";
import type { FillResult } from "@/registry/tables/ai-fill-drawer/component";
import type { Memory } from "@/registry/permissions/memory-panel/component";
import type { ModelOption } from "@/registry/composer/model-picker/component";
import type { PlanStep } from "@/registry/agents/plan-review/component";
import type { PublishCheck } from "@/registry/agents/publish-gate/component";
import type { QualityCriterion } from "@/registry/composer/prompt-quality/component";
import type { RelayCallState, RelayItem, RelayRun } from "@/registry/voice/voice-agent-relay/component";
import type { ReviewField } from "@/registry/review/ai-review-panel/component";
import type { RunStep } from "@/registry/agents/agent-run-card/component";
import type { Thought } from "@/registry/traces/stream-of-thought/component";
import type { WizardAnswers, WizardStep } from "@/registry/composer/prompt-wizard/component";

// The workspace is a (fictional) UX AI agent for the ai-patterns registry
// itself: the team asks it to audit AI screens against the catalogue, write
// and review pattern specs, ship components, and report on how patterns
// are used. Every pattern in the registry shows up somewhere in that work.

export const USER_NAME = "Carlos";
export const AGENT_NAME = "Origami";
export const AGENT_ICON = Origami;

export function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const TEAM: Collaborator[] = [
  { id: "carlos", name: "Carlos March", role: "Owner", initials: "CM", color: "bg-violet-500", isOnline: true },
  { id: "ana", name: "Ana López", role: "Product Designer", initials: "AL", color: "bg-sky-500", isOnline: true },
  { id: "james", name: "James Liu", role: "Design Engineer", initials: "JL", color: "bg-emerald-500", isOnline: false },
  { id: "sara", name: "Sara Kim", role: "Accessibility", initials: "SK", color: "bg-amber-500", isOnline: false },
];

export const ORG_MEMBERS = [
  { id: "carlos", name: "Carlos March", email: "carlos@ai-patterns.app" },
  { id: "ana", name: "Ana López", email: "ana@ai-patterns.app" },
  { id: "james", name: "James Liu", email: "james@ai-patterns.app" },
  { id: "sara", name: "Sara Kim", email: "sara@ai-patterns.app" },
  { id: "lena", name: "Lena Novak", email: "lena@ai-patterns.app" },
];

export const ROLES = [
  { id: "viewer", label: "Viewer" },
  { id: "editor", label: "Editor" },
  { id: "admin", label: "Admin" },
];

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

export const COMPOSER_SOURCES: PromptBarItem[] = [
  { id: "registry", label: "Registry" },
  { id: "figma", label: "Figma" },
  { id: "github", label: "GitHub" },
  { id: "analytics", label: "Analytics" },
];

export const COMPOSER_COMMANDS: PromptBarItem[] = [
  { id: "audit", label: "/audit", description: "Audit a screen against the catalogue" },
  { id: "spec", label: "/spec", description: "Draft a pattern's UX spec" },
  { id: "schedule", label: "/schedule", description: "Run this every week" },
];

export interface StarterCard {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  prompt: string;
}

// Three ways in, each a complete journey. The first is the guided one —
// Audit → Fix → Ship — so it leads, and says so.
export const STARTER_CARDS: StarterCard[] = [
  {
    id: "audit",
    title: "Audit a screen",
    description: "I'll match your chat screen against the catalogue, fix what drifts, and ship it.",
    icon: Eye,
    prompt: "Audit my chat screen against the catalogue",
  },
  {
    id: "spec",
    title: "Draft a pattern spec",
    description: "Answer three questions and I'll write the spec in the catalogue's template.",
    icon: PenTool,
    prompt: "",
  },
  {
    id: "spike",
    title: "Investigate a drop-off",
    description: "Find out why people hit Stop on long answers, and which pattern fixes it.",
    icon: TrendingDown,
    prompt: "Why are users stopping long answers?",
  },
];

// ---------------------------------------------------------------------------
// The guided journey — Audit → Fix → Ship, one thread, one next step at a time
// ---------------------------------------------------------------------------

export const JOURNEY = {
  audit: "Audit my chat screen against the catalogue",
  fix: "Fix all three",
  ship: "Ship it",
} as const;

export type RunScript = (Omit<RunStep, "status" | "durationSeconds"> & { duration: number })[];

export const FIX_PLAN: PlanStep[] = [
  { id: "stop", text: "Make Stop morph back to Send when the answer ends" },
  { id: "tool", text: "Resolve the tool badge into its result" },
  { id: "spinner", text: "Swap the bare spinner for a Thinking Loader" },
  { id: "a11y", text: "Check each fix against its Accessibility section" },
];

export const FIX_PLAN_ALT: PlanStep[] = [
  { id: "spinner-first", text: "Start with the spinner — it drives most Stop clicks" },
  { id: "rest", text: "Then fix the Stop button and the tool badge" },
  { id: "review", text: "Leave the accessibility pass for your review" },
];

export const FIX_SOURCE = `// components/StopButton.tsx
- return <button onClick={onStop}>Stop</button>;
+ return state === "generating"
+   ? <button aria-label="Stop generating" onClick={onStop}>…</button>
+   : <button aria-label="Send" onClick={onSubmit}>…</button>;

// components/ToolBadge.tsx
- {verb} {target}…
+ {status === "running" ? \`\${verb} \${target}\` : result}
+ {status === "success" && <Check aria-hidden />}

// components/Spinner.tsx
- <Spinner />
+ <ThinkingLoader words={["Thinking", "Reading", "Drafting"]} />`;

export const SHIP_RUN: RunScript = [
  { id: "build", kind: "command", label: "Built the app", activeLabel: "Building the app", detail: "0 errors", duration: 5 },
  { id: "a11y", kind: "test", label: "Ran accessibility checks", activeLabel: "Running accessibility checks", detail: "12 passed", duration: 5 },
  { id: "push", kind: "push", label: "Pushed fix/chat-screen-patterns", activeLabel: "Pushing fix/chat-screen-patterns", detail: "8d2f41c", duration: 4 },
];

/** Every catalogue pattern the journey put on screen, in the order you met them. */
export const JOURNEY_PATTERNS = [
  "uploads/attachment-chip",
  "loaders/thinking-loader",
  "loaders/tool-call-chip",
  "loaders/analysis-list",
  "text/streaming-text",
  "text/follow-up-list",
  "agents/plan-review",
  "agents/task-list",
  "messages/artifact-panel",
  "code/diff-tabs",
  "permissions/tool-approval",
  "agents/background-tasks",
  "agents/agent-run-card",
];

// ---------------------------------------------------------------------------
// Reports, audits and investigations
// ---------------------------------------------------------------------------

export const WEEKLY_TRACE: TraceStep[] = [
  { label: "Pulled copy, install, and preview events for Oct 11 – Oct 17" },
  { label: "Grouped them by pattern and category" },
  { label: "Compared against the previous four weeks", meta: "baseline" },
  { label: "Checked which patterns the skill recommended most" },
  { label: "Drafted the summary" },
];

export const WEEKLY_CITATIONS: CitationSource[] = [
  {
    title: "Code tab copies · Oct 11 – 17",
    domain: "vercel.com/analytics",
    snippet: "Streaming Text 1,204 · Prompt Bar Pro 988 · Tool Approval 731 copies.",
    url: "#",
  },
  {
    title: "Skill recommendations · week 42",
    domain: "ai-patterns.app/skill",
    snippet: "Thinking Loader was shortlisted in 64% of “design a chat screen” requests.",
    url: "#",
  },
];

export const WEEKLY_SOURCES: Source[] = [
  { title: "Vercel Analytics", domain: "vercel.com", url: "https://vercel.com/analytics", faviconUrl: favicon("vercel.com") },
  { title: "carlosmarch/ai-patterns", domain: "github.com", url: "https://github.com/carlosmarch/ai-patterns", faviconUrl: favicon("github.com") },
  { title: "Skill usage logs", domain: "ai-patterns.app", url: "#", faviconUrl: favicon("claude.ai") },
];

export const AUDIT_ATTACHMENT: Attachment = {
  id: "chat-screen",
  name: "chat-screen-v2.png",
  size: 1_840_000,
  progress: 100,
  status: "done",
};

export const AUDIT_ITEMS: AnalysisItem[] = [
  { id: "a1", title: "components/StopButton.tsx", info: "Matches Stop Generation Button — no morph back to Send", status: "done" },
  { id: "a2", title: "components/ToolBadge.tsx", info: "Matches Tool Call Chip — never resolves to a result", status: "done" },
  { id: "a3", title: "components/ChatMessage.tsx", info: "Matches Chat Bubble — up to spec", status: "done" },
  { id: "a4", title: "components/Spinner.tsx", info: "Replace with Thinking Loader — no elapsed time", status: "done" },
];

export const AUDIT_DIFF_TABS: DiffTabFile[] = [
  {
    id: "stop",
    name: "components/StopButton.tsx",
    additions: 3,
    deletions: 1,
    lines: [
      { type: "context", content: "export function StopButton({ state, onStop, onSubmit }) {" },
      { type: "remove", content: '  return <button onClick={onStop}>Stop</button>;' },
      { type: "add", content: "  return state === \"generating\"" },
      { type: "add", content: '    ? <button aria-label="Stop generating" onClick={onStop}>…</button>' },
      { type: "add", content: '    : <button aria-label="Send" onClick={onSubmit}>…</button>;' },
    ],
  },
  {
    id: "tool",
    name: "components/ToolBadge.tsx",
    additions: 2,
    deletions: 1,
    lines: [
      { type: "context", content: '<span role="status">' },
      { type: "remove", content: "  {verb} {target}…" },
      { type: "add", content: "  {status === \"running\" ? `${verb} ${target}` : result}" },
      { type: "add", content: "  {status === \"success\" && <Check aria-hidden />}" },
    ],
  },
  {
    id: "spinner",
    name: "components/Spinner.tsx",
    additions: 1,
    deletions: 1,
    lines: [
      { type: "remove", content: "<Spinner />" },
      { type: "add", content: "<ThinkingLoader words={[\"Thinking\", \"Reading\", \"Drafting\"]} />" },
    ],
  },
];

export const SPIKE_AGENTS: Agent[] = [
  {
    id: "lead",
    name: "Origami",
    icon: Origami,
    status: "done",
    elapsedSeconds: 41,
    steps: [{ label: "Merged findings from 3 sub-agents" }],
  },
  {
    id: "replay",
    name: "Session replay analyst",
    icon: MousePointerClick,
    status: "done",
    elapsedSeconds: 12,
    steps: [
      { label: "Stop clicks up 38% on answers over 20s" },
      { label: "71% happen before the first token", meta: "blank wait" },
    ],
  },
  {
    id: "matcher",
    name: "Pattern matcher",
    icon: Search,
    status: "done",
    elapsedSeconds: 19,
    steps: [{ label: "Screen uses a bare spinner — no Thinking Loader", meta: "registry" }],
  },
  {
    id: "spec",
    name: "Spec checker",
    icon: BookOpenCheck,
    status: "done",
    elapsedSeconds: 9,
    steps: [{ label: "Expandable Trace spec covers waits over 10s" }],
  },
];

export const SPIKE_CITATIONS: CitationSource[] = [
  {
    title: "Session replays · long answers",
    domain: "replays.ai-patterns.app",
    snippet: "212 Stop clicks vs. a 154 baseline. 151 of 212 before the first token.",
    url: "#",
  },
  {
    title: "Thinking Loader — UX spec",
    domain: "ai-patterns.app",
    snippet: "Show a live elapsed-time counter so a long wait reads as progress, not a hang.",
    url: "/patterns/loaders/thinking-loader",
  },
];

export const SPIKE_SOURCES: Source[] = [
  { title: "Session replays", domain: "replays.ai-patterns.app", url: "#", faviconUrl: favicon("posthog.com") },
  { title: "Thinking Loader spec", domain: "ai-patterns.app", url: "/patterns/loaders/thinking-loader", faviconUrl: favicon("github.com") },
  { title: "Expandable Trace spec", domain: "ai-patterns.app", url: "/patterns/traces/expandable-trace", faviconUrl: favicon("github.com") },
  { title: "Nielsen Norman — Response times", domain: "nngroup.com", url: "https://www.nngroup.com/articles/response-times-3-important-limits/", faviconUrl: favicon("nngroup.com") },
];

// ---------------------------------------------------------------------------
// Live flows
// ---------------------------------------------------------------------------

export const GUIDANCE_ITEMS: Omit<AnalysisItem, "status">[] = [
  { id: "g1", title: "Content guidelines", info: "6 rules · no issues" },
  { id: "g2", title: "Motion", info: "Conflicts with “Respect reduced motion”" },
  { id: "g3", title: "Loading states", info: "Gap — nothing for waits over 30s" },
  { id: "g4", title: "Accessibility", info: "9 rules · no issues" },
];

export const GUIDANCE_QUESTIONS: HitlQuestion[] = [
  {
    id: "motion-conflict",
    question: "Two guidelines disagree. When reduced motion is on, shimmer and sweep effects should…",
    options: [
      { id: "static", label: "Turn off — show a static label" },
      { id: "fade", label: "Swap for a gentle opacity fade" },
      { id: "keep", label: "Keep, but slow them down" },
    ],
    freeTextPlaceholder: "Something else…",
  },
  {
    id: "long-wait",
    question: "For waits over 30 seconds, I should recommend…",
    options: [
      { id: "background", label: "Background Tasks Drawer" },
      { id: "trace", label: "Expandable Trace with live steps" },
      { id: "loader", label: "Thinking Loader with elapsed time" },
    ],
    freeTextPlaceholder: "Something else…",
  },
];

export const GUIDANCE_DIFF: DiffFile[] = [
  { id: "1", name: "Guidelines / Motion", additions: 3, deletions: 2 },
  { id: "2", name: "Guidelines / Loading states", additions: 4, deletions: 0 },
];

export const SPIKE_LIVE_AGENTS: Agent[] = [
  { id: "lead", name: "Origami", icon: Origami, status: "running", currentStep: "Planning the investigation", elapsedSeconds: 0, steps: [] },
  { id: "replay", name: "Session replay analyst", icon: MousePointerClick, status: "queued", elapsedSeconds: 0, steps: [] },
  { id: "matcher", name: "Pattern matcher", icon: Search, status: "queued", elapsedSeconds: 0, steps: [] },
  { id: "spec", name: "Spec checker", icon: BookOpenCheck, status: "queued", elapsedSeconds: 0, steps: [] },
];

const SPIKE_RUNNING_STEP: Record<string, string> = {
  replay: "Watching 212 sessions with a Stop click",
  matcher: "Matching the screen against 47 patterns",
  spec: "Reading loader and trace specs",
};

export function tickSpikeAgents(agents: Agent[]): Agent[] {
  const elapsed = (agents[0].elapsedSeconds ?? 0) + 1;

  return agents.map((agent, i) => {
    if (agent.status === "done") return agent;
    if (agent.id === "lead") {
      const allDone = agents.slice(1).every((a) => a.status === "done");
      return allDone
        ? { ...SPIKE_AGENTS[0], elapsedSeconds: elapsed }
        : { ...agent, elapsedSeconds: elapsed, currentStep: elapsed < 2 ? "Planning the investigation" : "Coordinating 3 sub-agents" };
    }
    const start = i * 1.5;
    const finish = start + 2 + i;
    if (elapsed < start) return agent;
    if (elapsed >= finish) return { ...SPIKE_AGENTS[i], elapsedSeconds: elapsed - Math.floor(start) };
    return { ...agent, status: "running", currentStep: SPIKE_RUNNING_STEP[agent.id], elapsedSeconds: elapsed - Math.floor(start) };
  });
}

export const SKILL_BUILD_SCRIPT: Omit<LogLine, "id">[] = [
  { text: "$ npm run skill:build", level: "default" },
  { text: "> node scripts/build-skill.mjs", level: "info" },
  { text: "Reading 47 patterns from src/registry …", level: "default" },
  { text: "✓ Wrote reference/index.md", level: "success" },
  { text: "✓ Wrote 47 pattern specs", level: "success" },
  { text: "✓ Skill reference is up to date", level: "success" },
];

export const SKILL_BUILD_DIFF: DiffFile[] = [
  { id: "1", name: "plugins/ai-patterns/skills/ai-patterns/reference/index.md", additions: 6, deletions: 2 },
  { id: "2", name: "reference/agents/procedure-builder.md", additions: 112, deletions: 0 },
  { id: "3", name: "reference/agents/instruction-tools.md", additions: 96, deletions: 0 },
  { id: "4", name: "reference/text/refinement-controls.md", additions: 88, deletions: 0 },
  { id: "5", name: "plugins/ai-patterns/.claude-plugin/plugin.json", additions: 1, deletions: 1 },
];

export const EXPLORE_FOLLOW_UPS = [
  "Summarize pattern usage this week",
  "Why are users stopping long answers?",
  "Review my guidelines",
  "Rebuild the skill reference docs",
];

// ---------------------------------------------------------------------------
// Background tasks
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Train
// ---------------------------------------------------------------------------

export const PROCEDURE_STEPS: ProcedureStep[] = [
  { id: "spec", kind: "header", text: "Check the spec" },
  {
    id: "read-spec",
    kind: "instruction",
    content: [
      "Open the pattern with ",
      { verb: "Read", label: "pattern.ts", icon: Braces },
      " and confirm every section is there: Summary through Related patterns.",
    ],
  },
  {
    id: "a11y",
    kind: "condition",
    mode: "code",
    condition: "spec.sections.accessibility.length === 0",
    then: [
      { id: "a11y-draft", kind: "instruction", content: ["Draft the Accessibility section from the component's ARIA roles."] },
      { id: "a11y-escalate", kind: "action", action: "escalate", target: "Accessibility reviewer" },
    ],
    else: [
      {
        id: "a11y-ok",
        kind: "instruction",
        content: ["Mark the spec as complete and ", { verb: "Tag", label: "spec-ready", icon: Tag }],
      },
    ],
  },
  { id: "ship", kind: "header", text: "Ship it" },
  {
    id: "new",
    kind: "condition",
    mode: "text",
    condition: "This is a new pattern, not a change to an existing one.",
    then: [
      {
        id: "register",
        kind: "instruction",
        content: [
          { verb: "Update", label: "registry/index.ts", icon: ArrowUp },
          " with the new entry, then ",
          { verb: "Run", label: "npm run skill:build", icon: TerminalSquare },
        ],
      },
      { id: "new-switch", kind: "action", action: "switch", target: "New pattern procedure" },
    ],
    else: [
      {
        id: "bump",
        kind: "instruction",
        content: ["Bump the plugin version and ", { verb: "Open", label: "Pull request", icon: GitPullRequest }],
      },
    ],
  },
];

export const PROCEDURE_TARGETS = {
  escalate: ["Accessibility reviewer", "Design systems team", "Carlos March"],
  switch: ["New pattern procedure", "Deprecation procedure", "Screen audit procedure"],
  workflow: ["Run skill:build", "Open a pull request", "Post to #design-requests"],
};

export const PROCEDURES = [
  { id: "review", title: "Review a pattern", usage: "Used in 38 threads · 92% approved first time", live: true },
  { id: "audit", title: "Audit a screen", usage: "Used in 61 threads · 4.6 patterns suggested", live: true },
  { id: "new", title: "New pattern procedure", usage: "Used in 12 threads", live: true },
  { id: "deprecate", title: "Deprecation procedure", usage: "Draft", live: false },
];

export const GUIDELINE_TOOLS: InstructionTool[] = [
  {
    id: "registry",
    label: "Search the registry",
    verb: "Search",
    icon: Layers,
    optionPlaceholder: "Select a category…",
    options: [
      { id: "loaders", label: "Loaders", icon: Sparkles, iconClassName: "text-violet-500" },
      { id: "errors", label: "Errors", icon: Eye, iconClassName: "text-red-500" },
      { id: "composer", label: "Composer", icon: FileCode2, iconClassName: "text-sky-500" },
    ],
  },
  {
    id: "figma",
    label: "Read a Figma frame",
    verb: "Read",
    icon: PenTool,
    optionPlaceholder: "Select a file…",
    createLabel: "Connect another file",
    options: [
      { id: "chat-v2", label: "Chat screen v2", icon: PenTool, iconClassName: "text-pink-500" },
      { id: "settings", label: "Agent settings", icon: PenTool, iconClassName: "text-pink-500" },
    ],
  },
  {
    id: "run",
    label: "Run a command",
    verb: "Run",
    icon: TerminalSquare,
    optionPlaceholder: "Select a script…",
    options: [
      { id: "lint", label: "npm run lint", icon: TerminalSquare },
      { id: "skill", label: "npm run skill:build", icon: TerminalSquare },
    ],
  },
];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const REFERENCE_URL =
  "https://github.com/carlosmarch/ai-patterns/tree/main/plugins/ai-patterns/skills/ai-patterns/reference";

export const SKILL_PROMPT = `Add one pattern from the ai-patterns catalogue to this app: a real screen, built in this codebase's own design system, that I can open and use.

1. Read the catalogue index at ${REFERENCE_URL}/index.md and shortlist patterns that fit a screen this app already has or needs.
2. Detect the stack and design system: framework, styling, and component library.
3. Pick one pattern, open its spec and follow it: Anatomy, Behavior, Content guidelines, Accessibility.
4. Build it into the existing components folder, using the app's own components and tokens.
5. Render it on a real route, run the app, and summarize the files you changed.`;

// ---------------------------------------------------------------------------
// Composer controls — model, autonomy, context window
// ---------------------------------------------------------------------------

export const MODELS: ModelOption[] = [
  { id: "swift", label: "Swift", description: "Quick answers about a single pattern." },
  { id: "atlas", label: "Atlas", description: "Audits, specs and components.", badge: "Default" },
  { id: "atlas-max", label: "Atlas Max", description: "Whole-project reviews and research.", locked: true },
];

export const AUTONOMY_CAPABILITIES: Capability[] = [
  { id: "read", label: "Read the repo" },
  { id: "edit", label: "Edit components" },
  { id: "run", label: "Run scripts" },
];

export const AUTONOMY_MODES: AutonomyMode[] = [
  { id: "suggest", label: "Suggest", description: "Reads and proposes changes. You apply them.", permissions: { read: "auto", edit: "suggest", run: "suggest" } },
  { id: "confirm", label: "Confirm", description: "Edits after you approve each change.", permissions: { read: "auto", edit: "ask", run: "ask" } },
  { id: "execute", label: "Execute", description: "Edits and runs scripts on its own. Stop it any time.", permissions: { read: "auto", edit: "auto", run: "auto" } },
];

export const CONTEXT_LIMIT = 200_000;

export function contextSegments(blocks: number): ContextSegment[] {
  return [
    { id: "chat", label: "Thread", tokens: 6_400 + blocks * 2_150, color: "bg-cyan-500" },
    { id: "specs", label: "Pattern specs", tokens: 41_800, color: "bg-blue-500" },
    { id: "tools", label: "Tool results", tokens: 9_300 + blocks * 600, color: "bg-violet-500" },
    { id: "system", label: "Guidelines", tokens: 4_100, color: "bg-pink-500" },
    { id: "memory", label: "Memory", tokens: 1_900, color: "bg-emerald-500" },
  ];
}

// ---------------------------------------------------------------------------
// New thread — templates, guided spec, setup pill
// ---------------------------------------------------------------------------

export const SPEC_WIZARD_STEPS: WizardStep[] = [
  { id: "name", question: "What's the pattern called?", hint: "A short noun phrase, the way it'll appear in the catalogue.", placeholder: "e.g. Agent Handoff" },
  { id: "job", question: "What does it do for the user?", options: ["Start", "Ask", "Steer", "Oversee", "Trust", "Recover"] },
  { id: "problem", question: "What problem does it solve?", hint: "One sentence, from the user's side.", placeholder: "e.g. The agent hits a limit and the user doesn't know who picks it up" },
  { id: "extras", question: "Anything to include?", placeholder: "e.g. Products that ship it, related patterns", optional: true },
];

export function buildSpecPrompt(a: WizardAnswers) {
  const name = a.name?.trim();
  if (!name) return "";
  let prompt = `Draft a UX spec for ${name}`;
  if (a.job) prompt += `, a ${a.job.toLowerCase()} pattern`;
  if (a.problem?.trim()) prompt += `. It solves: ${a.problem.trim().replace(/\.$/, "")}`;
  if (a.extras?.trim()) prompt += `. Include: ${a.extras.trim().replace(/\.$/, "")}`;
  return `${prompt}.`;
}

// ---------------------------------------------------------------------------
// Flows — spec drafting
// ---------------------------------------------------------------------------

export const SPEC_QUESTIONS: ClarifyingQuestion[] = [
  { id: "reader", label: "Who reads the spec first?", options: ["Coding agents", "Designers", "Both"], suggested: "Both" },
  { id: "depth", label: "How deep?", options: ["Summary only", "Full template", "Full + code notes"], suggested: "Full template" },
  { id: "evidence", label: "Back it with", options: ["Products that ship it", "Our analytics", "Nothing yet"], suggested: "Products that ship it", allowOther: true },
];

export const SPEC_PLAN: PlanStep[] = [
  { id: "a", text: "Read the spec template and two neighbouring specs" },
  { id: "b", text: "Find three products that ship this pattern" },
  { id: "c", text: "Draft every section, Summary to Related patterns" },
  { id: "d", text: "Self-review against the template and tighten" },
];

export function specThoughts(topic: string): Thought[] {
  return [
    { title: "Reading the request", body: `They want a spec for ${topic}. It has to read well for coding agents and designers, so every section needs a concrete rule, not a vibe.` },
    { title: "Finding the neighbours", body: "Human in the Loop and Background Tasks sit closest. The spec should say when to pick this one instead, or agents will reach for the wrong pattern." },
    { title: "Shaping the sections", body: "Lead the Summary with the job it does. Keep Behavior to states and transitions, and put every motion rule behind reduced motion." },
  ];
}

export function specSource(topic: string, tight = false) {
  if (tight) {
    return `# ${topic}
**Summary:** A card that shows work moving between an agent and a person — why, what was tried, and who has it now.
## When to use
- The agent hits a limit it can't resolve on its own.
## Anatomy
- Status line · reason · what was tried · next owner · one action
## Accessibility
- Announce the handoff in a polite live region.`;
  }
  return `# ${topic}
## Summary
A card that shows work moving between an agent and a person: why it moved, what the agent already tried, and who has it now.
## When to use
- The agent hits a limit it can't resolve on its own, like a refund over policy.
- A person must sign off before the work continues.
## When not to use
- For a single yes/no decision — use Tool Approval.
## Anatomy
- Status line with the next owner
- The reason, in the agent's own words
- What it tried, collapsed by default
- One primary action for the new owner
## Behavior
- The card resolves into the new owner's first reply.
- Reduced motion swaps the slide-in for a fade.
## Accessibility
- Announce the handoff in a polite live region.
## Related patterns
- Human in the Loop, Background Tasks Drawer, Wait Time Handoff`;
}

// ---------------------------------------------------------------------------
// Flows — research (needs wider network access)
// ---------------------------------------------------------------------------

export const RESEARCH_THOUGHTS: Thought[] = [
  { title: "Picking where to look", body: "Changelogs and help centres say what actually shipped, so they beat launch posts. Start with the three products the scout tracks most closely." },
  { title: "Comparing what they show", body: "All three show a step list while the agent runs, and fold it into a summary once it's done. Only one lets you stop a single step." },
  { title: "Mapping it to the catalogue", body: "That's Agent Run Card for the live view and Task List for the plan. Nothing we ship lets you stop one step yet — worth a spec." },
];

export const RESEARCH_SOURCES: Source[] = [
  { title: "Changelog — Agent runs", domain: "linear.app", url: "https://linear.app/changelog", faviconUrl: favicon("linear.app") },
  { title: "Background agents", domain: "docs.cursor.com", url: "https://docs.cursor.com", faviconUrl: favicon("cursor.com") },
  { title: "Claude Code on the web", domain: "code.claude.com", url: "https://code.claude.com/docs", faviconUrl: favicon("claude.com") },
];

// ---------------------------------------------------------------------------
// Flows — audit cost, memory, contrast run
// ---------------------------------------------------------------------------

export const AUDIT_COST = {
  min: 32,
  max: 40,
  balance: 120,
  breakdown: [
    { label: "Reading 214 files in src/", amount: 18 },
    { label: "Matching 4 screens × 3.5 credits", amount: 14 },
  ],
};

export const GUIDANCE_MEMORY = "Applies the reduced-motion guideline to every shimmer and sweep effect.";

export const MEMORIES: Memory[] = [
  { id: "m1", text: "Carlos owns the registry; Ana reviews every new spec.", source: "From a thread on 14 Oct" },
  { id: "m2", text: "Specs follow the Shiny Button section order.", source: "You asked me to remember this" },
  { id: "m3", text: "Prefers verb-first microcopy (“Ask your agent…”, not “Agent tasks”).", source: "From “Setup checklist microcopy”" },
  { id: "m4", text: "Ships to Cloudflare Workers — everything must be static.", source: "From CLAUDE.md" },
];

// ---------------------------------------------------------------------------
// Agents — publish gate
// ---------------------------------------------------------------------------

export const PUBLISH_CHECKS: PublishCheck[] = [
  { id: "specs", label: "Every procedure step names a real pattern", source: "rule", status: "pending" },
  { id: "tools", label: "Write tools still ask before running", source: "rule", status: "pending" },
  { id: "secrets", label: "No tokens in guidelines or procedures", source: "rule", status: "pending" },
  { id: "review", label: "Behavior review on 20 recorded threads", source: "agent", status: "pending" },
];

export const PUBLISH_FAILS: Record<string, string> = {
  tools: "“Create issue” in Linear was set to Always allow in the last edit. It would file issues without asking.",
};

// ---------------------------------------------------------------------------
// Playground — composers and the voice relay
// ---------------------------------------------------------------------------

export const PLAYGROUND_COMPLETIONS = [
  "Which pattern should I use for a 30-second tool call?",
  "Which pattern should I use when the agent needs permission?",
  "What should the UI show while the agent is thinking?",
  "What should the UI show when generation fails?",
  "How do I let people stop a long answer?",
  "How do I show where an answer came from?",
];

export const PLAYGROUND_CONTEXT: ContextSource[] = [
  { id: "spec-loader", group: "Specs", label: "Thinking Loader", detail: "loaders/thinking-loader", icon: FileCode2 },
  { id: "spec-approval", group: "Specs", label: "Tool Approval", detail: "permissions/tool-approval", icon: FileCode2 },
  { id: "figma", group: "Connectors", label: "Chat screen v2", detail: "Figma · edited yesterday", icon: PenTool },
  { id: "pr", group: "Connectors", label: "#94 Header avatars", detail: "GitHub · open PR", icon: GitPullRequest },
  { id: "web", group: "Web", label: "WCAG 2.2 contrast", detail: "w3.org/WAI", icon: Eye },
];

export const PLAYGROUND_CRITERIA: QualityCriterion[] = [
  {
    id: "task",
    label: "Task",
    tip: "Say what you want — audit, compare, scaffold, explain",
    test: (p) => /\b(audit|compare|scaffold|explain|review|which|suggest|build|write|draft)\b/i.test(p),
    insert: "[Which pattern]",
    at: "start",
  },
  { id: "surface", label: "Screen", tip: "Name the screen or moment", test: (p) => /\b(screen|page|modal|chat|composer|onboarding|settings|while|when)\b/i.test(p), insert: " on the [chat screen]" },
  { id: "constraint", label: "Constraint", tip: "Add a limit — mobile, reduced motion, dark mode", test: (p) => /\b(mobile|reduced motion|dark|keyboard|screen reader|under|without)\b/i.test(p), insert: ", on [mobile]" },
];

export type RelayStep = { at: number; state?: RelayCallState; item?: Omit<RelayItem, "id">; run?: RelayRun };

export const RELAY_SCRIPT: RelayStep[] = [
  { at: 600, state: "listening", item: { kind: "you", text: "Swap the chat screen spinner for a Thinking Loader." } },
  { at: 2400, state: "speaking", item: { kind: "voice", text: "On it — I'll ask Origami to replace the spinner and keep the elapsed timer." } },
  { at: 3800, item: { kind: "handoff", text: "Replace the spinner in chat-screen.tsx with Thinking Loader" }, run: { title: "Thinking Loader swap", status: "running", step: "Reading chat-screen.tsx" } },
  { at: 5000, state: "listening" },
  { at: 6400, item: { kind: "update", text: "It's editing chat-screen.tsx." }, run: { title: "Thinking Loader swap", status: "running", step: "Editing chat-screen.tsx" } },
  { at: 8200, item: { kind: "you", text: "Does it respect reduced motion?" } },
  { at: 9600, state: "speaking", item: { kind: "voice", text: "Yes — the shimmer turns into a static label. I'll ask it to add a test for that." } },
  { at: 11000, item: { kind: "handoff", text: "Add a reduced-motion test for the loader" }, run: { title: "Thinking Loader swap", status: "running", step: "Writing a reduced-motion test" } },
  { at: 11800, state: "listening" },
  {
    at: 14400,
    state: "speaking",
    item: { kind: "summary", text: "Done. Two files changed: the loader swap and a reduced-motion test. The diff is in Operator." },
    run: { title: "Thinking Loader swap", status: "done" },
  },
  { at: 17000, state: "listening" },
];

// ---------------------------------------------------------------------------
// Insights — usage events, tracked products, pattern requests
// ---------------------------------------------------------------------------

export interface CopyEvent {
  id: string;
  pattern: string;
  category: string;
  source: string;
  week: string;
  copies: number;
}

export const COPY_EVENTS: CopyEvent[] = [
  { id: "1", pattern: "Streaming Text", category: "text", source: "Site", week: "2026-11-02", copies: 1204 },
  { id: "2", pattern: "Prompt Bar Pro", category: "composer", source: "Site", week: "2026-11-02", copies: 862 },
  { id: "3", pattern: "Thinking Loader", category: "loaders", source: "Skill", week: "2026-11-02", copies: 731 },
  { id: "4", pattern: "Tool Approval", category: "permissions", source: "MCP", week: "2026-11-02", copies: 418 },
  { id: "5", pattern: "Agent Run Card", category: "agents", source: "Skill", week: "2026-11-02", copies: 377 },
  { id: "6", pattern: "Voice Orb", category: "voice", source: "Site", week: "2026-11-02", copies: 296 },
  { id: "7", pattern: "Streaming Text", category: "text", source: "Site", week: "2026-10-26", copies: 1130 },
  { id: "8", pattern: "Thinking Loader", category: "loaders", source: "Skill", week: "2026-10-26", copies: 702 },
  { id: "9", pattern: "Rate Limit", category: "errors", source: "MCP", week: "2026-10-26", copies: 154 },
  { id: "10", pattern: "Context Usage", category: "indicators", source: "Site", week: "2026-10-26", copies: 121 },
  { id: "11", pattern: "Plan Review", category: "agents", source: "Skill", week: "2026-10-19", copies: 98 },
  { id: "12", pattern: "Listening State", category: "voice", source: "MCP", week: "2026-10-19", copies: 41 },
];

export interface TrackedProduct {
  id: string;
  name: string;
  domain: string;
  category: string | null;
  surface: string | null;
  patterns: string | null;
  changelog: string | null;
  owner: string;
}

export const TRACKED_PRODUCTS: TrackedProduct[] = [
  { id: "linear", name: "Linear", domain: "linear.app", category: null, surface: null, patterns: null, changelog: null, owner: "Ana López" },
  { id: "cursor", name: "Cursor", domain: "cursor.com", category: "Code editor", surface: "Background agents", patterns: "Agent Run Card, Diff Tabs", changelog: "cursor.com/changelog", owner: "James Liu" },
  { id: "claude", name: "Claude", domain: "claude.com", category: "Assistant", surface: "Chat, Code", patterns: "Artifact Panel, Tool Approval", changelog: "support.claude.com", owner: "Carlos March" },
  { id: "perplexity", name: "Perplexity", domain: "perplexity.ai", category: "Search", surface: "Answers", patterns: "Sources Stack, Inline Citation", changelog: "perplexity.ai/changelog", owner: "Ana López" },
  { id: "elevenlabs", name: "ElevenLabs", domain: "elevenlabs.io", category: "Voice", surface: "Agents", patterns: "Voice Orb, Live Transcript", changelog: "elevenlabs.io/blog", owner: "Sara Kim" },
];

export const PRODUCT_FILL: Record<string, FillResult & { ms: number }> = {
  category: { value: "Project tracking", source: "linear.app", ms: 900 },
  surface: { value: "Agents in issues", source: "linear.app/docs/agents", ms: 1500 },
  patterns: { value: "Agent Run Card, Wait Time Handoff", source: "linear.app/changelog", ms: 2100 },
  changelog: { value: "linear.app/changelog", source: "Web search", ms: 1200 },
};

export const REQUEST_DOC = {
  title: "Request: show when an agent hands work to a person",
  meta: "From #design-requests · Ana López · 2 days ago",
  paragraphs: [
    "Our support agent escalates refunds over $500 to a person, but the customer just sees the chat go quiet. Nobody can tell the work moved, or who has it now.",
    "Intercom Fin and Zendesk both show a handoff card with the reason and the agent that picked it up. We'd want the same, plus what the agent already tried so the person doesn't start over.",
    "This is about keeping people informed while work moves between an agent and a teammate — I'd file it under oversight, not errors.",
    "Ideally it ships before the support redesign in December; it's blocking two screens.",
  ],
};

export const REQUEST_FIELDS: ReviewField[] = [
  {
    key: "name",
    label: "Pattern name",
    value: "Agent Handoff",
    reasoning: "The request describes an agent passing work to a person and asks for a card that shows it.",
    evidence: [{ id: "name-1", quote: "show a handoff card with the reason and the agent that picked it up" }],
  },
  {
    key: "job",
    label: "Job",
    value: "Oversee",
    reasoning: "Ana says it's about keeping people informed while work moves, and rules out errors explicitly.",
    evidence: [{ id: "job-1", quote: "I'd file it under oversight, not errors" }],
    status: "accepted",
  },
  {
    key: "problem",
    label: "User problem",
    value: "Customers can't tell when work moves to a person",
    reasoning: "The first paragraph names the silent gap after escalation as the problem.",
    evidence: [{ id: "problem-1", quote: "Nobody can tell the work moved, or who has it now" }],
  },
  {
    key: "seen",
    label: "Seen in",
    value: "Intercom Fin, Zendesk",
    reasoning: "Both are named as shipping a handoff card. Neither has a source link yet.",
    evidence: [{ id: "seen-1", quote: "Intercom Fin and Zendesk both show a handoff card" }],
  },
  {
    key: "anatomy",
    label: "Must include",
    value: "Reason, new owner, what was tried",
    reasoning: "The request lists the reason and owner from existing products, then adds what the agent tried.",
    evidence: [
      { id: "anatomy-1", quote: "the reason and the agent that picked it up" },
      { id: "anatomy-2", quote: "plus what the agent already tried" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    value: "High — blocks two screens",
    reasoning: "It's blocking two screens and has a December deadline. December is a guess at the redesign date.",
    evidence: [{ id: "priority-1", quote: "it's blocking two screens" }],
  },
];
