"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Copy, Globe, ThumbsDown, ThumbsUp } from "lucide-react";

export type StreamSegment = { type: "text"; content: string } | { type: "source"; label: string };

export interface StreamingTextProps {
  segments: StreamSegment[];
  /** Milliseconds between each revealed character. */
  speed?: number;
  followUps?: string[];
  className?: string;
}

type Token = { type: "char"; value: string } | { type: "source"; value: string };

function tokenize(segments: StreamSegment[]): Token[] {
  const tokens: Token[] = [];
  for (const segment of segments) {
    if (segment.type === "text") {
      for (const char of segment.content) tokens.push({ type: "char", value: char });
    } else {
      tokens.push({ type: "source", value: segment.label });
    }
  }
  return tokens;
}

export function StreamingText({ segments, speed = 18, followUps, className }: StreamingTextProps) {
  const tokens = React.useMemo(() => tokenize(segments), [segments]);
  const [count, setCount] = React.useState(0);
  const done = count >= tokens.length;

  React.useEffect(() => {
    if (count >= tokens.length) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), speed);
    return () => window.clearTimeout(id);
  }, [count, tokens.length, speed]);

  const nodes: React.ReactNode[] = [];
  let buffer = "";
  let key = 0;
  for (let i = 0; i < count; i++) {
    const token = tokens[i];
    if (token.type === "char") {
      buffer += token.value;
    } else {
      if (buffer) {
        nodes.push(<React.Fragment key={key++}>{buffer}</React.Fragment>);
        buffer = "";
      }
      nodes.push(<SourceChip key={key++} label={token.value} />);
    }
  }
  if (buffer) nodes.push(<React.Fragment key={key++}>{buffer}</React.Fragment>);

  const plainText = segments.map((s) => (s.type === "text" ? s.content : "")).join("");

  return (
    <div className={className}>
      <p className="text-sm leading-relaxed text-foreground/90">
        {nodes}
        {!done && <BlinkingCursor />}
      </p>
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex flex-wrap items-center gap-1.5"
        >
          <ActionButtons text={plainText} />
          {followUps?.length ? (
            <>
              <span className="mx-1 h-4 w-px bg-border" />
              {followUps.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {label}
                </button>
              ))}
            </>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-foreground"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
    />
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <span className="mx-1 inline-flex -translate-y-px items-center gap-1 rounded-full border bg-muted px-2 py-0.5 align-middle text-xs">
      <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Globe className="size-2.5" />
      </span>
      <span className="font-mono text-muted-foreground">{label}</span>
    </span>
  );
}

function ActionButtons({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-0.5 text-muted-foreground">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy"
        className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      <button
        type="button"
        aria-label="Good response"
        className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
      >
        <ThumbsUp className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="Bad response"
        className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
      >
        <ThumbsDown className="size-3.5" />
      </button>
    </div>
  );
}
