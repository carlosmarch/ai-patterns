"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Brain, Check, ChevronDown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Thought {
  /** A short headline for this beat of reasoning, e.g. "Comparing the two options". */
  title: string;
  /** The reasoning text itself. Pass the partial string while it streams. */
  body: string;
}

export interface StreamOfThoughtProps {
  /** Thoughts streamed so far. The last one is still growing while `thinking` is true. */
  thoughts: Thought[];
  /** True while the model is still reasoning. */
  thinking: boolean;
  /** Overrides the measured duration shown once thinking finishes ("Thought for 12s"). */
  durationSeconds?: number;
  /** Max height of the live window while streaming, in px. */
  liveHeight?: number;
  className?: string;
}

export function StreamOfThought({
  thoughts,
  thinking,
  durationSeconds,
  liveHeight = 148,
  className,
}: StreamOfThoughtProps) {
  const reduceMotion = useReducedMotion();
  const bodyId = React.useId();
  const elapsed = useElapsedSeconds(thinking);
  const seconds = durationSeconds ?? elapsed;

  // `null` = follow the default (open while thinking, closed when done).
  // Once the person toggles, their choice wins.
  const [userOpen, setUserOpen] = React.useState<boolean | null>(null);
  const open = userOpen ?? thinking;

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const pinned = React.useRef(true);

  // Keep the live window scrolled to the newest line, unless the person
  // scrolled up to re-read something.
  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !thinking || !pinned.current) return;
    el.scrollTop = el.scrollHeight;
  }, [thoughts, thinking, open]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
  }

  const current = thoughts.at(-1)?.title ?? "Thinking";

  return (
    <div className={cn("text-sm", className)}>
      <button
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-2 rounded-md py-1 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {thinking ? (
          <Brain className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <Sparkles className="size-3.5 shrink-0" aria-hidden />
        )}
        {/* Announces "Thinking" once, then "Thought for Ns" — never the stream itself. */}
        <span className="sr-only" role="status">
          {thinking ? "Thinking" : `Thought for ${seconds} seconds`}
        </span>
        <span aria-hidden className="min-w-0 truncate">
          {thinking ? (
            <SlidingLabel label={current} shimmer={!reduceMotion} />
          ) : (
            <span className="text-foreground">Thought for {seconds}s</span>
          )}
        </span>
        <span aria-hidden className="ml-auto flex shrink-0 items-center gap-2">
          {thinking && (
            <span className="flex font-mono tabular-nums">
              <SlidingNumber value={String(seconds)} />s
            </span>
          )}
          <ChevronDown
            className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={scrollRef}
              onScroll={onScroll}
              aria-busy={thinking}
              aria-label="Reasoning"
              tabIndex={thinking ? 0 : undefined}
              className={cn(
                "mt-2 focus-visible:outline-none",
                thinking && "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
              style={
                thinking
                  ? {
                      maxHeight: liveHeight,
                      maskImage: "linear-gradient(to bottom, transparent, black 28px)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent, black 28px)",
                    }
                  : undefined
              }
            >
              <ol>
                {thoughts.map((thought, i) => {
                  const last = i === thoughts.length - 1;
                  const live = thinking && last;
                  return (
                    <motion.li
                      key={i}
                      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center pt-0.5">
                        <StepMark live={live} />
                        {!last && <span className="my-1 w-px flex-1 bg-border" />}
                      </div>
                      <div className={cn("min-w-0", !last && "pb-3")}>
                        <p className="text-xs font-medium text-foreground/90">{thought.title}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {thought.body}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A pulsing dot while the step streams; a check once it's done. */
function StepMark({ live }: { live: boolean }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
      <AnimatePresence mode="wait" initial={false}>
        {live ? (
          <motion.span
            key="live"
            className="size-1.5 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        ) : (
          <motion.span
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="size-2.5 text-muted-foreground" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Counts whole seconds while `running`, and freezes when it stops. */
function useElapsedSeconds(running: boolean) {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  return elapsed;
}

/** The current thought's title slides in from below and shimmers. */
function SlidingLabel({ label, shimmer }: { label: string; shimmer: boolean }) {
  return (
    <span className="relative inline-flex h-[1.4em] items-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          className={cn("inline-block whitespace-nowrap", shimmer && "bg-clip-text text-transparent")}
          style={
            shimmer
              ? {
                  backgroundImage:
                    "linear-gradient(90deg, var(--muted-foreground) 30%, var(--foreground) 50%, var(--muted-foreground) 70%)",
                  backgroundSize: "200% 100%",
                }
              : undefined
          }
          initial={{ y: 10, opacity: 0, backgroundPositionX: "150%" }}
          animate={{ y: 0, opacity: 1, backgroundPositionX: "-50%" }}
          exit={{ y: -10, opacity: 0 }}
          transition={{
            y: { duration: 0.15, ease: "easeOut" },
            opacity: { duration: 0.15, ease: "easeOut" },
            backgroundPositionX: { repeat: Infinity, duration: 1.4, ease: "linear", repeatDelay: 0.6 },
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Each digit slides up and out when it changes. */
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
