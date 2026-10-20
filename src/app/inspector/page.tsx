import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";

import { InspectorApp } from "./inspector-app";

// Unlisted for now: nothing links here and it's kept out of search, so it's
// only reachable by URL while the concept settles.
export const metadata: Metadata = {
  title: "Inspector — ai-patterns",
  description: "Check every AI surface in a codebase against the pattern contracts: what passes, what fails, and the fix.",
  robots: { index: false, follow: false },
};

// A full-screen tool, so it covers the site header and footer from the root layout.
export default async function InspectorPage() {
  const plugin = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "plugins/ai-patterns/.claude-plugin/plugin.json"), "utf-8")
  ) as { version: string };

  return (
    <main className="fixed inset-0 z-40 bg-background">
      <h1 className="sr-only">Inspector</h1>
      <InspectorApp skillVersion={plugin.version} />
    </main>
  );
}
