"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import {
  Accessibility,
  Bot,
  Check,
  CircleCheck,
  CircleX,
  Copy,
  FileText,
  Link2,
  MousePointerClick,
  PenLine,
  Search,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ThinkingLoader } from "@/registry/loaders/thinking-loader/component";
import { VoiceOrb } from "@/registry/voice/voice-orb/component";
import { PromptBarPro, type PromptBarItem, type SessionSuggestion } from "@/registry/composer/prompt-bar-pro/component";

import { cn } from "@/lib/utils";
import {
  AGENTS,
  CopyVignette,
  SearchVignette,
  TeamCredit,
  Typed,
  useTick,
} from "../home-features";

// Alternative takes on the home page's "why" bento. Each variant tells the
// same story — find by behavior, copy the source, a spec per pattern, read by
// your agent — in a different shape, so they can be compared side by side.

export type SectionItem = {
  slug: string;
  category: string;
  title: string;
  thumb: ReactNode;
};

/* ------------------------------------------------------------------------ */
/* Shared bits                                                               */
/* ------------------------------------------------------------------------ */

export function InstallLink({ className }: { className?: string }) {
  return (
    <Link
      href="/skill"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90",
        className
      )}
    >
      Install the skill
    </Link>
  );
}

export function AgentIcons({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {AGENTS.map((a) => (
        <span key={a.name} title={a.name} className="grid size-5 place-items-center">
          <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
            <path d={a.path} />
          </svg>
          <span className="sr-only">{a.name}</span>
        </span>
      ))}
    </div>
  );
}

export function ThumbCard({ item, className }: { item: SectionItem; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-muted/40 p-1.5", className)}>
      <div className="aspect-[5/3] rounded-lg border bg-card p-1.5 dark:bg-background">{item.thumb}</div>
      <p className="truncate px-1 pt-1.5 pb-0.5 text-xs font-medium">{item.title}</p>
    </div>
  );
}

const pickItems = (items: SectionItem[], slugs: string[]) =>
  slugs
    .map((slug) => items.find((i) => i.slug === slug))
    .filter((i): i is SectionItem => Boolean(i));

/* ------------------------------------------------------------------------ */
/* A · Ask for a pattern — split hero with a chat that answers in patterns   */
/* ------------------------------------------------------------------------ */

