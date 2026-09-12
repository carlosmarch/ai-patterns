"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AgentStep {
  label: string;
  meta?: string;
}

export type AgentStatus = "queued" | "running" | "done" | "error";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentStep?: string;
  elapsedSeconds?: number;
  steps: AgentStep[];
}

export interface MultiAgentTraceProps {
  agents: Agent[];
  className?: string;
}

export function MultiAgentTrace({ agents, className }: MultiAgentTraceProps) {
  const active = agents.filter((a) => a.status === "running" || a.status === "queued").length;
  const failed = agents.filter((a) => a.status === "error").length;
  const allResolved = active === 0;

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card", className)}>
      <div aria-live="polite" className="flex items-center gap-2 border-b px-4 py-3 text-xs font-medium">
        {!allResolved ? (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
        ) : failed > 0 ? (
          <X className="size-3.5 text-destructive" aria-hidden />
        ) : (
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        )}
        <span>
          {!allResolved
            ? `${active} agent${active === 1 ? "" : "s"} working`
            : `Done — ${agents.length - failed}/${agents.length} complete`}
        </span>
      </div>

      <ul className="divide-y">
        {agents.map((agent) => (
          <AgentRow key={agent.id} agent={agent} />
        ))}
      </ul>
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const [open, setOpen] = React.useState(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <StatusIcon status={agent.status} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{agent.name}</p>
          {agent.currentStep && <p className="truncate text-[11px] text-muted-foreground">{agent.currentStep}</p>}
        </div>
        {typeof agent.elapsedSeconds === "number" && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{agent.elapsedSeconds}s</span>
        )}
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && agent.steps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-3 pl-11">
              {agent.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Check className="size-2.5 text-muted-foreground" />
                    </span>
                    {i < agent.steps.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
                  </div>
                  <p className="pb-3 text-xs text-foreground/90">
                    {step.label}
                    {step.meta && <span className="ml-1.5 text-muted-foreground">{step.meta}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "running") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Running" />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <X className="size-3.5" aria-label="Failed" />
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Check className="size-3.5" aria-label="Done" />
      </span>
    );
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted" aria-label="Queued">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
    </span>
  );
}
