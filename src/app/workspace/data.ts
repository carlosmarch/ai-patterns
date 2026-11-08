import {
  ArrowUp,
  BookOpenCheck,
  Braces,
  Compass,
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
import type { BackgroundTask } from "@/registry/agents/background-tasks/component";
import type { CitationSource } from "@/registry/text/inline-citation/component";
import type { Collaborator } from "@/registry/collaboration/collaborative-presence/component";
import type { CompareResponse } from "@/registry/compare/response-compare/component";
import type { DiffFile } from "@/registry/code/diff-summary/component";
import type { DiffTabFile } from "@/registry/code/diff-tabs/component";
import type { HitlQuestion } from "@/registry/agents/human-in-the-loop/component";
import type { InstructionTool } from "@/registry/agents/instruction-tools/component";
import type { LogLine } from "@/registry/code/terminal-stream/component";
import type { PeekImage } from "@/registry/media/image-peek/component";
import type { ProcedureStep } from "@/registry/agents/procedure-builder/component";
import type { PromptBarItem, SessionSuggestion } from "@/registry/composer/prompt-bar-pro/component";
import type { SetupStep } from "@/registry/navigation/setup-checklist/component";
import type { Source } from "@/registry/text/sources-stack/component";
import type { StackFrame, CodeFrame } from "@/registry/errors/console-error-card/component";
import type { TraceStep } from "@/registry/traces/expandable-trace/component";
import type { TrustedSource } from "@/registry/text/source-trust-card/component";
import type { AutonomyMode, Capability } from "@/registry/composer/autonomy-mode/component";
import type { Branch } from "@/registry/messages/conversation-branches/component";
import type { CheckpointTurn } from "@/registry/agents/checkpoint-restore/component";
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
import type { Task } from "@/registry/agents/task-list/component";
import type { TemplatePart } from "@/registry/composer/prompt-template/component";
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

export const COMPOSER_SUGGESTIONS: SessionSuggestion[] = [
  { id: "spike", label: "Why are users stopping long answers?", icon: TrendingDown },
  { id: "guidance", label: "Review my guidelines", icon: BookOpenCheck },
  { id: "bulk", label: "Rebuild the skill reference docs", icon: TerminalSquare },
  { id: "summary", label: "Summarize pattern usage this week", icon: Sparkles },
];

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

export const STARTER_CARDS: StarterCard[] = [
  {
    id: "explore",
    title: "Explore capabilities",
    description: "See what I can help you with across audits, specs, components, and reporting",
    icon: Compass,
    prompt: "What can you help me with?",
  },
  {
    id: "guidance",
    title: "Review my guidelines",
    description: "Check the design guidelines I follow for conflicts or gaps",
    icon: BookOpenCheck,
    prompt: "Review my guidelines",
  },
  {
    id: "spike",
    title: "Investigate a UX drop-off",
    description: "Find out why people hit Stop on long answers, and which pattern fixes it",
    icon: TrendingDown,
    prompt: "Why are users stopping long answers?",
  },
];

// ---------------------------------------------------------------------------
// Threads — seeded history
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

export const AUDIT_TRUST_SOURCES: TrustedSource[] = [
  {
    title: "Stop Generation Button — UX spec",
    domain: "ai-patterns.app",
    description: "“The control morphs back into Send the moment the stream ends — never leave a dead Stop button behind.”",
    url: "/patterns/buttons/stop-generation-button",
    faviconUrl: favicon("github.com"),
    trustReason: "is the source of truth — it's the registry's own spec, versioned with the component.",
  },
  {
    title: "WCAG 2.2 · 4.1.3 Status Messages",
    domain: "w3.org",
    description: "Status changes like “Generating…” must be announced without moving focus.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/status-messages",
    faviconUrl: favicon("w3.org"),
  },
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

export const AUDIT_DIFF_FILES: DiffFile[] = [
  { id: "1", name: "components/StopButton.tsx", additions: 3, deletions: 1 },
  { id: "2", name: "components/ToolBadge.tsx", additions: 2, deletions: 1 },
  { id: "3", name: "components/Spinner.tsx", additions: 1, deletions: 1 },
];

export const AUDIT_MICROCOPY =
  "Something went wrong while generating your response. Please try again later or contact support if the problem persists.";

export const AUDIT_SELECTION =
  "Your chat screen covers the happy path well, but three of its loading states never resolve: the tool badge stays on “Searching…” after the call returns, and the stop button doesn't turn back into Send.";

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

function shot(bg: string, fg: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'><rect width='320' height='200' fill='${bg}'/><rect x='24' y='24' width='272' height='22' rx='6' fill='${fg}' opacity='.5'/><rect x='24' y='60' width='180' height='12' rx='6' fill='${fg}' opacity='.35'/><rect x='24' y='82' width='220' height='12' rx='6' fill='${fg}' opacity='.35'/><rect x='184' y='140' width='112' height='36' rx='18' fill='${fg}' opacity='.6'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const CONTRAST_SCREENSHOTS: PeekImage[] = [
  { id: "1", alt: "Tool Approval card in light mode", label: "Light", src: shot("#f5f5f5", "#171717") },
  { id: "2", alt: "Tool Approval card in dark mode with low-contrast buttons", label: "Dark", src: shot("#262626", "#525252") },
  { id: "3", alt: "Contrast checker failing at 2.9:1", label: "Contrast 2.9:1", src: shot("#fee2e2", "#b91c1c") },
];

export const CONTRAST_ERROR: { message: string; frame: CodeFrame; stack: StackFrame[] } = {
  message:
    "Hydration failed because the server rendered text didn't match the client. The deny button's label is computed from `matchMedia` during render.",
  frame: {
    file: "src/registry/permissions/tool-approval/component.tsx (61:9) @ ToolApproval",
    lines: [
      { number: 59, content: "  const isDark = window.matchMedia(\"(prefers-color-scheme: dark)\").matches;" },
      { number: 60, content: "  return (" },
      { number: 61, content: "    <button className={isDark ? \"text-neutral-500\" : \"text-neutral-700\"}>", isError: true },
      { number: 62, content: "      Deny" },
    ],
  },
  stack: [
    { name: "ToolApproval", file: "src/registry/permissions/tool-approval/component.tsx (61:9)" },
    { name: "ToolApprovalDemo", file: "src/registry/permissions/tool-approval/demo.tsx (12:5)" },
  ],
};

export const CONTRAST_TERMINAL: LogLine[] = [
  { id: "1", text: "$ npx axe http://localhost:3000/patterns/permissions/tool-approval --tags wcag2aa", level: "default" },
  { id: "2", text: "Running axe-core 4.10 in dark mode …", level: "info" },
  { id: "3", text: "✗ color-contrast: “Deny” 2.9:1 (needs 4.5:1)", level: "error" },
  { id: "4", text: "✗ color-contrast: “Always allow” 3.6:1 (needs 4.5:1)", level: "error" },
  { id: "5", text: "2 violations on 1 page", level: "warn" },
];

export const CONTRAST_PATCH: DiffFile[] = [
  { id: "1", name: "src/registry/permissions/tool-approval/component.tsx", additions: 4, deletions: 3 },
];

export const COPY_RESPONSES: [CompareResponse, CompareResponse] = [
  {
    id: "invite",
    label: "Inviting",
    content: "Ask about a pattern, or describe the screen you're designing — I'll shortlist what fits.",
  },
  {
    id: "direct",
    label: "Direct",
    content: "Describe a screen. I'll pick the patterns and scaffold it.",
  },
];

export const TRANSLATE_PARTIAL =
  "Here are the first specs in Spanish:\n\n1. Thinking Loader — “Un indicador con una etiqueta brillante y un contador de tiempo transcurrido, para que una espera larga se lea como progreso.”\n2. Tool Call Chip — “Una píldora en línea que nombra la herramienta en curso y se resuelve en un resumen del resultado.”\n3. Tool Approval — “Una solicitud pendiente con las acciones permitir, permitir siempre y";

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

export const INITIAL_TASKS: BackgroundTask[] = [
  {
    id: "weekly",
    title: "Weekly pattern usage report · scheduled",
    kind: "agent",
    kindLabel: "Agent",
    status: "running",
    elapsedSeconds: 74,
    activity: "Reading copy events",
    stats: ["47 patterns", "6 tool uses"],
  },
  {
    id: "lint",
    title: "Lint the registry",
    kind: "shell",
    kindLabel: "Bash",
    status: "done",
    elapsedSeconds: 9,
    command: "npm run lint",
    output: "> eslint\n\n✓ No problems found",
  },
];

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

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "connect",
    label: "Connect your tools",
    status: "done",
    icons: [
      { label: "GitHub", color: "#181717", initial: "G" },
      { label: "Figma", color: "#A259FF", initial: "F" },
    ],
  },
  { id: "registry", label: "Index the pattern registry", status: "done" },
  { id: "skill", label: "Install the skill in your coding agent", status: "pending" },
  { id: "team", label: "Invite your team", status: "pending" },
];

