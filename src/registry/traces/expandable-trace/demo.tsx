import { ExpandableTrace, type TraceStep } from "./component";

const steps: TraceStep[] = [
  { label: "Reading flavor briefs" },
  { label: "Scanning supplier lists" },
  { label: "Comparing tasting notes", meta: "6 flavors" },
  { label: "Writing the scoop report" },
];

export default function ExpandableTraceDemo() {
  return (
    <ExpandableTrace durationSeconds={4} steps={steps} defaultOpen className="w-full max-w-sm" />
  );
}
