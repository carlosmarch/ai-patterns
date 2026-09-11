"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { ExpandableTrace, type TraceStep } from "./component";

const variants: { value: string; label: string; duration: number; steps: TraceStep[] }[] = [
  {
    value: "steps",
    label: "Steps",
    duration: 4,
    steps: [
      { label: "Reading flavor briefs" },
      { label: "Scanning supplier lists" },
      { label: "Comparing tasting notes", meta: "6 flavors" },
      { label: "Writing the scoop report" },
    ],
  },
  {
    value: "reasoning",
    label: "Reasoning",
    duration: 6,
    steps: [
      { label: "Considering the user's intent" },
      { label: "Weighing two competing approaches" },
      { label: "Checking constraints against the brief" },
      { label: "Drafting a final answer" },
    ],
  },
  {
    value: "search",
    label: "Search",
    duration: 8,
    steps: [
      { label: "Searching", meta: "“ice cream flavor trends 2026”" },
      { label: "Opening top results", meta: "4 pages" },
      { label: "Cross-referencing supplier sites" },
      { label: "Compiling citations" },
    ],
  },
  {
    value: "coding",
    label: "Coding",
    duration: 5,
    steps: [
      { label: "Reading", meta: "component.tsx" },
      { label: "Editing the shimmer effect" },
      { label: "Running the type checker" },
      { label: "Fixing a lint warning" },
    ],
  },
];

export default function ExpandableTraceDemo() {
  const [active, setActive] = React.useState(variants[0].value);
  const current = variants.find((v) => v.value === active) ?? variants[0];

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <ExpandableTrace
        key={active}
        durationSeconds={current.duration}
        steps={current.steps}
        defaultOpen
        className="w-full"
      />
      <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
        {variants.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setActive(v.value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              active === v.value
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
