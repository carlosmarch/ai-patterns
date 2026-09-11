"use client";

import * as React from "react";
import { ChevronDown, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FlowchartToken {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  /** Tailwind background color class for a leading dot, e.g. "bg-amber-500". */
  dotColor?: string;
}

export interface FlowchartClause {
  connector: "if" | "and" | "or";
  subject: FlowchartToken;
  field: FlowchartToken;
  value: FlowchartToken;
}

export interface FlowchartTriggerNode {
  type: "trigger";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface FlowchartConditionNode {
  type: "condition";
  clauses: FlowchartClause[];
}

export type FlowchartNode = FlowchartTriggerNode | FlowchartConditionNode;

export interface FlowchartProps {
  nodes: FlowchartNode[];
  className?: string;
}

const badgeStyles: Record<FlowchartNode["type"], string> = {
  trigger: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  condition: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const badgeLabels: Record<FlowchartNode["type"], string> = {
  trigger: "Trigger",
  condition: "If / Else",
};

export function Flowchart({ nodes, className }: FlowchartProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-muted/20 p-8",
        "[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]",
        className
      )}
    >
      <div className="mx-auto flex max-w-sm flex-col items-center">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-8 w-px bg-border" aria-hidden />}
            <span
              className={cn(
                "mb-3 rounded-md px-2.5 py-1 text-xs font-semibold",
                badgeStyles[node.type]
              )}
            >
              {badgeLabels[node.type]}
            </span>
            {node.type === "trigger" ? (
              <TriggerCard node={node} />
            ) : (
              <ConditionCard node={node} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TriggerCard({ node }: { node: FlowchartTriggerNode }) {
  const Icon = node.icon;
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{node.title}</p>
        <p className="text-sm text-muted-foreground">{node.description}</p>
      </div>
    </div>
  );
}

function ConditionCard({ node }: { node: FlowchartConditionNode }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      {node.clauses.map((clause, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex w-12 shrink-0 items-center gap-1 pt-1.5 text-sm text-muted-foreground">
            <GripVertical className="size-3.5 shrink-0" />
            {clause.connector}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <FieldChip token={clause.subject} />
            <FieldChip token={clause.field} />
            <span className="text-sm text-muted-foreground">is</span>
            <ValueChip token={clause.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldChip({ token }: { token: FlowchartToken }) {
  const Icon = token.icon;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
    >
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      {token.label}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </button>
  );
}

function ValueChip({ token }: { token: FlowchartToken }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
    >
      {token.dotColor && <span className={cn("size-2 shrink-0 rounded-full", token.dotColor)} />}
      {token.label}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </button>
  );
}
