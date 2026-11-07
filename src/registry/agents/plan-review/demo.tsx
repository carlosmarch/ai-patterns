"use client";

import * as React from "react";

import { PlanReview, type PlanStep } from "./component";

const first: PlanStep[] = [
  { id: "a", text: "Pull Q3 revenue and churn from the finance dashboard" },
  { id: "b", text: "Compare against Q2 and the Q3 targets" },
  { id: "c", text: "Draft a 5-slide summary deck" },
  { id: "d", text: "Add speaker notes for each slide" },
];

const second: PlanStep[] = [
  { id: "e", text: "Read the Q3 board memo for context" },
  { id: "f", text: "Pull revenue, churn and NPS for Q2 and Q3" },
  { id: "g", text: "Chart the three biggest changes" },
  { id: "h", text: "Draft a one-page summary instead of a deck" },
];

export default function PlanReviewDemo() {
  const [key, setKey] = React.useState(0);
  const [approved, setApproved] = React.useState(false);
  const flip = React.useRef(false);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <PlanReview
        key={key}
        steps={first}
        estimate="~4 min"
        onApprove={() => setApproved(true)}
        onRegenerate={() =>
          new Promise((resolve) =>
            setTimeout(() => {
              flip.current = !flip.current;
              resolve(flip.current ? second : first);
            }, 1200)
          )
        }
      />
      {approved && (
        <button
          type="button"
          onClick={() => {
            setKey((k) => k + 1);
            setApproved(false);
          }}
          className="self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  );
}
