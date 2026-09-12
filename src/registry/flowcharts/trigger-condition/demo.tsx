"use client";

import { IceCreamCone } from "lucide-react";

import { Flowchart, type FlowchartNode } from "./component";

const flavorOptions = [
  { id: "rocky-road", label: "Rocky Road", dotColor: "bg-amber-500" },
  { id: "mint-chip", label: "Mint Chip", dotColor: "bg-emerald-500" },
  { id: "vanilla-bean", label: "Vanilla Bean", dotColor: "bg-slate-300" },
];

const toppingOptions = [
  { id: "brown-butter-brittle", label: "Brown butter bourbon brittle crunch", dotColor: "bg-amber-500" },
  { id: "hot-fudge", label: "Hot fudge", dotColor: "bg-orange-700" },
  { id: "sprinkles", label: "Sprinkles", dotColor: "bg-pink-500" },
];

const fieldOptions = [
  { id: "flavor", label: "flavor" },
  { id: "topping", label: "topping" },
  { id: "size", label: "size" },
];

const nodes: FlowchartNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    icon: IceCreamCone,
    title: "New order created",
    description: "Trigger when a new order is created",
  },
  {
    id: "condition-1",
    type: "condition",
    clauses: [
      {
        id: "clause-1",
        connector: "if",
        subject: { id: "order", icon: IceCreamCone, label: "order" },
        field: { id: "flavor", label: "flavor" },
        fieldOptions,
        value: { id: "rocky-road", label: "Rocky Road", dotColor: "bg-amber-500" },
        valueOptions: flavorOptions,
      },
      {
        id: "clause-2",
        connector: "and",
        subject: { id: "order-2", icon: IceCreamCone, label: "order" },
        field: { id: "topping", label: "topping" },
        fieldOptions,
        value: {
          id: "brown-butter-brittle",
          label: "Brown butter bourbon brittle crunch",
          dotColor: "bg-amber-500",
        },
        valueOptions: toppingOptions,
      },
    ],
  },
];

export default function FlowchartDemo() {
  return <Flowchart nodes={nodes} className="w-full max-w-md" />;
}