const REFERENCE_URL =
  "https://github.com/carlosmarch/ai-patterns/tree/main/plugins/ai-patterns/skills/ai-patterns/reference";

export const SKILL_PROMPT = `Add one pattern from the ai-patterns catalogue to this app: a real screen, built in this codebase's own design system, that I can open and use.

1. Read the catalogue index at ${REFERENCE_URL}/index.md and shortlist patterns that fit a screen this app already has or needs.
2. Detect the stack and design system: framework, styling, and component library.
3. Pick one pattern, open its spec and follow it: Anatomy, Behavior, Content guidelines, Accessibility.
4. Build it into the existing components folder, using the app's own components and tokens.
5. Render it on a real route, run the app, and summarize the files you changed.`;

export const SKILL_SNIPPET = `# In Claude Code, install the skill:
/plugin marketplace add carlosmarch/ai-patterns
/plugin install ai-patterns@ai-patterns

# Then ask for a screen, e.g.
"Add a prompt bar with a model picker to the chat page"`;

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

export const PROMPT_TEMPLATES: { name: string; parts: TemplatePart[] }[] = [
  {
    name: "Audit a screen",
    parts: [
      "Audit our ",
      { id: "screen", placeholder: "screen", options: ["chat screen", "settings page", "onboarding flow"], value: "chat screen" },
      " against the catalogue, focusing on ",
      { id: "focus", placeholder: "focus", options: ["loading states", "errors", "permissions"], value: "loading states" },
      ", and flag anything ",
      { id: "bar", placeholder: "bar", options: ["off-spec", "inaccessible", "missing"], value: "off-spec" },
      ".",
    ],
  },
  {
    name: "Compare two patterns",
    parts: [
      "Tell me about ",
      { id: "a", placeholder: "pattern", options: ["Thinking Loader", "Stream of Thought", "Expandable Trace"], value: "Stream of Thought" },
      " and when I'd use it instead of ",
      { id: "b", placeholder: "pattern", options: ["Thinking Loader", "Expandable Trace", "Analysis List"], value: "Thinking Loader" },
      " for ",
      { id: "case", placeholder: "use case" },
      ".",
    ],
  },
];

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

