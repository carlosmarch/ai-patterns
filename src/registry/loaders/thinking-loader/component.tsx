"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export type ThinkingLoaderVariant = "drive" | "dots" | "orbit" | "surfer";

export interface ThinkingLoaderProps {
  label?: string;
  variant?: ThinkingLoaderVariant;
  className?: string;
}

export function ThinkingLoader({
  label = "Thinking",
  variant = "drive",
  className,
}: ThinkingLoaderProps) {
  const elapsed = useElapsedSeconds();
  const Icon = icons[variant];

  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3 text-muted-foreground", className)}
    >
      <Icon />
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

function GridIcon() {
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.span
          key={i}
          className="size-1 rounded-[1px] bg-current"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 3) * 0.1 + Math.floor(i / 3) * 0.1,
          }}
        />
      ))}
    </div>
  );
}

function DotsIcon() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function OrbitIcon() {
  return (
    <motion.div
      className="relative size-4"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
    >
      <span className="absolute inset-0 rounded-full border border-current/25" />
      <span className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-current" />
    </motion.div>
  );
}

function SurferIcon() {
  return (
    <div className="flex h-4 items-end gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-current"
          animate={{ height: ["30%", "100%", "30%"] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

const icons: Record<ThinkingLoaderVariant, React.ComponentType> = {
  drive: GridIcon,
  dots: DotsIcon,
  orbit: OrbitIcon,
  surfer: SurferIcon,
};
