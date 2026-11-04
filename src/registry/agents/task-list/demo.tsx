"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { TaskList, type Task } from "./component";

const TASKS: Omit<Task, "status">[] = [
  {
    id: "research",
    label: "Research sourced “Seen in” credits for all 50 patterns",
    activeLabel: "Researching sourced “Seen in” credits for all 50 patterns",
  },
  {
    id: "update",
    label: "Change seenIn to sourced entries and widen the product list",
    activeLabel: "Changing seenIn to sourced entries and widening the product list",
  },
  {
    id: "ship",
    label: "Build, verify, commit, push and open PR",
    activeLabel: "Building, verifying, committing, pushing and opening the PR",
  },
];

function initialTasks(): Task[] {
  return TASKS.map((task, i) => ({ ...task, status: i === 0 ? "in_progress" : "pending" }));
}

export default function TaskListDemo() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const finished = tasks.every((task) => task.status === "completed");

  React.useEffect(() => {
    const activeIndex = tasks.findIndex((task) => task.status === "in_progress");
    if (activeIndex === -1) return;

    const id = window.setTimeout(
      () => {
        setTasks((prev) =>
          prev.map((task, i) => {
            if (i === activeIndex) return { ...task, status: "completed" };
            if (i === activeIndex + 1) return { ...task, status: "in_progress" };
            return task;
          })
        );
      },
      1800 + Math.random() * 800
    );

    return () => window.clearTimeout(id);
  }, [tasks]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <TaskList tasks={tasks} label="Agent plan" />
      <button
        type="button"
        onClick={() => setTasks(initialTasks())}
        className={
          finished
            ? "flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            : "invisible flex items-center gap-1.5 text-xs"
        }
        aria-hidden={!finished}
        tabIndex={finished ? 0 : -1}
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
