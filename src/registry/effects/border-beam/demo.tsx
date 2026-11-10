"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { PromptBarPro, type PromptBarItem } from "../../composer/prompt-bar-pro/component";
import { BorderBeam } from "./component";

const sources: PromptBarItem[] = [
  { id: "figma", label: "Figma" },
  { id: "registry", label: "Registry" },
  { id: "docs", label: "Docs" },
];

const commands: PromptBarItem[] = [
  { id: "build", label: "/build", description: "Build a pattern from a spec" },
  { id: "review", label: "/review", description: "Review a component's motion" },
];

export default function BorderBeamDemo() {
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    if (!working) return;
    const t = setTimeout(() => setWorking(false), 3200);
    return () => clearTimeout(t);
  }, [working]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <BorderBeam active={working} radius={16} className="w-full">
        <PromptBarPro
          suggestions={[]}
          sources={sources}
          commands={commands}
          placeholder="Build anything…"
          generating={working}
          onSubmit={() => setWorking(true)}
          onStop={() => setWorking(false)}
        />
      </BorderBeam>

      <BorderBeam radius={999} duration={10} className="w-4/5 self-end">
        <label className="flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm text-muted-foreground">
          <Search className="size-4 shrink-0" />
          <input
            placeholder="Search patterns, e.g. Cost Estimate"
            aria-label="Search patterns"
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </BorderBeam>

      <p className="text-center text-xs text-muted-foreground">
        Send a prompt — the beam speeds up and brightens while the agent works.
      </p>
    </div>
  );
}
