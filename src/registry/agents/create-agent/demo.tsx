"use client";

import * as React from "react";

import { CreateAgent, CreateAgentPayload, DEFAULT_GUARDRAILS } from "./component";

export default function CreateAgentDemo() {
  const [created, setCreated] = React.useState<CreateAgentPayload | null>(null);

  if (created) {
    const activeGuardrails = DEFAULT_GUARDRAILS.filter(
      (g) => created.guardrails.find((r) => r.id === g.id)?.enabled
    );
    const allTriggers = [
      ...created.triggers.map((t) => t.sourceId),
      ...created.customTriggers.map((t) => t.name || "Custom"),
    ];

    return (
      <div className="w-full max-w-xs rounded-2xl border bg-card px-4 py-4 text-left">
        <p className="text-sm font-semibold">{created.name}</p>
        {created.instructions && (
          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{created.instructions}</p>
        )}

        {activeGuardrails.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">Guardrails</p>
            <ul className="mt-1 space-y-1">
              {activeGuardrails.map((g) => (
                <li key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <g.icon className="size-3 shrink-0" />
                  {g.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {allTriggers.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">Triggers</p>
            <p className="mt-1 text-xs text-muted-foreground">{allTriggers.join(", ")}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCreated(null)}
          className="mt-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Create another
        </button>
      </div>
    );
  }

  return <CreateAgent onCreateAgent={setCreated} />;
}
