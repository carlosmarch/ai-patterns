"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BadgeCheck, Search } from "lucide-react";
import { siClaude, siCursor, siGithubcopilot } from "simple-icons";

import { TEAMS, type Team } from "@/lib/teams";

// The "why" bento on the home page: two wide cards with a live vignette each,
// three small ones, and a credit strip with the skill CTA.

const QUERIES = ["approve", "stream", "cite", "interrupt", "retry"];
const COPIES = [
  { title: "Tool Approval", file: "tool-approval/component.tsx" },
  { title: "Streaming Text", file: "streaming-text/component.tsx" },
  { title: "Inline Citation", file: "inline-citation/component.tsx" },
];
export const AGENTS: { name: string; path: string; bg: string; fg: string }[] = [
  { name: siClaude.title, path: siClaude.path, bg: "#1f1f1f", fg: "#d97757" },
  { name: siCursor.title, path: siCursor.path, bg: "#1f1f1f", fg: "#fff" },
  { name: siGithubcopilot.title, path: siGithubcopilot.path, bg: "#1f1f1f", fg: "#fff" },
];

export function useTick(interval: number) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [reduce, interval]);
  return tick;
}

export function HomeFeatures({
  thumbnails,
  patternCount,
}: {
  thumbnails: ReactNode;
  patternCount: number;
}) {
  return (
    <section className="py-16 sm:py-20">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
        The code, and the reasoning behind it.
        <span className="block text-muted-foreground">Both written for AI agents.</span>
      </h2>

      <div className="mt-10 grid gap-3 sm:grid-cols-6">
        <Tile
          className="sm:col-span-3"
          title="Find by behavior"
          description="Type what it does — approve, stream, cite, interrupt. Every pattern answers by behavior, not by name."
        >
          <SearchVignette thumbnails={thumbnails} />
        </Tile>
        <Tile
          className="sm:col-span-3"
          title="Copy it, don't install it"
          description="The component lands in your repo as source, with its demo and spec beside it. No package to keep up with."
        >
          <CopyVignette />
        </Tile>
        <Tile
          className="sm:col-span-2"
          size="sm"
          title="A spec per pattern"
          description="When to use, when not, anatomy, behavior, a11y — in the same order, every time."
        >
          <SpecStack />
        </Tile>
        <Tile
          className="sm:col-span-2"
          size="sm"
          title="Accessible by default"
          description="Keyboard paths, live regions and reduced motion are part of the contract."
        >
          <BadgeCheck className="size-6 fill-blue-500 text-background" />
        </Tile>
        <Tile
          className="sm:col-span-2"
          size="sm"
          title="Read by your agent"
          description="Install the skill and Claude Code reads the spec before it writes the UI."
        >
          <div className="flex -space-x-1.5">
            {AGENTS.map((a) => (
              <span
                key={a.name}
                title={a.name}
                className="grid size-7 place-items-center rounded-full ring-2 ring-card dark:ring-background"
                style={{ background: a.bg }}
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill={a.fg} aria-hidden>
                  <path d={a.path} />
                </svg>
              </span>
            ))}
          </div>
        </Tile>
      </div>

      <div className="mt-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <TeamCredit patternCount={patternCount} />
        <Link
          href="/skill"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Install the skill
        </Link>
      </div>
    </section>
  );
}

function Tile({
  title,
  description,
  size = "lg",
  className,
  children,
}: {
  title: string;
  description: string;
  size?: "lg" | "sm";
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={
        "flex flex-col overflow-hidden rounded-xl border bg-muted/40 " +
        (size === "lg" ? "min-h-[280px] sm:min-h-[300px] " : "min-h-[150px] sm:min-h-[200px] ") +
        (className ?? "")
      }
    >
      <div
        className={
          size === "lg"
            ? "relative flex flex-1 items-center justify-center overflow-hidden"
            : "flex-1 px-5 pt-5"
        }
      >
        {children}
      </div>
      <div className="px-5 pt-3 pb-5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </article>
  );
}

