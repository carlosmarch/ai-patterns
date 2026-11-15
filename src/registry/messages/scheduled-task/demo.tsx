"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { ScheduledTask, type ScheduledTaskStatus } from "./component";

const OFFER = "Run the research scout on Monday";
const TITLE = "Run the research scout";
const WHEN_OPTIONS = ["Monday, 9:00", "Tomorrow, 9:00", "In 1 hour", "Friday, 16:00"];

type Stage = "offer" | "accepted" | "scheduled";

export default function ScheduledTaskDemo() {
  const [stage, setStage] = React.useState<Stage>("offer");
  const [when, setWhen] = React.useState(WHEN_OPTIONS[0]);
  const [status, setStatus] = React.useState<ScheduledTaskStatus>("scheduled");
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const reset = () => {
    setStage("offer");
    setWhen(WHEN_OPTIONS[0]);
    setStatus("scheduled");
  };

  const accept = () => {
    setStage("accepted");
    later(() => setStage("scheduled"), 900);
  };

  const runNow = () => {
    setStatus("running");
    later(() => setStatus("ran"), 2200);
    later(reset, 5200);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 text-sm">
      <p className="text-foreground/90">
        Scheduled Task is merged and in the catalogue. Want me to run the research scout again on Monday, to code
        the week&rsquo;s new changelogs against the registry?
      </p>

      <button
        type="button"
        onClick={accept}
        disabled={stage !== "offer"}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left transition-colors enabled:hover:bg-accent disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Check
          className={stage === "offer" ? "size-4 text-muted-foreground/40" : "size-4 text-muted-foreground"}
          aria-hidden
        />
        <span className={stage === "offer" ? "text-foreground" : "text-muted-foreground"}>{OFFER}</span>
      </button>

      <AnimatePresence>
        {stage === "accepted" && (
          <motion.p
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground"
          >
            Scheduling…
          </motion.p>
        )}
      </AnimatePresence>

      {stage === "scheduled" && (
        <div className="flex flex-col gap-3">
          <ScheduledTask
            title={TITLE}
            when={when}
            whenOptions={WHEN_OPTIONS}
            status={status}
            onWhenChange={setWhen}
            onRunNow={runNow}
          />
          <p className="text-xs text-muted-foreground">
            {status === "ran"
              ? "Done — research/scout/2026-11-15.md has 2 new candidates and a new Seen in source for Composer Question."
              : `Got it — I'll run the scout (${when}) and link the report here when it's written.`}
          </p>
        </div>
      )}
    </div>
  );
}
