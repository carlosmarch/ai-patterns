"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  siArc,
  siClaude,
  siCursor,
  siFigma,
  siGithubcopilot,
  siGooglegemini,
  siLinear,
  siMistralai,
  siNotion,
  siPerplexity,
  siRaycast,
  siReplit,
  siV0,
  siWarp,
  siWindsurf,
  type SimpleIcon,
} from "simple-icons";

type Team = {
  icon: SimpleIcon;
  // Tile background and glyph colour, tuned to read like each team's app icon.
  bg: string;
  fg: string;
};

// The teams whose AI workflows the patterns are distilled from. Ordered so
// neighbouring tiles contrast; three consecutive entries are on screen at once.
const TEAMS: Team[] = [
  { icon: siClaude, bg: "linear-gradient(145deg,#e48a6a,#c15f3c)", fg: "#fff" },
  { icon: siCursor, bg: "linear-gradient(145deg,#2a2a2a,#050505)", fg: "#fff" },
  { icon: siLinear, bg: "linear-gradient(145deg,#7b85e6,#4450c4)", fg: "#fff" },
  { icon: siPerplexity, bg: "linear-gradient(145deg,#1d3a3f,#0b1f22)", fg: "#20b8cd" },
  { icon: siRaycast, bg: "linear-gradient(145deg,#ff7b7b,#e0383e)", fg: "#fff" },
  { icon: siNotion, bg: "linear-gradient(145deg,#ffffff,#ececec)", fg: "#111" },
  { icon: siGooglegemini, bg: "linear-gradient(145deg,#4f8ef7,#9b72cb)", fg: "#fff" },
  { icon: siV0, bg: "linear-gradient(145deg,#262626,#000)", fg: "#fff" },
  { icon: siReplit, bg: "linear-gradient(145deg,#ff8a3d,#e8560a)", fg: "#fff" },
  { icon: siGithubcopilot, bg: "linear-gradient(145deg,#3a2a6b,#0d1117)", fg: "#fff" },
  { icon: siArc, bg: "linear-gradient(145deg,#3a3ff5,#1b1fb0)", fg: "#ff9aa0" },
  { icon: siFigma, bg: "linear-gradient(145deg,#2c2c2c,#111)", fg: "#fff" },
  { icon: siMistralai, bg: "linear-gradient(145deg,#ffb347,#fa520f)", fg: "#fff" },
  { icon: siWindsurf, bg: "linear-gradient(145deg,#1f3d38,#0b100f)", fg: "#5fe0c4" },
  { icon: siWarp, bg: "linear-gradient(145deg,#2fb6ff,#0170c9)", fg: "#fff" },
];

const SLOTS = 3;
const INTERVAL = 2600;

function TeamTile({ slot, tick }: { slot: number; tick: number }) {
  const reduce = useReducedMotion();
  const team = TEAMS[(tick * SLOTS + slot) % TEAMS.length];

  return (
    <span
      aria-hidden
      className="relative mx-[0.2em] inline-block size-[0.9em] -translate-y-[0.05em] align-middle [perspective:400px]"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={team.icon.slug}
          title={team.icon.title}
          className="absolute inset-0 grid place-items-center rounded-[24%] shadow-[0_1px_2px_rgb(0_0_0/0.12),0_6px_16px_-6px_rgb(0_0_0/0.35),inset_0_0_0_1px_rgb(255_255_255/0.08)]"
          style={{ background: team.bg }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -80, y: "35%", scale: 0.85, filter: "blur(4px)" }}
          animate={{ opacity: 1, rotateX: 0, y: "0%", scale: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 80, y: "-35%", scale: 0.85, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: slot * 0.12 }}
        >
          <svg viewBox="0 0 24 24" className="size-[52%]" fill={team.fg}>
            <path d={team.icon.path} />
          </svg>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroHeadline() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), INTERVAL);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <h1 className="mt-6 text-5xl leading-[1.1] font-semibold tracking-tight sm:text-6xl">
      <span className="sr-only">The pattern language for AI agents</span>
      <span aria-hidden className="block">
        The pattern
        <TeamTile slot={0} tick={tick} />
      </span>
      <span aria-hidden className="block">
        language
        <TeamTile slot={1} tick={tick} />
        for
      </span>
      <span aria-hidden className="block">
        AI agents
        <TeamTile slot={2} tick={tick} />
      </span>
    </h1>
  );
}
