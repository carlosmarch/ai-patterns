"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightLeft, CircleCheck, LoaderCircle, Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { VoiceWaveform } from "../voice-waveform/component";

/** Who is talking on the call right now. */
export type RelayCallState = "listening" | "speaking" | "muted";

export type RelayItem =
  /** What the person said, as a short transcript line. */
  | { id: string; kind: "you"; text: string }
  /** What the voice agent said back. */
  | { id: string; kind: "voice"; text: string }
  /** The voice agent passed a request to the working agent. */
  | { id: string; kind: "handoff"; text: string }
  /** A short progress note the voice agent read out while the work ran. */
  | { id: string; kind: "update"; text: string }
  /** The spoken summary when the run finished. */
  | { id: string; kind: "summary"; text: string };

export interface RelayRun {
  /** The working agent's task, as the voice agent handed it over. */
  title: string;
  status: "running" | "done";
  /** What it is doing now, in a few words ("Editing pricing.tsx"). */
  step?: string;
}

export interface VoiceAgentRelayProps {
  state: RelayCallState;
  /** The call so far, oldest first. Only the last few lines are shown. */
  items: RelayItem[];
  /** The run the voice agent is relaying, once something has been handed off. */
  run?: RelayRun | null;
  /** Elapsed call time, already formatted ("1:24"). */
  elapsed?: string;
  onToggleMute: () => void;
  onEnd: () => void;
  /** How many recent lines to keep on screen. */
  visibleItems?: number;
  className?: string;
}

const STATE_LABEL: Record<RelayCallState, string> = {
  listening: "Listening",
  speaking: "Speaking",
  muted: "Muted",
};

/**
 * A realtime voice call with a front-line voice agent that relays work to a
 * separate working agent. The call bar shows who is talking; the run strip
 * shows what the working agent is doing; the feed keeps the last few spoken
 * lines, with hand-offs, progress notes and the final summary marked apart
 * from conversation, so a glance tells what was asked and what came back.
 */
export function VoiceAgentRelay({
  state,
  items,
  run,
  elapsed,
  onToggleMute,
  onEnd,
  visibleItems = 4,
  className,
}: VoiceAgentRelayProps) {
  const reduce = useReducedMotion();
  const recent = items.slice(-visibleItems);
  const last = items[items.length - 1];
  const muted = state === "muted";

  return (
    <section
      aria-label="Voice chat with agent"
      className={cn("flex flex-col overflow-hidden rounded-2xl border bg-card", className)}
    >
      {run && <RunStrip run={run} />}

      <ol className="flex min-h-28 flex-col justify-end gap-1.5 px-4 py-3" aria-label="Call transcript">
        <AnimatePresence initial={false}>
          {recent.map((item) => (
            <motion.li
              key={item.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <RelayLine item={item} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {/* Announce only what the voice agent says, not every transcript tick. */}
      <p className="sr-only" aria-live="polite">
        {last && last.kind !== "you" ? last.text : ""}
      </p>

      <div className="flex items-center gap-3 border-t bg-muted/30 px-3 py-2">
        <span className="flex min-w-16 flex-col">
          <span className="text-xs font-medium">{STATE_LABEL[state]}</span>
          {elapsed && <span className="text-[11px] tabular-nums text-muted-foreground">{elapsed}</span>}
        </span>
        <VoiceWaveform
          state={muted ? "idle" : state}
          barCount={21}
          className={cn("h-8 flex-1", state === "speaking" ? "text-foreground" : "text-muted-foreground")}
        />
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border transition-colors hover:bg-accent",
            muted && "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {muted ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          <span className="sr-only">{muted ? "Unmute" : "Mute"}</span>
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="flex h-8 items-center gap-1.5 rounded-full bg-destructive px-3 text-xs font-medium text-white transition-colors hover:bg-destructive/90"
        >
          <PhoneOff className="size-3.5" aria-hidden />
          End
        </button>
      </div>
    </section>
  );
}

function RunStrip({ run }: { run: RelayRun }) {
  const done = run.status === "done";
  return (
    <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2 text-xs">
      {done ? (
        <CircleCheck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <LoaderCircle className="size-3.5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{run.title}</span>
        {run.step && !done && <span className="text-muted-foreground"> · {run.step}</span>}
      </span>
      <span className="shrink-0 text-muted-foreground">{done ? "Done" : "Agent working"}</span>
    </div>
  );
}

function RelayLine({ item }: { item: RelayItem }) {
  switch (item.kind) {
    case "you":
      return (
        <p className="text-sm">
          <span className="sr-only">You: </span>
          {item.text}
        </p>
      );
    case "voice":
      return (
        <p className="text-sm text-muted-foreground">
          <span className="sr-only">Voice agent: </span>
          {item.text}
        </p>
      );
    case "handoff":
      return (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ArrowRightLeft className="size-3 shrink-0" aria-hidden />
          <span>
            Handed to agent: <span className="text-foreground">{item.text}</span>
          </span>
        </p>
      );
    case "update":
      return (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Volume2 className="size-3 shrink-0" aria-hidden />
          <span>
            <span className="sr-only">Progress: </span>
            {item.text}
          </span>
        </p>
      );
    case "summary":
      return (
        <p className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-sm">
          <span className="mb-0.5 block text-[11px] font-medium text-muted-foreground">Summary</span>
          {item.text}
        </p>
      );
  }
}
