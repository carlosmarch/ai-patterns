"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: React.ReactNode;
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-white/10 bg-neutral-900 px-6 py-2.5 text-sm font-medium text-neutral-50 shadow-sm dark:bg-neutral-100 dark:text-neutral-900",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ backgroundPositionX: "150%" }}
        animate={{ backgroundPositionX: "-50%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 2.2,
          ease: "linear",
          repeatDelay: 0.8,
        }}
      />
    </motion.button>
  );
}
