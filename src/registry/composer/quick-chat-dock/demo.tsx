"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import { QuickChatDock } from "./component";

export default function QuickChatDockDemo() {
  const [asked, setAsked] = React.useState<string | null>(null);
  const [agentOpen, setAgentOpen] = React.useState<false | string>(false);

  return (
    <div className="relative h-72 w-full max-w-xl overflow-hidden rounded-xl border bg-background bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:32px_32px]">
      <div className="p-4">
        <AnimatePresence mode="wait">
          {asked ? (
            <motion.div
              key={asked}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xs rounded-lg border bg-card px-3 py-2 text-sm shadow-sm"
            >
              <p className="text-xs text-muted-foreground">You asked</p>
              <p className="truncate">{asked}</p>
            </motion.div>
          ) : (
            <motion.p key="hint" exit={{ opacity: 0 }} className="text-xs text-muted-foreground">
              Hover the bottom edge, or press <kbd className="font-sans">⇧ Enter</kbd>.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {agentOpen !== false && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            className="absolute inset-y-0 right-0 z-40 flex w-56 flex-col border-l bg-card p-3 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Agent</p>
              <button
                type="button"
                onClick={() => setAgentOpen(false)}
                aria-label="Close agent"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {agentOpen ? `Continuing: “${agentOpen}”` : "Full agent conversation lives here."}
            </p>
          </motion.aside>
        )}
      </AnimatePresence>

      <QuickChatDock onSubmit={setAsked} onOpenAgent={(draft) => setAgentOpen(draft)} />
    </div>
  );
}
