"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { ResponseActions, type RegenerateOption, type ResponseRating } from "./component";

const ANSWERS: Record<string, string> = {
  default:
    "A mutex is a lock with an owner: one thread takes it, does its work and releases it. A semaphore is a counter — it lets up to N threads in at once, and any thread can signal it. Use a mutex to protect shared data, and a semaphore to limit access to a pool, like five database connections.",
  again:
    "Think of a mutex as the single key to a room: whoever holds it is the only one inside, and only they can hand it back. A semaphore is a bouncer with a headcount — N people may enter, and anyone leaving frees a spot. Mutexes guard data; semaphores ration resources.",
  concise: "Mutex: one owner at a time, released by that owner. Semaphore: a counter allowing N at once, signalled by anyone.",
  fast: "A mutex lets one thread in at a time; a semaphore lets in up to N. Mutex for shared data, semaphore for limited pools.",
};

const OPTIONS: RegenerateOption[] = [
  { id: "concise", label: "More concise", hint: "Same answer, fewer words" },
  { id: "fast", label: "Try with Fast model", hint: "Quicker, less detail" },
];

export default function ResponseActionsDemo() {
  const [answer, setAnswer] = React.useState("default");
  const [rating, setRating] = React.useState<ResponseRating>(null);
  const [regenerating, setRegenerating] = React.useState(false);
  const [log, setLog] = React.useState<string | null>(null);

  function regenerate(option?: RegenerateOption) {
    setRegenerating(true);
    setRating(null);
    setTimeout(() => {
      setAnswer(option?.id ?? (answer === "again" ? "default" : "again"));
      setRegenerating(false);
    }, 1100);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="ml-auto max-w-[80%] rounded-2xl bg-muted px-3.5 py-2 text-sm">
        What&apos;s the difference between a mutex and a semaphore?
      </div>

      <div className="flex flex-col gap-1">
        <AnimatePresence mode="wait">
          <motion.p
            key={answer}
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: regenerating ? 0.4 : 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-busy={regenerating}
            className="text-sm leading-relaxed"
          >
            {ANSWERS[answer]}
          </motion.p>
        </AnimatePresence>

        <ResponseActions
          className="-ml-2"
          text={ANSWERS[answer]}
          rating={rating}
          onRate={setRating}
          onFeedback={(f) => setLog(f.reasons.length || f.note ? `Feedback: ${[...f.reasons, f.note].filter(Boolean).join(", ")}` : "Feedback: thumbs down, no reason")}
          onRegenerate={regenerate}
          regenerateOptions={OPTIONS}
          regenerating={regenerating}
          onShare={() => "https://example.com/share/c/8f2a"}
        />
      </div>

      {log && <p className="px-1 text-xs text-muted-foreground">{log}</p>}
    </div>
  );
}
