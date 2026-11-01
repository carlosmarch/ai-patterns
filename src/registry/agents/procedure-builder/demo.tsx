"use client";

import { Braces, Tag } from "lucide-react";

import { ProcedureBuilder, type ProcedureStep } from "./component";

const steps: ProcedureStep[] = [
  { id: "verify", kind: "header", text: "Verify the claim" },
  {
    id: "ask-photo",
    kind: "instruction",
    content: [
      "Ask the customer for a photo of the damaged or missing item and check it against ",
      { verb: "Read", label: "Order details", icon: Braces },
      ".",
    ],
  },
  {
    id: "evidence",
    kind: "condition",
    mode: "text",
    condition:
      "Evidence looks sufficient: e.g., the image clearly shows spilled or leaking packaging (sauce, soup, drinks, oil, stains) or it shows an item missing from what was ordered.",
    then: [
      {
        id: "evidence-ok",
        kind: "instruction",
        content: ["Thank the customer and ", { verb: "Tag", label: "Evidence verified", icon: Tag }],
      },
    ],
    else: [
      { id: "evidence-ask", kind: "instruction", content: ["Ask once more for a clearer photo of the item and its packaging."] },
      { id: "evidence-escalate", kind: "action", action: "escalate", target: "Claims team" },
    ],
  },
];

const targets = {
  escalate: ["Claims team", "Tier 2 support", "On-call manager"],
  switch: ["Order refund procedure", "Missing delivery procedure", "Address change procedure"],
  workflow: ["Issue store credit", "Create courier ticket", "Send satisfaction survey"],
};

export default function ProcedureBuilderDemo() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border bg-background px-4 py-6 shadow-sm sm:px-6">
      <ProcedureBuilder initialSteps={steps} targets={targets} />
    </div>
  );
}
