"use client";

import * as React from "react";

import { SelectionActions } from "./component";

const PARAGRAPH =
  "Turn on the thinking loader the moment the agent starts a step, and keep it up until the trace is fully ready to show so users never sit through a blank pause.";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockRewrite(selection: string, instruction: string) {
  await delay(900);
  const lower = instruction.toLowerCase();

  if (lower.includes("formal")) {
    return selection.replace(/\bTurn on\b/, "Enable");
  }
  if (lower.includes("shorten") || lower.includes("clarity") || lower.includes("improve")) {
    return selection.replace(/\bTurn on the thinking loader\b/, "Show the loader").replace(/\bfully ready\b/, "ready");
  }
  return selection;
}

async function mockExplain(selection: string) {
  await delay(500);
  void selection;
  return "This sentence explains when to trigger the thinking loader and how long to keep it visible so the interface never looks stuck.";
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
