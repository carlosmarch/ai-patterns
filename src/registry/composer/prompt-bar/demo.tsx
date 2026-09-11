"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { PromptBar, type PromptBarVariant } from "./component";

const variants: { value: PromptBarVariant; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
];

export default function PromptBarDemo() {
  const [variant, setVariant] = React.useState<PromptBarVariant>("rounded");
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

      <PromptBar
        key={variant}
        variant={variant}
        onSubmit={(v) => setMessages((prev) => [...prev, v])}
        className="w-full"
      />

      <p className="text-center text-xs text-muted-foreground">
        Try typing <span className="font-mono">@</span> for flavors or <span className="font-mono">/</span> for
        commands.
      </p>

      <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
        {variants.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setVariant(v.value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              variant === v.value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
