"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { ModelPicker, type ModelOption } from "./component";

const models: ModelOption[] = [
  { id: "fast", label: "Swift", description: "Quick answers for everyday tasks." },
  { id: "balanced", label: "Atlas", description: "Strong all-rounder for writing and code.", badge: "New" },
  { id: "deep", label: "Atlas Max", description: "Most capable, for complex analysis.", locked: true },
];

export default function ModelPickerDemo() {
  const [model, setModel] = React.useState("balanced");
  const [thinking, setThinking] = React.useState(false);

  return (
    <div className="flex w-full max-w-lg flex-col pt-56">
      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        <p className="px-1 pb-6 text-sm text-muted-foreground">Ask anything…</p>
        <div className="flex items-center justify-between">
          <ModelPicker
            models={models}
            value={model}
            onChange={setModel}
            thinking={thinking}
            onThinkingChange={setThinking}
            onUpgrade={() => {}}
          />
          <button
            type="button"
            aria-label="Send"
            className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
