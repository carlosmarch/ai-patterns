"use client";

import * as React from "react";

import { RateLimit } from "./component";

export default function RateLimitDemo() {
  const [key, setKey] = React.useState(0);
  const [mode, setMode] = React.useState<"static" | "countdown">("static");
  const [resetAt, setResetAt] = React.useState(new Date(0));

  function resetCountdown() {
    setResetAt(new Date(Date.now() + 4 * 60 * 1000));
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex gap-2">
        {(["static", "countdown"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setKey((k) => k + 1); if (m === "countdown") resetCountdown(); }}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              mode === m
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {m === "static" ? "Reset time" : "Countdown"}
          </button>
        ))}
      </div>

      <RateLimit
        key={key}
        label="Approaching weekly usage limit"
        resetTime={mode === "static" ? "18:00" : undefined}
        resetAt={mode === "countdown" ? resetAt : undefined}
        upgradeLabel="Get more usage"
        onUpgrade={() => {}}
        onDismiss={() => { setKey((k) => k + 1); if (mode === "countdown") resetCountdown(); }}
      />
    </div>
  );
}
