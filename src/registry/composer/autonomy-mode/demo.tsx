"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, FilePen, Terminal } from "lucide-react";

import { AutonomyModePicker, type AutonomyMode, type Capability } from "./component";

const capabilities: Capability[] = [
  { id: "read", label: "Read files" },
  { id: "edit", label: "Edit files" },
  { id: "run", label: "Run commands" },
];

const modes: AutonomyMode[] = [
  {
    id: "suggest",
    label: "Suggest",
    description: "Reads and proposes changes. You apply them.",
    permissions: { read: "auto", edit: "suggest", run: "suggest" },
  },
  {
    id: "confirm",
    label: "Confirm",
    description: "Makes changes after you approve each one.",
    permissions: { read: "auto", edit: "ask", run: "ask" },
  },
  {
    id: "execute",
    label: "Execute",
    description: "Edits and runs commands on its own. Stop it any time.",
    permissions: { read: "auto", edit: "auto", run: "auto" },
  },
];

// The same two next steps, shown the way each mode would handle them.
const steps = [
  { icon: FilePen, label: "Edit pricing.ts", detail: "Apply the 20% annual discount" },
  { icon: Terminal, label: "Run npm test", detail: "pricing.test.ts" },
];

export default function AutonomyModeDemo() {
  const [mode, setMode] = React.useState("confirm");

  return (
    <div className="flex w-full max-w-lg flex-col gap-3 pt-64">
      <div className="rounded-xl border bg-background p-3" aria-live="polite">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">Agent’s next steps</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={mode}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.14 }}
            className="space-y-1.5"
          >
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-2.5 rounded-lg border bg-card px-2.5 py-1.5">
                <s.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs">{s.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{s.detail}</span>
                </span>
                {mode === "suggest" && (
                  <span className="rounded-md border border-dashed px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    Suggested · Apply
                  </span>
                )}
                {mode === "confirm" && (
                  <span className="flex gap-1">
                    <span className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">Deny</span>
                    <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] text-background">Allow</span>
                  </span>
                )}
                {mode === "execute" && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Check className="size-3" aria-hidden /> Done
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        <p className="px-1 pb-6 text-sm text-muted-foreground">Add a 20% annual discount and check the tests…</p>
        <div className="flex items-center justify-between">
          <AutonomyModePicker modes={modes} capabilities={capabilities} value={mode} onChange={setMode} />
          <button
            type="button"
            aria-label="Send"
            className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
