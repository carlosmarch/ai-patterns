import type { Metadata } from "next";
import Link from "next/link";

import { PatternDemo } from "./pattern-demo";

export const metadata: Metadata = {
  title: "Demo — ai-patterns",
  description: "Every pattern wired up together in one live AI chat interface.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8 sm:py-12">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-sm font-medium text-muted-foreground">Demo</h1>
        <Link href="/patterns" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Browse all patterns →
        </Link>
      </div>

      <PatternDemo />
    </main>
  );
}
