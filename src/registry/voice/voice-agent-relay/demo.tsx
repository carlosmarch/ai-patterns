"use client";

import * as React from "react";
import { AudioLines } from "lucide-react";

import { VoiceAgentRelay, type RelayCallState, type RelayItem, type RelayRun } from "./component";

type Step = { at: number; state?: RelayCallState; item?: Omit<RelayItem, "id">; run?: RelayRun };

// A scripted call: the person asks for a change, the voice agent hands it
// off, reads out progress while the working agent runs, answers a question
// mid-run, and closes with a short spoken summary.
const SCRIPT: Step[] = [
  { at: 600, state: "listening", item: { kind: "you", text: "Add an annual plan to the pricing page, twenty percent off." } },
  { at: 2600, state: "speaking", item: { kind: "voice", text: "Got it — I'll ask the agent to add an annual toggle with a 20% discount." } },
  {
    at: 4200,
    item: { kind: "handoff", text: "Add a Monthly / Annual toggle to pricing, annual at 20% off" },
    run: { title: "Annual pricing toggle", status: "running", step: "Reading pricing.tsx" },
  },
  { at: 5400, state: "listening" },
  { at: 6800, item: { kind: "update", text: "It's editing pricing.tsx and plans.ts." }, run: { title: "Annual pricing toggle", status: "running", step: "Editing plans.ts" } },
  { at: 8600, item: { kind: "you", text: "Will the badge say how much I save?" } },
  { at: 10200, state: "speaking", item: { kind: "voice", text: "Not yet — I'll add a “Save 20%” badge to the request." } },
  { at: 11800, item: { kind: "handoff", text: "Show a “Save 20%” badge beside the annual price" }, run: { title: "Annual pricing toggle", status: "running", step: "Adding saving-badge.tsx" } },
  { at: 12600, state: "listening" },
  {
    at: 15200,
    state: "speaking",
    item: { kind: "summary", text: "Done. Three files changed: a Monthly / Annual toggle, annual prices at 20% off, and a Save 20% badge. The full diff is in the chat." },
    run: { title: "Annual pricing toggle", status: "done" },
  },
  { at: 18000, state: "listening" },
];

export default function VoiceAgentRelayDemo() {
  const [onCall, setOnCall] = React.useState(false);
  const [state, setState] = React.useState<RelayCallState>("listening");
  const [items, setItems] = React.useState<RelayItem[]>([]);
  const [run, setRun] = React.useState<RelayRun | null>(null);
  const [seconds, setSeconds] = React.useState(0);
  const mutedRef = React.useRef(false);

  React.useEffect(() => {
    if (!onCall) return;
    const timers = SCRIPT.map((step, i) =>
      window.setTimeout(() => {
        if (step.state) setState(mutedRef.current ? "muted" : step.state);
        if (step.item) setItems((prev) => [...prev, { ...step.item!, id: String(i) } as RelayItem]);
        if (step.run) setRun(step.run);
      }, step.at)
    );
    const clock = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(clock);
    };
  }, [onCall]);

  function start() {
    setItems([]);
    setRun(null);
    setSeconds(0);
    setState("listening");
    mutedRef.current = false;
    setOnCall(true);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {onCall ? (
        <VoiceAgentRelay
          state={state}
          items={items}
          run={run}
          elapsed={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}
          onToggleMute={() => {
            mutedRef.current = !mutedRef.current;
            setState(mutedRef.current ? "muted" : "listening");
          }}
          onEnd={() => setOnCall(false)}
        />
      ) : (
        <>
          {run?.status === "done" && (
            <p className="rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
              Call ended · the agent&apos;s full reply and diff are in the chat.
            </p>
          )}
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2">
            <input
              disabled
              placeholder="Ask for a change…"
              aria-label="Message"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {/* The agent is idle and the input is empty, so Send becomes Start voice chat. */}
            <button
              type="button"
              onClick={start}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95"
            >
              <AudioLines className="size-4" aria-hidden />
              <span className="sr-only">Start voice chat</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Press the waveform button to start a scripted call.</p>
        </>
      )}
    </div>
  );
}
