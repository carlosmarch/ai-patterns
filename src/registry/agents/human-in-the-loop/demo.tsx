"use client";

import * as React from "react";

import { HumanInTheLoop } from "./component";

const questions = [
  {
    id: "intent",
    question: "How should the agent handle ambiguous user intent?",
    options: [
      { id: "clarify", label: "Ask a clarifying question" },
      { id: "assume", label: "Make a reasonable assumption" },
      { id: "variants", label: "Generate multiple variants" },
    ],
    freeTextPlaceholder: "Something else...",
  },
  {
    id: "review",
    question: "What should trigger a human review step?",
    options: [
      { id: "external", label: "Before any external action" },
      { id: "confidence", label: "On low-confidence outputs" },
      { id: "destructive", label: "Destructive operations only" },
    ],
    freeTextPlaceholder: "Something else...",
  },
  {
    id: "model",
    question: "Which model should handle reasoning tasks?",
    options: [
      { id: "fastest", label: "Fastest available" },
      { id: "capable", label: "Most capable" },
      { id: "balanced", label: "Balance cost and quality" },
    ],
    freeTextPlaceholder: "Something else...",
  },
];

export default function HumanInTheLoopDemo() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <HumanInTheLoop
        key={key}
        questions={questions}
        onSubmit={() => setTimeout(() => setKey((k) => k + 1), 1800)}
        onSkip={() => setKey((k) => k + 1)}
        onClose={() => setKey((k) => k + 1)}
        className="w-full max-w-xs"
      />
    </div>
  );
}
