"use client";

import * as React from "react";

import { ConfidenceIndicator, type ConfidenceLevel } from "./component";

const levels: { value: ConfidenceLevel; label: string; reason: string }[] = [
  { value: "high", label: "High", reason: "Confirmed by three independent sources in the document." },
  { value: "medium", label: "Medium", reason: "Only one source mentions this figure directly." },
  { value: "low", label: "Low", reason: "The field was extracted from a blurry section of the scan." },
];

export default function ConfidenceIndicatorDemo() {
  const [level, setLevel] = React.useState<ConfidenceLevel>("medium");
  const current = levels.find((l) => l.value === level)!;

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex gap-2">
        {levels.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setLevel(l.value)}
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              level === l.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Badge, with calibrated score</p>
          <ConfidenceIndicator level={level} reason={current.reason} percentage={{ high: 96, medium: 61, low: 24 }[level]} />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Inline dot, per-claim</p>
          <p className="text-sm leading-relaxed">
            The invoice total is{" "}
            <span className="font-medium">
              $4,210.00
              <ConfidenceIndicator level={level} variant="dot" reason={current.reason} className="ml-1" />
            </span>
            , due on the last business day of the month.
          </p>
        </div>
      </div>
    </div>
  );
}
