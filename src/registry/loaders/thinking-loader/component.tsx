"use client";

import * as React from "react";
import { Brain } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

const DEFAULT_WORDS = [
  "Thinking",
  "Reasoning",
  "Pondering",
  "Analyzing",
  "Considering",
  "Working it out",
];

export interface ThinkingLoaderProps {
  /** Words to cycle through as the label. Defaults to a set of generic synonyms. */
  words?: string[];
  /** How often the label changes, in ms. */
  interval?: number;
  className?: string;
}

export function ThinkingLoader({
  words = DEFAULT_WORDS,
  interval = 2000,
  className,
}: ThinkingLoaderProps) {
  const elapsed = useElapsedSeconds();
  const word = useCyclingWord(words, interval);

  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3 text-muted-foreground", className)}
    >
      <ShimmerRow word={word} />
      <span className="ml-auto flex items-center font-mono text-sm tabular-nums">
        <SlidingNumber value={elapsed} />s
      </span>
    </div>
  );
}

function useCyclingWord(words: string[], interval: number) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [words, interval]);

  return words[index % words.length];
}

function useElapsedSeconds() {
  const [elapsed, setElapsed] = React.useState("0");

  React.useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000).toString());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return elapsed;
}

/**
 * A dim icon+label row with a brighter copy of the same row swept across it by
 * one shared moving mask, so the sheen crosses the icon and the text together
 * as a single band instead of two independently-timed shimmers.
 */
function ShimmerRow({ word }: { word: string }) {
  const maskImage = "linear-gradient(90deg, transparent 30%, black 50%, transparent 70%)";

  return (
    <span className="relative inline-flex items-center gap-3">
      <WordRow word={word} className="text-muted-foreground/40" />
      <motion.span
        className="absolute inset-0 flex items-center gap-3 text-foreground"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          maskSize: "300% 100%",
          WebkitMaskSize: "300% 100%",
        }}
        initial={{ maskPosition: "100% 0%" }}
        animate={{ maskPosition: "-100% 0%" }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
      >
        <WordRow word={word} />
      </motion.span>
    </span>
  );
}

function WordRow({ word, className }: { word: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Brain className="size-4 shrink-0" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-block text-sm font-medium"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Each digit slides up and out when it changes, and the new one slides up into place. */
function SlidingNumber({ value }: { value: string }) {
  return (
    <span className="inline-flex">
      {value.split("").map((char, i) => (
        <span key={i} className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${i}-${char}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
