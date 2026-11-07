"use client";

import { InstructionTools } from "./component";

export default function InstructionToolsDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6 pb-64">
      <InstructionTools
        defaultSteps={[
          "Acknowledge the issue and reassure the customer you'll resolve it now. ",
          "Ask them which order is damaged.",
          "Look up the order with ",
        ]}
        defaultPickerOpen
        className="rounded-2xl border bg-card p-4"
      />
      <p className="text-center text-xs text-muted-foreground">
        Pick a tool, then a connector — or type <span className="font-mono">/</span> after a space anywhere.
      </p>
    </div>
  );
}
