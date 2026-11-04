"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight, CornerDownLeft, Pause, Play, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ApprovalScene,
  ArticleScene,
  CitationScene,
  CreateAgentScene,
  DiffScene,
  ModelScene,
  PaletteScene,
  PlayingContext,
  SelectionScene,
  TraceScene,
  VoiceScene,
  WheelScene,
} from "./scenes";

export type HeroEntry = {
  slug: string;
  category: string;
  title: string;
  description: string;
};

type SceneId =
  | "palette"
  | "voice"
  | "trace"
  | "article"
  | "approval"
  | "wheel"
  | "diff"
  | "model"
  | "selection"
  | "citation"
  | "agent";

type Scene = {
  id: SceneId;
  slug: string;
  Component: ComponentType;
  /** Position and size on the 1440×900 stage. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0 = right behind the glass, 1 = far back (more blur, more parallax). */
  depth: number;
  tone: "light" | "dark";
};

// Laid out around a clear centre column that holds the headline and search.
const SCENES: Scene[] = [
  { id: "palette", slug: "command-palette", Component: PaletteScene, x: 150, y: 40, w: 370, h: 240, depth: 0.25, tone: "light" },
  { id: "voice", slug: "voice-waveform", Component: VoiceScene, x: 600, y: 40, w: 200, h: 130, depth: 0.7, tone: "light" },
  { id: "trace", slug: "multi-agent-trace", Component: TraceScene, x: 850, y: 70, w: 210, h: 130, depth: 0.6, tone: "dark" },
  { id: "article", slug: "streaming-text", Component: ArticleScene, x: 1110, y: 10, w: 380, h: 250, depth: 0.85, tone: "light" },
  { id: "approval", slug: "tool-approval", Component: ApprovalScene, x: -30, y: 320, w: 220, h: 120, depth: 0.8, tone: "light" },
  { id: "wheel", slug: "thinking-loader", Component: WheelScene, x: 220, y: 470, w: 200, h: 130, depth: 0.5, tone: "dark" },
  { id: "diff", slug: "diff-summary", Component: DiffScene, x: -50, y: 670, w: 400, h: 200, depth: 0.9, tone: "light" },
  { id: "model", slug: "prompt-bar-pro", Component: ModelScene, x: 1080, y: 360, w: 330, h: 270, depth: 0.2, tone: "light" },
  { id: "selection", slug: "selection-actions", Component: SelectionScene, x: 420, y: 720, w: 370, h: 220, depth: 0.35, tone: "dark" },
  { id: "citation", slug: "inline-citation", Component: CitationScene, x: 840, y: 770, w: 210, h: 120, depth: 0.7, tone: "light" },
  { id: "agent", slug: "create-agent", Component: CreateAgentScene, x: 1110, y: 690, w: 340, h: 210, depth: 0.45, tone: "dark" },
];

// What the search placeholder types, and which scenes come into focus for it.
const TOPICS: { text: string; scenes: SceneId[] }[] = [
  { text: "command menus", scenes: ["palette", "model"] },
  { text: "streaming text", scenes: ["article", "selection"] },
  { text: "tool approvals", scenes: ["approval", "trace"] },
  { text: "thinking states", scenes: ["wheel", "citation"] },
  { text: "voice input", scenes: ["voice", "agent"] },
  { text: "model pickers", scenes: ["model", "palette"] },
  { text: "code diffs", scenes: ["diff", "trace"] },
  { text: "selection menus", scenes: ["selection", "article"] },
  { text: "agent builders", scenes: ["agent", "approval"] },
];

const STAGE_W = 1440;
const STAGE_H = 900;

