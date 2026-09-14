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
  interval = 6000,
  className,
}: ThinkingLoaderProps) {
  const elapsed = useElapsedSeconds();
  const word = useCyclingWord(words, interval);

  return (
    <div
      className={cn("flex items-center gap-1 px-4 py-3 text-muted-foreground", className)}
    >
      <Brain className="size-4 shrink-0" aria-hidden />
      <ShimmerWord word={word} />
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

function ShimmerWord({ word }: { word: string }) {
  return (
    <span className="relative inline-block h-[1.2em] overflow-hidden text-sm font-medium">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          className="inline-block whitespace-nowrap bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--muted-foreground) 30%, var(--foreground) 50%, var(--muted-foreground) 70%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ y: 10, opacity: 0, backgroundPositionX: "150%" }}
          animate={{ y: 0, opacity: 1, backgroundPositionX: "-50%" }}
          exit={{ y: -10, opacity: 0 }}
          transition={{
            y: { duration: 0.08, ease: "easeOut" },
            opacity: { duration: 0.08, ease: "easeOut" },
            backgroundPositionX: { repeat: Infinity, repeatType: "loop", duration: 1.4, ease: "linear", repeatDelay: 0.8 },
          }}
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
