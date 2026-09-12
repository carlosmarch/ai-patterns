"use client";

import * as React from "react";

import { SelectionActions } from "./component";

const PARAGRAPH =
  "Pistachio holds the top slot all weekend. Churn pistachio first thing Saturday so the batch has time to fully firm before the afternoon rush.";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockRewrite(selection: string, instruction: string) {
  await delay(900);
  const lower = instruction.toLowerCase();

  if (lower.includes("formal")) {
    return selection.replace(/\bChurn\b/, "Begin churning");
  }
  if (lower.includes("shorten") || lower.includes("clarity") || lower.includes("improve")) {
    return selection.replace(/\bChurn pistachio\b/, "Churn it").replace(/\bfully firm\b/, "firm up");
  }
  return selection;
}

async function mockExplain(selection: string) {
  await delay(500);
  void selection;
  return "This sentence tells the team when to start the pistachio batch and why the timing matters for Saturday's rush.";
}

export default function SelectionActionsDemo() {
  return (
    <div className="w-full max-w-md">
      <SelectionActions text={PARAGRAPH} onRewrite={mockRewrite} onExplain={mockExplain} />
      <p className="mt-4 text-xs text-muted-foreground">
        Highlight a passage above to try Explain, Improve, or a custom edit.
      </p>
    </div>
  );
}
