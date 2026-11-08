"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { PublishGate, type PublishCheck, type PublishGateStage } from "./component";

const INITIAL: PublishCheck[] = [
  { id: "secrets", label: "No secrets in app files", source: "rule", status: "pending" },
  { id: "auth", label: "Every page requires sign-in", source: "rule", status: "pending" },
  { id: "deps", label: "Dependencies have no known vulnerabilities", source: "rule", status: "pending" },
  { id: "review", label: "Security review of data access", source: "agent", status: "pending" },
];

// The scripted run: the secrets rule fails until the agent fixes it.
const FAILS: Record<string, string> = {
  secrets: "An API key is written in config.ts, line 4. It would be visible to anyone who opens the app.",
};

export default function PublishGateDemo() {
  const [checks, setChecks] = React.useState(INITIAL);
  const [stage, setStage] = React.useState<PublishGateStage>("checking");
  const [run, setRun] = React.useState(0);
  const fixed = React.useRef(new Set<string>());

  // Run the checks one after another.
  React.useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    INITIAL.forEach((c, i) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setChecks((prev) => prev.map((p) => (p.id === c.id ? { ...p, status: "running" } : p)));
        }, 400 + i * 900),
        window.setTimeout(() => {
          if (cancelled) return;
          const fail = FAILS[c.id] && !fixed.current.has(c.id);
          setChecks((prev) =>
            prev.map((p) =>
              p.id === c.id ? { ...p, status: fail ? "failed" : "passed", detail: fail ? FAILS[c.id] : undefined } : p
            )
          );
          if (i === INITIAL.length - 1) {
            const anyFailed = Object.keys(FAILS).some((id) => !fixed.current.has(id));
            setStage(anyFailed ? "blocked" : "ready");
          }
        }, 1100 + i * 900)
      );
    });
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [run]);

  function fix(id: string) {
    setChecks((prev) => prev.map((p) => (p.id === id ? { ...p, fixing: true } : p)));
    window.setTimeout(() => {
      fixed.current.add(id);
      // After a fix, the checks run again from the top.
      setChecks(INITIAL);
      setStage("checking");
      setRun((r) => r + 1);
    }, 1800);
  }

  function reset() {
    fixed.current.clear();
    setChecks(INITIAL);
    setStage("checking");
    setRun((r) => r + 1);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <PublishGate
        target="pricing-calculator.acme.app"
        audience="Only people at Acme"
        checks={checks}
        stage={stage}
        onFix={fix}
        onPublish={() => {
          setStage("publishing");
          window.setTimeout(() => setStage("published"), 1200);
        }}
      />
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" aria-hidden />
        Run again
      </button>
    </div>
  );
}
