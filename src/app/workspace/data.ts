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
  { id: "carlos", name: "Carlos March", email: "carlos@ai-patterns.dev" },
  { id: "ana", name: "Ana López", email: "ana@ai-patterns.dev" },
  { id: "james", name: "James Liu", email: "james@ai-patterns.dev" },
  { id: "sara", name: "Sara Kim", email: "sara@ai-patterns.dev" },
  { id: "lena", name: "Lena Novak", email: "lena@ai-patterns.dev" },
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
    domain: "ai-patterns.dev/skill",
    snippet: "Thinking Loader was shortlisted in 64% of “design a chat screen” requests.",
    url: "#",
  },
];

export const WEEKLY_SOURCES: Source[] = [
  { title: "Vercel Analytics", domain: "vercel.com", url: "https://vercel.com/analytics", faviconUrl: favicon("vercel.com") },
  { title: "carlosmarch/ai-patterns", domain: "github.com", url: "https://github.com/carlosmarch/ai-patterns", faviconUrl: favicon("github.com") },
  { title: "Skill usage logs", domain: "ai-patterns.dev", url: "#", faviconUrl: favicon("claude.ai") },
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
    domain: "ai-patterns.dev",
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
    domain: "replays.ai-patterns.dev",
    snippet: "212 Stop clicks vs. a 154 baseline. 151 of 212 before the first token.",
    url: "#",
  },
  {
    title: "Thinking Loader — UX spec",
    domain: "ai-patterns.dev",
    snippet: "Show a live elapsed-time counter so a long wait reads as progress, not a hang.",
    url: "/patterns/loaders/thinking-loader",
  },
];

export const SPIKE_SOURCES: Source[] = [
  { title: "Session replays", domain: "replays.ai-patterns.dev", url: "#", faviconUrl: favicon("posthog.com") },
  { title: "Thinking Loader spec", domain: "ai-patterns.dev", url: "/patterns/loaders/thinking-loader", faviconUrl: favicon("github.com") },
  { title: "Expandable Trace spec", domain: "ai-patterns.dev", url: "/patterns/traces/expandable-trace", faviconUrl: favicon("github.com") },
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
