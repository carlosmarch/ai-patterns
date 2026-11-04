"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

import { MessageQueueComposer, type SendMode } from "./component";

interface Turn {
  id: number;
  text: string;
  mode: SendMode;
  done: boolean;
}

const TURN_MS = 4000;

export default function MessageQueueDemo() {
  const [turns, setTurns] = React.useState<Turn[]>([
    { id: 0, text: "Fix the failing auth tests", mode: "now", done: false },
  ]);
  const timer = React.useRef<number | undefined>(undefined);
  const busy = turns.some((t) => !t.done);

  const finishAll = React.useCallback(() => {
    setTurns((ts) => ts.map((t) => ({ ...t, done: true })));
  }, []);

  const startTurn = React.useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(finishAll, TURN_MS);
  }, [finishAll]);

  React.useEffect(() => {
    startTurn();
    return () => window.clearTimeout(timer.current);
  }, [startTurn]);

  const onSend = React.useCallback(
    (text: string, mode: SendMode) => {
      setTurns((ts) => [...ts.slice(-3), { id: Date.now(), text, mode, done: false }]);
      startTurn();
    },
    [startTurn]
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex min-h-40 flex-col justify-end gap-1.5">
        <AnimatePresence initial={false}>
          {turns.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-1.5 text-sm"
            >
              <span className="truncate">{t.text}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                {t.mode === "queued" && <span className="rounded border px-1 text-[10px]">from queue</span>}
                {t.done ? (
                  "Done"
                ) : (
                  <>
                    <motion.span
                      className="size-1.5 rounded-full bg-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    Working
                  </>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <MessageQueueComposer
        busy={busy}
        onSend={onSend}
        onStop={() => {
          window.clearTimeout(timer.current);
          finishAll();
        }}
      />

      <p className="text-center text-xs text-muted-foreground">
        While the agent works, press <span className="font-mono">⌘↵</span> (Ctrl↵) to queue a follow-up.
      </p>
    </div>
  );
}
