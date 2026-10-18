"use client";

import * as React from "react";

import { RefinementControls } from "./component";

const DRAFT =
  "Onboarding is the design of early success. It helps new users reach their first meaningful outcome quickly by combining motivation, ability, timely prompts, learning scaffolds, and trust, so that the product feels worth coming back to after the very first session.";

const RESPONSES: Record<string, string> = {
  "Match writing style":
    "Onboarding is about designing early wins. Get people to their first real result fast — give them a reason, make it easy, nudge at the right moment, teach as they go, and earn their trust so they come back.",
  Rephrase:
    "Good onboarding engineers an early win: it gets new users to a meaningful result fast by pairing motivation and ability with well-timed prompts, learning scaffolds, and trust — so the product earns a second visit.",
  Shorten: "Onboarding designs early success: a fast first win built on motivation, ability, prompts, scaffolds, and trust.",
  Elaborate:
    "Onboarding is the design of early success. Rather than a tour of features, it is the deliberate path that takes a new user to their first meaningful outcome as quickly as possible. It draws on motivation (why should I care?), ability (can I do this easily?), timely prompts (what should I do now?), learning scaffolds (help that fades as skill grows), and trust (is this safe and reliable?). Done well, the first session ends with a result the user values — the strongest predictor that they will return.",
  "More formal":
    "Onboarding constitutes the deliberate design of early user success. It enables new users to achieve a first meaningful outcome efficiently by integrating motivation, ability, timely prompts, learning scaffolds, and trust, thereby establishing the product's value beyond the initial session.",
  Bulletize:
    "Onboarding is the design of early success:\n• Get new users to a first meaningful outcome, fast\n• Build motivation and ability\n• Use timely prompts\n• Provide learning scaffolds\n• Earn trust so users return",
  Summarize: "Onboarding gets new users to an early, meaningful win so they return.",
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockRefine(text: string, instruction: string) {
  await delay(1100);
  const canned = RESPONSES[instruction];
  if (canned) return canned;
  if (/question/i.test(instruction)) return "What if onboarding were designed around a user's first meaningful win?";
  if (/emoji/i.test(instruction)) return `🚀 ${text}`;
  return RESPONSES.Rephrase;
}

export default function RefinementControlsDemo() {
  return (
    <div className="w-full max-w-lg pt-12">
      <RefinementControls text={DRAFT} onRefine={mockRefine} />
    </div>
  );
}
