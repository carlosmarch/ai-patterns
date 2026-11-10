"use client";

import * as React from "react";

import { VoiceOrbCall, type VoiceOrbState, type VoiceOrbTranscript } from "./component";

const SCRIPT: VoiceOrbTranscript[] = [
  { speaker: "user", text: "Which pattern shows that my agent is still working on an answer?" },
  { speaker: "assistant", text: "A Thinking Loader for a short wait, or Stream of Thought if people should see the reasoning." },
  { speaker: "user", text: "And how do I show what a long task will cost?" },
  { speaker: "assistant", text: "Show a Cost Estimate before it runs, then a Context Usage meter while it works." },
];

/** A scripted call that walks the orb through Ready → Listening → Thinking → Speaking, turn after turn. */
export default function VoiceOrbDemo() {
  const [connected, setConnected] = React.useState(true);
  const [state, setState] = React.useState<VoiceOrbState>("ready");
  const [transcript, setTranscript] = React.useState<VoiceOrbTranscript | null>(null);
  const [muted, setMuted] = React.useState(false);
  const mutedRef = React.useRef(false);

  React.useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    // Waits `ms` of unmuted time: muting freezes the script where it is.
    const wait = async (ms: number) => {
      let left = ms;
      while (left > 0) {
        if (cancelled) throw new Error("cancelled");
        await new Promise((r) => setTimeout(r, 50));
        if (!mutedRef.current) left -= 50;
      }
    };

    async function run() {
      for (;;) {
        setState("ready");
        setTranscript(null);
        await wait(1400);
        for (const turn of SCRIPT) {
          setState(turn.speaker === "user" ? "listening" : "speaking");
          const words = turn.text.split(" ");
          for (let i = 1; i <= words.length; i++) {
            setTranscript({ ...turn, text: words.slice(0, i).join(" "), final: false });
            await wait(turn.speaker === "user" ? 230 : 190);
          }
          setTranscript({ ...turn, final: true });
          if (turn.speaker === "user") {
            await wait(500);
            setState("thinking");
            await wait(2200);
          } else {
            setState("ready");
            await wait(1600);
          }
        }
        await wait(1200);
      }
    }

    run().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [connected]);

  return (
    <div className="w-full max-w-sm">
      <VoiceOrbCall
        state={state}
        connected={connected}
        transcript={transcript}
        muted={muted}
        onMutedChange={(next) => {
          mutedRef.current = next;
          setMuted(next);
        }}
        onEnd={() => setConnected(false)}
        onStart={() => {
          mutedRef.current = false;
          setMuted(false);
          setConnected(true);
        }}
        orbClassName="text-foreground dark:text-orange-50"
      />
    </div>
  );
}
