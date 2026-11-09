import type { Metadata } from "next";

import { SITE_SHARE_IMAGE } from "@/lib/share";

import plugin from "../../../plugins/ai-patterns/.claude-plugin/plugin.json";
import { WorkspaceApp } from "./workspace-app";

export const metadata: Metadata = {
  title: "Workspace — ai-patterns",
  description: "A guided first session in a UX agent workspace: audit a chat screen, fix it with catalogue patterns, and ship it. Every card along the way is a pattern you can copy.",
  openGraph: { siteName: "AI Patterns", title: "Workspace — AI Patterns", description: "A guided first session in a UX agent workspace: audit a chat screen, fix it with catalogue patterns, and ship it. Every card along the way is a pattern you can copy.", url: "/workspace", images: SITE_SHARE_IMAGE },
};

// The workspace is a full-screen app, so it covers the site header and
// footer from the root layout instead of sitting inside them.
export default function WorkspacePage() {
  return (
    <main className="fixed inset-0 z-40 bg-background">
      <h1 className="sr-only">Workspace</h1>
      <WorkspaceApp skillVersion={plugin.version} />
    </main>
  );
}
