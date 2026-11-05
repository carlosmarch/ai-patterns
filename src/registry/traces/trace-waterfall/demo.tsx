"use client";

import { TraceWaterfall, type TraceSpan } from "./component";

const SPANS: TraceSpan[] = [
  { id: "plan", kind: "model", name: "claude", detail: "plan", start: 0, duration: 2800 },
  { id: "read-cart", kind: "tool", name: "read_file", detail: "src/checkout/cart.ts", start: 2900, duration: 340 },
  { id: "grep", kind: "tool", name: "grep", detail: "roundTotal", start: 2950, duration: 520 },
  { id: "read-test", kind: "tool", name: "read_file", detail: "cart.test.ts", start: 3000, duration: 260 },
  { id: "edit-plan", kind: "model", name: "claude", detail: "write fix", start: 3600, duration: 2500 },
  { id: "edit", kind: "tool", name: "edit_file", detail: "src/checkout/cart.ts", start: 6200, duration: 310 },
  { id: "approval", kind: "wait", name: "Awaiting approval", detail: "npm test", start: 6600, duration: 41_400 },
  { id: "test", kind: "tool", name: "bash", detail: "npm test -- cart", start: 48_100, duration: 13_200 },
  { id: "review", kind: "model", name: "claude", detail: "read results", start: 61_400, duration: 2500 },
  { id: "backoff", kind: "wait", name: "Rate limit", detail: "backoff", start: 64_000, duration: 8000 },
  { id: "push", kind: "tool", name: "bash", detail: "git push", start: 72_100, duration: 1900, status: "error" },
  { id: "push-retry", kind: "tool", name: "bash", detail: "git push --retry", start: 74_100, duration: 1400 },
];

export default function TraceWaterfallDemo() {
  return (
    <div className="w-full max-w-2xl">
      <TraceWaterfall title="Fix flaky checkout test" spans={SPANS} />
    </div>
  );
}
