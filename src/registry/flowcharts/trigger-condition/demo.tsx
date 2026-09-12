"use client";

import { GitBranch } from "lucide-react";

import { Flowchart, type FlowchartNode } from "./component";

const filesOptions = [
  { id: "gt10", label: "> 10", dotColor: "bg-amber-500" },
  { id: "gt50", label: "> 50", dotColor: "bg-red-500" },
  { id: "gt100", label: "> 100", dotColor: "bg-red-700" },
];

const categoryOptions = [
  { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
  { id: "skill", label: "plugins/ai-patterns/**", dotColor: "bg-violet-500" },
  { id: "app", label: "src/app/**", dotColor: "bg-emerald-500" },
];

const fieldOptions = [
  { id: "files", label: "files changed" },
  { id: "path", label: "path" },
  { id: "author", label: "author" },
];

const nodes: FlowchartNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    icon: GitBranch,
    title: "New pull request opened",
    description: "Trigger when a PR is opened against main",
  },
  {
    id: "condition-1",
    type: "condition",
    clauses: [
      {
        id: "clause-1",
        connector: "if",
        subject: { id: "pr", icon: GitBranch, label: "PR" },
        field: { id: "files", label: "files changed" },
        fieldOptions,
        value: { id: "gt10", label: "> 10", dotColor: "bg-amber-500" },
        valueOptions: filesOptions,
      },
      {
        id: "clause-2",
        connector: "and",
        subject: { id: "pr-2", icon: GitBranch, label: "PR" },
        field: { id: "path", label: "path" },
        fieldOptions,
        value: { id: "registry", label: "src/registry/**", dotColor: "bg-blue-500" },
        valueOptions: categoryOptions,
      },
    ],
  },
];

export default function FlowchartDemo() {
  return <Flowchart nodes={nodes} className="w-full max-w-md" />;
}
