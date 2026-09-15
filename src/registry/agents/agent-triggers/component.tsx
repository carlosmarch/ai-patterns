"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtSign, GitBranch, GitPullRequest, Layers, Play, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AgentTrigger {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  event: string;
  context: string;
  enabled: boolean;
  needsSetup?: boolean;
}

export interface AgentTriggersProps {
  title?: string;
  description?: string;
  triggers?: AgentTrigger[];
  onRunAgent?: () => void;
  onToggle?: (id: string, enabled: boolean) => void;
  onAddTrigger?: (platformId?: string) => void;
  onFinishSetup?: (id: string) => void;
  className?: string;
}

const QUICK_ADD_PLATFORMS = [
  { id: "github", label: "GitHub", icon: GitBranch },
  { id: "slack", label: "Slack", icon: AtSign },
  { id: "figma", label: "Figma", icon: Layers },
] as const;

export const DEFAULT_TRIGGERS: AgentTrigger[] = [
  {
    id: "github-issue",
    icon: GitPullRequest,
    event: "Issue labeled pattern-request",
    context: "in dm-cmarch/ai-patterns",
    enabled: true,
  },
  {
    id: "slack-mention",
    icon: AtSign,
    event: "When agent is mentioned",
    context: "in Slack",
    enabled: false,
  },
  {
    id: "figma-ready",
    icon: Layers,
    event: "Frame marked ready for dev",
    context: "in any Figma file",
    enabled: false,
    needsSetup: true,
  },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        enabled ? "bg-foreground" : "bg-muted"
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm"
        animate={{ x: enabled ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function AgentTriggers({
  title = "Triggers",
  description = "When should this agent run?",
  triggers: initialTriggers = DEFAULT_TRIGGERS,
  onRunAgent,
  onToggle,
  onAddTrigger,
  onFinishSetup,
  className,
}: AgentTriggersProps) {
  const [triggers, setTriggers] = React.useState(initialTriggers);
  const [running, setRunning] = React.useState(false);

  function handleToggle(id: string, value: boolean) {
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: value } : t)));
    onToggle?.(id, value);
  }

  function handleRun() {
    if (running) return;
    setRunning(true);
    onRunAgent?.();
    setTimeout(() => setRunning(false), 2200);
  }

  return (
    <div className={cn("w-full max-w-xs overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none",
            running ? "border-transparent bg-foreground text-background" : "hover:bg-accent"
          )}
        >
          <Play className={cn("size-3 transition-all", running ? "fill-current" : "fill-none stroke-current")} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={running ? "running" : "idle"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.1 }}
            >
              {running ? "Running…" : "Run agent"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <ul className="divide-y border-t">
        {triggers.map((trigger) => (
          <li key={trigger.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground">
              <trigger.icon className="size-3.5" />
            </span>
            <p className="min-w-0 flex-1 text-xs leading-snug">
              <span className="font-medium">{trigger.event}</span>{" "}
              <span className="text-muted-foreground">{trigger.context}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {trigger.needsSetup && !trigger.enabled && (
                <button
                  type="button"
                  onClick={() => onFinishSetup?.(trigger.id)}
                  className="text-[11px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Finish setup
                </button>
              )}
              <Toggle enabled={trigger.enabled} onChange={(v) => handleToggle(trigger.id, v)} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t px-4 py-2.5">
        <button
          type="button"
          onClick={() => onAddTrigger?.()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add trigger
        </button>
        <div className="ml-0.5 flex items-center gap-0.5">
          {QUICK_ADD_PLATFORMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Add ${label} trigger`}
              onClick={() => onAddTrigger?.(id)}
              className="flex size-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
