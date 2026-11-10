"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { IncognitoToggle, TemporaryChatBanner } from "./component";

export default function IncognitoToggleDemo() {
  const [active, setActive] = React.useState(false);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">New chat</span>
        <IncognitoToggle active={active} onActiveChange={setActive} />
      </div>

      <TemporaryChatBanner active={active} onExit={() => setActive(false)} />

      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card p-3 transition-colors",
          active && "border-dashed border-foreground/30"
        )}
      >
        <p className="flex-1 px-1 pb-6 text-sm text-muted-foreground">
          {active ? "Ask anything — this chat won't be saved" : "Ask anything…"}
        </p>
        <button
          type="button"
          aria-label="Send"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
