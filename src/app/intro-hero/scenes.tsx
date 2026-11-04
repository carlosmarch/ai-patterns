"use client";

import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  ChevronUp,
  Copy,
  FileText,
  Globe,
  Loader2,
  Mail,
  Megaphone,
  MousePointer2,
  Search,
  Share2,
  Sparkles,
  SquareCheck,
  Terminal,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Every scene on the intro hero is a tiny, self-running mock of a pattern in
 * the catalogue. They share one clock switch so the hero's pause button (and
 * scrolling the hero out of view, and reduced motion) freezes all of them.
 */
export const PlayingContext = createContext(true);

function useTick(ms: number) {
  const playing = useContext(PlayingContext);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [playing, ms]);
  return tick;
}

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function Cursor({ x, y, pressed }: { x: number | string; y: number | string; pressed?: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20 text-(--s-fg) drop-shadow-[0_1px_1px_rgb(0_0_0/0.35)]"
      animate={{ x, y, scale: pressed ? 0.82 : 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 22 }}
    >
      <MousePointer2 className="size-3.5 fill-(--s-bg)" strokeWidth={1.6} />
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Command palette                                                     */
/* ------------------------------------------------------------------ */

const PALETTE = [
  { label: "Write an email", meta: "Gmail", icon: Mail, color: "#ea4335", group: "Suggestions" },
  { label: "Ask assistant", meta: "Summaries, drafts, answers", icon: Sparkles, color: "#3b82f6" },
  { label: "Create a task", meta: "Linear", icon: SquareCheck, color: "#8b5cf6" },
  { label: "Add contact to CRM", meta: "HubSpot", icon: UserPlus, color: "#f97316" },
  { label: "Schedule a meeting", meta: "Calendar", icon: Calendar, color: "#2563eb" },
  { label: "Post an update", meta: "#team-updates", icon: Megaphone, color: "#10b981", group: "Share" },
  { label: "Save as page", meta: "Notion · Meeting notes", icon: FileText, color: "#737373" },
];
const PALETTE_QUERY = "Ask assistant";

export function PaletteScene() {
  const tick = useTick(140);
  // 0–13 type the query · 14–60 walk the list
  const cycle = tick % 62;
  const typed = PALETTE_QUERY.slice(0, Math.min(cycle, 13));
  const active = cycle < 14 ? 1 : Math.floor((cycle - 14) / 7) % PALETTE.length;

  return (
    <div className="flex h-full flex-col p-3 text-[10px]">
      <div className="flex items-center gap-1.5 border-b border-(--s-line) pb-2 text-(--s-mute)">
        <Search className="size-3" />
        {typed ? (
          <span className="text-(--s-fg)">
            {typed}
            <span className="ml-px inline-block h-2.5 w-px translate-y-0.5 animate-pulse bg-(--s-fg)" />
          </span>
        ) : (
          <span>Type a command or search…</span>
        )}
        <span className="ml-auto rounded border border-(--s-line) px-1 text-[7px] tracking-wide">ESC</span>
      </div>
      <ul className="mt-1 flex-1">
        {PALETTE.map((item, i) => {
          const Icon = item.icon;
          return (
            <Fragment key={item.label}>
              {item.group && (
                <li className="px-1.5 pt-1.5 pb-0.5 text-[8px] text-(--s-mute)">{item.group}</li>
              )}
              <li className="relative flex items-center gap-2 rounded-md px-1.5 py-[3px]">
                {i === active && (
                  <motion.span
                    layoutId="hero-palette-hl"
                    className="absolute inset-0 rounded-md bg-(--s-soft)"
                    transition={spring}
                  />
                )}
                <Icon className="relative size-3" style={{ color: item.color }} />
                <span className="relative text-(--s-fg)">{item.label}</span>
                <span className="relative truncate text-(--s-mute)">{item.meta}</span>
                <span className="relative ml-auto flex gap-0.5 text-[7px] text-(--s-mute)">
                  <kbd className="rounded border border-(--s-line) px-0.5">⌘</kbd>
                  <kbd className="rounded border border-(--s-line) px-0.5">{i + 1}</kbd>
                </span>
              </li>
            </Fragment>
          );
        })}
      </ul>
      <div className="flex items-center gap-1 border-t border-(--s-line) pt-1.5 text-[8px] text-(--s-mute)">
        <Check className="size-2.5" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {PALETTE[active].label}
          </motion.span>
        </AnimatePresence>
        <span className="ml-auto">↵ to open</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Model picker                                                        */
/* ------------------------------------------------------------------ */

const MODELS = [
  { name: "Opus", note: "Hardest problems", speed: 2, quality: 5, cost: 5, first: "~2.0s" },
  { name: "Sonnet", note: "Everyday work", speed: 4, quality: 4, cost: 3, first: "~0.9s" },
  { name: "Haiku", note: "Quick and light", speed: 5, quality: 3, cost: 1, first: "~0.3s" },
  { name: "Auto", note: "Picks per message", speed: 0, quality: 0, cost: 0, first: "varies" },
];

function Bars({ value, on }: { value: number; on: boolean }) {
  if (!value) return <span className="w-[34px] text-center text-[7px] text-(--s-mute)">varies</span>;
  return (
    <span className="flex w-[34px] gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-[3px] flex-1 rounded-full transition-colors duration-300",
            i < value ? (on ? "bg-(--s-accent)" : "bg-(--s-mute)") : "bg-(--s-line)"
          )}
        />
      ))}
    </span>
  );
}