const TONES: Record<Scene["tone"], CSSProperties> = {
  light: {
    "--s-bg": "#ffffff",
    "--s-fg": "#171717",
    "--s-mute": "#7a7a7a",
    "--s-line": "#e7e7e7",
    "--s-soft": "#f3f3f3",
    "--s-accent": "#3b82f6",
  } as CSSProperties,
  dark: {
    "--s-bg": "#121212",
    "--s-fg": "#f2f2f2",
    "--s-mute": "#8b8b8b",
    "--s-line": "#262626",
    "--s-soft": "#1e1e1e",
    "--s-accent": "#4f8ef7",
  } as CSSProperties,
};

const href = (e: Pick<HeroEntry, "category" | "slug">) => `/patterns/${e.category}/${e.slug}`;

/* ------------------------------------------------------------------ */

function useTypewriter(words: string[], playing: boolean) {
  const [s, setS] = useState({ i: 0, n: words[0].length, del: false });

  useEffect(() => {
    if (!playing) return;
    const word = words[s.i];
    const delay = s.del ? (s.n === 0 ? 260 : 26) : s.n === word.length ? 2300 : 62;
    const id = setTimeout(() => {
      setS((p) => {
        const w = words[p.i];
        if (!p.del && p.n < w.length) return { ...p, n: p.n + 1 };
        if (!p.del) return { ...p, del: true };
        if (p.n > 0) return { ...p, n: p.n - 1 };
        return { i: (p.i + 1) % words.length, n: 0, del: false };
      });
    }, delay);
    return () => clearTimeout(id);
  }, [s, playing, words]);

  return { index: s.i, text: words[s.i].slice(0, s.n) };
}

function score(entry: HeroEntry, q: string) {
  const title = entry.title.toLowerCase();
  const hay = `${title} ${entry.slug} ${entry.category} ${entry.description}`.toLowerCase();
  if (title.startsWith(q)) return 4;
  if (title.includes(q)) return 3;
  const words = q.split(/\s+/).filter(Boolean);
  // Loose plural match so "command menus" finds "Command Palette" via "command".
  const hits = words.filter((w) => hay.includes(w) || (w.length > 3 && hay.includes(w.replace(/e?s$/, ""))));
  if (hits.length === words.length) return 2;
  if (hits.length > 0) return hits.length / words.length;
  return 0;
}

/* ------------------------------------------------------------------ */

