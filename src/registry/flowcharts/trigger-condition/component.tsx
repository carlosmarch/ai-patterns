"use client";

import * as React from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { ChevronDown, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FlowchartToken {
  id: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  /** Tailwind background color class for a leading dot, e.g. "bg-amber-500". */
  dotColor?: string;
}

export interface FlowchartClause {
  id: string;
  connector: "if" | "and" | "or";
  subject: FlowchartToken;
  subjectOptions?: FlowchartToken[];
  field: FlowchartToken;
  fieldOptions?: FlowchartToken[];
  value: FlowchartToken;
  valueOptions?: FlowchartToken[];
}

export interface FlowchartTriggerNode {
  id: string;
  type: "trigger";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface FlowchartConditionNode {
  id: string;
  type: "condition";
  clauses: FlowchartClause[];
}

export type FlowchartNode = FlowchartTriggerNode | FlowchartConditionNode;

export interface FlowchartProps {
  nodes: FlowchartNode[];
  className?: string;
}

type ClauseTokenKey = "subject" | "field" | "value";

const badgeStyles: Record<FlowchartNode["type"], string> = {
  trigger: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  condition: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const badgeLabels: Record<FlowchartNode["type"], string> = {
  trigger: "Trigger",
  condition: "If / Else",
};

export function Flowchart({ nodes, className }: FlowchartProps) {
  const [nodeList, setNodeList] = React.useState(nodes);

  function handleClausesReorder(nodeId: string, clauses: FlowchartClause[]) {
    setNodeList((prev) =>
      prev.map((node) => (node.id === nodeId && node.type === "condition" ? { ...node, clauses } : node))
    );
  }

  function handleClauseTokenChange(
    nodeId: string,
    clauseId: string,
    key: ClauseTokenKey,
    token: FlowchartToken
  ) {
    setNodeList((prev) =>
      prev.map((node) =>
        node.id === nodeId && node.type === "condition"
          ? {
              ...node,
              clauses: node.clauses.map((clause) =>
                clause.id === clauseId ? { ...clause, [key]: token } : clause
              ),
            }
          : node
      )
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-muted/20 p-8",
        "[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]",
        className
      )}
    >
      <Reorder.Group
        as="div"
        axis="y"
        values={nodeList}
        onReorder={setNodeList}
        className="mx-auto flex max-w-sm flex-col items-center"
      >
        {nodeList.map((node, i) => (
          <FlowchartNodeItem
            key={node.id}
            node={node}
            isFirst={i === 0}
            onClausesReorder={(clauses) => handleClausesReorder(node.id, clauses)}
            onClauseTokenChange={(clauseId, key, token) =>
              handleClauseTokenChange(node.id, clauseId, key, token)
            }
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function FlowchartNodeItem({
  node,
  isFirst,
  onClausesReorder,
  onClauseTokenChange,
}: {
  node: FlowchartNode;
  isFirst: boolean;
  onClausesReorder: (clauses: FlowchartClause[]) => void;
  onClauseTokenChange: (clauseId: string, key: ClauseTokenKey, token: FlowchartToken) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={node}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex w-full flex-col items-center"
    >
      {!isFirst && <div className="h-8 w-px bg-border" aria-hidden />}
      <div className="mb-3 flex items-center gap-1.5">
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold",
            badgeStyles[node.type]
          )}
        >
          {badgeLabels[node.type]}
        </span>
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          aria-label="Drag to reorder this step"
          className="flex size-5 shrink-0 touch-none items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing cursor-grab"
        >
          <GripVertical className="size-3.5" />
        </button>
      </div>
      {node.type === "trigger" ? (
        <TriggerCard node={node} />
      ) : (
        <ConditionCard
          node={node}
          onClausesReorder={onClausesReorder}
          onClauseTokenChange={onClauseTokenChange}
        />
      )}
    </Reorder.Item>
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

function ConditionCard({
  node,
  onClausesReorder,
  onClauseTokenChange,
}: {
  node: FlowchartConditionNode;
  onClausesReorder: (clauses: FlowchartClause[]) => void;
  onClauseTokenChange: (clauseId: string, key: ClauseTokenKey, token: FlowchartToken) => void;
}) {
  return (
    <div className="w-full rounded-2xl border bg-card p-4 shadow-sm">
      <Reorder.Group
        as="div"
        axis="y"
        values={node.clauses}
        onReorder={onClausesReorder}
        className="flex flex-col gap-3"
      >
        {node.clauses.map((clause, i) => (
          <ClauseRow
            key={clause.id}
            clause={clause}
            displayConnector={i === 0 ? "if" : clause.connector === "if" ? "and" : clause.connector}
            onTokenChange={(key, token) => onClauseTokenChange(clause.id, key, token)}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

function ClauseRow({
  clause,
  displayConnector,
  onTokenChange,
}: {
  clause: FlowchartClause;
  displayConnector: FlowchartClause["connector"];
  onTokenChange: (key: ClauseTokenKey, token: FlowchartToken) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={clause}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-start gap-2 bg-card"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder this clause"
        className="flex w-12 shrink-0 touch-none items-center gap-1 rounded pt-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing cursor-grab"
      >
        <GripVertical className="size-3.5 shrink-0" />
        {displayConnector}
      </button>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <TokenChip
          variant="field"
          token={clause.subject}
          options={clause.subjectOptions}
          onSelect={(token) => onTokenChange("subject", token)}
        />
        <TokenChip
          variant="field"
          token={clause.field}
          options={clause.fieldOptions}
          onSelect={(token) => onTokenChange("field", token)}
        />
        <span className="text-sm text-muted-foreground">is</span>
        <TokenChip
          variant="value"
          token={clause.value}
          options={clause.valueOptions}
          onSelect={(token) => onTokenChange("value", token)}
        />
      </div>
    </Reorder.Item>
  );
}

function TokenChip({
  token,
  options,
  variant,
  onSelect,
}: {
  token: FlowchartToken;
  options?: FlowchartToken[];
  variant: "field" | "value";
  onSelect: (token: FlowchartToken) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const Icon = token.icon;
  const hasOptions = !!options?.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasOptions && setOpen((v) => !v)}
        aria-haspopup={hasOptions ? "listbox" : undefined}
        aria-expanded={hasOptions ? open : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
          variant === "field" ? "bg-muted px-2.5 py-1.5 hover:bg-accent" : "border px-3 py-1.5 hover:bg-accent",
          !hasOptions && "cursor-default"
        )}
      >
        {variant === "value" && token.dotColor && (
          <span className={cn("size-2 shrink-0 rounded-full", token.dotColor)} />
        )}
        {variant === "field" && Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {token.label}
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && hasOptions && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className="absolute left-0 top-full z-10 mt-2 min-w-40 overflow-hidden rounded-xl border bg-popover shadow-md"
          >
            {options!.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={option.id === token.id}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm hover:bg-accent",
                  option.id === token.id && "font-medium"
                )}
              >
                {option.dotColor && <span className={cn("size-2 shrink-0 rounded-full", option.dotColor)} />}
                {option.icon && <option.icon className="size-3.5 text-muted-foreground" />}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}