// Each ask cycles through the panel: the question, the patterns the agent
// lands on, and one line of reasoning for why those fit — the "reasoning too".
// `mode` is the skill command the ask runs as (`apply` unless set).
type SkillMode = "list" | "review" | "apply";
const ASKS: { prompt: string; why: string; slugs: string[]; mode?: SkillMode }[] = [
  {
    prompt: "Show me patterns that let people approve what the agent does",
    why: "Gate risky actions before they run, and let people choose how much runs unasked.",
    slugs: ["tool-approval", "human-in-the-loop", "autonomy-mode", "plan-review", "access-request"],
  },
  {
    mode: "review",
    prompt: "Audit our chat screen for hand-rolled AI UI",
    why: "Swap the spinner, the error toast and the bare input — each cites its spec's When to use.",
    slugs: ["thinking-loader", "generation-error", "prompt-bar", "streaming-text"],
  },
  {
    prompt: "How should an answer prove where it came from?",
    why: "Cite inline at the claim, then let people open and judge the source.",
    slugs: ["inline-citation", "sources-stack", "source-trust-card", "confidence-indicator"],
  },
  {
    prompt: "Something for when the model fails halfway through",
    why: "Keep what already streamed, say what broke, and offer the next step.",
    slugs: ["partial-response", "generation-error", "rate-limit", "connectivity-error", "console-error-card"],
  },
  {
    mode: "list",
    prompt: "What's in the catalogue for errors and limits?",
    why: "Everything under errors, numbered — each with the job it does for the user.",
    slugs: ["generation-error", "rate-limit", "connectivity-error", "console-error-card", "partial-response"],
  },
  {
    prompt: "Let people talk to it instead of typing",
    why: "Show it's listening, echo the words live, and hand off to text cleanly.",
    slugs: ["listening-state", "live-transcript", "voice-waveform", "voice-orb", "prompt-bar"],
  },
  {
    prompt: "People stare at an empty box and don't know what to ask",
    why: "Replace the blank state with starters, templates and a guided first prompt.",
    slugs: ["prompt-onboarding", "prompt-template", "prompt-wizard", "prompt-autocomplete", "follow-up-list"],
  },
  {
    prompt: "The agent will take a while. How do I keep people in the loop?",
    why: "Show the plan, tick off steps as they land, and let people leave and come back.",
    slugs: ["task-list", "agent-run-card", "background-tasks", "wait-time-handoff", "stop-generation-button"],
  },
  {
    prompt: "How do I show what the model is thinking without a wall of text?",
    why: "Summarize reasoning as it streams and keep the full trace one click away.",
    slugs: ["stream-of-thought", "thinking-loader", "expandable-trace", "multi-agent-trace", "tool-call-chip"],
  },
  {
    prompt: "Let people undo what the agent changed",
    why: "Review the change before keeping it, and restore any earlier point after.",
    slugs: ["checkpoint-restore", "diff-summary", "diff-tabs", "conversation-branches"],
  },
  {
    prompt: "Users keep asking what this is going to cost them",
    why: "Estimate before the run, meter during it, and show what's left of the budget.",
    slugs: ["cost-estimate", "context-usage", "model-picker", "rate-limit"],
  },
  {
    prompt: "Make vague prompts better before they're sent",
    why: "Flag what's missing, ask one good question, or rewrite it for review.",
    slugs: ["prompt-quality", "clarifying-questions", "prompt-enhancer", "context-chips"],
  },
  {
    prompt: "Ways to tweak an answer without retyping the prompt",
    why: "Put the common edits on the answer itself, and compare versions side by side.",
    slugs: ["response-actions", "refinement-controls", "selection-actions", "response-compare"],
  },
  {
    prompt: "What does the assistant remember about me, and can I turn it off?",
    why: "Make memory visible and editable, and give people a mode where nothing is kept.",
    slugs: ["memory-panel", "incognito-toggle", "ai-disclosure-badge", "connector-panel"],
  },
  {
    prompt: "Let people search our data in plain English",
    why: "Turn the sentence into visible filters or a query people can check and edit.",
    slugs: ["natural-language-query", "describe-filters", "ai-fill-drawer", "command-palette"],
  },
  {
    prompt: "Help me set up an agent that runs on its own",
    why: "Name the job, wire its tools, then decide what wakes it up.",
    slugs: ["create-agent", "agent-setup-pill", "agent-triggers", "trigger-condition", "procedure-builder"],
  },
  {
    prompt: "Where should the generated code or document live?",
    why: "Give the output its own pane next to the chat, with a preview and a diff.",
    slugs: ["artifact-panel", "code-preview", "diff-tabs", "terminal-stream"],
  },
  {
    prompt: "Get a new team from sign-up to their first useful run",
    why: "A short checklist, the right connections, and teammates invited early.",
    slugs: ["setup-checklist", "connector-panel", "invite-members", "collaborative-presence"],
  },
  {
    prompt: "Let people keep typing while the agent is still busy",
    why: "Queue the next messages, attach context, and keep a quick dock at hand.",
    slugs: ["message-queue", "quick-chat-dock", "attachment-chip", "instruction-tools"],
  },
  {
    prompt: "How do I let a reviewer check the AI's work?",
    why: "Collect findings in one panel, mark AI-made content, and say how sure it is.",
    slugs: ["ai-review-panel", "analysis-list", "ai-disclosure-badge", "confidence-indicator"],
  },
];

