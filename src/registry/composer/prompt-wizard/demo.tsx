"use client";

import * as React from "react";

import { PromptWizard, type WizardAnswers, type WizardStep } from "./component";

const STEPS: WizardStep[] = [
  {
    id: "role",
    question: "What role are you hiring for?",
    hint: "The job title as it should appear in the post.",
    placeholder: "e.g. Product designer",
  },
  { id: "level", question: "How senior?", options: ["Junior", "Mid-level", "Senior", "Lead"] },
  {
    id: "work",
    question: "What will they work on first?",
    hint: "One or two sentences — this makes the post specific.",
    placeholder: "e.g. Redesign onboarding for our mobile app",
  },
  { id: "tone", question: "What should it sound like?", options: ["Warm", "Direct", "Playful", "Formal"] },
  {
    id: "extras",
    question: "Anything else to include?",
    placeholder: "e.g. Remote in Europe, salary range €70–85k",
    optional: true,
  },
];

function build(a: WizardAnswers) {
  const parts: string[] = [];
  const role = a.role?.trim();
  const level = a.level?.toLowerCase();
  if (role || level) parts.push(`Write a job post for a ${[level, role || "role"].filter(Boolean).join(" ")}`);
  if (a.work?.trim()) parts.push(`who will start by working on: ${a.work.trim().replace(/\.$/, "")}`);
  let prompt = parts.join(", ");
  if (a.tone) prompt += `${prompt ? ". " : ""}Keep the tone ${a.tone.toLowerCase()}`;
  if (a.extras?.trim()) prompt += `${prompt ? ". " : ""}Mention: ${a.extras.trim().replace(/\.$/, "")}`;
  return prompt ? `${prompt}.` : "";
}

export default function PromptWizardDemo() {
  const [run, setRun] = React.useState(0);
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PromptWizard
        key={run}
        title="Job post"
        steps={STEPS}
        build={build}
        onSubmit={(prompt) => setSent(prompt)}
      />
      {sent && (
        <p className="px-1 text-xs text-muted-foreground">
          Sent: <span className="text-foreground">{sent}</span>{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => {
              setSent(null);
              setRun((r) => r + 1);
            }}
          >
            Start over
          </button>
        </p>
      )}
    </div>
  );
}
