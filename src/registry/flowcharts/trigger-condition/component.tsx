"use client";

import * as React from "react";
import { motion, Reorder, useDragControls, type PanInfo } from "motion/react";
import { ChevronDown, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FlowchartOption {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  /** Tailwind background color class for a leading dot, e.g. "bg-amber-500". */
  dotColor?: string;
}

export interface FlowchartField extends FlowchartOption {
  /** Alternatives shown in this chip's dropdown. Omit to render a static, non-interactive chip. */
  options?: FlowchartOption[];
}

export interface FlowchartClause {
  id: string;
  connector: "if" | "and" | "or";
  subject: FlowchartField;
  field: FlowchartField;
  value: FlowchartField;
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

const badgeStyles: Record<FlowchartNode["type"], string> = {
  trigger: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  condition: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const badgeLabels: Record<FlowchartNode["type"], string> = {
  trigger: "Trigger",
  condition: "If / Else",
};

interface Point {
  x: number;
  y: number;
}

interface NodeRect {
  top: number;
  bottom: number;
  centerX: number;
}

export function Flowchart({ nodes, className }: FlowchartProps) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const dragBase = React.useRef<Record<string, Point>>({});
  const [offsets, setOffsets] = React.useState<Record<string, Point>>({});
  const [rects, setRects] = React.useState<Record<string, NodeRect>>({});

  const measure = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const next: Record<string, NodeRect> = {};
    for (const node of nodes) {
      const el = nodeRefs.current[node.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[node.id] = {
        top: r.top - canvasRect.top,
        bottom: r.bottom - canvasRect.top,
        centerX: r.left - canvasRect.left + r.width / 2,
      };
    }
    setRects(next);
  }, [nodes]);

  React.useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function handleDragStart(id: string) {
    dragBase.current[id] = offsets[id] ?? { x: 0, y: 0 };
  }

  function handleDrag(id: string, info: PanInfo) {
    const base = dragBase.current[id] ?? { x: 0, y: 0 };
    setOffsets((prev) => ({
      ...prev,
      [id]: { x: base.x + info.offset.x, y: base.y + info.offset.y },
    }));
  }

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-muted/20 p-8",
        "[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]",
        className
      )}
    >
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        {nodes.slice(1).map((node, i) => {
          const prev = nodes[i];
          const a = rects[prev.id];
          const b = rects[node.id];
          if (!a || !b) return null;
          const offA = offsets[prev.id] ?? { x: 0, y: 0 };
          const offB = offsets[node.id] ?? { x: 0, y: 0 };
          return (
            <line
              key={node.id}
              x1={a.centerX + offA.x}
              y1={a.bottom + offA.y}
              x2={b.centerX + offB.x}
              y2={b.top + offB.y}
              className="stroke-border"
              strokeWidth={1.5}
            />
          );
        })}
      </svg>

      <div className="relative mx-auto flex max-w-sm flex-col items-center gap-8">
        {nodes.map((node) => (
          <FlowchartNodeCard
            key={node.id}
            node={node}
            canvasRef={canvasRef}
            registerRef={(el) => {
              nodeRefs.current[node.id] = el;
            }}
            onDragStart={() => handleDragStart(node.id)}
            onDrag={(info) => handleDrag(node.id, info)}
            onDragEnd={measure}
            onContentChange={measure}
          />
        ))}
      </div>
    </div>
  );
}