export function IntroHero({ entries, latest }: { entries: HeroEntry[]; latest?: HeroEntry }) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const reduce = useReducedMotion();
  const inView = useInView(sectionRef, { margin: "100px" });
  const [paused, setPaused] = useState<boolean | null>(null);
  const isPaused = paused ?? Boolean(reduce);
  const playing = !isPaused && inView;

  const [scale, setScale] = useState(1);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<SceneId | null>(null);

  const topicWords = useMemo(() => TOPICS.map((t) => t.text), []);
  const typer = useTypewriter(topicWords, playing && !focused && !query);

  // Scale the fixed stage to cover the hero at any viewport size.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(1.3, Math.max(0.6, Math.max(width / STAGE_W, height / STAGE_H))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // "/" focuses the search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
      inputRef.current?.focus({ preventScroll: top > -200 });
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) {
      // Empty: suggest the patterns behind the scenes on screen.
      const bySlug = new Map(entries.map((e) => [e.slug, e]));
      return SCENES.map((s) => bySlug.get(s.slug)).filter((e): e is HeroEntry => Boolean(e)).slice(0, 6);
    }
    return entries
      .map((e) => ({ e, s: score(e, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))
      .slice(0, 6)
      .map((r) => r.e);
  }, [entries, q]);

  // Which scenes are sharp: the hovered one, else the ones matching what's
  // typed, else the ones matching the placeholder's current topic.
  const focusSet = useMemo(() => {
    if (hovered) return new Set<SceneId>([hovered]);
    if (q) {
      const slugs = new Set(results.map((r) => r.slug));
      return new Set(SCENES.filter((s) => slugs.has(s.slug)).map((s) => s.id));
    }
    return new Set(TOPICS[typer.index].scenes);
  }, [hovered, q, results, typer.index]);

  const entryFor = useMemo(() => {
    const bySlug = new Map(entries.map((e) => [e.slug, e]));
    return (slug: string) => bySlug.get(slug);
  }, [entries]);

  // Pointer parallax, shared by every card.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  function go(entry: HeroEntry | undefined) {
    if (!entry) return;
    router.push(href(entry));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length) go(results[Math.min(active, results.length - 1)]);
      else router.push("/patterns");
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  }

  const open = focused;
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  return (
    <PlayingContext.Provider value={playing}>
      <section
        ref={sectionRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        data-paused={!playing}
        className="relative isolate h-[clamp(620px,calc(100svh-57px),940px)] overflow-hidden border-b bg-background"
      >
        {/* Stage */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          {SCENES.map((scene, i) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={i}
              entry={entryFor(scene.slug)}
              focused={focusSet.has(scene.id)}
              px={px}
              py={py}
              onHover={setHovered}
            />
          ))}
        </div>

        {/* Readability veil behind the centre column */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_34%_30%_at_50%_54%,var(--color-background)_35%,transparent_100%)] max-sm:bg-[radial-gradient(ellipse_80%_45%_at_50%_52%,var(--color-background)_45%,transparent_100%)]"
        />

        {/* Centre column */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          {latest && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pointer-events-auto absolute top-[clamp(20px,6%,64px)]"
            >
              <Link
                href={href(latest)}
                className="group inline-flex items-center gap-2 rounded-full bg-blue-500 p-1 pr-3.5 text-sm text-white shadow-[0_8px_30px_-8px_rgb(59_130_246/0.6)] transition-colors hover:bg-blue-600"
              >
                <span className="rounded-full bg-blue-950/70 px-2.5 py-0.5 text-xs font-medium">New</span>
                <span className="max-w-[52vw] truncate sm:max-w-none">{latest.title}</span>
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.1rem] leading-[1.08] sm:leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
          >
            Show your agent
            <br />
            the patterns that work
          </motion.h1>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative mt-9 w-full max-w-xl"
          >
            <div
              className={cn(
                "relative flex h-14 items-center gap-3 rounded-full border bg-background/70 pr-3 pl-5 shadow-[0_10px_40px_-16px_rgb(0_0_0/0.35)] backdrop-blur-xl transition-[border-color,box-shadow] sm:h-[68px] sm:pl-6",
                open && "border-foreground/25 shadow-[0_14px_50px_-14px_rgb(0_0_0/0.45)]"
              )}
            >
              <Search className="size-5 shrink-0 text-muted-foreground sm:size-6" aria-hidden />
              <div className="relative h-full flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={open && results.length ? `${listId}-${activeIndex}` : undefined}
                  aria-label="Search patterns"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={onKeyDown}
                  placeholder={focused ? "Search patterns…" : ""}
                  className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-xl"
                />
                {!query && !focused && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center text-base text-muted-foreground sm:text-xl"
                  >
                    Search for&nbsp;<span className="text-foreground">{typer.text}</span>
                    <span className="ml-px h-[1.15em] w-[2px] animate-[hero-caret_1s_steps(1)_infinite] bg-foreground" />
                  </span>
                )}
              </div>
              <kbd className="hidden size-8 shrink-0 place-items-center rounded-lg border bg-muted/50 font-sans text-sm text-muted-foreground sm:grid">
                /
              </kbd>
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.99 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border bg-popover text-left shadow-2xl"
                >
                  <div className="px-4 pt-3 pb-1 text-[11px] font-medium text-muted-foreground">
                    {q ? (results.length ? "Patterns" : "No matches") : "On screen"}
                  </div>
                  <ul id={listId} role="listbox" aria-label="Patterns" className="max-h-72 overflow-y-auto p-1.5">
                    {results.map((entry, i) => (
                      <li
                        key={entry.slug}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(entry)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2",
                          i === activeIndex && "bg-accent"
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{entry.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{entry.description}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{entry.category}</span>
                        {i === activeIndex && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                      </li>
                    ))}
                    {q && !results.length && (
                      <li className="px-3 py-2 text-sm text-muted-foreground">
                        Nothing for “{query}”. Press ↵ to browse every pattern.
                      </li>
                    )}
                  </ul>
                  <Link
                    href="/patterns"
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all {entries.length} patterns
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border px-1">↑↓</kbd> to move · <kbd className="rounded border px-1">↵</kbd> to open
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="#first-demo"
              className="rounded-full bg-foreground px-6 py-3 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Browse patterns
            </Link>
            <Link
              href="/skill"
              className="rounded-full bg-muted px-6 py-3 text-[15px] font-medium text-foreground transition-[transform,background-color] hover:scale-[1.03] hover:bg-accent active:scale-[0.98]"
            >
              Install the skill
            </Link>
          </motion.div>
        </div>

        {/* Pause / play every scene */}
        <button
          type="button"
          onClick={() => setPaused(!isPaused)}
          aria-label={isPaused ? "Play animations" : "Pause animations"}
          aria-pressed={isPaused}
          className="absolute right-4 bottom-4 z-20 grid size-11 place-items-center rounded-full bg-muted/80 text-foreground backdrop-blur transition-colors hover:bg-accent sm:right-6 sm:bottom-6 sm:size-12"
        >
          {isPaused ? <Play className="size-4 fill-current" /> : <Pause className="size-4 fill-current" />}
        </button>
      </section>
    </PlayingContext.Provider>
  );
}

/* ------------------------------------------------------------------ */

function SceneCard({
  scene,
  index,
  entry,
  focused,
  px,
  py,
  onHover,
}: {
  scene: Scene;
  index: number;
  entry?: HeroEntry;
  focused: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
  onHover: (id: SceneId | null) => void;
}) {
  const reach = 14 + scene.depth * 34;
  const x = useTransform(px, (v) => v * -reach);
  const y = useTransform(py, (v) => v * -reach * 0.7);
  const { Component } = scene;

  const blur = focused ? 0 : 3 + scene.depth * 11;
  const opacity = focused ? 1 : 0.85 - scene.depth * 0.4;
  const cardScale = focused ? 1.03 : 1 - scene.depth * 0.05;

  return (
    <motion.div
      className="absolute"
      style={{ left: scene.x, top: scene.y, width: scene.w, height: scene.h, x, y, zIndex: focused ? 5 : Math.round((1 - scene.depth) * 4) }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="hero-float size-full"
        style={
          {
            "--float": `${-6 - scene.depth * 10}px`,
            "--dur": `${7 + (index % 4) * 1.7}s`,
            "--delay": `${-index * 1.3}s`,
          } as CSSProperties
        }
      >
        <Link
          href={entry ? href(entry) : "/patterns"}
          tabIndex={-1}
          onPointerEnter={() => onHover(scene.id)}
          onPointerLeave={() => onHover(null)}
          className={cn(
            "group relative block size-full overflow-hidden rounded-[20px] p-1.5 transition-[filter,opacity,transform] duration-700 ease-out",
            scene.tone === "light"
              ? "bg-neutral-200/80 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:bg-neutral-100"
              : "bg-neutral-900 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)] ring-1 ring-white/10"
          )}
          style={{
            filter: `blur(${blur}px)`,
            opacity,
            transform: `scale(${cardScale})`,
          }}
        >
          <div
            className="relative size-full overflow-hidden rounded-[14px] bg-(--s-bg) text-(--s-fg)"
            style={TONES[scene.tone]}
          >
            <Component />
          </div>
          {entry && (
            <span
              className={cn(
                "absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium opacity-0 shadow-lg transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100",
                "translate-y-1",
                scene.tone === "light" ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
              )}
            >
              {entry.title}
              <ArrowUpRight className="size-3" />
            </span>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
