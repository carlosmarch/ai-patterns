"use client";

import * as React from "react";

import { PromptQuality, type QualityCriterion } from "./component";

// Simple keyword heuristics standing in for a model's judgement.
const CRITERIA: QualityCriterion[] = [
  {
    id: "task",
    label: "Task",
    tip: "Start with what you want done — write, summarize, plan, compare",
    test: (p) => /\b(write|draft|summari[sz]e|plan|compare|explain|list|create|design|rewrite|translate)\b/i.test(p),
    insert: "[Write]",
    at: "start",
  },
  {
    id: "audience",
    label: "Audience",
    tip: "Say who it's for",
    test: (p) => /\b(for|to) (my |our |a |an |the )?\w+/i.test(p),
    insert: " for [audience]",
  },
  {
    id: "format",
    label: "Format",
    tip: "Name the shape of the answer — bullets, an email, a table",
    test: (p) => /\b(bullet|list|table|email|paragraph|outline|steps|tweet|post|headline)s?\b/i.test(p),
    insert: ", as [bullet points]",
  },
  {
    id: "constraints",
    label: "Length or tone",
    tip: "Add a limit or a tone, like under 100 words or friendly",
    test: (p) => /\b(under|at most|max(imum)?|\d+ (words|lines|bullets|points)|short|brief|formal|friendly|casual|tone)\b/i.test(p),
    insert: ", under [100] words",
  },
];

export default function PromptQualityDemo() {
  const [value, setValue] = React.useState("Write a launch email");
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PromptQuality
        value={value}
        onChange={setValue}
        criteria={CRITERIA}
        onSubmit={(prompt) => {
          setSent(prompt);
          setValue("");
        }}
      />
      {sent && (
        <p className="px-1 text-xs text-muted-foreground">
          Sent: <span className="text-foreground">{sent}</span>
        </p>
      )}
    </div>
  );
}
