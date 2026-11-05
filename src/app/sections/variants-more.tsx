"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { Accessibility, Bot, Check, FileText, Minus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedOrigami } from "@/components/animated-origami";
import { AGENTS, useTick } from "../home-features";
import { AgentIcons, InstallLink, ThumbCard, type SectionItem } from "./variants";

// A second batch of takes on the home page's "why" section.

/* ------------------------------------------------------------------------ */
/* G · Before / after — pick a request, drag to compare naive vs pattern     */
/* ------------------------------------------------------------------------ */

type Example = {
  id: string;
  request: string;
  pattern: string;
  /** What changes, for screen readers — the visuals are decorative. */
  summary: string;
  Before: () => ReactNode;
  After: () => ReactNode;
};

const EXAMPLES: Example[] = [
  {
    id: "approval",
    request: "Ask before the agent sends email.",
    pattern: "Tool Approval",
    summary:
      "Without the spec: a generic OK / Cancel dialog with no details. With it: the tool, recipient, subject and a body preview, with Deny, Edit and a focused Approve.",
    Before: ApprovalBefore,
    After: ApprovalAfter,
  },
  {
    id: "citations",
    request: "Show where the answer came from.",
    pattern: "Inline Citation",
    summary:
      "Without the spec: a list of raw links dumped under the answer. With it: numbered citations on the claims they support and a compact sources stack.",
    Before: CitationBefore,
    After: CitationAfter,
  },
  {
    id: "failure",
    request: "Handle the model failing mid-answer.",
    pattern: "Partial Response",
    summary:
      "Without the spec: the answer disappears behind 'Something went wrong'. With it: the partial answer stays, marked as interrupted, with Continue and Retry.",
    Before: FailureBefore,
    After: FailureAfter,
  },
  {
    id: "working",
    request: "Show that the agent is working.",
    pattern: "Expandable Trace",
    summary:
      "Without the spec: a spinner that says Loading. With it: the steps the agent has finished, the one it's on, and how long it has taken.",
    Before: WorkingBefore,
    After: WorkingAfter,
  },
  {
    id: "limit",
    request: "Tell people they've hit the limit.",
    pattern: "Rate Limit",
    summary:
      "Without the spec: a raw 429 Too Many Requests error. With it: when the limit resets, what still works, and a way to queue the message.",
    Before: LimitBefore,
    After: LimitAfter,
  },
];

export function CompareVariant() {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState(50);
  const [index, setIndex] = useState(0);
  const sweep = useRef<ReturnType<typeof animate> | null>(null);
  const example = EXAMPLES[index];
  const { Before, After } = example;

  // On a new request, sweep the handle in from the right: the plain version
  // shows first, then the pattern is revealed up to the midpoint.
  function choose(i: number) {
    setIndex(i);
    sweep.current?.stop();
    if (reduce) return setPos(50);
    sweep.current = animate(96, 50, {
      duration: 0.9,
      delay: 0.25,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setPos(Math.round(v)),
    });
  }

  useEffect(() => () => sweep.current?.stop(), []);

  return (
    <section className="py-6">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        Same request.
        <span className="block text-muted-foreground">One of them read the spec.</span>
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Pick a request, then drag to compare what an agent writes on its own with what it writes after reading the
        pattern.
      </p>

      <div role="group" aria-label="Requests" className="mt-8 flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => choose(i)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              i === index ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            &ldquo;{ex.request}&rdquo;
          </button>
        ))}
      </div>

      <div className="relative mt-4 h-[340px] overflow-hidden rounded-xl border bg-muted/40 select-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={example.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* After — full width underneath */}
            <div aria-hidden className="absolute inset-0 grid place-items-center p-6">
              <After />
            </div>
            {/* Before — clipped to the left of the handle */}
            <div
              aria-hidden
              className="absolute inset-0 grid place-items-center bg-muted p-6"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <Before />
            </div>
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute top-3 left-3 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur">
          Without the spec
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] backdrop-blur">
          With {example.pattern}
        </span>

        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-foreground/30" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background shadow-md">
            <span className="flex gap-0.5">
              <span className="h-3 w-px bg-muted-foreground" />
              <span className="h-3 w-px bg-muted-foreground" />
            </span>
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => {
            sweep.current?.stop();
            setPos(Number(e.target.value));
          }}
          aria-label={`Compare without and with ${example.pattern}`}
          aria-valuetext={`${pos}% without the spec`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {example.request} {example.summary}
      </p>
    </section>
  );
}

