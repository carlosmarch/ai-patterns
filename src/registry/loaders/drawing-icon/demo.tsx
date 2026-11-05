"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { DrawingIcon, type DrawingIconName } from "./component";

const STEPS: { icon: DrawingIconName; label: string }[] = [
  { icon: "lightbulb", label: "Thinking" },
  { icon: "globe", label: "Searching the web" },
  { icon: "telescope", label: "Looking deeper" },
  { icon: "pen", label: "Writing" },
  { icon: "origami", label: "Creating image" },
];

export default function DrawingIconDemo() {
  const [step, setStep] = React.useState(0);
  const done = step >= STEPS.length;
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  React.useEffect(() => {
    if (done) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 3600);
    return () => window.clearTimeout(id);
  }, [step, done]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex items-center gap-5 text-foreground">
        {STEPS.map((s) => (
          <DrawingIcon key={s.icon} icon={s.icon} size={28} ghost />
        ))}
      </div>

      <div
        aria-live="polite"
        className="flex w-full items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground"
      >
        <DrawingIcon key={current.icon} icon={current.icon} paused={done} />
        <span className={done ? "text-foreground" : undefined}>
          {done ? "Image created" : `${current.label}…`}
        </span>
        {done && (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="ml-auto flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
