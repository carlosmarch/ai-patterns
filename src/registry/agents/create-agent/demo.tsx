"use client";

import * as React from "react";

import { CreateAgent, CreateAgentPayload } from "./component";

export default function CreateAgentDemo() {
  const [created, setCreated] = React.useState<CreateAgentPayload | null>(null);

  if (created) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold">{created.name} created</p>
        <p className="max-w-[220px] text-xs text-muted-foreground">
          {created.triggers.length === 0 && created.customTriggers.length === 0
            ? "No triggers configured yet."
            : [
                ...created.triggers.map((t) => t.sourceId),
                ...created.customTriggers.map((t) => t.name || "Custom"),
              ].join(", ") + "."}
        </p>
        <button
          type="button"
          onClick={() => setCreated(null)}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Create another
        </button>
      </div>
    );
  }

  return <CreateAgent onCreateAgent={setCreated} />;
}
