import { DiffTabs, type DiffTabFile } from "./component";

const files: DiffTabFile[] = [
  {
    id: "flavors",
    name: "flavors.css",
    additions: 13,
    deletions: 0,
    lines: [
      { type: "context", content: ".scoop-card {" },
      { type: "remove", content: "  gap: 14px;" },
      { type: "add", content: "  gap: 12px;" },
      { type: "add", content: "  container-type: inline-size;" },
      { type: "context", content: "}" },
    ],
  },
  {
    id: "churn-schedule",
    name: "ChurnSchedule.tsx",
    additions: 74,
    deletions: 41,
    lines: [
      { type: "context", content: "export function ChurnSchedule({ flavors }: ChurnScheduleProps) {" },
      { type: "remove", content: "  const sorted = flavors.sort((a, b) => a.churnRate - b.churnRate);" },
      { type: "add", content: "  const sorted = [...flavors].sort((a, b) => a.churnRate - b.churnRate);" },
      { type: "add", content: "  const [selected, setSelected] = useState<string | null>(null);" },
      { type: "context", content: "" },
      { type: "context", content: "  return (" },
      { type: "remove", content: "    <ul>" },
      { type: "add", content: "    <ul className=\"scoop-card\">" },
    ],
  },
];

export default function DiffTabsDemo() {
  return <DiffTabs files={files} className="max-w-md" />;
}
