import type { Metadata } from "next";

import { PatternDemo } from "./pattern-demo";

export const metadata: Metadata = {
  title: "Demo — ai-patterns",
  description: "Every pattern wired up together in one realistic AI chat interface.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-6 py-12">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Demo</p>
        <h1 className="text-3xl font-semibold tracking-tight">See every pattern at work</h1>
        <p className="text-muted-foreground">
          One conversation, wired up with the whole registry. Type a message and it replies, or
          type <span className="font-mono text-foreground">/</span> to run a specific pattern.
        </p>
      </div>

      <PatternDemo />
    </main>
  );
}
