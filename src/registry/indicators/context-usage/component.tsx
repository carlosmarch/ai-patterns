"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

export interface ContextSegment {
  /** Stable id, also used as the React key. */
  id: string;
  label: string;
  tokens: number;
  /** Tailwind background class for the segment and its row swatch. */
  color: string;
}

export interface ContextUsageProps {
  /** What fills the context window, in the order it's drawn. */
  segments: ContextSegment[];
  /** Size of the context window, in tokens. */
  limit: number;
  /** Tokens held back so the product can auto-compact before the window overflows. */
  reserved?: number;
  /** Share of the usable window (limit − reserved, 0–1) at which the meter warns. */
  warnAt?: number;
  title?: string;
  compactLabel?: string;
  reservedLabel?: string;
  freeLabel?: string;
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

function formatShare(tokens: number, limit: number) {
  return `${((tokens / Math.max(limit, 1)) * 100).toFixed(1)}%`;
}

const spring = { type: "spring", stiffness: 200, damping: 28 } as const;

export function ContextUsage({
  segments,
  limit,
  reserved = 0,
  warnAt = 0.9,
  title = "Context",
  compactLabel = "Compact",
  reservedLabel = "Autocompact buffer",
  freeLabel = "Free space",
  onCompact,
  className,
}: ContextUsageProps) {
  const reduceMotion = !!useReducedMotion();
  const id = React.useId();
  const [active, setActive] = React.useState<string | null>(null);
  const [compacting, setCompacting] = React.useState(false);

  const used = segments.reduce((sum, s) => sum + s.tokens, 0);
  const usable = Math.max(1, limit - reserved);
  const free = Math.max(0, usable - used);
  const warn = used / usable >= warnAt;
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
    <div className={cn("flex w-full flex-col gap-4 rounded-3xl bg-card p-5 border", className)}>
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
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="flex items-baseline gap-2">
            <span className="text-4xl font-medium tracking-tight tabular-nums">
              <AnimatedTokens value={focused ? focused.tokens : used} instant={reduceMotion} />
            </span>
            <span className="text-sm text-muted-foreground">
              {focused ? focused.label.toLowerCase() : `of ${formatTokens(limit)}`}
            </span>
          </span>
          <span className="text-sm text-muted-foreground tabular-nums">
            {Math.round(((focused ? focused.tokens : used) / Math.max(limit, 1)) * 100)}% used
          </span>
        </p>
        {warn && !focused && (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {free > 0
              ? `${formatTokens(free)} left before auto-compact — compact now to choose what's kept.`
              : "Auto-compacting on the next message."}
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
        className="flex h-2.5 w-full gap-0.5"
        onMouseLeave={() => setActive(null)}
      >
        {segments.map((s) => (
          <motion.div
            key={s.id}
            title={`${s.label}: ${formatTokens(s.tokens)}`}
            onMouseEnter={() => setActive(s.id)}
            className={cn("h-full min-w-0 rounded-full transition-opacity", s.color, active && active !== s.id && "opacity-25")}
            initial={false}
            animate={{ flexGrow: s.tokens, flexBasis: 0 }}
            style={{ flexShrink: 1, minWidth: s.tokens > 0 ? 3 : 0 }}
            transition={transition}
          />
        ))}
        <motion.div
          aria-hidden
          className="h-full rounded-full bg-muted"
          initial={false}
          animate={{ flexGrow: free, flexBasis: 0 }}
          transition={transition}
        />
        {reserved > 0 && (
          <motion.div
            aria-hidden
            title={`${reservedLabel}: ${formatTokens(reserved)}`}
            className={cn("h-full rounded-full bg-muted-foreground/35 transition-opacity", active && "opacity-25")}
            initial={false}
            animate={{ flexGrow: reserved, flexBasis: 0 }}
            transition={transition}
          />
        )}
      </div>

      <ul className="-mx-2 flex flex-col text-sm" aria-label="What's in context">
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
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors outline-none",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                active === s.id && "bg-muted"
              )}
            >
              <Row swatch={s.color} label={s.label} tokens={s.tokens} limit={limit} />
            </button>
          </li>
        ))}
        {reserved > 0 && (
          <li className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground">
            <Row swatch="bg-muted-foreground/35" label={reservedLabel} tokens={reserved} limit={limit} />
          </li>
        )}
        <li className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground">
          <Row swatch="bg-muted ring-1 ring-inset ring-border" label={freeLabel} tokens={free} limit={limit} />
        </li>
      </ul>
    </div>
  );
}

function Row({ swatch, label, tokens, limit }: { swatch: string; label: string; tokens: number; limit: number }) {
  return (
    <>
      <span className={cn("size-2.5 shrink-0 rounded-[3px]", swatch)} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="tabular-nums">
        {formatTokens(tokens)}
        <span className="sr-only"> tokens,</span>
      </span>
      <span className="w-14 text-right text-muted-foreground tabular-nums">{formatShare(tokens, limit)}</span>
    </>
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
