"use client";

import * as React from "react";

import { PromptBar } from "./component";

export default function PromptBarDemo() {
  const [messages, setMessages] = React.useState<string[]>([]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {messages.length > 0 && (
        <div className="w-full space-y-1.5">
          {messages.map((m, i) => (
            <p key={i} className="truncate rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground">
              {m}
            </p>
          ))}
        </div>
      )}

      <PromptBar onSubmit={(v) => setMessages((prev) => [...prev, v])} className="w-full" />

      <p className="text-center text-xs text-muted-foreground">
        Try typing <span className="font-mono">@</span> for flavors or <span className="font-mono">/</span> for
        commands.
      </p>
    </div>
  );
}
