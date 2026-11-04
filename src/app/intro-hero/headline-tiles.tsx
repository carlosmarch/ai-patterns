"use client";

import { useContext, useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AudioLines,
  Command,
  GitCompareArrows,
  Loader,
  MessageSquareQuote,
  MousePointerClick,
  Network,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  TextCursorInput,
  Workflow,
  type LucideProps,
} from "lucide-react";
import {
  siArc,
  siClaude,
  siCursor,
  siElevenlabs,
  siFigma,
  siFramer,
  siGithubcopilot,
  siGooglegemini,
  siHuggingface,
  siIntercom,
  siLinear,
  siMistralai,
  siNotion,
  siPerplexity,
  siRaycast,
  siReplit,
  siV0,
  siWarp,
  siWindsurf,
  siZedindustries,
  type SimpleIcon,
} from "simple-icons";

import { PlayingContext } from "./scenes";

type Tile = { name: string; bg: string } & (
  // A simple-icons glyph drawn on a tile, coloured to read like the team's app icon…
  | { path: string; fg: string; src?: never; Icon?: never }
  // …the team's own app icon artwork, for logos simple-icons doesn't carry…
  | { src: string; path?: never; fg?: never; Icon?: never }
  // …or a pattern icon.
  | { Icon: ComponentType<LucideProps>; fg: string; path?: never; src?: never }
);

const glyph = (icon: SimpleIcon, bg: string, fg = "#fff"): Tile => ({
  name: icon.title,
  path: icon.path,
  bg,
  fg,
});

// The agents whose workflows the patterns are distilled from. Ordered so
// neighbouring tiles contrast.
const AGENTS: Tile[] = [
  { name: "Orca", src: "/teams/orca.png", bg: "#0b0b0b" },
  glyph(siClaude, "linear-gradient(145deg,#e48a6a,#c15f3c)"),
  glyph(siCursor, "linear-gradient(145deg,#2a2a2a,#050505)"),
  glyph(siIntercom, "linear-gradient(145deg,#3b5cff,#1f3bd6)"),
  glyph(siPerplexity, "linear-gradient(145deg,#1d3a3f,#0b1f22)", "#20b8cd"),
  glyph(siLinear, "linear-gradient(145deg,#7b85e6,#4450c4)"),
  glyph(siRaycast, "linear-gradient(145deg,#ff7b7b,#e0383e)"),
  glyph(siNotion, "linear-gradient(145deg,#ffffff,#ececec)", "#111"),
  glyph(siZedindustries, "linear-gradient(145deg,#1a6be0,#0a3f9a)"),
  glyph(siV0, "linear-gradient(145deg,#262626,#000)"),
  glyph(siHuggingface, "linear-gradient(145deg,#ffe066,#ffc21a)", "#1f1f1f"),
  glyph(siGooglegemini, "linear-gradient(145deg,#4f8ef7,#9b72cb)"),
  glyph(siElevenlabs, "linear-gradient(145deg,#f4f4f4,#dcdcdc)", "#111"),
  glyph(siReplit, "linear-gradient(145deg,#ff8a3d,#e8560a)"),
  glyph(siGithubcopilot, "linear-gradient(145deg,#3a2a6b,#0d1117)"),
  glyph(siFramer, "linear-gradient(145deg,#2f7bff,#0047e0)"),
  glyph(siArc, "linear-gradient(145deg,#3a3ff5,#1b1fb0)", "#ff9aa0"),
  glyph(siFigma, "linear-gradient(145deg,#2c2c2c,#111)"),
  glyph(siMistralai, "linear-gradient(145deg,#ffb347,#fa520f)"),
  glyph(siWindsurf, "linear-gradient(145deg,#1f3d38,#0b100f)", "#5fe0c4"),
  glyph(siWarp, "linear-gradient(145deg,#2fb6ff,#0170c9)"),
];

// One icon per family of patterns in the catalogue.
const PATTERNS: Tile[] = [
  { name: "Command palette", Icon: Command, bg: "linear-gradient(145deg,#2b2b2b,#0a0a0a)", fg: "#fff" },
  { name: "Tool approval", Icon: ShieldCheck, bg: "linear-gradient(145deg,#34d399,#059669)", fg: "#fff" },
  { name: "Streaming text", Icon: TextCursorInput, bg: "linear-gradient(145deg,#60a5fa,#2563eb)", fg: "#fff" },
  { name: "Voice", Icon: AudioLines, bg: "linear-gradient(145deg,#f472b6,#db2777)", fg: "#fff" },
  { name: "Multi-agent trace", Icon: Network, bg: "linear-gradient(145deg,#a78bfa,#7c3aed)", fg: "#fff" },
  { name: "Inline citation", Icon: MessageSquareQuote, bg: "linear-gradient(145deg,#ffffff,#ececec)", fg: "#111" },
  { name: "Thinking loader", Icon: Loader, bg: "linear-gradient(145deg,#fbbf24,#f59e0b)", fg: "#1f1f1f" },
  { name: "Diff summary", Icon: GitCompareArrows, bg: "linear-gradient(145deg,#1f2937,#030712)", fg: "#4ade80" },
  { name: "Selection actions", Icon: MousePointerClick, bg: "linear-gradient(145deg,#fb923c,#ea580c)", fg: "#fff" },
  { name: "Agent triggers", Icon: Workflow, bg: "linear-gradient(145deg,#22d3ee,#0891b2)", fg: "#fff" },
  { name: "Prompt bar", Icon: Sparkles, bg: "linear-gradient(145deg,#818cf8,#4338ca)", fg: "#fff" },
  { name: "Response compare", Icon: PanelsTopLeft, bg: "linear-gradient(145deg,#f87171,#dc2626)", fg: "#fff" },
];

const INTERVAL = 2600;

function useTileTick() {
  const playing = useContext(PlayingContext);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), INTERVAL);
    return () => clearInterval(id);
  }, [playing]);
  return tick;
}

function RotatingTile({ tiles, delay = 0 }: { tiles: Tile[]; delay?: number }) {
  const reduce = useReducedMotion();
  const tick = useTileTick();
  const tile = tiles[tick % tiles.length];

  return (
    <span
      aria-hidden
      className="relative mx-[0.18em] inline-block size-[0.88em] -translate-y-[0.06em] align-middle [perspective:400px]"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={tile.name}
          title={tile.name}
          className="absolute inset-0 grid place-items-center overflow-hidden rounded-[24%] shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-6px_rgb(0_0_0/0.35),inset_0_0_0_1px_rgb(255_255_255/0.08)]"
          style={{ background: tile.bg }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -80, y: "35%", scale: 0.85, filter: "blur(4px)" }}
          animate={{ opacity: 1, rotateX: 0, y: "0%", scale: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 80, y: "-35%", scale: 0.85, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay }}
        >
          {tile.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tile.src} alt="" className="size-full" draggable={false} />
          ) : tile.Icon ? (
            <tile.Icon className="size-[56%]" color={tile.fg} strokeWidth={2.25} />
          ) : (
            <svg viewBox="0 0 24 24" className="size-[52%]" fill={tile.fg}>
              <path d={tile.path} />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Rotating logos of the agents the patterns come from. */
export function AgentTile() {
  return <RotatingTile tiles={AGENTS} />;
}

/** Rotating icons of the pattern families in the catalogue. */
export function PatternTile() {
  return <RotatingTile tiles={PATTERNS} delay={0.15} />;
}
