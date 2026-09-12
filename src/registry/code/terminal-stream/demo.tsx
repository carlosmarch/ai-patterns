"use client";

import * as React from "react";

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
    <TerminalStream command="npm run build" lines={lines} status={status} className="w-full max-w-md" />
  );
}