function FlowchartNodeCard({
  node,
  canvasRef,
  registerRef,
  onDragStart,
  onDrag,
  onDragEnd,
  onContentChange,
}: {
  node: FlowchartNode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  registerRef: (el: HTMLDivElement | null) => void;
  onDragStart: () => void;
  onDrag: (info: PanInfo) => void;
  onDragEnd: () => void;
  onContentChange: () => void;
}) {
  const controls = useDragControls();

  return (
    <motion.div
      ref={registerRef}
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={canvasRef}
      onDragStart={onDragStart}
      onDrag={(_, info) => onDrag(info)}
      onDragEnd={onDragEnd}
      whileDrag={{ boxShadow: "0 12px 28px rgb(0 0 0 / 0.16)", zIndex: 10 }}
      className="relative flex w-full flex-col items-center"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`Move ${badgeLabels[node.type]} step`}
        className={cn(
          "mb-3 touch-none cursor-grab select-none rounded-md px-2.5 py-1 text-xs font-semibold active:cursor-grabbing",
          badgeStyles[node.type]
        )}
      >
        {badgeLabels[node.type]}
      </button>
      {node.type === "trigger" ? (
        <TriggerCard node={node} />
      ) : (
        <ConditionCard node={node} onChange={onContentChange} />
      )}
    </motion.div>
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
  onChange,
}: {
  node: FlowchartConditionNode;
  onChange: () => void;
}) {
  const [clauses, setClauses] = React.useState(node.clauses);

  function updateClause(next: FlowchartClause) {
    setClauses((prev) => prev.map((c) => (c.id === next.id ? next : c)));
  }

  return (
    <Reorder.Group
      as="div"
      axis="y"
      values={clauses}
      onReorder={(next) => {
        setClauses(next);
        onChange();
      }}
      className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm"
    >
      {clauses.map((clause, i) => (
        <ClauseRow key={clause.id} clause={clause} isFirst={i === 0} onChange={updateClause} />
      ))}
    </Reorder.Group>
  );
}

function ClauseRow({
  clause,
  isFirst,
  onChange,
}: {
  clause: FlowchartClause;
  isFirst: boolean;
  onChange: (clause: FlowchartClause) => void;
}) {
  const controls = useDragControls();
  // The leading clause always reads "if"; only later clauses read "and" / "or".
  const displayConnector = isFirst ? "if" : clause.connector === "if" ? "and" : clause.connector;

  return (
    <Reorder.Item
      as="div"
      value={clause}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 6px 16px rgb(0 0 0 / 0.12)" }}
      className="relative flex items-start gap-2 rounded-lg bg-card"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder condition"
        className="flex w-12 shrink-0 touch-none cursor-grab items-center gap-1 pt-1.5 text-sm text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-3.5 shrink-0" />
        {displayConnector}
      </button>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Chip
          variant="field"
          token={clause.subject}
          onSelect={(next) =>
            onChange({ ...clause, subject: { ...next, options: clause.subject.options } })
          }
        />
        <Chip
          variant="field"
          token={clause.field}
          onSelect={(next) =>
            onChange({ ...clause, field: { ...next, options: clause.field.options } })
          }
        />
        <span className="text-sm text-muted-foreground">is</span>
        <Chip
          variant="value"
          token={clause.value}
          onSelect={(next) =>
            onChange({ ...clause, value: { ...next, options: clause.value.options } })
          }
        />
      </div>
    </Reorder.Item>
  );
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    function handle(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [onOutside]);
  return ref;
}

function Chip({
  token,
  onSelect,
  variant,
}: {
  token: FlowchartField;
  onSelect: (next: FlowchartOption) => void;
  variant: "field" | "value";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const Icon = token.icon;
  const options = token.options ?? [];
  const hasOptions = options.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasOptions && setOpen((v) => !v)}
        aria-haspopup={hasOptions || undefined}
        aria-expanded={hasOptions ? open : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
          hasOptions && "hover:bg-accent",
          variant === "field" ? "bg-muted px-2.5" : "border px-3"
        )}
      >
        {variant === "value" && token.dotColor && (
          <span className={cn("size-2 shrink-0 rounded-full", token.dotColor)} />
        )}
        {variant === "field" && Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {token.label}
        {hasOptions && (
          <ChevronDown
            className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        )}
      </button>
      {open && hasOptions && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border bg-popover py-1 shadow-md">
          {options.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent",
                  opt.label === token.label && "font-medium"
                )}
              >
                {variant === "value" && opt.dotColor && (
                  <span className={cn("size-2 shrink-0 rounded-full", opt.dotColor)} />
                )}
                {variant === "field" && OptIcon && (
                  <OptIcon className="size-3.5 text-muted-foreground" />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
