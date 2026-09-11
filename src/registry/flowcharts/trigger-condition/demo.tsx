"use client";

import { IceCreamCone, User } from "lucide-react";

import { Flowchart, type FlowchartNode } from "./component";

const flavorOptions = [
  { label: "Rocky Road", dotColor: "bg-amber-500" },
  { label: "Pistachio", dotColor: "bg-lime-500" },
  { label: "Strawberry", dotColor: "bg-pink-500" },
  { label: "Chocolate", dotColor: "bg-stone-600" },
];

const toppingOptions = [
  { label: "Brown butter bourbon brittle crunch", dotColor: "bg-amber-500" },
  { label: "Rainbow sprinkles", dotColor: "bg-fuchsia-500" },
  { label: "Hot fudge", dotColor: "bg-stone-700" },
  { label: "Toasted coconut", dotColor: "bg-orange-400" },
];

const subjectOptions = [
  { icon: IceCreamCone, label: "order" },
  { icon: User, label: "customer" },
];

const fieldOptions = [{ label: "flavor" }, { label: "topping" }, { label: "size" }];

const nodes: FlowchartNode[] = [
  {
    id: "trigger",
    type: "trigger",
    icon: IceCreamCone,
    title: "New order created",
    description: "Trigger when a new order is created",
  },
  {
    id: "condition",
    type: "condition",
    clauses: [
      {
        id: "flavor",
        connector: "if",
        subject: { icon: IceCreamCone, label: "order", options: subjectOptions },
        field: { label: "flavor", options: fieldOptions },
        value: { label: "Rocky Road", dotColor: "bg-amber-500", options: flavorOptions },
      },
      {
        id: "topping",
        connector: "and",
        subject: { icon: IceCreamCone, label: "order", options: subjectOptions },
        field: { label: "topping", options: fieldOptions },
        value: {
          label: "Brown butter bourbon brittle crunch",
          dotColor: "bg-amber-500",
          options: toppingOptions,
        },
      },
    ],
  },
];

export default function FlowchartDemo() {
  return <Flowchart nodes={nodes} className="w-full max-w-md" />;
}
