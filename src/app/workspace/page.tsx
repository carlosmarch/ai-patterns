import type { Metadata } from "next";

import { WorkspaceApp } from "./workspace-app";

export const metadata: Metadata = {
  title: "Workspace — ai-patterns",
  description: "Every pattern in use inside one product: a UX AI agent workspace for auditing, specifying, and shipping AI interface patterns.",
};

// The workspace is a full-screen app, so it covers the site header and
// footer from the root layout instead of sitting inside them.
export default function WorkspacePage() {
  return (
    <main className="fixed inset-0 z-40 bg-background">
      <h1 className="sr-only">Workspace</h1>
      <WorkspaceApp />
    </main>
  );
}
