"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

export interface ContextSegment {
  /** Stable id, also used as the React key. */
  id: string;
  label: string;
  tokens: number;
  /** Tailwind background class for the segment and its legend dot. */
  color: string;
}

export interface ContextUsageProps {
  /** What fills the context window, in the order it's drawn. */
  segments: ContextSegment[];
  /** Size of the context window, in tokens. */
  limit: number;
  /** Share of the window (0–1) at which the meter warns that it's nearly full. */
  warnAt?: number;
  title?: string;
  compactLabel?: string;
  /** Summarise older content to free space. Return a promise to show a pending state. */
  onCompact?: () => void | Promise<void>;
  className?: string;
}

export function formatTokens(n: number) {
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

function trim(v: number) {
  return v.toFixed(1).replace(/\.0$/, "");
}

const spring = { type: "spring", stiffness: 200, damping: 28 } as const;

export function ContextUsage({
  segments,
  limit,
  warnAt = 0.9,
  title = "Context",
  compactLabel = "Compact",
  onCompact,
  className,
}: ContextUsageProps) {
  const reduceMotion = !!useReducedMotion();
  const id = React.useId();
  const [active, setActive] = React.useState<string | null>(null);
  const [compacting, setCompacting] = React.useState(false);

  const used = segments.reduce((sum, s) => sum + s.tokens, 0);
  const share = Math.min(1, used / Math.max(limit, 1));
  const free = Math.max(0, limit - used);
  const warn = share >= warnAt;
  const focused = segments.find((s) => s.id === active);
  const transition = reduceMotion ? { duration: 0 } : spring;

  async function compact() {
    if (!onCompact || compacting) return;
    setCompacting(true);
    try {
      await onCompact();
    } finally {
      setCompacting(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-4 rounded-3xl border bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-medium">{title}</h3>
        {onCompact && (
          <button
            type="button"
            onClick={compact}
            disabled={compacting}
            aria-describedby={`${id}-status`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-progress disabled:opacity-60",
              warn ? "bg-foreground text-background hover:opacity-90" : "bg-muted hover:bg-muted-foreground/15"
            )}
          >
            {compacting ? "Compacting…" : compactLabel}
          </button>
        )}
      </div>

      <div id={`${id}-status`} aria-live="polite" className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-4xl font-medium tracking-tight tabular-nums">
            <AnimatedTokens value={focused ? focused.tokens : used} instant={reduceMotion} />
          </span>
          <span className="text-sm text-muted-foreground">
            {focused ? `${focused.label.toLowerCase()} · ${Math.round((focused.tokens / limit) * 100)}%` : `of ${formatTokens(limit)}`}
          </span>
        </p>
        {warn && !focused && (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {formatTokens(free)} left — compact to keep earlier details from being dropped.
          </p>
        )}
      </div>

      <div
        role="meter"
        aria-label={`${title} window used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={`${formatTokens(used)} of ${formatTokens(limit)} tokens used`}
        className="flex h-11 w-full gap-1"
        onMouseLeave={() => setActive(null)}
      >
        {segments.map((s) => (
          <motion.div
            key={s.id}
            title={`${s.label}: ${formatTokens(s.tokens)}`}
            onMouseEnter={() => setActive(s.id)}
            className={cn("h-full min-w-0 rounded-md transition-opacity", s.color, active && active !== s.id && "opacity-30")}
            initial={false}
            animate={{ flexGrow: s.tokens, flexBasis: 0 }}
            style={{ flexShrink: 1, minWidth: s.tokens > 0 ? 4 : 0 }}
            transition={transition}
          />
        ))}
        <motion.div
          aria-hidden
          className="h-full rounded-md bg-muted"
          initial={false}
          animate={{ flexGrow: free, flexBasis: 0 }}
          transition={transition}
        />
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="What's in context">
        {segments.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={active === s.id}
              onMouseEnter={() => setActive(s.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive((a) => (a === s.id ? null : s.id))}
              className={cn(
                "flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm transition-colors outline-none",
                "hover:bg-muted-foreground/15 focus-visible:ring-2 focus-visible:ring-ring",
                active === s.id && "bg-muted-foreground/15"
              )}
            >
              <span className={cn("size-2.5 rounded-[3px]", s.color)} aria-hidden />
              {s.label}
              <span className="sr-only">: {formatTokens(s.tokens)} tokens</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnimatedTokens({ value, instant }: { value: number; instant: boolean }) {
  const motionValue = useSpring(value, { stiffness: 220, damping: 30 });
  const text = useTransform(motionValue, (v) => formatTokens(v));

  React.useEffect(() => {
    if (instant) motionValue.jump(value);
    else motionValue.set(value);
  }, [motionValue, value, instant]);

  return <motion.span>{text}</motion.span>;
}