export const SPEC_PLAN_ALT: PlanStep[] = [
  { id: "e", text: "Start from Human in the Loop's spec as the closest neighbour" },
  { id: "f", text: "Draft Summary, Anatomy and Behavior first" },
  { id: "g", text: "Leave Content guidelines for your review" },
];

export const SPEC_TASKS: Omit<Task, "status">[] = [
  { id: "read", label: "Read the template and neighbouring specs", activeLabel: "Reading the template and neighbouring specs" },
  { id: "evidence", label: "Find products that ship it", activeLabel: "Finding products that ship it" },
  { id: "draft", label: "Draft all eight sections", activeLabel: "Drafting all eight sections" },
  { id: "review", label: "Self-review and tighten", activeLabel: "Self-reviewing and tightening" },
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

export const CONTRAST_RUN: (Omit<RunStep, "status" | "durationSeconds"> & { duration: number })[] = [
  { id: "build", kind: "command", label: "Built the site", activeLabel: "Building the site", detail: "58 pages", duration: 6 },
  { id: "axe", kind: "test", label: "Ran contrast checks", activeLabel: "Running contrast checks", detail: "2 passed", duration: 5 },
  { id: "push", kind: "push", label: "Pushed fix/tool-approval-contrast", activeLabel: "Pushing fix/tool-approval-contrast", detail: "4c1e9ab", duration: 4 },
];

// ---------------------------------------------------------------------------
// Seeded threads — branches, checkpoints, code preview
// ---------------------------------------------------------------------------

export const NAME_BRANCHES: Branch[] = [
  { id: "n1", prompt: "Suggest a name for the pattern where an agent passes work to a person", response: "“Agent Handoff” — it names both sides and matches how support tools already describe it." },
  { id: "n2", prompt: "Suggest a shorter, verb-first name for it", response: "“Hand off” works as a button label, but as a catalogue title “Agent Handoff” is clearer next to Human in the Loop." },
];

export const LOADER_CHECKPOINTS: CheckpointTurn[] = [
  {
    id: "c1",
    time: "16:02",
    prompt: "Add an elapsed-time counter to Thinking Loader.",
    reply: "Added a counter that appears after 3 seconds, in tabular figures so it doesn't jitter.",
    changes: [{ path: "thinking-loader/component.tsx", kind: "edit" }],
  },
  {
    id: "c2",
    time: "16:09",
    prompt: "Rotate the status words every 2 seconds.",
    reply: "Status words now cycle every 2s and pause on hover.",
    changes: [
      { path: "thinking-loader/component.tsx", kind: "edit" },
      { path: "thinking-loader/demo.tsx", kind: "edit" },
    ],
  },
  {
    id: "c3",
    time: "16:14",
    prompt: "Make the shimmer sweep faster and brighter.",
    reply: "Doubled the sweep speed and raised the highlight to 60% opacity.",
    changes: [{ path: "thinking-loader/shimmer.css", kind: "create" }],
  },
];

export const ORIGAMI_SVG = `<svg xmlns="http://www.w3.org/2000/svg"
     width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round"
     class="origami">
  <style>
    .origami path {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: fold 3.6s ease-in-out infinite;
    }
    .origami path:nth-child(2) { animation-delay: 0.3s; }
    .origami path:nth-child(3) { animation-delay: 0.6s; }
    @keyframes fold {
      0% { stroke-dashoffset: 1; }
      45%, 65% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .origami path { animation: none; stroke-dashoffset: 0; }
    }
  </style>
  <path pathLength="1" d="M12 12V4a1 1 0 0 1 1-1h6.297a1 1 0 0 1 .651 1.759l-4.696 4.025" />
  <path pathLength="1" d="m12 21-7.414-7.414A2 2 0 0 1 4 12.172V6.415a1.002 1.002 0 0 1 1.707-.707L20 20.009" />
  <path pathLength="1" d="m12.214 3.381 8.414 14.966a1 1 0 0 1-.167 1.199l-1.168 1.163a1 1 0 0 1-.706.291H6.351a1 1 0 0 1-.625-.219L3.25 18.8a1 1 0 0 1 .631-1.781l4.165.027" />
</svg>`;

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
