"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type ConfidenceLevel = "high" | "medium" | "low";

const LEVEL_CONFIG: Record<
  ConfidenceLevel,
  { label: string; bars: number; barColor: string; dotColor: string }
> = {
  high: {
    label: "High confidence",
    bars: 3,
    barColor: "text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  medium: {
    label: "Medium confidence",
    bars: 2,
    barColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  low: {
    label: "Low confidence",
    bars: 1,
    barColor: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

export interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  /** Overrides the default "High/Medium/Low confidence" label. */
  label?: string;
  /** One short, specific sentence explaining the level. Shown in an expandable disclosure (badge variant) or as the tooltip/accessible name (dot variant). */
  reason?: string;
  /** A calibrated 0-100 score to display alongside the band. Only pass this if the number is real — see pattern content guidelines. */
  percentage?: number;
  /** "badge" (default) for a standalone claim/response; "dot" for inline placement next to a word or value. */
  variant?: "badge" | "dot";
  className?: string;
}

export function ConfidenceIndicator({
  level,
  label,
  reason,
  percentage,
  variant = "badge",
  className,
}: ConfidenceIndicatorProps) {
  const config = LEVEL_CONFIG[level];
  const text = label ?? config.label;

  if (variant === "dot") {
    return <ConfidenceDot level={level} text={text} reason={reason} className={className} />;
  }

  return (
    <ConfidenceBadge
      level={level}
      text={text}
      reason={reason}
      percentage={percentage}
      className={className}
    />
  );
}

function ConfidenceBadge({
  level,
  text,
  reason,
  percentage,
  className,
}: {
  level: ConfidenceLevel;
  text: string;
  reason?: string;
  percentage?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const config = LEVEL_CONFIG[level];
  const canExpand = Boolean(reason);

  return (
    <div className={cn("inline-flex max-w-full flex-col items-start", className)}>
      <button
        type="button"
        onClick={() => canExpand && setExpanded((v) => !v)}
        aria-expanded={canExpand ? expanded : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors",
          canExpand ? "cursor-pointer hover:bg-accent" : "cursor-default"
        )}
      >
        <SignalBars level={level} className={config.barColor} />
        <span>{text}</span>
        {typeof percentage === "number" && (
          <span className="text-muted-foreground">· {Math.round(percentage)}%</span>
        )}
        {canExpand && (
          <ChevronDown
            className={cn("size-3 text-muted-foreground transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {canExpand && expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden pl-1 pt-1.5 text-xs text-muted-foreground"
          >
            {reason}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfidenceDot({
  level,
  text,
  reason,
  className,
}: {
  level: ConfidenceLevel;
  text: string;
  reason?: string;
  className?: string;
}) {
  const config = LEVEL_CONFIG[level];
  const accessibleName = reason ? `${text}: ${reason}` : text;

  return (
    <span
      role="img"
      aria-label={accessibleName}
      title={accessibleName}
      className={cn("inline-flex size-2 shrink-0 translate-y-[-1px] rounded-full", config.dotColor, className)}
    />
  );
}

function SignalBars({ level, className }: { level: ConfidenceLevel; className?: string }) {
  const filled = LEVEL_CONFIG[level].bars;
  const heights = [5, 8, 11];

  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {heights.map((height, i) => (
        <span
          key={height}
          style={{ height }}
          className={cn("w-1 rounded-sm", i < filled ? cn("bg-current", className) : "bg-muted-foreground/25")}
        />
      ))}
    </span>
  );
}
