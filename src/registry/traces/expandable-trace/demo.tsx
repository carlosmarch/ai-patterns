import { ExpandableTrace, type TraceStep } from "./component";

const steps: TraceStep[] = [
  { label: "Reading the component's UX doc" },
  { label: "Comparing it against similar patterns" },
  { label: "Checking accessibility notes", meta: "keyboard + reduced motion" },
  { label: "Scaffolding the component" },
];

export default function ExpandableTraceDemo() {
  return (
    <ExpandableTrace durationSeconds={4} steps={steps} defaultOpen className="w-full max-w-sm" />
  );
}
