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
      <ShimmerBrain />
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-block"
        >
          <ShimmerText text={word} />
        </motion.span>
      </AnimatePresence>
      <span className="ml-auto flex items-baseline font-mono text-sm tabular-nums">
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
  const [elapsed, setElapsed] = React.useState("0.0");

  React.useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return elapsed;
}

function ShimmerText({ text }: { text: string }) {
  return (
    <motion.span
      className="bg-clip-text text-sm font-medium text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 40%, var(--foreground) 50%, var(--muted-foreground) 60%)",
        backgroundSize: "200% 100%",
      }}
      initial={{ backgroundPositionX: "100%" }}
      animate={{ backgroundPositionX: "-100%" }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
    >
      {text}
    </motion.span>
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

/** A dim brain icon with a brighter copy swept across it by a moving mask, echoing ShimmerText's sheen. */
function ShimmerBrain() {
  const maskImage = "linear-gradient(90deg, transparent 30%, black 50%, transparent 70%)";

  return (
    <span className="relative inline-flex size-4 shrink-0">
      <Brain className="size-4 text-muted-foreground/40" aria-hidden />
      <motion.span
        className="absolute inset-0"
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
        <Brain className="size-4 text-foreground" aria-hidden />
      </motion.span>
    </span>
  );
}
