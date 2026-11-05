"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hourglass } from "lucide-react";

import { cn } from "@/lib/utils";

export type TraceSpanKind = "tool" | "model" | "wait";

export interface TraceSpan {
  id: string;
  kind: TraceSpanKind;
  /** Tool or step name, e.g. "read_file", "claude", "Awaiting approval". */
  name: string;
  /** Short argument or target, e.g. "src/cart.ts". */
  detail?: string;
  /** Milliseconds from the start of the run. */
  start: number;
  /** Milliseconds. */
  duration: number;
  status?: "ok" | "error";
}

export interface TraceWaterfallProps {
  spans: TraceSpan[];
  title?: string;
  /** Draw waiting spans at their real length from the start. Defaults to compressed. */
  defaultWaitingToScale?: boolean;
  /** Share of active (non-waiting) time each compressed wait is drawn at. */
  compressedWaitShare?: number;
  className?: string;
}

// Below a ~28rem card, rows stack (name + duration, then a full-width bar);
// the axis and gridlines collapse their side columns to match.
const COLS = "grid-cols-[0px_minmax(0,1fr)_0px] @md:grid-cols-[10rem_minmax(0,1fr)_3.5rem]";
const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_auto] gap-y-1 @md:grid-cols-[10rem_minmax(0,1fr)_3.5rem] @md:gap-y-0";

const KIND_LABEL: Record<TraceSpanKind, string> = {
  tool: "Tools",
  model: "Model",
  wait: "Waiting",
};