export function AskVariant({ items }: { items: SectionItem[] }) {
  return (
    <section className="grid items-center gap-10 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <h2 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          Ask for a pattern.
          <span className="block text-muted-foreground">Get the reasoning too.</span>
        </h2>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          Describe the behavior you need. Your agent finds the pattern, reads its spec, and writes the UI.
        </p>
        <InstallLink className="mt-7" />
        <AgentIcons className="mt-7 text-muted-foreground" />
      </div>
      <AskPanel items={items} />
    </section>
  );
}

type AskPhase = "asking" | "searching" | "found";

/** The first trace step: what the command read before it answered. */
function readStep(mode: SkillMode, specs: number) {
  if (mode === "list") return "Read reference/index.md";
  if (mode === "review") return `Scanned the project against ${specs} specs · nothing edited`;
  return `Read reference/index.md, then ${specs} specs`;
}

const ASK_COMMANDS: PromptBarItem[] = [
  {
    id: "apply",
    label: "/ai-patterns apply",
    description: "Find the patterns and write the UI",
  },
  {
    id: "review",
    label: "/ai-patterns review",
    description: "Audit a screen for hand-rolled AI UI",
  },
  { id: "list", label: "/ai-patterns list", description: "List the catalogue" },
];

/** One turn of the chat: which canned answer runs, and the words it answers. */
type AskTurn = { ask: number; prompt: string; run: number; user: boolean };

const ASK_SUGGESTIONS: SessionSuggestion[] = [5, 9, 11, 3, 2, 0].map((i) => ({
  id: `ask-${i}`,
  label: ASKS[i].prompt,
  icon: Sparkles,
}));

const STOP_WORDS = new Set([
  "need", "want", "with", "that", "this", "what", "some", "make", "mode", "have",
  "from", "into", "show", "like", "when", "should", "them", "they", "people", "pattern", "patterns",
]);

