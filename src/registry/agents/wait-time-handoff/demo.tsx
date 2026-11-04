"use client";

import { WaitTimeHandoff } from "./component";

export default function WaitTimeHandoffDemo() {
  return <WaitTimeHandoff agentName="AI-Patterns" defaultValue={{ amount: 2, unit: "hours", kind: "workflow" }} />;
}
