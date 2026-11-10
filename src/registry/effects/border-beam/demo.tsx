"use client";

import * as React from "react";
import { ArrowUp, AtSign, ChevronDown, Search } from "lucide-react";

import { BorderBeam } from "./component";

export default function BorderBeamDemo() {
  const [value, setValue] = React.useState("");
  const [working, setWorking] = React.useState(false);

  React.useEffect(() => {
    if (!working) return;
    const t = setTimeout(() => setWorking(false), 3200);
    return () => clearTimeout(t);
  }, [working]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || working) return;
    setValue("");
    setWorking(true);
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <BorderBeam active={working} radius={18} className="w-full">
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-[18px] border bg-card p-3">
          <button
            type="button"
            aria-label="Mention a pattern"
            className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <AtSign className="size-4" />
          </button>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={working ? "Building the Thinking Loader…" : "Build anything…"}
            aria-label="Prompt"
            disabled={working}
            className="bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-2">
            {["Agent", "Auto"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                {label}
                <ChevronDown className="size-3" />
              </span>
            ))}
            <button
              type="submit"
              aria-label="Send"
              disabled={!value.trim() || working}
              className="ml-auto flex size-8 items-center justify-center rounded-full border bg-muted text-muted-foreground enabled:hover:text-foreground disabled:opacity-50"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
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
