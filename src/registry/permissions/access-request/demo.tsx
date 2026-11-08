"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { AccessRequest } from "./component";

export default function AccessRequestDemo() {
  const [run, setRun] = React.useState(0);
  const [decided, setDecided] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <AccessRequest
        key={run}
        title="Update environment?"
        target={{ name: "Web", scope: "Personal" }}
        requester="Claude"
        reason="Let the research scout read any product's public docs and changelogs."
        changes={[
          { id: "network", label: "Network access", from: "Allowed domains only", to: "Any host", widens: true },
          { id: "allowlist", label: "Allowed domains list", from: "12 domains", to: "Discarded" },
        ]}
        impact="Applies to this session and every session that uses this environment."
        approveLabel="Update environment"
        onDecision={() => setDecided(true)}
      />
      {decided && (
        <button
          type="button"
          onClick={() => {
            setDecided(false);
            setRun((r) => r + 1);
          }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Ask again
        </button>
      )}
    </div>
  );
}
