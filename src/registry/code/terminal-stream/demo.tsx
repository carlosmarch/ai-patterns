"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { TerminalStream, type LogLine, type TerminalStatus } from "./component";

const SCRIPT: Omit<LogLine, "id">[] = [
  { text: "$ npm run build", level: "default" },
  { text: "▲ Next.js 16.3.5 (Turbopack)", level: "info" },
  { text: "Creating an optimized production build ...", level: "default" },
  { text: "✓ Compiled successfully in 8.1s", level: "success" },
  { text: "Running TypeScript ...", level: "default" },
  { text: "warn - unused variable `foo` in demo.tsx", level: "warn" },
  { text: "✓ Finished TypeScript in 2.9s", level: "success" },
  { text: "Generating static pages (18/18)", level: "default" },
  { text: "✓ Build completed", level: "success" },
];

export default function TerminalStreamDemo() {
  const [run, setRun] = React.useState(0);
  const [lines, setLines] = React.useState<LogLine[]>([]);
  const status: TerminalStatus = lines.length >= SCRIPT.length ? "done" : "running";

  React.useEffect(() => {
    if (lines.length >= SCRIPT.length) return;
    const id = window.setTimeout(() => {
      setLines((prev) => [...prev, { ...SCRIPT[prev.length], id: String(prev.length) }]);
    }, 450);
    return () => window.clearTimeout(id);
  }, [lines]);

  return (
    <div className="w-full max-w-md space-y-4">
      <TerminalStream
        key={run}
        command="npm run build"
        lines={lines}
        status={status}
        className="w-full"
      />
      <button
        type="button"
        onClick={() => {
          setLines([]);
          setRun((r) => r + 1);
        }}
        className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
