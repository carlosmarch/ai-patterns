"use client";

import { Code2, Plus } from "lucide-react";

import { CommandPaletteWindow, type CommandPaletteGroup } from "./component";

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
  return (
    <CommandPaletteWindow
      groups={groups}
      placeholder="Search or start a session"
      className="max-w-md"
      onSelect={(item) => console.log("selected", item)}
    />
  );
}
