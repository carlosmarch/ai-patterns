"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowDown, Mic } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TranscriptSegment {
  id: string;
  speaker: "user" | "assistant";
  text: string;
  /** Interim speech-recognition results render lighter and can still be replaced; omit or set true once the segment is committed. */
  final?: boolean;
}

export interface LiveTranscriptProps {
  segments: TranscriptSegment[];
  /** Whether the mic is actively capturing right now — drives the live cursor and the region's aria-live behavior. */
  active?: boolean;
  className?: string;
}

const SPEAKER_LABEL: Record<TranscriptSegment["speaker"], string> = {
  user: "You",
  assistant: "Assistant",
};

export function LiveTranscript({ segments, active = true, className }: LiveTranscriptProps) {
  const [pinnedToBottom, setPinnedToBottom] = React.useState(true);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!pinnedToBottom) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segments, pinnedToBottom]);

  function handleScroll() {
    const el = bodyRef.current;
    if (!el) return;
    setPinnedToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
  }

  function jumpToLatest() {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setPinnedToBottom(true);
  }

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl border bg-card", className)}>
      <div
        ref={bodyRef}
        onScroll={handleScroll}
        role="log"
        aria-live={active ? "polite" : "off"}
        className="max-h-72 space-y-3 overflow-y-auto px-4 py-3.5"
      >
        {segments.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="size-3.5" aria-hidden />
            Waiting for speech…
          </p>
        ) : (
          segments.map((segment) => (
            <p key={segment.id} className="text-sm leading-relaxed">
              <span className="mr-1.5 text-xs font-medium text-muted-foreground">
                {SPEAKER_LABEL[segment.speaker]}
              </span>
              <span className={cn(segment.final === false && "text-muted-foreground italic")}>
                {segment.text}
                {segment.final === false && active && <BlinkingCursor />}
              </span>
            </p>
          ))
        )}
      </div>

      {!pinnedToBottom && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs text-background shadow-sm"
        >
          <ArrowDown className="size-3" aria-hidden />
          Jump to latest
        </button>
      )}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      aria-hidden
      className="ml-0.5 inline-block h-3 w-[2px] translate-y-px bg-muted-foreground"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
    />
  );
}
