"use client";

import { WaitTimeHandoff } from "./component";

export default function WaitTimeHandoffDemo() {
  return <WaitTimeHandoff agentName="Fin" defaultValue={{ amount: 1, unit: "minutes", kind: "workflow" }} />;
}
