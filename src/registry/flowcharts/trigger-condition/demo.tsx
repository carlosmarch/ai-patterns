"use client";

import { IceCreamCone } from "lucide-react";

import { Flowchart, type FlowchartNode } from "./component";

const nodes: FlowchartNode[] = [
  {
    type: "trigger",
    icon: IceCreamCone,
    title: "New order created",
    description: "Trigger when a new order is created",
  },
  {
    type: "condition",
    clauses: [
      {
        connector: "if",
        subject: { icon: IceCreamCone, label: "order" },
        field: { label: "flavor" },
        value: { label: "Rocky Road", dotColor: "bg-amber-500" },
      },
      {
        connector: "and",
        subject: { icon: IceCreamCone, label: "order" },
        field: { label: "topping" },
        value: { label: "Brown butter bourbon brittle crunch", dotColor: "bg-amber-500" },
      },
    ],
  },
];

export default function FlowchartDemo() {
  return <Flowchart nodes={nodes} className="w-full max-w-md" />;
}
