"use client";

import * as React from "react";

import { ClarifyingQuestions } from "./component";

const questions = [
  { id: "audience", label: "Who is it for?", options: ["Investors", "The whole team", "Customers"], suggested: "The whole team" },
  { id: "length", label: "How long?", options: ["One page", "5 slides", "10+ slides"], suggested: "5 slides" },
  { id: "tone", label: "Tone", options: ["Upbeat", "Neutral", "Formal"], suggested: "Neutral", allowOther: true },
];

export default function ClarifyingQuestionsDemo() {
  const [key, setKey] = React.useState(0);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="self-end rounded-2xl bg-muted px-3.5 py-2 text-sm">Make a deck summarising our Q3 results</div>
      <ClarifyingQuestions key={key} questions={questions} onSubmit={() => {}} />
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
