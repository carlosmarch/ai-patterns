"use client";

import * as React from "react";
import { Code2, Plus } from "lucide-react";

import { CommandPalette, type CommandPaletteGroup } from "./component";

const groups: CommandPaletteGroup[] = [
  {
    label: "Quick actions",
    items: [{ id: "new-session", label: "New session", icon: Plus }],
  },
  {
    label: "Recent",
    items: [
      { id: "1", label: "Created by credit with portfolio link", icon: Code2, meta: "Just now" },
      { id: "2", label: "Header menu selected state", icon: Code2, meta: "Just now" },
      { id: "3", label: "Diff tabs chip border styling", icon: Code2, meta: "Last hour" },
      { id: "4", label: "Thinking loader icon-text gap", icon: Code2, meta: "PR #52 · Last hour" },
      { id: "5", label: "Voice waveform and transcript patterns", icon: Code2, meta: "PR #51 · Last hour" },
    ],
  },
];

export default function CommandPaletteDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
      >
        Search or start a session
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder="Search or start a session"
        onSelect={(item) => console.log("selected", item)}
      />
    </div>
  );
}
