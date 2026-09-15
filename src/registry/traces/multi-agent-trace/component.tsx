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
  icon?: React.ComponentType<{ className?: string }>;
  status: AgentStatus;
  currentStep?: string;
  elapsedSeconds?: number;
  steps: AgentStep[];
  subAgents?: Agent[];
}

export interface MultiAgentTraceProps {
  agents: Agent[];
  className?: string;
}

function countActive(agents: Agent[]): number {
  return agents.reduce((n, a) => {
    const self = a.status === "running" || a.status === "queued" ? 1 : 0;
    return n + self + (a.subAgents ? countActive(a.subAgents) : 0);
  }, 0);
}

function countFailed(agents: Agent[]): number {
  return agents.reduce((n, a) => {
    return n + (a.status === "error" ? 1 : 0) + (a.subAgents ? countFailed(a.subAgents) : 0);
  }, 0);
}

function countTotal(agents: Agent[]): number {
  return agents.reduce((n, a) => n + 1 + (a.subAgents ? countTotal(a.subAgents) : 0), 0);
}

export function MultiAgentTrace({ agents, className }: MultiAgentTraceProps) {
  const active = countActive(agents);
  const failed = countFailed(agents);
  const total = countTotal(agents);
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
            : `Done — ${total - failed}/${total} complete`}
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

function AgentRow({ agent, depth = 0 }: { agent: Agent; depth?: number }) {
  const [open, setOpen] = React.useState(false);
  const hasContent = agent.steps.length > 0 || (agent.subAgents?.length ?? 0) > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!hasContent}
        className="flex w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
        style={{ paddingLeft: depth > 0 ? `${1 + depth * 1.5}rem` : undefined }}
      >
        <StatusIcon status={agent.status} icon={agent.icon} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{agent.name}</p>
          {agent.currentStep && (
            <p className="truncate text-[11px] text-muted-foreground">{agent.currentStep}</p>
          )}
        </div>
        {typeof agent.elapsedSeconds === "number" && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {agent.elapsedSeconds}s
          </span>
        )}
        {hasContent && (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {agent.steps.length > 0 && (
              <ul
                className="px-4 pb-3 pl-11"
                style={{ paddingLeft: depth > 0 ? `${2.75 + depth * 1.5}rem` : undefined }}
              >
                {agent.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Check className="size-2.5 text-muted-foreground" />
                      </span>
                      {(i < agent.steps.length - 1 || (agent.subAgents?.length ?? 0) > 0) && (
                        <span className="my-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <p className="pb-3 text-xs text-foreground/90">
                      {step.label}
                      {step.meta && (
                        <span className="ml-1.5 text-muted-foreground">{step.meta}</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {agent.subAgents && agent.subAgents.length > 0 && (
              <ul className="border-t divide-y">
                {agent.subAgents.map((sub) => (
                  <AgentRow key={sub.id} agent={sub} depth={depth + 1} />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function StatusIcon({
  status,
  icon: Icon,
}: {
  status: AgentStatus;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (status === "running") {
    return (
      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
        {Icon ? (
          <>
            <Icon className="size-3.5 text-muted-foreground" aria-label="Running" />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-card ring-1 ring-border">
              <Loader2 className="size-1.5 animate-spin text-muted-foreground" />
            </span>
          </>
        ) : (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Running" />
        )}
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        {Icon ? <Icon className="size-3.5" aria-label="Error" /> : <X className="size-3.5" aria-label="Failed" />}
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        {Icon ? (
          <>
            <Icon className="size-3.5" aria-label="Done" />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-card ring-1 ring-border">
              <Check className="size-1.5 text-emerald-600 dark:text-emerald-400" />
            </span>
          </>
        ) : (
          <Check className="size-3.5" aria-label="Done" />
        )}
      </span>
    );
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted" aria-label="Queued">
      {Icon ? (
        <Icon className="size-3.5 text-muted-foreground/50" />
      ) : (
        <span className="size-1.5 rounded-full bg-muted-foreground" />
      )}
    </span>
  );
}