export function SearchVignette({ thumbnails }: { thumbnails: ReactNode }) {
  const reduce = useReducedMotion();
  const tick = useTick(2400);
  const word = QUERIES[tick % QUERIES.length];
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 grid grid-cols-3 gap-2 p-3 opacity-60 [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      >
        {thumbnails}
      </div>
      <div
        aria-hidden
        className="relative flex w-[78%] max-w-[300px] items-center gap-2 rounded-full border bg-background/90 px-4 py-2.5 shadow-lg backdrop-blur"
      >
        <Search className="size-3.5 text-muted-foreground" />
        <span className="flex-1 text-sm">
          {reduce ? word : <Typed key={word} word={word} />}
          <span className="ml-px inline-block h-[1em] w-px translate-y-[0.15em] animate-pulse bg-foreground" />
        </span>
        <kbd className="rounded border px-1.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
      </div>
    </>
  );
}

// Types `word` out one character at a time; keyed by word so it restarts.
export function Typed({ word }: { word: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= word.length) clearInterval(id);
        return Math.min(c + 1, word.length);
      });
    }, 70);
    return () => clearInterval(id);
  }, [word]);
  return word.slice(0, count);
}

export function CopyVignette() {
  const reduce = useReducedMotion();
  const tick = useTick(2800);
  const item = COPIES[tick % COPIES.length];

  return (
    <div aria-hidden className="relative h-20 w-[82%] max-w-[340px]">
      <div className="absolute inset-x-6 -top-3 h-full rounded-2xl border bg-card/50 dark:bg-background/50" />
      <div className="absolute inset-x-3 -top-1.5 h-full rounded-2xl border bg-card/80 dark:bg-background/80" />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={item.title}
          className="absolute inset-0 flex items-center gap-3 rounded-2xl border bg-card px-3 shadow-lg dark:bg-background"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          <span className="size-11 shrink-0 rounded-lg border bg-muted" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">Copied {item.title}</span>
            <span className="block truncate font-mono text-[11px] text-muted-foreground">
              {item.file}
            </span>
          </span>
          <span className="shrink-0 self-start pt-3 text-[11px] text-muted-foreground">Just now</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SpecStack() {
  return (
    <div aria-hidden className="relative h-7 w-12">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute top-0 flex h-7 w-6 flex-col gap-[3px] rounded-[5px] border bg-card p-1 shadow-sm dark:bg-background"
          style={{ left: i * 9, transform: `rotate(${(i - 1) * 8}deg)`, zIndex: i }}
        >
          <span className="h-[2px] w-3/4 rounded-full bg-muted-foreground/50" />
          <span className="h-[2px] w-full rounded-full bg-muted-foreground/25" />
          <span className="h-[2px] w-2/3 rounded-full bg-muted-foreground/25" />
        </span>
      ))}
    </div>
  );
}

// Three teams at a time, rotating through the whole strip. TEAMS.length is a
// multiple of three, so every frame shows three distinct teams.
export function TeamCredit({ patternCount }: { patternCount: number }) {
  const reduce = useReducedMotion();
  const tick = useTick(3200);
  const start = (tick * 3) % TEAMS.length;
  const teams = [0, 1, 2].map((i) => TEAMS[(start + i) % TEAMS.length]);
  const names = teams.map((t) => t.name).join(", ");

  return (
    <div className="flex items-center gap-4">
      <TeamStack teams={teams} />
      <div className="min-w-0">
        <p className="text-sm font-medium">
          <span className="sr-only">
            Studied across {TEAMS.slice(0, 3).map((t) => t.name).join(", ")} and more
          </span>
          <span aria-hidden>
            Studied across{" "}
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={start}
                className="inline-block"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {names}
              </motion.span>
            </AnimatePresence>{" "}
            and more
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {patternCount} patterns, each written up as a spec your agent can read
        </p>
      </div>
    </div>
  );
}

export function TeamStack({ teams }: { teams: Team[] }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="relative h-10 w-16 shrink-0">
      {teams.map((team, i) => (
        <AnimatePresence key={i} initial={false}>
          <motion.span
            key={team.id}
            className="absolute top-0 grid size-10 place-items-center overflow-hidden rounded-[24%] shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-6px_rgb(0_0_0/0.35),inset_0_0_0_1px_rgb(255_255_255/0.08)]"
            style={{ background: team.bg, left: i * 12, zIndex: i }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.85, rotate: (i - 1) * 7 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: (i - 1) * 7 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 26, delay: reduce ? 0 : i * 0.06 }}
          >
            {team.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.src} alt="" className="size-full" draggable={false} />
            ) : (
              <svg viewBox="0 0 24 24" className="size-[52%]" fill={team.fg}>
                <path d={team.path} />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      ))}
    </div>
  );
}
