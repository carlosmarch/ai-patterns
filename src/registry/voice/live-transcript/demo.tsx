"use client";

import * as React from "react";

import { ChatBubble } from "../../messages/chat-bubble/component";
import { LiveTranscript, type TranscriptSegment } from "./component";

const SCRIPT: { speaker: TranscriptSegment["speaker"]; text: string }[] = [
  { speaker: "user", text: "What's on my calendar tomorrow afternoon?" },
  { speaker: "assistant", text: "You have a design review at 2 and a dentist appointment at 4:30." },
  { speaker: "user", text: "Can you move the design review to the morning?" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LiveTranscriptDemo() {
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);
  const [settled, setSettled] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        setSettled(false);
        setSegments([]);
        await sleep(400);

        for (let turn = 0; turn < SCRIPT.length; turn++) {
          if (cancelled) return;
          const { speaker, text } = SCRIPT[turn];
          const id = `seg-${turn}`;
          const words = text.split(" ");

          for (let i = 1; i <= words.length; i++) {
            if (cancelled) return;
            const partial = words.slice(0, i).join(" ");
            setSegments((prev) => [...prev.filter((s) => s.id !== id), { id, speaker, text: partial, final: false }]);
            await sleep(90);
          }

          setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, final: true } : s)));
          await sleep(600);
        }

        await sleep(1000);
        if (cancelled) return;
        setSettled(true);
        await sleep(3000);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full max-w-md">
      {settled ? (
        <div className="space-y-4">
          {SCRIPT.map((turn, i) => (
            <ChatBubble key={i} role={turn.speaker} content={turn.text} />
          ))}
        </div>
      ) : (
        <LiveTranscript segments={segments} />
      )}
    </div>
  );
}
