"use client";

import * as React from "react";

import { PromptAutocomplete } from "./component";

// Canned completions standing in for a model call: the first one that
// continues what's typed wins.
const COMPLETIONS = [
  "Summarize this thread in three bullet points and list any open decisions",
  "Summarize the attached PDF for a non-technical audience",
  "Write a product description for a reusable glass water bottle, under 80 words",
  "Write a friendly follow-up email to a candidate after their final interview",
  "Explain the difference between a mutex and a semaphore with a short example",
  "Explain this error and suggest the smallest fix",
  "Draft a launch announcement for our new dark mode, for the changelog",
  "Plan a three-day trip to Lisbon on a mid-range budget",
];

function fakeSuggest(prompt: string, signal: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      const typed = prompt.toLowerCase();
      const match = COMPLETIONS.find((c) => c.toLowerCase().startsWith(typed) && c.length > prompt.length);
      resolve(match ? match.slice(prompt.length) : "");
    }, 180);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export default function PromptAutocompleteDemo() {
  const [value, setValue] = React.useState("Summarize th");
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PromptAutocomplete
        value={value}
        onChange={setValue}
        getSuggestion={fakeSuggest}
        onSubmit={(prompt) => {
          setSent(prompt);
          setValue("");
        }}
      />
      <p className="px-1 text-xs text-muted-foreground">
        {sent ? (
          <>
            Sent: <span className="text-foreground">{sent}</span>
          </>
        ) : (
          <>Try typing “Write a”, “Explain” or “Plan”. Tab accepts, → takes one word, Esc dismisses.</>
        )}
      </p>
    </div>
  );
}
