"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { StreamOfThought, type Thought } from "./component";

const script: Thought[] = [
  {
    title: "Reading the question",
    body: "They want a loading state for a reasoning model that shows what it's actually thinking, not just a spinner. The answer should stay the focus once it arrives.",
  },
  {
    title: "Weighing the options",
    body: "A spinner hides the work, and a raw transcript is too much. Streaming the reasoning as a few named steps keeps it honest and still easy to skim.",
  },
  {
    title: "Keeping it out of the way",
    body: "Show it live in a short, fading window so it reads as background activity, then fold it into a one-line summary when the answer starts.",
  },
  {
    title: "Drafting the answer",
    body: "Lead with the recommendation, then the two rules that matter: collapse on completion, and never hide anything the answer depends on.",
  },
];

const answer =
  "Stream the reasoning inline in a short, fading window while the model thinks, then fold it into a one-line summary the moment the answer starts. Anyone curious can expand it; everyone else just reads the answer.";

const WORDS_PER_TICK = 1;
const TICK_MS = 75;

export default function StreamOfThoughtDemo() {
  const [run, setRun] = React.useState(0);
  const [thoughts, setThoughts] = React.useState<Thought[]>([]);
  const [thinking, setThinking] = React.useState(true);

  function replay() {
    setThoughts([]);
    setThinking(true);
    setRun((r) => r + 1);
  }

  React.useEffect(() => {
    const words = script.map((t) => t.body.split(" "));
    let index = 0;
    let count = 0;

    const id = window.setInterval(() => {
      count += WORDS_PER_TICK;
      if (count >= words[index].length) {
        if (index === script.length - 1) {
          window.clearInterval(id);
          setThoughts(script);
          setThinking(false);
          return;
        }
        index += 1;
        count = 0;
      }
      setThoughts([
        ...script.slice(0, index),
        { title: script[index].title, body: words[index].slice(0, count).join(" ") },
      ]);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [run]);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <StreamOfThought key={run} thoughts={thoughts} thinking={thinking} />
        <AnimatePresence>
          {!thinking && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="text-sm leading-relaxed"
            >
              {answer}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={replay}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
