"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface ThinkingLoaderProps {
  label?: string;
  className?: string;
}

export function ThinkingLoader({ label = "Thinking", className }: ThinkingLoaderProps) {
  const elapsed = useElapsedSeconds();

  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3 text-muted-foreground", className)}
    >
      <SpinnerIcon />
      <ShimmerText text={label} />
      <span className="ml-auto flex items-baseline font-mono text-sm tabular-nums">
        <SlidingNumber value={elapsed} />s
      </span>
    </div>
  );
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

function SpinnerIcon() {
  return (
    <motion.span
      className="size-3.5 rounded-full border-2 border-current/25 border-t-current"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
    />
  );
}