export function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatTick(ms: number) {
  if (ms === 0) return "0";
  if (ms < 60_000) return `${+(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return s ? `${m}m${s}s` : `${m}m`;
}

interface Segment {
  start: number;
  end: number;
  /** Display position and length, in the same unit as time. */
  at: number;
  len: number;
  wait: boolean;
}

/** A piecewise-linear time → percent scale that can shrink waiting intervals. */
function buildScale(spans: TraceSpan[], compress: boolean, share: number) {
  const total = Math.max(1, ...spans.map((s) => s.start + s.duration));

  // Merge overlapping wait spans into intervals.
  const waits: { start: number; end: number }[] = [];
  for (const s of [...spans].filter((s) => s.kind === "wait").sort((a, b) => a.start - b.start)) {
    const last = waits[waits.length - 1];
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.start + s.duration);
    else waits.push({ start: s.start, end: s.start + s.duration });
  }
  const waiting = waits.reduce((sum, w) => sum + (w.end - w.start), 0);
  const cap = Math.max(1, (total - waiting) * share);

  const segments: Segment[] = [];
  let t = 0;
  let at = 0;
  for (const w of waits) {
    if (w.start > t) {
      segments.push({ start: t, end: w.start, at, len: w.start - t, wait: false });
      at += w.start - t;
    }
    const real = w.end - w.start;
    const len = compress ? Math.min(real, cap) : real;
    segments.push({ start: w.start, end: w.end, at, len, wait: true });
    at += len;
    t = w.end;
  }
  if (t < total) {
    segments.push({ start: t, end: total, at, len: total - t, wait: false });
    at += total - t;
  }
  const displayTotal = at;

  function x(time: number) {
    const seg = segments.find((s) => time <= s.end) ?? segments[segments.length - 1];
    const span = seg.end - seg.start || 1;
    const pos = seg.at + ((Math.min(Math.max(time, seg.start), seg.end) - seg.start) / span) * seg.len;
    return (pos / displayTotal) * 100;
  }

  return { x, total, waiting, segments };
}

const NICE_STEPS = [100, 200, 500, 1000, 2000, 5000, 10_000, 15_000, 20_000, 30_000, 60_000, 120_000, 300_000];

function buildTicks(scale: ReturnType<typeof buildScale>, compress: boolean) {
  const visibleSpan = compress
    ? scale.segments.reduce((sum, s) => sum + (s.wait ? 0 : s.len), 0) || scale.total
    : scale.total;
  const step = NICE_STEPS.find((n) => visibleSpan / n <= 6) ?? NICE_STEPS[NICE_STEPS.length - 1];

  const ticks: { ms: number; x: number }[] = [];
  let lastX = -Infinity;
  for (let ms = 0; ms <= scale.total; ms += step) {
    // In compressed mode, time inside a shrunk wait has no meaningful position.
    const hidden = scale.segments.some((s) => s.wait && s.len < s.end - s.start && ms > s.start && ms < s.end);
    const x = scale.x(ms);
    if (hidden || x - lastX < 7 || x > 96) continue;
    ticks.push({ ms, x });
    lastX = x;
  }
  return ticks;
}

export function TraceWaterfall({
  spans,
  title = "Run trace",
  defaultWaitingToScale = false,
  compressedWaitShare = 0.08,
  className,
}: TraceWaterfallProps) {
  const reduceMotion = useReducedMotion();
  const [toScale, setToScale] = React.useState(defaultWaitingToScale);
  const scale = React.useMemo(
    () => buildScale(spans, !toScale, compressedWaitShare),
    [spans, toScale, compressedWaitShare]
  );
  const ticks = React.useMemo(() => buildTicks(scale, !toScale), [scale, toScale]);
  const hasWaits = spans.some((s) => s.kind === "wait");

  const byKind = (["tool", "model", "wait"] as const).map((kind) => ({
    kind,
    ms: spans.filter((s) => s.kind === kind).reduce((sum, s) => sum + s.duration, 0),
    count: spans.filter((s) => s.kind === kind).length,
  }));

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 220, damping: 30 };

  return (
    <section
      aria-label={title}
      className={cn("@container w-full overflow-hidden rounded-2xl border bg-card text-card-foreground", className)}
    >
      {/* Summary */}
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="text-xs text-muted-foreground">{title}</h3>
          <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">
            {formatDuration(scale.total)}
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {byKind
            .filter((k) => k.count > 0)
            .map((k) => (
              <div key={k.kind} className="flex items-center gap-1.5">
                <KindSwatch kind={k.kind} />
                <dt className="text-muted-foreground">{KIND_LABEL[k.kind]}</dt>
                <dd className="font-mono tabular-nums">{formatDuration(k.ms)}</dd>
              </div>
            ))}
        </dl>
        {hasWaits && (
          <button
            type="button"
            aria-pressed={toScale}
            onClick={() => setToScale((v) => !v)}
            className={cn(
              "ml-auto inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              toScale
                ? "border-foreground/20 bg-foreground text-background hover:bg-foreground/90"
                : "bg-background text-foreground hover:bg-muted"
            )}
          >
            <Hourglass className="size-3.5" aria-hidden />
            Waiting to scale
          </button>
        )}
      </header>

      <div className="px-2 pb-2 pt-1">
        {/* Axis */}
        <div className={cn("grid items-end px-2", COLS)} aria-hidden>
          <span />
          <div className="relative h-6">
            <AnimatePresence initial={false}>
              {ticks.map((tick) => (
                <motion.span
                  key={tick.ms}
                  initial={{ opacity: 0, left: `${tick.x}%` }}
                  animate={{ opacity: 1, left: `${tick.x}%` }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="absolute bottom-1 -translate-x-1/2 font-mono text-[10px] tabular-nums text-muted-foreground first:translate-x-0"
                >
                  {formatTick(tick.ms)}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <span />
        </div>

        <div className="relative">
          {/* Gridlines + compressed-wait breaks, behind the rows */}
          <div className={cn("pointer-events-none absolute inset-0 grid px-2", COLS)} aria-hidden>
            <span />
            <div className="relative">
              {ticks.map((tick) => (
                <motion.span
                  key={tick.ms}
                  initial={false}
                  animate={{ left: `${tick.x}%` }}
                  transition={spring}
                  className="absolute inset-y-0 w-px bg-border/70"
                />
              ))}
              {!toScale &&
                scale.segments
                  .filter((s) => s.wait && s.len < s.end - s.start)
                  .map((s) => (
                    <span
                      key={s.start}
                      className="absolute inset-y-0 w-px border-l border-dashed border-muted-foreground/40"
                      style={{ left: `${scale.x((s.start + s.end) / 2)}%` }}
                    />
                  ))}
            </div>
            <span />
          </div>

          <ol aria-label={`${spans.length} spans`} className="relative flex flex-col">
            {spans.map((span, i) => (
              <SpanRow
                key={span.id}
                span={span}
                index={i}
                left={scale.x(span.start)}
                right={scale.x(span.start + span.duration)}
                compressed={
                  !toScale &&
                  span.kind === "wait" &&
                  scale.segments.some(
                    (s) => s.wait && s.len < s.end - s.start && span.start >= s.start && span.start < s.end
                  )
                }
                spring={spring}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </ol>
        </div>

        {hasWaits && (
          <p className="px-2 pt-2 text-[11px] text-muted-foreground" aria-live="polite">
            {toScale
              ? "Waiting drawn to scale."
              : "Waiting compressed — dashed lines mark shortened time."}
          </p>
        )}
      </div>
    </section>
  );
}

function SpanRow({
  span,
  index,
  left,
  right,
  compressed,
  spring,
  reduceMotion,
}: {
  span: TraceSpan;
  index: number;
  left: number;
  right: number;
  compressed: boolean;
  spring: object;
  reduceMotion: boolean;
}) {
  const wait = span.kind === "wait";
  const error = span.status === "error";
  const width = Math.max(right - left, 0.4);

  return (
    <li className={cn("group grid items-center rounded-md px-2 py-1 transition-colors hover:bg-muted/60", ROW_COLS)}>
      <span className="sr-only">
        {`${span.name}${span.detail ? ` ${span.detail}` : ""}, started at ${formatDuration(span.start)}, took ${formatDuration(span.duration)}${error ? ", failed" : ""}`}
      </span>

      <span className="flex min-w-0 items-baseline gap-1.5 pr-3 text-xs" aria-hidden>
        <span className={cn("shrink-0", wait ? "italic text-muted-foreground" : "font-mono", error && "text-destructive")}>
          {span.name}
        </span>
        {span.detail && <span className="truncate text-muted-foreground/80">{span.detail}</span>}
      </span>

      <div className="relative col-span-2 row-start-2 h-4 @md:col-span-1 @md:col-start-2 @md:row-start-1" aria-hidden>
        <motion.div
          initial={reduceMotion ? false : { left: `${left}%`, width: 0, opacity: 0 }}
          animate={{ left: `${left}%`, width: `${width}%`, opacity: 1 }}
          transition={{ ...spring, delay: reduceMotion ? 0 : index * 0.02 }}
          style={{ minWidth: 3 }}
          className={cn(
            "absolute inset-y-0.5 overflow-hidden rounded-[3px]",
            span.kind === "tool" && (error ? "bg-destructive/80" : "bg-foreground/80"),
            span.kind === "model" && "bg-muted-foreground/45",
            wait && "border border-dashed border-muted-foreground/45 bg-muted",
            "transition-[filter] group-hover:brightness-110"
          )}
        >
          {wait && (
            <span
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--color-muted-foreground) 0 1px, transparent 1px 5px)",
                opacity: 0.25,
              }}
            />
          )}
          {compressed && (
            <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 -skew-x-[20deg] border-x border-muted-foreground/60 bg-card" />
          )}
        </motion.div>
      </div>

      <span
        className={cn(
          "text-right font-mono text-[11px] tabular-nums @md:col-start-3 @md:row-start-1",
          error ? "text-destructive" : wait ? "text-muted-foreground" : "text-foreground/80"
        )}
        aria-hidden
      >
        {formatDuration(span.duration)}
      </span>
    </li>
  );
}

function KindSwatch({ kind }: { kind: TraceSpanKind }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2.5 rounded-[2px]",
        kind === "tool" && "bg-foreground/80",
        kind === "model" && "bg-muted-foreground/45",
        kind === "wait" && "border border-dashed border-muted-foreground/60 bg-muted"
      )}
    />
  );
}
