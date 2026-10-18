"use client";

import { ArrowUp, Boxes, Braces, Tag } from "lucide-react";

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
  { id: "resolve", kind: "header", text: "Offer a resolution" },
  {
    id: "policy",
    kind: "condition",
    mode: "code",
    condition: "(order.age_hours ≤ policy.damage_claim_window_hours) and (order.total ≤ policy.auto_approve_limit)",
    then: [
      {
        id: "replacement-update",
        kind: "instruction",
        content: [
          { verb: "Update", label: "Resolution method", icon: ArrowUp },
          ' to be "Replacement" and ',
          { verb: "Tag", label: "Replacement initiated", icon: Tag },
        ],
      },
      {
        id: "replacement-place",
        kind: "instruction",
        content: [
          { verb: "Use", label: "Order replacement", icon: Boxes },
          " and let the customer know a replacement order has been placed and the expected delivery time ",
          { verb: "Read", label: "ETA", icon: Braces },
        ],
      },
    ],
    else: [
      { id: "refund-explain", kind: "instruction", content: ["Explain that a reorder can't be placed due to policy."] },
      {
        id: "refund-update",
        kind: "instruction",
        content: [
          { verb: "Update", label: "Resolution method", icon: ArrowUp },
          ' to be "Refund" and ',
          { verb: "Tag", label: "Refund initiated", icon: Tag },
        ],
      },
      { id: "refund-switch", kind: "action", action: "switch", target: "Order refund procedure" },
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
