"use client";

import * as React from "react";

import { ContextUsage, type ContextSegment } from "./component";

const LIMIT = 200_000;
const RESERVED = 32_000;

const INITIAL: ContextSegment[] = [
  { id: "chat", label: "Chat", tokens: 96_400, color: "bg-cyan-500" },
  { id: "files", label: "Files", tokens: 26_200, color: "bg-blue-500" },
  { id: "tools", label: "Tools", tokens: 11_800, color: "bg-violet-500" },
  { id: "system", label: "System", tokens: 3_600, color: "bg-pink-500" },
  { id: "memory", label: "Memory", tokens: 2_600, color: "bg-emerald-500" },
];

export default function ContextUsageDemo() {
  const [segments, setSegments] = React.useState(INITIAL);

  function grow(id: string, by: number) {
    setSegments((all) => {
      const used = all.reduce((sum, s) => sum + s.tokens, 0);
      const add = Math.max(0, Math.min(by, LIMIT - RESERVED - used));
      return all.map((s) => (s.id === id ? { ...s, tokens: s.tokens + add } : s));
    });
  }

  async function compact() {
    await new Promise((r) => setTimeout(r, 900));
    // Older turns are replaced by a short summary; tool output is dropped.
    setSegments((all) =>
      all.map((s) =>
        s.id === "chat" ? { ...s, tokens: Math.round(s.tokens * 0.12) } : s.id === "tools" ? { ...s, tokens: Math.round(s.tokens * 0.3) } : s
      )
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ContextUsage segments={segments} limit={LIMIT} reserved={RESERVED} onCompact={compact} />
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => grow("chat", 6_400)}
          className="rounded-full border px-3 py-1.5 font-medium transition-colors hover:bg-muted"
        >
          Send a message
        </button>
        <button
          type="button"
          onClick={() => grow("files", 14_000)}
          className="rounded-full border px-3 py-1.5 font-medium transition-colors hover:bg-muted"
        >
          Attach a file
        </button>
        <button
          type="button"
          onClick={() => setSegments(INITIAL)}
          className="rounded-full border px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
