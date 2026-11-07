"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Thought {
  /** A short headline for this beat of reasoning, e.g. "Comparing the two options". */
  title?: string;
  /** The reasoning text itself. Pass the partial string while it streams. */
  body: string;
}

export interface StreamOfThoughtProps {
  /** Thoughts streamed so far. The last one may still be growing. */
  thoughts: Thought[];
  /** True while the model is still reasoning. */
  thinking: boolean;
  /** Shown in the header once thinking finishes ("Thought for 12s"). */
  durationSeconds?: number;
  /** Max height of the live window while streaming, in px. */
  liveHeight?: number;
  className?: string;
}

export function StreamOfThought({
  thoughts,
  thinking,
  durationSeconds,
  liveHeight = 132,
  className,
}: StreamOfThoughtProps) {
  const reduceMotion = useReducedMotion();
  const bodyId = React.useId();
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

  const label = thinking
    ? "Thinking"
    : durationSeconds != null
      ? `Thought for ${durationSeconds}s`
      : "Thought";

  return (
    <div className={cn("text-sm", className)}>
      <button
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="group inline-flex items-center gap-1 rounded-md py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span role="status">
          {thinking && !reduceMotion ? <Shimmer>{label}</Shimmer> : label}
        </span>
        <ChevronRight
          aria-hidden
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")}
        />
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
              tabIndex={thinking ? 0 : undefined}
              aria-label="Reasoning"
              className={cn(
                "mt-1 ml-1.5 border-l pl-4 focus-visible:outline-none",
                thinking && "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
              style={
                thinking
                  ? {
                      maxHeight: liveHeight,
                      maskImage: "linear-gradient(to bottom, transparent, black 32px)",
                      WebkitMaskImage: "linear-gradient(to bottom, transparent, black 32px)",
                    }
                  : undefined
              }
            >
              <div className="space-y-3 py-1">
                {thoughts.map((thought, i) => (
                  <motion.div
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {thought.title && (
                      <p className="font-medium text-foreground/90">{thought.title}</p>
                    )}
                    <p className="leading-relaxed text-muted-foreground">{thought.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Shimmer({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 30%, var(--foreground) 50%, var(--muted-foreground) 70%)",
        backgroundSize: "200% 100%",
      }}
      initial={{ backgroundPositionX: "150%" }}
      animate={{ backgroundPositionX: "-50%" }}
      transition={{ repeat: Infinity, duration: 1.4, ease: "linear", repeatDelay: 0.6 }}
    >
      {children}
    </motion.span>
  );
}
