"use client";

import * as React from "react";
import { ListChecks, RotateCcw } from "lucide-react";

import { BackgroundTasksDrawer, type BackgroundTask } from "./component";

const AGENT_ACTIVITY = [
  "Reading the registry",
  "Running a command",
  "Editing component.tsx",
  "Running lint",
  "Writing pattern spec",
];

function makeInitial(): BackgroundTask[] {
  return [
    {
      id: "cleanup",
      title: "Design system phase 1 cleanup",
      kind: "agent",
      kindLabel: "Agent",
      status: "running",
      elapsedSeconds: 52,
      activity: AGENT_ACTIVITY[0],
      stats: ["Opus", "48.1k tokens", "5 tool uses"],
    },
    {
      id: "build",
      title: "Baseline build on origin/main",
      kind: "shell",
      kindLabel: "Bash",
      status: "running",
      elapsedSeconds: 27,
      activity: "Compiling",
      command: "npm run build",
      output: "▲ Next.js 16.3.5 (Turbopack)\n✓ Compiled successfully in 8.1s\n✓ Finished TypeScript in 2.9s\n✓ Generating static pages (52/52)",
    },
    {
      id: "install",
      title: "Install dependencies",
      kind: "shell",
      kindLabel: "Bash",
      status: "done",
      elapsedSeconds: 7,
      command: "npm install",
      output: "added 443 packages, and audited 444 packages in 7s\n\n179 packages are looking for funding",
    },
    {
      id: "check",
      title: "Check node, deps, playwright",
      kind: "shell",
      kindLabel: "Bash",
      status: "done",
      elapsedSeconds: 5,
      command: "node -v; ls node_modules | head -3; ls /opt/pw-browsers",
      output: "v20.19.2\n@alloc\n@babel\n@emnapi\nchromium-1194",
    },
  ];
}

function tick(tasks: BackgroundTask[]): BackgroundTask[] {
  return tasks.map((task) => {
    if (task.status !== "running") return task;
    const elapsedSeconds = task.elapsedSeconds + 1;

    if (task.id === "build") {
      return elapsedSeconds >= 34
        ? { ...task, elapsedSeconds, status: "done", activity: undefined }
        : { ...task, elapsedSeconds, activity: elapsedSeconds > 30 ? "Generating static pages" : "Compiling" };
    }

    const step = Math.floor((elapsedSeconds - 52) / 3);
    const tokens = (48.1 + (elapsedSeconds - 52) * 0.8).toFixed(1);
    return {
      ...task,
      elapsedSeconds,
      activity: AGENT_ACTIVITY[step % AGENT_ACTIVITY.length],
      stats: ["Opus", `${tokens}k tokens`, `${5 + step} tool uses`],
    };
  });
}

export default function BackgroundTasksDemo() {
  const [tasks, setTasks] = React.useState<BackgroundTask[]>(makeInitial);
  const [open, setOpen] = React.useState(true);
  const runningCount = tasks.filter((t) => t.status === "running").length;

  React.useEffect(() => {
    if (runningCount === 0) return;
    const id = window.setInterval(() => setTasks((prev) => tick(prev)), 1000);
    return () => window.clearInterval(id);
  }, [runningCount]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="relative flex h-[520px] w-full overflow-hidden rounded-2xl border bg-muted/30">
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="h-3 w-40 rounded-full bg-muted" />
          <div className="h-3 w-64 rounded-full bg-muted" />
          <div className="h-3 w-52 rounded-full bg-muted" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-auto flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <ListChecks className="size-3.5" />
            {runningCount > 0 ? `${runningCount} running` : "Tasks"}
            {runningCount > 0 && <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />}
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full justify-end">
          <BackgroundTasksDrawer
            open={open}
            onClose={() => setOpen(false)}
            tasks={tasks}
            onStop={(id) =>
              setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: "stopped", activity: undefined } : t))
              )
            }
            onClearFinished={() => setTasks((prev) => prev.filter((t) => t.status === "running"))}
            onViewTranscript={(id) => console.log("view transcript", id)}
            className="pointer-events-auto"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          setTasks(makeInitial());
          setOpen(true);
        }}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