// The "before" side: what an agent writes with no guidance — default-looking,
// system-dialog styling, the same for every request.
function PlainBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-[320px] rounded-md border border-neutral-300 bg-white p-4 font-sans text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
        className
      )}
    >
      {children}
    </div>
  );
}

function PlainButton({ children, primary }: { children: ReactNode; primary?: boolean }) {
  return (
    <span
      className={cn(
        "rounded border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700",
        primary && "bg-neutral-100 dark:bg-neutral-800"
      )}
    >
      {children}
    </span>
  );
}

// The "after" side: the card surface every pattern sits on.
function PatternBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-[320px] rounded-2xl border bg-card p-4 shadow-lg dark:bg-background", className)}>
      {children}
    </div>
  );
}

const Bar = ({ w }: { w: string }) => <span className={cn("block h-1.5 rounded-full bg-muted-foreground/25", w)} />;

function CitationBefore() {
  return (
    <PlainBox>
      <p className="text-xs leading-relaxed">
        The Pro plan includes 5 seats and SSO. Annual billing saves 20% compared to monthly.
      </p>
      <p className="mt-3 text-[11px] font-medium">Sources:</p>
      <ul className="mt-1 space-y-0.5 text-[10px] break-all text-blue-700 underline dark:text-blue-400">
        <li>https://acme.com/pricing?ref=nav&amp;utm_source=docs</li>
        <li>https://help.acme.com/articles/48213-sso-setup</li>
        <li>https://acme.com/blog/2025/annual-billing-update</li>
      </ul>
    </PlainBox>
  );
}

function Cite({ n }: { n: number }) {
  return (
    <span className="mx-0.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-blue-500/15 px-1 align-[1px] font-mono text-[9px] text-blue-600 dark:text-blue-400">
      {n}
    </span>
  );
}

function CitationAfter() {
  return (
    <PatternBox>
      <p className="text-xs leading-relaxed">
        The Pro plan includes 5 seats and SSO
        <Cite n={1} />
        <Cite n={2} />. Annual billing saves 20% over monthly
        <Cite n={3} />.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className="flex -space-x-1">
          {["bg-neutral-800", "bg-sky-500", "bg-amber-500"].map((c) => (
            <span key={c} className={cn("size-4 rounded-full border-2 border-card dark:border-background", c)} />
          ))}
        </span>
        <span className="text-[11px] text-muted-foreground">3 sources · acme.com, help.acme.com</span>
      </div>
    </PatternBox>
  );
}

function FailureBefore() {
  return (
    <PlainBox>
      <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Error: Something went wrong. Please try again.
      </div>
      <div className="mt-4 flex justify-end">
        <PlainButton primary>Try again</PlainButton>
      </div>
    </PlainBox>
  );
}

function FailureAfter() {
  return (
    <PatternBox>
      <div className="space-y-1.5">
        <Bar w="w-full" />
        <Bar w="w-11/12" />
        <Bar w="w-4/5" />
        <span className="block h-1.5 w-1/2 rounded-full bg-gradient-to-r from-muted-foreground/25 to-transparent" />
      </div>
      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <span className="size-1.5 rounded-full bg-amber-500" />
        <span className="text-[11px] text-muted-foreground">Response interrupted — your partial answer is kept</span>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">Continue</span>
        <span className="rounded-full border px-3 py-1 text-xs">Retry from start</span>
      </div>
    </PatternBox>
  );
}

function WorkingBefore() {
  return (
    <PlainBox className="flex flex-col items-center gap-3 py-8">
      <span className="size-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-300" />
      <span className="text-xs">Loading...</span>
    </PlainBox>
  );
}

