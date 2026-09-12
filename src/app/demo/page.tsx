import type { Metadata } from "next";

import { PatternDemo } from "./pattern-demo";

export const metadata: Metadata = {
  title: "Demo — ai-patterns",
  description: "Every pattern wired up together in one live AI chat interface.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8 sm:py-12">
      <h1 className="sr-only">Demo</h1>
      <PatternDemo />
    </main>
  );
}
