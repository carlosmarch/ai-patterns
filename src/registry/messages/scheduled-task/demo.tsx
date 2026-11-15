"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

import { ScheduledTask, type ScheduledTaskStatus } from "./component";

const OFFER = "Draft the Cost Estimate states tomorrow";
const TITLE = "Draft the Cost Estimate states";
const WHEN_OPTIONS = ["Tomorrow, 9:00", "In 1 hour", "Monday, 9:00", "Friday, 16:00"];

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
        The Cost Estimate pill is in. Its empty, over-budget and loading states still need drafts — want me to pick
        them up tomorrow?
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
              ? "Done — three state drafts are ready in the Cost Estimate spec."
              : `Got it — I'll draft the states (${when}) and tell you here when they're ready.`}
          </p>
        </div>
      )}
    </div>
  );
}