function WorkingAfter() {
  const steps = [
    { label: "Searched 3 sources", done: true },
    { label: "Read pricing.md", done: true },
    { label: "Comparing plans", done: false },
  ];
  return (
    <PatternBox>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Working · 3 steps</span>
        <span className="font-mono text-[10px] text-muted-foreground">0:08</span>
      </div>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2 text-xs">
            {step.done ? (
              <span className="grid size-4 place-items-center rounded-full bg-foreground/10">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
            ) : (
              <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-foreground" />
            )}
            <span
              className={
                step.done
                  ? "text-muted-foreground"
                  : "bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--foreground)_50%,var(--muted-foreground)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:hero-shimmer_1.4s_linear_infinite]"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t pt-2.5 text-[11px] text-muted-foreground">Show details ›</p>
    </PatternBox>
  );
}

function LimitBefore() {
  return (
    <PlainBox>
      <p className="font-mono text-xs">429 Too Many Requests</p>
      <p className="mt-1 font-mono text-[10px] break-all text-neutral-500">
        {"{\"error\":{\"type\":\"rate_limit_error\",\"message\":\"Rate limited\"}}"}
      </p>
      <div className="mt-4 flex justify-end">
        <PlainButton primary>OK</PlainButton>
      </div>
    </PlainBox>
  );
}

function LimitAfter() {
  return (
    <PatternBox>
      <p className="text-sm font-medium">You&apos;ve used today&apos;s messages</p>
      <p className="mt-1 text-xs text-muted-foreground">Resets in 42 min · Smaller models still work.</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-full rounded-full bg-foreground/70" />
      </div>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">Queue for later</span>
        <span className="rounded-full border px-3 py-1 text-xs">Switch model</span>
      </div>
    </PatternBox>
  );
}

function ApprovalBefore() {
  return (
    <PlainBox>
      <p className="text-sm">The agent wants to send an email. Continue?</p>
      <div className="mt-4 flex justify-end gap-2">
        <PlainButton>Cancel</PlainButton>
        <PlainButton primary>OK</PlainButton>
      </div>
    </PlainBox>
  );
}

function ApprovalAfter() {
  return (
    <div className="w-full max-w-[340px] rounded-2xl border bg-card p-4 shadow-lg dark:bg-background">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px]">
          <span className="size-1.5 rounded-full bg-amber-500" />
          gmail.send
        </span>
        <span className="text-[11px] text-muted-foreground">Needs your approval</span>
      </div>
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="w-12 text-muted-foreground">To</dt>
          <dd>team@acme.com</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-12 text-muted-foreground">Subject</dt>
          <dd>Q3 launch recap</dd>
        </div>
      </dl>
      <div className="mt-3 space-y-1.5 rounded-lg bg-muted/60 p-2.5">
        <span className="block h-1.5 w-full rounded-full bg-muted-foreground/25" />
        <span className="block h-1.5 w-5/6 rounded-full bg-muted-foreground/25" />
        <span className="block h-1.5 w-2/3 rounded-full bg-muted-foreground/25" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full border px-3 py-1 text-xs">Deny</span>
        <span className="rounded-full border px-3 py-1 text-xs">Edit</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs text-background ring-2 ring-blue-500/50 ring-offset-2 ring-offset-card dark:ring-offset-background">
          Approve
          <kbd className="font-mono text-[10px] opacity-60">⏎</kbd>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* H · Anatomy — a pattern with numbered callouts tied to a legend           */
/* ------------------------------------------------------------------------ */

const PARTS = [
  { id: 1, name: "Answer body", note: "Streams in; never reflows what's already read." },
  { id: 2, name: "Inline citation", note: "Sits on the claim it supports; opens a peek." },
  { id: 3, name: "Sources stack", note: "Collapsed favicons until you ask for more." },
  { id: 4, name: "Follow-ups", note: "Suggested next questions, one tap each." },
];

export function AnatomyVariant() {
  const reduce = useReducedMotion();
  const tick = useTick(2400);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? (reduce ? null : PARTS[tick % PARTS.length].id);

  return (
    <section className="grid items-center gap-10 py-6 md:grid-cols-[1.1fr_0.9fr]">
      <div aria-hidden className="relative rounded-xl border bg-muted/40 p-8 sm:p-10">
        <div className="rounded-2xl border bg-card p-5 shadow-sm dark:bg-background">
          <Region id={1} active={active}>
            <div className="space-y-1.5">
              <span className="block h-2 w-full rounded-full bg-muted-foreground/25" />
              <span className="block h-2 w-11/12 rounded-full bg-muted-foreground/25" />
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2/3 rounded-full bg-muted-foreground/25" />
                <Region id={2} active={active} className="rounded-full">
                  <span className="block rounded-full bg-blue-500/15 px-1.5 font-mono text-[9px] text-blue-600 dark:text-blue-400">
                    1
                  </span>
                </Region>
              </span>
              <span className="block h-2 w-4/5 rounded-full bg-muted-foreground/25" />
            </div>
          </Region>
          <Region id={3} active={active} className="mt-4 w-fit">
            <span className="flex items-center gap-2">
              <span className="flex -space-x-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-4 rounded-full border-2 border-card bg-muted-foreground/30 dark:border-background" />
                ))}
              </span>
              <span className="text-[11px] text-muted-foreground">3 sources</span>
            </span>
          </Region>
          <Region id={4} active={active} className="mt-4 w-fit">
            <span className="flex flex-wrap gap-1.5">
              {["Compare plans", "Show the math"].map((f) => (
                <span key={f} className="rounded-full border px-2.5 py-1 text-[11px]">
                  {f}
                </span>
              ))}
            </span>
          </Region>
        </div>
      </div>

      <div>
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          Every pattern ships
          <span className="block text-muted-foreground">with its anatomy.</span>
        </h2>
        <ol className="mt-6 space-y-1" onPointerLeave={() => setHover(null)}>
          {PARTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onPointerEnter={() => setHover(p.id)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                className={cn(
                  "flex w-full gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  active === p.id ? "bg-muted/60" : "hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] transition-colors",
                    active === p.id ? "bg-blue-500 text-white" : "border text-muted-foreground"
                  )}
                >
                  {p.id}
                </span>
                <span>
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Region({
  id,
  active,
  className,
  children,
}: {
  id: number;
  active: number | null;
  className?: string;
  children: ReactNode;
}) {
  const on = active === id;
  return (
    <div
      className={cn(
        "relative rounded-md outline-2 outline-offset-4 outline-dashed transition-[outline-color] duration-300",
        on ? "outline-blue-500/70" : "outline-transparent",
        className
      )}
    >
      {children}
      <motion.span
        className={cn(
          "absolute -top-4 -right-4 z-10 grid size-5 place-items-center rounded-full font-mono text-[10px] shadow-sm transition-colors",
          on ? "bg-blue-500 text-white" : "border bg-background text-muted-foreground"
        )}
        animate={{ scale: on ? 1.15 : 1 }}
      >
        {id}
      </motion.span>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* I · Orbit — one skill at the centre, agents and patterns circling it      */
/* ------------------------------------------------------------------------ */

const ORBIT_PATTERNS = ["Tool Approval", "Streaming Text", "Inline Citation", "Rate Limit", "Live Transcript", "Diff Tabs"];

function Ring({
  size,
  duration,
  reverse,
  children,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  children: ReactNode[];
}) {
  const reduce = useReducedMotion();
  const spin = reverse ? -360 : 360;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border border-dashed"
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={reduce ? undefined : { rotate: spin }}
      transition={{ duration, ease: "linear", repeat: Infinity }}
    >
      {children.map((child, i) => {
        const angle = (i / children.length) * Math.PI * 2;
        const style: CSSProperties = {
          // Rounded so server and client serialise the same string.
          left: `${(50 + 50 * Math.cos(angle)).toFixed(2)}%`,
          top: `${(50 + 50 * Math.sin(angle)).toFixed(2)}%`,
        };
        return (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
            {/* Counter-rotate so each satellite stays upright. */}
            <motion.div
              animate={reduce ? undefined : { rotate: -spin }}
              transition={{ duration, ease: "linear", repeat: Infinity }}
            >
              {child}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

export function OrbitVariant() {
  return (
    <section className="grid items-center gap-10 py-6 md:grid-cols-2">
      <div>
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          One skill.
          <span className="block text-muted-foreground">Every agent that reads markdown.</span>
        </h2>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          The specs are plain markdown, so Claude Code, Cursor and Copilot all read the same contract before
          they touch your UI.
        </p>
        <InstallLink className="mt-7" />
      </div>
      <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,var(--muted)_0%,transparent_100%)]" />
        <Ring size={140} duration={28}>
          {AGENTS.map((a) => (
            <span key={a.name} className="grid size-9 place-items-center rounded-full shadow-md" style={{ background: a.bg }}>
              <svg viewBox="0 0 24 24" className="size-4" fill={a.fg}>
                <path d={a.path} />
              </svg>
            </span>
          ))}
        </Ring>
        <Ring size={260} duration={60} reverse>
          {ORBIT_PATTERNS.map((p) => (
            <span
              key={p}
              className="block rounded-full border bg-card px-2.5 py-1 text-[11px] whitespace-nowrap shadow-sm dark:bg-background"
            >
              {p}
            </span>
          ))}
        </Ring>
        <div className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-foreground text-background shadow-xl">
          <AnimatedOrigami className="size-7" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* J · Index — an editorial list of categories with a cursor-following peek  */
/* ------------------------------------------------------------------------ */

const INDEX_ROWS = 8;

export function IndexVariant({ items }: { items: SectionItem[] }) {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [peek, setPeek] = useState<{ category: string; x: number; y: number } | null>(null);

  const groups = Object.entries(
    items.reduce<Record<string, SectionItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {})
  ).sort((a, b) => b[1].length - a[1].length);
  const shown = groups.slice(0, INDEX_ROWS);
  const rest = groups.slice(INDEX_ROWS);
  const peekItem = peek && groups.find(([c]) => c === peek.category)?.[1][0];

  function move(e: PointerEvent, category: string) {
    const box = listRef.current?.getBoundingClientRect();
    if (!box) return;
    setPeek({ category, x: e.clientX - box.left, y: e.clientY - box.top });
  }

  return (
    <section className="py-6">
      <div className="flex items-end justify-between gap-6">
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          {items.length} patterns,
          <span className="block text-muted-foreground">indexed by what they do.</span>
        </h2>
        <InstallLink className="hidden sm:inline-flex" />
      </div>

      <ul ref={listRef} className="relative mt-10 border-t" onPointerLeave={() => setPeek(null)}>
        {shown.map(([category, entries]) => (
          <li key={category} onPointerMove={(e) => move(e, category)}>
            <Link
              href={`/patterns#${category}`}
              className="group flex items-baseline gap-4 border-b py-3.5 transition-colors hover:bg-muted/30"
            >
              <span className="w-8 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                {String(entries.length).padStart(2, "0")}
              </span>
              <span className="text-lg font-medium capitalize tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                {category}
              </span>
              <span className="ml-auto hidden min-w-0 truncate text-xs text-muted-foreground sm:block">
                {entries.map((e) => e.title).join(" · ")}
              </span>
            </Link>
          </li>
        ))}
        {rest.length > 0 && (
          <li>
            <Link
              href="/patterns"
              className="flex items-baseline gap-4 border-b py-3.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="w-8 shrink-0 font-mono text-[11px] tabular-nums">
                +{rest.reduce((n, [, e]) => n + e.length, 0)}
              </span>
              <span className="text-sm">
                {rest.length} more categories — {rest.slice(0, 4).map(([c]) => c).join(", ")}…
              </span>
            </Link>
          </li>
        )}

        <AnimatePresence>
          {peek && peekItem && (
            <motion.div
              key="peek"
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 z-10 hidden w-52 sm:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, x: peek.x + 24, y: peek.y - 70 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
            >
              <ThumbCard item={peekItem} className="bg-card shadow-xl dark:bg-background" />
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
      <InstallLink className="mt-6 sm:hidden" />
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* K · Comparison — ai-patterns against the usual alternatives               */
/* ------------------------------------------------------------------------ */

const COLUMNS = ["ai-patterns", "Component library", "Inspiration gallery"];
const ROWS: { label: string; has: [boolean, boolean, boolean] }[] = [
  { label: "Source lives in your repo", has: [true, false, false] },
  { label: "Animated, production-ready code", has: [true, true, false] },
  { label: "When to use — and when not to", has: [true, false, false] },
  { label: "Accessibility as part of the contract", has: [true, true, false] },
  { label: "Built for AI-specific states", has: [true, false, true] },
  { label: "Readable by your coding agent", has: [true, false, false] },
];

export function ComparisonVariant() {
  return (
    <section className="py-6">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        Not a library.
        <span className="block text-muted-foreground">Not a mood board.</span>
      </h2>
      <div className="relative mt-10 overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-[46%] pb-3 text-left text-xs font-normal text-muted-foreground">
                <span className="sr-only">Feature</span>
              </th>
              {COLUMNS.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={cn(
                    "px-3 pt-4 pb-3 text-center text-xs font-medium",
                    i === 0 ? "rounded-t-xl border-x border-t bg-card dark:bg-muted/40" : "text-muted-foreground"
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, r) => (
              <tr key={row.label}>
                <th scope="row" className="border-t py-3 pr-4 text-left font-normal">
                  {row.label}
                </th>
                {row.has.map((has, i) => (
                  <td
                    key={i}
                    className={cn(
                      "border-t px-3 py-3 text-center",
                      i === 0 && "border-x bg-card dark:bg-muted/40",
                      i === 0 && r === ROWS.length - 1 && "rounded-b-xl border-b"
                    )}
                  >
                    {has ? (
                      <Check className={cn("mx-auto size-4", i === 0 ? "text-blue-500" : "text-foreground/70")} />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/40" />
                    )}
                    <span className="sr-only">{has ? "Yes" : "No"}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <InstallLink />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* L · Spotlight grid — four features lit by the cursor                      */
/* ------------------------------------------------------------------------ */

const SPOT_FEATURES = [
  { icon: Search, title: "Find by behavior", body: "Type what it does — approve, stream, cite, interrupt." },
  { icon: FileText, title: "A spec per pattern", body: "When to use, when not, anatomy, behavior, a11y — every time." },
  { icon: Accessibility, title: "Accessible by default", body: "Keyboard paths, live regions and reduced motion included." },
  { icon: Bot, title: "Read by your agent", body: "Install the skill and your agent reads the spec first." },
];

export function SpotlightVariant() {
  const gridRef = useRef<HTMLDivElement>(null);

  // One pointer listener for the whole grid: each card reads its own offset
  // from the shared coordinates, so the glow can spill across card borders.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const onMove = (e: globalThis.PointerEvent) => {
      for (const card of grid.querySelectorAll<HTMLElement>("[data-spot]")) {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - box.left}px`);
        card.style.setProperty("--y", `${e.clientY - box.top}px`);
      }
    };
    grid.addEventListener("pointermove", onMove);
    return () => grid.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section className="py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          Everything a pattern needs
          <span className="block text-muted-foreground">to survive a real product.</span>
        </h2>
        <AgentIcons className="text-muted-foreground" />
      </div>
      <div ref={gridRef} className="group/spot mt-10 grid gap-3 sm:grid-cols-2">
        {SPOT_FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            data-spot
            className="relative overflow-hidden rounded-xl border bg-muted/40 p-6 [--x:-999px] [--y:-999px]"
          >
            {/* Border glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
              style={{
                background:
                  "radial-gradient(260px circle at var(--x) var(--y), color-mix(in oklab, var(--foreground) 10%, transparent), transparent 70%)",
              }}
            />
            <div className="relative">
              <span className="grid size-9 place-items-center rounded-lg border bg-background">
                <Icon className="size-4" />
              </span>
              <h3 className="mt-10 text-sm font-medium">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <InstallLink />
      </div>
    </section>
  );
}