/** Picks the canned answer that shares the most words with what was typed. */
function matchAsk(text: string, fallback: number) {
  const words = (text.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP_WORDS.has(w));
  let best = fallback;
  let bestScore = 0;
  ASKS.forEach((ask, i) => {
    // A word that names a pattern ("voice", "citation") counts more than one
    // that only shows up in the canned question or its reasoning.
    const slugs = ask.slugs.join(" ");
    const text = `${ask.prompt} ${ask.why}`.toLowerCase();
    const score = words.reduce((sum, w) => {
      const stem = w.slice(0, 5);
      return sum + (slugs.includes(stem) ? 3 : text.includes(stem) ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  });
  return best;
}

function AskPanel({ items }: { items: SectionItem[] }) {
  const reduce = useReducedMotion();
  const [turn, setTurn] = useState<AskTurn>({
    ask: 0,
    prompt: ASKS[0].prompt,
    run: 0,
    user: false,
  });
  const [phase, setPhase] = useState<AskPhase>("asking");
  // Once someone reaches for the prompt bar, the demo stops cycling on its own
  // and only answers what they send.
  const [engaged, setEngaged] = useState(false);
  const ask = ASKS[turn.ask];
  const found = pickItems(items, ask.slugs);

  // Walk each question through asking → searching → found, then (unless the
  // visitor has taken over) move on to the next canned ask. Resetting happens
  // in the timers (not synchronously in the effect) to avoid a cascading render.
  useEffect(() => {
    if (reduce) {
      const id = setTimeout(() => setPhase("found"), 0);
      return () => clearTimeout(id);
    }
    const timers = [
      setTimeout(() => setPhase("asking"), 0),
      setTimeout(() => setPhase("searching"), 700),
      setTimeout(() => setPhase("found"), 3600),
    ];
    if (!engaged) {
      timers.push(
        setTimeout(
          () =>
            setTurn((t) => {
              const next = (t.ask + 1) % ASKS.length;
              return {
                ask: next,
                prompt: ASKS[next].prompt,
                run: t.run + 1,
                user: false,
              };
            }),
          8000,
        ),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [turn.run, engaged, reduce]);

  const shown: AskPhase = reduce ? "found" : phase;

  function send(value: string) {
    const prompt = value.trim();
    if (!prompt) return;
    setEngaged(true);
    setTurn((t) => ({
      ask: matchAsk(prompt, (t.ask + 1) % ASKS.length),
      prompt,
      run: t.run + 1,
      user: true,
    }));
  }

  return (
    <div
      className="relative flex min-h-[680px] min-w-0 flex-col py-5"
      onPointerDownCapture={() => setEngaged(true)}
      onFocusCapture={() => setEngaged(true)}
    >
      <div aria-hidden className="flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={turn.run}
            className="ml-auto w-fit max-w-[80%] rounded-2xl border bg-card px-4 py-3 text-sm leading-snug shadow-sm dark:bg-background"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <span className="mr-1.5 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              /ai-patterns {ask.mode ?? "apply"}
            </span>
            {turn.prompt}
          </motion.p>
        </AnimatePresence>

        {/* The registry's own patterns narrate the answer: the Voice orb
            (thinking) and the Thinking loader while the agent reads the specs,
            then an Expandable trace step that carries the count and the
            one-line reasoning. */}
        <div className="mt-8 min-h-28">
          <AnimatePresence mode="wait" initial={false}>
            {shown === "searching" && (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ThinkingLoader words={["Reading the specs"]} className="max-w-md px-0 py-0" />
                <VoiceOrb
                  state="thinking"
                  particles={1100}
                  className="mx-auto mt-2 size-72 max-w-full text-foreground dark:text-orange-50"
                />
              </motion.div>
            )}
            {shown === "found" && (
              <motion.div
                key={`found-${turn.run}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="flex items-center gap-2 text-xs font-medium">
                  <Sparkles className="size-3.5 text-muted-foreground" />
                  {ask.mode === "review"
                    ? `Found ${found.length} swaps`
                    : ask.mode === "list"
                      ? `Listed ${found.length} patterns`
                      : `Found ${found.length} patterns`}
                </p>
                <ol className="mt-2 max-w-md">
                  {[readStep(ask.mode ?? "apply", found.length), ask.why].map((text, i, all) => (
                    <motion.li
                      key={i}
                      className="flex gap-3"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: reduce ? 0 : 0.1 + i * 0.15 }}
                    >
                      <span className="flex flex-col items-center">
                        <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Check className="size-2.5 text-muted-foreground" />
                        </span>
                        {i < all.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                      </span>
                      <p
                        className={cn(
                          "leading-snug",
                          i < all.length - 1
                            ? "pb-2.5 font-mono text-xs text-muted-foreground/80"
                            : "text-sm text-muted-foreground"
                        )}
                      >
                        {text}
                      </p>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex gap-3 [mask-image:linear-gradient(to_right,black_70%,transparent)]">
          <AnimatePresence mode="popLayout">
            {shown === "found" &&
              found.map((item, i) => (
                <motion.div
                  key={`${turn.run}-${item.slug}`}
                  className="w-40 shrink-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 28, delay: reduce ? 0 : i * 0.07 }}
                >
                  <ThumbCard item={item} className="bg-card dark:bg-background" />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <p role="status" className="sr-only">
        {shown === "found" && turn.user
          ? `Found ${found.length} patterns: ${found.map((f) => f.title).join(", ")}. ${ask.why}`
          : ""}
      </p>

      {/* The composer is the registry's Prompt bar pro: suggestions send a
          canned ask, typing sends your own, and Stop ends the search early. */}
      <PromptBarPro
        suggestions={ASK_SUGGESTIONS}
        visibleCount={2}
        commands={ASK_COMMANDS}
        placeholder="Ask for a pattern"
        generating={!reduce && shown !== "found" && (turn.user || !engaged)}
        onStop={() => setPhase("found")}
        onSubmit={send}
        className="mt-4 [&_button]:max-w-full"
      />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* B · Three moves — Find, Copy, Ship, with the active step walking along    */
/* ------------------------------------------------------------------------ */

const STEPS = [
  { title: "Find", body: "Search by what it does, not what it's called." },
  { title: "Copy", body: "The component, its demo and its spec land in your repo." },
  { title: "Ship", body: "Keyboard, live regions and reduced motion come with it." },
];

export function StepsVariant() {
  const reduce = useReducedMotion();
  const tick = useTick(2800);
  const active = reduce ? -1 : tick % STEPS.length;

  return (
    <section className="py-6">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        From a prompt to a pattern
        <span className="block text-muted-foreground">in three moves.</span>
      </h2>

      <ol className="relative mt-10 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const on = active === i;
          return (
            <li
              key={step.title}
              className={cn(
                "relative flex min-h-[260px] flex-col overflow-hidden rounded-xl border transition-[background-color,box-shadow] duration-500",
                on ? "bg-card shadow-lg dark:bg-muted/60" : "bg-muted/40"
              )}
            >
              <div aria-hidden className="relative flex flex-1 items-center justify-center p-5">
                {i === 0 && <StepFind on={on || reduce === true} />}
                {i === 1 && <StepCopy on={on || reduce === true} />}
                {i === 2 && <StepShip on={on || reduce === true} />}
              </div>
              <div className="flex gap-3 px-5 pt-3 pb-5">
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-colors duration-500",
                    on ? "border-foreground bg-foreground text-background" : "text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-end">
        <InstallLink />
      </div>
    </section>
  );
}

function StepFind({ on }: { on: boolean }) {
  return (
    <div className="flex w-full max-w-[220px] items-center gap-2 rounded-full border bg-background px-3.5 py-2 shadow-sm">
      <Search className="size-3.5 text-muted-foreground" />
      <span className="flex-1 text-sm">
        {on ? <Typed word="approve" /> : <span className="text-muted-foreground">Search…</span>}
      </span>
    </div>
  );
}

const FILES = ["component.tsx", "demo.tsx", "pattern.ts"];

function StepCopy({ on }: { on: boolean }) {
  return (
    <ul className="w-full max-w-[200px] space-y-1.5">
      {FILES.map((file, i) => (
        <motion.li
          key={file}
          className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 font-mono text-[11px] shadow-sm"
          animate={{ opacity: on ? 1 : 0.45, x: on ? 0 : -4 }}
          transition={{ delay: on ? i * 0.12 : 0, duration: 0.3 }}
        >
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          {file}
        </motion.li>
      ))}
    </ul>
  );
}

const CHECKS = ["Keyboard path", "Live region", "Reduced motion"];

function StepShip({ on }: { on: boolean }) {
  return (
    <ul className="w-full max-w-[180px] space-y-2">
      {CHECKS.map((check, i) => (
        <li key={check} className="flex items-center gap-2 text-xs">
          <motion.span
            className="grid size-4 place-items-center rounded-full"
            animate={{
              backgroundColor: on ? "rgb(59 130 246)" : "rgb(0 0 0 / 0)",
              scale: on ? [0.6, 1.1, 1] : 1,
            }}
            transition={{ delay: on ? 0.15 + i * 0.15 : 0, duration: 0.35 }}
          >
            <Check className={cn("size-2.5 transition-colors", on ? "text-white" : "text-muted-foreground")} strokeWidth={3} />
          </motion.span>
          <span className={on ? "" : "text-muted-foreground"}>{check}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------------ */
/* C · Feature tabs — a list on the left drives one large preview            */
/* ------------------------------------------------------------------------ */

const TABS = [
  { id: "find", icon: Search, title: "Find by behavior", body: "Type what it does — approve, stream, cite, interrupt." },
  { id: "copy", icon: Copy, title: "Copy it, don't install it", body: "Source in your repo, with its demo and spec beside it." },
  { id: "spec", icon: FileText, title: "A spec per pattern", body: "When to use, when not, anatomy, behavior, a11y — same order, every time." },
  { id: "agent", icon: Bot, title: "Read by your agent", body: "The skill makes Claude Code read the spec before it writes the UI." },
] as const;

const TAB_MS = 5000;

export function TabsVariant({ thumbnails }: { thumbnails: ReactNode }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const tab = TABS[index];
  const auto = !reduce && !paused;

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % TABS.length), TAB_MS);
    return () => clearTimeout(id);
  }, [auto, index]);

  return (
    <section className="py-6">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        The code, and the reasoning behind it.
      </h2>
      <div
        className="mt-10 grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div role="tablist" aria-orientation="vertical" aria-label="Features" className="flex flex-col gap-1">
          {TABS.map((t, i) => {
            const selected = i === index;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="features-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setIndex(i)}
                onKeyDown={(e) => {
                  const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
                  if (!step) return;
                  e.preventDefault();
                  const next = (i + step + TABS.length) % TABS.length;
                  setIndex(next);
                  document.getElementById(`tab-${TABS[next].id}`)?.focus();
                }}
                className={cn(
                  "relative flex gap-3.5 overflow-hidden rounded-xl px-4 py-3.5 text-left transition-colors",
                  selected ? "bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors duration-300",
                    selected
                      ? "border-transparent bg-foreground text-background shadow-sm"
                      : "bg-card text-muted-foreground dark:bg-background"
                  )}
                >
                  <t.icon className="size-4" />
                </span>
                <span className="min-w-0 self-center">
                <span className={cn("block text-sm font-medium", !selected && "text-muted-foreground")}>
                  {t.title}
                </span>
                <AnimatePresence initial={false}>
                  {selected && (
                    <motion.span
                      className="block overflow-hidden text-xs leading-relaxed text-muted-foreground"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                    >
                      <span className="block pt-1">{t.body}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                </span>
                {selected && auto && (
                  <motion.span
                    key={`bar-${index}`}
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px origin-left bg-foreground/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: TAB_MS / 1000, ease: "linear" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          id="features-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden"
        >
          {/* Dot grid behind the vignettes, fading out toward the edges. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab.id}
              className="absolute inset-0 flex items-center justify-center"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
            >
              {tab.id === "find" && <SearchVignette thumbnails={thumbnails} />}
              {tab.id === "copy" && <CopyVignette />}
              {tab.id === "spec" && <SpecDoc />}
              {tab.id === "agent" && <MiniTerminal />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const SPEC_SECTIONS: { label: string; icon: LucideIcon }[] = [
  { label: "Summary", icon: FileText },
  { label: "When to use", icon: CircleCheck },
  { label: "When not to use", icon: CircleX },
  { label: "Anatomy", icon: Shapes },
  { label: "Behavior", icon: MousePointerClick },
  { label: "Content guidelines", icon: PenLine },
  { label: "Accessibility", icon: Accessibility },
  { label: "Related patterns", icon: Link2 },
];

function SpecDoc() {
  const tick = useTick(700);
  const active = tick % SPEC_SECTIONS.length;
  return (
    <div aria-hidden className="w-[72%] max-w-[280px] rounded-xl border bg-card p-4 shadow-lg dark:bg-background">
      <p className="font-mono text-[11px] text-muted-foreground">tool-approval/pattern.ts</p>
      <ul className="mt-3 space-y-0.5">
        {SPEC_SECTIONS.map(({ label, icon: Icon }, i) => {
          const on = i === active;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors duration-300",
                on && "bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0 transition-colors duration-300",
                  on ? "text-foreground" : "text-muted-foreground/50"
                )}
              />
              <span className={cn("text-xs transition-colors duration-300", !on && "text-muted-foreground")}>
                {label}
              </span>
              {i < active && <Check className="ml-auto size-3 text-muted-foreground/60" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* D · Terminal — the agent visibly reads the spec before writing UI         */
/* ------------------------------------------------------------------------ */

type TermLine = { kind: "prompt" | "read" | "note" | "write" | "done"; text: string };

// The skill's three real commands, each with the steps it actually takes —
// the terminal plays them in turn.
const SCRIPTS: { mode: "list" | "review" | "apply"; lines: TermLine[] }[] = [
  {
    mode: "list",
    lines: [
      { kind: "prompt", text: "/ai-patterns list all patterns" },
      { kind: "read", text: "Read ai-patterns/reference/index.md" },
      { kind: "note", text: "access — Invite Members, Share Session" },
      { kind: "note", text: "loaders — Thinking Loader, …" },
      { kind: "note", text: "permissions — Tool Approval, …" },
      { kind: "done", text: "Numbered, grouped by category" },
    ],
  },
  {
    mode: "review",
    lines: [
      { kind: "prompt", text: "/ai-patterns review my project" },
      { kind: "read", text: "Read ai-patterns/reference/index.md" },
      { kind: "note", text: "app/chat/spinner.tsx → Thinking Loader" },
      { kind: "note", text: "app/chat/error.tsx → Generation Error" },
      { kind: "note", text: "Each swap cites the spec's When to use" },
      { kind: "done", text: "Read-only · nothing edited" },
    ],
  },
  {
    mode: "apply",
    lines: [
      { kind: "prompt", text: "/ai-patterns apply tool-approval before outbound tool calls" },
      { kind: "read", text: "Read ai-patterns/reference/permissions/tool-approval.md" },
      { kind: "note", text: "When not to use: low-risk, reversible actions" },
      { kind: "note", text: "Behavior: approve, edit, or deny — never auto-continue" },
      { kind: "write", text: "Write src/components/tool-approval.tsx" },
      { kind: "done", text: "Focus moves to Approve · live region announces it" },
    ],
  },
];

/** Plays each script line by line, holds the finished one, then moves on. */
function useTermScript(step = 650, hold = 2600) {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ script: 0, count: 0 });
  const { lines } = SCRIPTS[state.script];
  useEffect(() => {
    if (reduce) return;
    const done = state.count >= lines.length;
    const id = setTimeout(
      () =>
        setState((s) =>
          done ? { script: (s.script + 1) % SCRIPTS.length, count: 0 } : { ...s, count: s.count + 1 }
        ),
      done ? hold : state.count === 0 ? 400 : step
    );
    return () => clearTimeout(id);
  }, [state, lines.length, reduce, step, hold]);
  return { script: state.script, count: reduce ? lines.length : state.count };
}

function TermRow({ line }: { line: TermLine }) {
  if (line.kind === "prompt")
    return (
      <p className="text-neutral-100">
        <span className="text-neutral-500">&gt; </span>
        {line.text}
      </p>
    );
  const dot =
    line.kind === "done" ? "text-emerald-400" : line.kind === "write" ? "text-sky-400" : "text-[#d97757]";
  return (
    <p className={cn(line.kind === "note" ? "pl-4 text-neutral-500" : "text-neutral-300")}>
      {line.kind !== "note" && <span className={dot}>● </span>}
      {line.kind === "note" && <span className="text-neutral-600">⎿ </span>}
      {line.text}
    </p>
  );
}

function Terminal({ className, compact }: { className?: string; compact?: boolean }) {
  const { script, count } = useTermScript();
  const lines = SCRIPTS[script].lines;
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden rounded-xl bg-neutral-950 shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-1.5 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-neutral-700" />
        ))}
        <span className="ml-2 font-mono text-[10px] text-neutral-500">claude — my-app</span>
        <span className="ml-auto flex gap-1 font-mono text-[10px]">
          {SCRIPTS.map((s, i) => (
            <span
              key={s.mode}
              className={cn(
                "rounded px-1.5 py-0.5 transition-colors duration-300",
                i === script ? "bg-neutral-800 text-neutral-100" : "text-neutral-600"
              )}
            >
              {s.mode}
            </span>
          ))}
        </span>
      </div>
      <div
        className={cn(
          "space-y-1.5 p-4 font-mono leading-relaxed",
          compact ? "min-h-[180px] text-[10px]" : "min-h-[230px] text-[11px] sm:text-xs"
        )}
      >
        {lines.slice(0, count).map((line, i) => (
          <motion.div
            key={`${script}-${i}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TermRow line={line} />
          </motion.div>
        ))}
        {count < lines.length && (
          <span className="inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-neutral-400" />
        )}
      </div>
    </div>
  );
}

function MiniTerminal() {
  return <Terminal compact className="w-[86%] max-w-[380px]" />;
}

export function TerminalVariant() {
  return (
    <section className="grid items-center gap-10 py-6 md:grid-cols-[1.15fr_0.85fr]">
      <Terminal className="order-last md:order-first" />
      <div>
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          Your agent reads the spec
          <span className="block text-muted-foreground">before it writes the UI.</span>
        </h2>
        <ul className="mt-6 space-y-3 text-sm">
          {[
            "Matches your request to a pattern by behavior",
            "Follows when-to-use and when-not-to-use",
            "Ships the keyboard path and live regions with it",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-blue-500" />
              <span className="text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex items-center gap-5">
          <InstallLink />
          <AgentIcons className="text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* E · Marquee wall — the whole catalogue drifting behind a centred pitch    */
/* ------------------------------------------------------------------------ */

function MarqueeRow({ items, reverse, duration }: { items: SectionItem[]; reverse?: boolean; duration: number }) {
  const reduce = useReducedMotion();
  // Two copies side by side so translating by -50% loops seamlessly.
  const loop = [...items, ...items];
  return (
    <motion.div
      className="flex w-max gap-3"
      animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    >
      {loop.map((item, i) => (
        <ThumbCard key={`${item.slug}-${i}`} item={item} className="w-44 shrink-0" />
      ))}
    </motion.div>
  );
}

export function MarqueeVariant({ items, patternCount }: { items: SectionItem[]; patternCount: number }) {
  const half = Math.ceil(items.length / 2);
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-muted/20 py-10">
      <div
        aria-hidden
        className="space-y-3 opacity-70 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <MarqueeRow items={items.slice(0, half)} duration={60} />
        <MarqueeRow items={items.slice(half)} duration={70} reverse />
      </div>
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,var(--background)_55%,transparent)] px-6">
        <div className="text-center">
          <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
            {patternCount} patterns.
            <span className="block text-muted-foreground">One spec format.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
            Copy the source, keep the reasoning, let your agent read both.
          </p>
          <InstallLink className="mt-6" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* F · Numbers — a quiet stats strip with the credit line beneath            */
/* ------------------------------------------------------------------------ */

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => (node.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);
  return <span ref={ref}>{to}</span>;
}

export function StatsVariant({ patternCount, categoryCount }: { patternCount: number; categoryCount: number }) {
  const stats = [
    { value: patternCount, label: "patterns" },
    { value: categoryCount, label: "categories" },
    { value: 8, label: "sections in every spec" },
    { value: 0, label: "packages to install" },
  ];
  return (
    <section className="py-6">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        Small enough to read.
        <span className="block text-muted-foreground">Complete enough to ship.</span>
      </h2>
      <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "flex min-h-[140px] flex-col justify-between bg-muted/40 p-5",
              i % 2 === 1 && "border-l",
              i >= 2 && "border-t sm:border-t-0",
              i === 2 && "sm:border-l"
            )}
          >
            <dt className="order-last mt-4 text-xs text-muted-foreground">{s.label}</dt>
            <dd className="text-4xl font-semibold tracking-tight tabular-nums">
              <CountUp to={s.value} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <TeamCredit patternCount={patternCount} />
        <InstallLink />
      </div>
    </section>
  );
}