export function ModelScene() {
  const tick = useTick(1300);
  const hover = [1, 0, 2, 3, 1, 2][tick % 6];
  const thinking = tick % 8 >= 4;
  const web = tick % 10 >= 6;
  const m = MODELS[hover];

  return (
    <div className="flex h-full flex-col p-3 text-[9px]">
      <div className="rounded-lg border border-(--s-line) p-2">
        <div className="text-(--s-mute)">Ask anything…</div>
        <div className="mt-1.5 flex items-center">
          <span className="flex items-center gap-1 rounded-md bg-(--s-soft) px-1.5 py-0.5 text-(--s-fg)">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={m.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                {m.name}
              </motion.span>
            </AnimatePresence>
            <ChevronUp className="size-2.5" />
          </span>
          <span className="ml-auto grid size-4 place-items-center rounded-md bg-(--s-fg) text-(--s-bg)">
            <ArrowUp className="size-2.5" />
          </span>
        </div>
      </div>

      <div className="relative mt-1.5 flex-1 rounded-lg border border-(--s-line) p-1.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)]">
        <div className="flex px-1 pb-1 text-[7px] tracking-wide text-(--s-mute)">
          <span>MODEL</span>
          <span className="ml-auto flex gap-1.5">
            <span className="w-[34px]">SPEED</span>
            <span className="w-[34px]">QUALITY</span>
            <span className="w-[34px]">COST</span>
          </span>
        </div>
        {MODELS.map((model, i) => (
          <div key={model.name} className="relative flex items-center gap-1.5 rounded-md px-1 py-[3px]">
            {i === hover && (
              <motion.span layoutId="hero-model-hl" className="absolute inset-0 rounded-md bg-(--s-soft)" transition={spring} />
            )}
            <span className="relative grid size-3.5 place-items-center rounded bg-(--s-soft) text-[7px] text-(--s-mute)">
              {model.name[0]}
            </span>
            <span className="relative leading-tight">
              <span className="flex items-center gap-0.5 text-(--s-fg)">
                {model.name}
                {i === hover && <Check className="size-2.5 text-(--s-accent)" />}
              </span>
              <span className="block text-[7px] text-(--s-mute)">{model.note}</span>
            </span>
            <span className="relative ml-auto flex gap-1.5">
              <Bars value={model.speed} on={i === hover} />
              <Bars value={model.quality} on={i === hover} />
              <Bars value={model.cost} on={i === hover} />
            </span>
          </div>
        ))}
        <div className="mt-1 space-y-1 border-t border-(--s-line) px-1 pt-1.5">
          {[
            { icon: Brain, label: "Extended thinking", on: thinking },
            { icon: Globe, label: "Web search", on: web },
          ].map(({ icon: Icon, label, on }) => (
            <div key={label} className="flex items-center gap-1.5 text-(--s-fg)">
              <Icon className="size-2.5 text-(--s-mute)" />
              {label}
              <span
                className={cn(
                  "ml-auto flex h-2 w-3.5 rounded-full p-[1px] transition-colors",
                  on ? "justify-end bg-(--s-accent)" : "justify-start bg-(--s-line)"
                )}
              >
                <motion.span layout transition={spring} className="size-1.5 rounded-full bg-white" />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 flex px-1 text-[7px] text-(--s-mute)">
          {m.first} first token
          <span className="ml-auto">↑↓ ↵</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Streaming text                                                      */
/* ------------------------------------------------------------------ */

const ARTICLE = [
  "Most agents fail at the edges, not the middle. The answer is fine; what breaks is everything around it — the wait, the tool call nobody approved, the source nobody can find.",
  "Good patterns make those edges legible. Stream the words as they arrive, show what the agent is doing while it works, and let people step in before it matters.",
];
const ARTICLE_WORDS = ARTICLE.map((p) => p.split(" "));
const ARTICLE_TOTAL = ARTICLE_WORDS.reduce((n, p) => n + p.length, 0);
const ARTICLE_STARTS = ARTICLE_WORDS.map((_, p) => ARTICLE_WORDS.slice(0, p).reduce((n, w) => n + w.length, 0));

export function ArticleScene() {
  const tick = useTick(85);
  const shown = tick % (ARTICLE_TOTAL + 30);

  return (
    <div className="flex h-full flex-col p-4 text-[9.5px] leading-[1.55]">
      <div className="mb-2 flex items-center gap-1.5 text-[8px] text-(--s-mute)">
        <span className="size-1.5 animate-pulse rounded-full bg-(--s-accent)" />
        Writing · {Math.min(shown, ARTICLE_TOTAL)} words
      </div>
      <h4 className="mb-1.5 text-[12px] font-semibold text-(--s-fg)">Designing for the wait</h4>
      {ARTICLE_WORDS.map((words, p) => {
        const start = ARTICLE_STARTS[p];
        return (
          <p key={p} className="mb-1.5 text-(--s-mute)">
            {words.map((word, i) => {
              const index = start + i;
              const age = shown - index;
              return (
                <span
                  key={i}
                  className="transition-[opacity,filter] duration-300"
                  style={{
                    opacity: age <= 0 ? 0 : age < 4 ? 0.35 + age * 0.16 : 1,
                    filter: age > 0 && age < 3 ? "blur(1px)" : "none",
                    color: age > 0 && age < 4 ? "var(--s-fg)" : undefined,
                  }}
                >
                  {word}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Selection actions                                                   */
/* ------------------------------------------------------------------ */

const SELECT_TEXT = "lives, what the manager asked for, and how much of what we wrote down actually describes the workflow, in enough detail to automate it.";

function MenuItem({
  id,
  hover,
  icon: Icon,
  children,
  chevron,
}: {
  id: string;
  hover: string;
  icon: typeof Share2;
  children: ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1">
      {hover === id && (
        <motion.span
          layoutId={`hero-sel-hl-${id === "claude" || id === "chatgpt" ? "sub" : "main"}`}
          className="absolute inset-0 rounded-md bg-(--s-soft)"
          transition={spring}
        />
      )}
      <Icon className="relative size-2.5 text-(--s-mute)" />
      <span className="relative text-(--s-fg)">{children}</span>
      {chevron && <ChevronRight className="relative ml-auto size-2.5 text-(--s-mute)" />}
    </div>
  );
}

export function SelectionScene() {
  const tick = useTick(650);
  const phase = tick % 10;
  // 0–1 select · 2 menu · 3 Share · 4 Ask AI · 5–6 submenu items · 7 click · 8–9 rest
  const selected = phase === 0 ? 0 : phase === 1 ? 0.55 : 1;
  const menu = phase >= 2 && phase <= 7;
  const hover = ["", "", "", "share", "ask", "claude", "chatgpt", "chatgpt", "", ""][phase];
  const sub = phase >= 4 && phase <= 7;
  const cursor = {
    0: { x: 196, y: 14 },
    1: { x: 290, y: 30 },
    2: { x: 320, y: 46 },
    3: { x: 70, y: 82 },
    4: { x: 70, y: 102 },
    5: { x: 190, y: 122 },
    6: { x: 190, y: 142 },
    7: { x: 190, y: 142 },
    8: { x: 300, y: 190 },
    9: { x: 300, y: 190 },
  }[phase]!;
  const chars = Math.round(SELECT_TEXT.length * selected);


  return (
    <div className="relative h-full p-4 text-[10px]">
      <p className="leading-[1.6] text-(--s-mute)">
        <span className="rounded-[2px] bg-(--s-accent)/30 text-(--s-fg) transition-all">{SELECT_TEXT.slice(0, chars)}</span>
        {SELECT_TEXT.slice(chars)}
      </p>
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[64px] left-4 w-[120px] rounded-lg border border-(--s-line) bg-(--s-bg) p-1 shadow-xl"
          >
            <MenuItem id="share" hover={hover} icon={Share2}>Share</MenuItem>
            <MenuItem id="ask" hover={hover} icon={Sparkles} chevron>Ask AI</MenuItem>
            <MenuItem id="copy" hover={hover} icon={Copy}>Copy as Markdown</MenuItem>
            <AnimatePresence>
              {sub && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-[22px] left-[124px] w-[118px] rounded-lg border border-(--s-line) bg-(--s-bg) p-1 shadow-xl"
                >
                  <MenuItem id="claude" hover={hover} icon={Sparkles}>Open in Claude</MenuItem>
                  <MenuItem id="chatgpt" hover={hover} icon={Globe}>Open in ChatGPT</MenuItem>
                  {phase === 7 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 px-1.5 pt-1 text-[8px] text-(--s-accent)"
                    >
                      <Loader2 className="size-2.5 animate-spin" /> Opening…
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <Cursor x={cursor.x} y={cursor.y} pressed={phase === 7} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create agent                                                        */
/* ------------------------------------------------------------------ */

const AGENT_PROMPT = "Every Monday, summarize open PRs and post to #eng";
const AGENT_STEPS = [
  { label: "Trigger", value: "Mondays · 9:00" },
  { label: "Tools", value: "GitHub, Slack" },
  { label: "Output", value: "Post to #eng" },
];

export function CreateAgentScene() {
  const tick = useTick(70);
  const cycle = tick % (AGENT_PROMPT.length + 90);
  const typed = AGENT_PROMPT.slice(0, cycle);
  const after = cycle - AGENT_PROMPT.length;
  const steps = after < 6 ? 0 : Math.min(3, Math.floor((after - 6) / 8) + 1);
  const ready = after > 36;

  return (
    <div className="flex h-full flex-col p-3.5 text-[9px]">
      <div className="text-[7px] tracking-wide text-(--s-mute)">NEW AGENT</div>
      <div className="mt-0.5 text-[12px] leading-tight font-semibold text-(--s-fg)">
        From one sentence
        <br />
        to a working agent
      </div>
      <div className="mt-2 flex min-h-[30px] items-start gap-1.5 rounded-lg border border-(--s-line) bg-(--s-soft) p-1.5 text-(--s-fg)">
        <span className="flex-1">
          {typed}
          {after < 0 && <span className="ml-px inline-block h-2.5 w-px translate-y-0.5 animate-pulse bg-(--s-fg)" />}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {AGENT_STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            animate={{ opacity: i < steps ? 1 : 0.25, y: i < steps ? 0 : 4 }}
            transition={spring}
            className="rounded-md border border-(--s-line) p-1.5"
          >
            <div className="text-[7px] text-(--s-mute)">{step.label}</div>
            <div className="mt-0.5 truncate text-(--s-fg)">{i < steps ? step.value : "…"}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-end gap-1.5 pt-2">
        <span className="text-[8px] text-(--s-mute)">{ready ? "Ready to run" : steps ? "Drafting…" : ""}</span>
        <motion.span
          animate={{ opacity: ready ? 1 : 0.35, scale: ready ? 1 : 0.96 }}
          className="rounded-md bg-(--s-fg) px-2 py-0.5 text-[8px] font-medium text-(--s-bg)"
        >
          Create agent
        </motion.span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Thinking wheel                                                      */
/* ------------------------------------------------------------------ */

const THOUGHTS = ["Searching", "Reading", "Comparing", "Drafting", "Checking", "Citing"];
const ROW = 20;

export function WheelScene() {
  const tick = useTick(1200);
  const n = THOUGHTS.length;

  return (
    <div className="relative grid h-full place-items-center overflow-hidden [perspective:300px]">
      <AnimatePresence initial={false}>
      {Array.from({ length: 5 }, (_, k) => k - 2).map((offset) => {
        const word = THOUGHTS[(((tick + offset) % n) + n) % n];
        return (
          <motion.span
            key={tick + offset}
            initial={{ opacity: 0, y: (offset + 1) * ROW, rotateX: -40 }}
            animate={{
              opacity: offset === 0 ? 1 : 0.5 - Math.abs(offset) * 0.18,
              y: offset * ROW,
              rotateX: offset * -22,
              scale: offset === 0 ? 1 : 0.9,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className={cn(
              "absolute text-[13px] font-medium",
              offset === 0
                ? "bg-[linear-gradient(90deg,var(--s-mute)_20%,var(--s-fg)_50%,var(--s-mute)_80%)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:hero-shimmer_1.6s_linear_infinite]"
                : "text-(--s-mute)"
            )}
          >
            {word}
          </motion.span>
        );
      })}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Voice                                                               */
/* ------------------------------------------------------------------ */

const TRANSCRIPT = "Book a table for four on Friday".split(" ");

export function VoiceScene() {
  const tick = useTick(110);
  const words = Math.min(TRANSCRIPT.length, Math.floor((tick % 70) / 7));

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-(--s-accent) px-2 py-0.5 text-[8px] font-medium text-white">
          <span className="size-1 animate-pulse rounded-full bg-white" />
          Listening
        </span>
        <span className="size-4 rounded-full bg-(--s-soft)" />
        <span className="size-4 rounded-full bg-(--s-soft)" />
      </div>
      <div className="flex h-6 items-center gap-[2px]">
        {Array.from({ length: 22 }, (_, i) => {
          const h = 0.25 + 0.75 * Math.abs(Math.sin(tick * 0.55 + i * 0.7) * Math.cos(tick * 0.21 + i * 0.3));
          return (
            <span
              key={i}
              className="w-[2.5px] rounded-full bg-(--s-fg) transition-[height] duration-100"
              style={{ height: `${Math.round(h * 24)}px`, opacity: 0.35 + h * 0.65 }}
            />
          );
        })}
      </div>
      <div className="h-3 text-[8.5px] text-(--s-mute)">
        {TRANSCRIPT.slice(0, words).map((w, i) => (
          <motion.span key={i} initial={{ opacity: 0, filter: "blur(2px)" }} animate={{ opacity: 1, filter: "blur(0px)" }}>
            {w}{" "}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-agent trace                                                   */
/* ------------------------------------------------------------------ */

const LANES = [
  { name: "Planner", start: 0, len: 6 },
  { name: "Researcher", start: 4, len: 10 },
  { name: "Coder", start: 8, len: 12 },
  { name: "Reviewer", start: 18, len: 6 },
];

export function TraceScene() {
  const tick = useTick(260);
  const t = tick % 30;

  return (
    <div className="flex h-full flex-col justify-center gap-1.5 p-3 text-[8.5px]">
      <div className="mb-0.5 flex items-center text-[7px] tracking-wide text-(--s-mute)">
        TRACE
        <span className="ml-auto tabular-nums">{(t * 0.26).toFixed(1)}s</span>
      </div>
      {LANES.map((lane) => {
        const p = Math.max(0, Math.min(1, (t - lane.start) / lane.len));
        const state = p === 0 ? "queued" : p === 1 ? "done" : "running";
        return (
          <div key={lane.name} className="flex items-center gap-1.5">
            <span className="grid size-2.5 place-items-center">
              {state === "running" ? (
                <Loader2 className="size-2.5 animate-spin text-(--s-accent)" />
              ) : state === "done" ? (
                <Check className="size-2.5 text-emerald-500" />
              ) : (
                <span className="size-1.5 rounded-full bg-(--s-line)" />
              )}
            </span>
            <span className={cn("w-12 truncate", state === "queued" ? "text-(--s-mute)" : "text-(--s-fg)")}>{lane.name}</span>
            <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-(--s-line)">
              <span
                className={cn("block h-full rounded-full transition-[width] duration-300", state === "done" ? "bg-emerald-500" : "bg-(--s-accent)")}
                style={{ width: `${p * 100}%` }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool approval                                                       */
/* ------------------------------------------------------------------ */

export function ApprovalScene() {
  const tick = useTick(700);
  const phase = tick % 7;
  // 0–1 waiting · 2 hover · 3 press · 4–5 running · 6 done
  const state = phase <= 3 ? "ask" : phase <= 5 ? "running" : "done";

  return (
    <div className="relative flex h-full flex-col p-3 text-[9px]">
      <div className="flex items-center gap-1.5 text-(--s-fg)">
        <Terminal className="size-3 text-(--s-mute)" />
        <span className="font-medium">Run a command?</span>
      </div>
      <code className="mt-1.5 rounded-md bg-(--s-soft) px-1.5 py-1 font-mono text-[8.5px] text-(--s-fg)">
        npm run deploy --prod
      </code>
      <div className="mt-auto flex h-5 items-center justify-end gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "ask" ? (
            <motion.div key="ask" className="flex gap-1.5" exit={{ opacity: 0, y: -4 }}>
              <span className="rounded-md border border-(--s-line) px-2 py-0.5 text-(--s-fg)">Deny</span>
              <motion.span
                animate={{ scale: phase === 3 ? 0.92 : 1, opacity: phase >= 2 ? 1 : 0.85 }}
                className="rounded-md bg-(--s-fg) px-2 py-0.5 font-medium text-(--s-bg)"
              >
                Allow
              </motion.span>
            </motion.div>
          ) : state === "running" ? (
            <motion.span key="run" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-1 text-(--s-mute)">
              <Loader2 className="size-2.5 animate-spin" /> Running…
            </motion.span>
          ) : (
            <motion.span key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-500">
              <Check className="size-2.5" /> Deployed
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Cursor x={phase >= 2 && phase <= 3 ? 172 : 120} y={phase >= 2 && phase <= 3 ? 84 : 60} pressed={phase === 3} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline citation                                                     */
/* ------------------------------------------------------------------ */

const SOURCES = [
  { n: 1, title: "Q3 earnings report", host: "investors.acme.com" },
  { n: 2, title: "Renewals dashboard", host: "data.acme.com" },
];

function CiteChip({ i, shown, open }: { i: number; shown: number; open: number }) {
  return (
    <AnimatePresence>
      {shown > i && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={spring}
          className={cn(
            "mx-0.5 inline-grid h-3 min-w-3 place-items-center rounded-full px-1 align-middle text-[7px] font-medium transition-colors",
            open === i ? "bg-(--s-accent) text-white" : "bg-(--s-soft) text-(--s-mute)"
          )}
        >
          {i + 1}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function CitationScene() {
  const tick = useTick(900);
  const phase = tick % 6;
  const shown = phase >= 1 ? (phase >= 2 ? 2 : 1) : 0;
  const open = phase === 3 ? 0 : phase === 4 ? 1 : -1;


  return (
    <div className="relative h-full p-3 text-[9.5px] leading-[1.6] text-(--s-fg)">
      Revenue grew 18% in Q3
      <CiteChip i={0} shown={shown} open={open} />, driven by enterprise renewals
      <CiteChip i={1} shown={shown} open={open} />.
      <AnimatePresence>
        {open >= 0 && (
          <motion.div
            key={open}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            className="absolute right-3 bottom-3 left-3 rounded-md border border-(--s-line) bg-(--s-bg) p-1.5 shadow-lg"
          >
            <div className="flex items-center gap-1 text-[8.5px] font-medium">
              <FileText className="size-2.5 text-(--s-mute)" /> {SOURCES[open].title}
            </div>
            <div className="text-[7.5px] text-(--s-mute)">{SOURCES[open].host}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diff summary                                                        */
/* ------------------------------------------------------------------ */

const FILES = [
  { name: "src/composer/prompt-bar.tsx", add: 64, del: 12 },
  { name: "src/traces/trace.tsx", add: 38, del: 21 },
  { name: "src/voice/waveform.tsx", add: 19, del: 4 },
  { name: "README.md", add: 7, del: 5 },
];

export function DiffScene() {
  const tick = useTick(160);
  const cycle = tick % 50;
  const p = Math.min(1, cycle / 20);
  const add = Math.round(FILES.reduce((n, f) => n + f.add, 0) * p);
  const del = Math.round(FILES.reduce((n, f) => n + f.del, 0) * p);

  return (
    <div className="flex h-full flex-col p-4 text-[10px]">
      <div className="flex items-center gap-2 text-(--s-fg)">
        <span className="font-medium">{FILES.length} files changed</span>
        <span className="font-mono text-emerald-500 tabular-nums">+{add}</span>
        <span className="font-mono text-red-500 tabular-nums">−{del}</span>
        <span className="ml-auto rounded-md bg-(--s-fg) px-2 py-0.5 text-[8px] font-medium text-(--s-bg)">Review</span>
      </div>
      <ul className="mt-3 space-y-2">
        {FILES.map((f, i) => {
          const fp = Math.max(0, Math.min(1, (cycle - i * 3) / 14));
          return (
            <li key={f.name} className="flex items-center gap-2">
              <FileText className="size-3 text-(--s-mute)" />
              <span className="truncate font-mono text-[9px] text-(--s-fg)">{f.name}</span>
              <span className="ml-auto flex h-1.5 w-20 gap-[1px] overflow-hidden rounded-full bg-(--s-line)">
                <span className="bg-emerald-500 transition-[width] duration-300" style={{ width: `${(f.add / 80) * 100 * fp}%` }} />
                <span className="bg-red-500 transition-[width] duration-300" style={{ width: `${(f.del / 80) * 100 * fp}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
