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
type Offset = { dx: number; dy: number };

const badgeStyles: Record<FlowchartNode["type"], string> = {
  trigger: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  condition: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

const badgeLabels: Record<FlowchartNode["type"], string> = {
  trigger: "Trigger",
  condition: "If / Else",
};

/* ── canvas layout constants ── */
const CANVAS_PAD = 32;
const ROW_GAP = 40;
const CARD_MAX_WIDTH = 384;

function estimateHeight(node: FlowchartNode) {
  return node.type === "trigger" ? 116 : 96 + node.clauses.length * 56;
}

export function Flowchart({ nodes, className }: FlowchartProps) {
  const [nodeList, setNodeList] = React.useState(nodes);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const nodeRefs = React.useRef(new Map<string, HTMLDivElement>());
  const [canvasWidth, setCanvasWidth] = React.useState(0);
  const [heights, setHeights] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(nodes.map((node) => [node.id, estimateHeight(node)]))
  );
  const [offsets, setOffsets] = React.useState<Record<string, Offset>>({});
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measure = () => {
      setCanvasWidth(canvas.clientWidth);
      setHeights((prev) => {
        const next = { ...prev };
        let changed = false;
        nodeRefs.current.forEach((el, id) => {
          const h = el.offsetHeight;
          if (h && Math.abs(h - (next[id] ?? 0)) > 0.5) {
            next[id] = h;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    nodeRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [nodeList]);

  /* stacked base position for each node, ignoring drag offsets */
  const baseTops = React.useMemo(() => {
    const tops: Record<string, number> = {};
    let y = CANVAS_PAD;
    nodeList.forEach((node) => {
      tops[node.id] = y;
      y += (heights[node.id] ?? estimateHeight(node)) + ROW_GAP;
    });
    return tops;
  }, [nodeList, heights]);

  const lastNode = nodeList[nodeList.length - 1];
  const canvasHeight = lastNode
    ? baseTops[lastNode.id] + (heights[lastNode.id] ?? estimateHeight(lastNode)) + CANVAS_PAD
    : CANVAS_PAD * 2;

  const effectiveWidth = canvasWidth || CARD_MAX_WIDTH + CANVAS_PAD * 2;
  const cardWidth = Math.max(Math.min(CARD_MAX_WIDTH, effectiveWidth - CANVAS_PAD * 2), 200);
  const baseCenterX = effectiveWidth / 2;

  function place(nodeId: string) {
    const off = offsets[nodeId];
    return {
      cx: baseCenterX + (off?.dx ?? 0),
      top: (baseTops[nodeId] ?? 0) + (off?.dy ?? 0),
    };
  }

  function anchors(node: FlowchartNode) {
    const { cx, top } = place(node.id);
    const height = heights[node.id] ?? estimateHeight(node);
    return {
      top: { x: cx, y: top },
      bottom: { x: cx, y: top + height },
    };
  }

  function connector(from: FlowchartNode, to: FlowchartNode) {
    const start = anchors(from).bottom;
    const end = anchors(to).top;
    const k = Math.min(Math.max(Math.abs(end.y - start.y) * 0.55, 24), 84);
    return `M ${start.x} ${start.y} C ${start.x} ${start.y + k}, ${end.x} ${end.y - k}, ${end.x} ${end.y}`;
  }

  function handleDragMove(nodeId: string, node: FlowchartNode, dx: number, dy: number) {
    const height = heights[nodeId] ?? estimateHeight(node);
    const baseTop = baseTops[nodeId] ?? 0;
    const minCx = cardWidth / 2 + CANVAS_PAD / 2;
    const maxCx = Math.max(effectiveWidth - cardWidth / 2 - CANVAS_PAD / 2, minCx);
    const cx = Math.min(Math.max(baseCenterX + dx, minCx), maxCx);
    const top = Math.min(Math.max(baseTop + dy, 8), Math.max(canvasHeight - height - 8, 8));
    setOffsets((current) => ({ ...current, [nodeId]: { dx: cx - baseCenterX, dy: top - baseTop } }));
  }

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
      ref={canvasRef}
      className={cn(
        "relative w-full rounded-2xl border bg-muted/20",
        "[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]",
        className
      )}
      style={{ height: canvasHeight }}
    >
      <svg width={effectiveWidth} height={canvasHeight} className="pointer-events-none absolute inset-0" aria-hidden>
        {nodeList.slice(1).map((node, i) => (
          <path
            key={node.id}
            d={connector(nodeList[i], node)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1.5}
          />
        ))}
      </svg>

      {nodeList.map((node) => {
        const { cx, top } = place(node.id);
        return (
          <FlowchartNodeItem
            key={node.id}
            node={node}
            offset={offsets[node.id] ?? { dx: 0, dy: 0 }}
            style={{
              left: cx,
              top,
              width: cardWidth,
              zIndex: draggingId === node.id ? 2 : 1,
            }}
            registerRef={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
              else nodeRefs.current.delete(node.id);
            }}
            onDragStart={() => setDraggingId(node.id)}
            onDragMove={(dx, dy) => handleDragMove(node.id, node, dx, dy)}
            onDragEnd={() => setDraggingId(null)}
            onClausesReorder={(clauses) => handleClausesReorder(node.id, clauses)}
            onClauseTokenChange={(clauseId, key, token) =>
              handleClauseTokenChange(node.id, clauseId, key, token)
            }
          />
        );
      })}
    </div>
  );
}

function FlowchartNodeItem({
  node,
  offset,
  style,
  registerRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClausesReorder,
  onClauseTokenChange,
}: {
  node: FlowchartNode;
  offset: Offset;
  style: React.CSSProperties;
  registerRef: (el: HTMLDivElement | null) => void;
  onDragStart: () => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onClausesReorder: (clauses: FlowchartClause[]) => void;
  onClauseTokenChange: (clauseId: string, key: ClauseTokenKey, token: FlowchartToken) => void;
}) {
  const drag = React.useRef<{ pointerId: number; startX: number; startY: number; baseDx: number; baseDy: number } | null>(
    null
  );

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseDx: offset.dx,
      baseDy: offset.dy,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStart();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    onDragMove(d.baseDx + event.clientX - d.startX, d.baseDy + event.clientY - d.startY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null;
      onDragEnd();
    }
  }

  return (
    <div
      ref={registerRef}
      className="absolute flex -translate-x-1/2 flex-col items-start gap-1.5"
      style={style}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("rounded-md px-2.5 py-1 text-xs font-semibold", badgeStyles[node.type])}>
          {badgeLabels[node.type]}
        </span>
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Drag to move this step"
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
    </div>
  );
}

function TriggerCard({ node }: { node: FlowchartTriggerNode }) {
  const Icon = node.icon;
  return (
    <div className="flex w-full items-center gap-2.5 rounded-2xl border bg-card p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold">{node.title}</p>
        <p className="text-xs text-muted-foreground">{node.description}</p>
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
    <div className="w-full rounded-2xl border bg-card p-3">
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
        className="flex w-10 shrink-0 touch-none items-center gap-1 rounded pt-1 text-xs text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing cursor-grab"
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
        <span className="text-xs text-muted-foreground">is</span>
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
    <div ref={ref} className="relative" data-ui>
      <button
        type="button"
        onClick={() => hasOptions && setOpen((v) => !v)}
        aria-haspopup={hasOptions ? "listbox" : undefined}
        aria-expanded={hasOptions ? open : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
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
            className="absolute left-0 top-full z-10 mt-2 min-w-40 overflow-hidden rounded-xl border bg-popover"
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
                  "flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs hover:bg-accent",
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
