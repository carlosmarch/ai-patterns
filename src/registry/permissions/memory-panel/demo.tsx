"use client";

import * as React from "react";

import { MemoryPanel, MemoryUpdatedNotice, type Memory } from "./component";

const initial: Memory[] = [
  { id: "1", text: "Works as a product designer at a fintech startup.", source: "From a chat on 12 Oct" },
  { id: "2", text: "Prefers concise answers with bullet points.", source: "You asked me to remember this" },
  { id: "3", text: "Writes in British English.", source: "From a chat on 3 Nov" },
];

export default function MemoryPanelDemo() {
  const [memories, setMemories] = React.useState(initial);
  const [enabled, setEnabled] = React.useState(true);
  const [notice, setNotice] = React.useState(0);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMemories((m) => [...m, { id: String(Date.now()), text: "Is planning a trip to Lisbon in March.", source: "Just now" }]);
            setNotice((n) => n + 1);
          }}
          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Simulate a new memory
        </button>
        <button
          type="button"
          onClick={() => {
            setMemories(initial);
            setEnabled(true);
            setNotice(0);
          }}
          className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      </div>

      {notice > 0 && <MemoryUpdatedNotice key={notice} text="Is planning a trip to Lisbon in March." onManage={() => {}} />}

      <MemoryPanel
        memories={memories}
        enabled={enabled}
        onEnabledChange={setEnabled}
        onEdit={(id, text) => setMemories((m) => m.map((x) => (x.id === id ? { ...x, text } : x)))}
        onDelete={(id) => setMemories((m) => m.filter((x) => x.id !== id))}
        onClearAll={() => setMemories([])}
      />
    </div>
  );
}
