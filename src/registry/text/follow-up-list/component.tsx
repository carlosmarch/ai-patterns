"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CornerDownRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FollowUpListProps {
  suggestions: string[];
  onSelect?: (suggestion: string) => void;
  className?: string;
}

export function FollowUpList({ suggestions, onSelect, className }: FollowUpListProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul className={cn("flex w-full max-w-md flex-col", className)}>
      {suggestions.map((suggestion, i) => (
        <motion.li
          key={suggestion}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
        >
          <button
            type="button"
            onClick={() => onSelect?.(suggestion)}
            className="group flex w-full items-center gap-2.5 border-b py-3 text-left last:border-b-0"
          >
            <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="flex-1 text-sm text-foreground/90 transition-colors group-hover:text-foreground">
              {suggestion}
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
