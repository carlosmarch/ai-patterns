"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { ComposerQuestion, type ComposerQuestionAnswer } from "./component";

const QUESTION = "Which loader should the empty chat state use while the first reply streams?";
const OPTIONS = [
  { id: "thinking", label: "Thinking Loader — shimmer label, no icon" },
  { id: "drawing", label: "Drawing Icon with a short status line" },
  { id: "both", label: "Thinking Loader first, Drawing Icon after 3 s" },
];

interface Turn {
  id: number;
  from: "agent" | "you";
  text: string;
}

const START: Turn[] = [
  {
    id: 0,
    from: "agent",
    text: "The empty state is wired up. One call before I style the loading moment:",
  },
];

function describe(a: ComposerQuestionAnswer) {
  if (a.kind === "option") return a.label;
  if (a.kind === "text") return a.text;
  return "Skipped — use your best guess.";
}

export default function ComposerQuestionDemo() {
  const [turns, setTurns] = React.useState<Turn[]>(START);
  const [open, setOpen] = React.useState(true);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const reset = () => {
    setTurns(START);
    setOpen(true);
  };

  const reply = (you: string, agent: string) => {
    setOpen(false);
    setTurns((t) => [...t, { id: Date.now(), from: "you", text: you }]);
    later(() => setTurns((t) => [...t, { id: Date.now() + 1, from: "agent", text: agent }]), 700);
    later(reset, 4200);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex min-h-32 flex-col justify-end gap-2">
        <AnimatePresence initial={false}>
          {turns.map((t) => (
            <motion.p
              key={t.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                t.from === "you"
                  ? "max-w-[85%] self-end rounded-2xl border bg-muted px-3 py-1.5 text-sm"
                  : "max-w-[90%] text-sm text-muted-foreground"
              }
            >
              {t.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      <ComposerQuestion
        question={open ? QUESTION : null}
        options={OPTIONS}
        onAnswer={(a) =>
          reply(
            describe(a),
            a.kind === "skip"
              ? "Going with the Thinking Loader — easy to swap later."
              : "Got it. Styling the empty state now…"
          )
        }
        onDismiss={() => reply("(Dismissed)", "No problem — I'll leave the loader as it is.")}
        onSend={(text) => {
          setTurns((t) => [...t, { id: Date.now(), from: "you", text }]);
          later(reset, 2500);
        }}
      />
    </div>
  );
}
