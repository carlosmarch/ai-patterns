"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: string;
  /** Imperative label, e.g. "Run the build". */
  label: string;
  /** Optional present-continuous label shown while the task is in progress, e.g. "Running the build". */
  activeLabel?: string;
  status: TaskStatus;
}

export interface TaskListProps {
  tasks: Task[];
  /** Accessible name for the list. */
  label?: string;
  className?: string;
}

const STATUS_TEXT: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export function TaskList({ tasks, label = "Task list", className }: TaskListProps) {
  const done = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className={cn("w-full rounded-2xl border bg-card px-4 py-3", className)}>
      <ol aria-label={`${label}, ${done} of ${tasks.length} completed`} className="space-y-2.5">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ol>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const completed = task.status === "completed";
  const active = task.status === "in_progress";
  const text = active && task.activeLabel ? task.activeLabel : task.label;

  return (
    <li
      aria-current={active ? "step" : undefined}
      className="flex items-start gap-2.5"
    >
      <span className="relative mt-px flex size-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={task.status}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <StatusIcon status={task.status} />
          </motion.span>
        </AnimatePresence>
        <span className="sr-only">{STATUS_TEXT[task.status]}: </span>
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 text-sm leading-snug transition-colors duration-300",
          completed ? "text-muted-foreground" : "text-foreground",
          active && "font-medium"
        )}
      >
        {text}
      </span>
    </li>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  const reduceMotion = useReducedMotion();

  if (status === "completed") {
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-muted-foreground" aria-hidden>
        <Check className="size-2.5 text-background" strokeWidth={3.5} />
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <motion.svg
        viewBox="0 0 16 16"
        className="size-4 text-foreground"
        fill="none"
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
      >
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity={0.15} strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </motion.svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground/60" fill="none" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
    </svg>
  );
}
