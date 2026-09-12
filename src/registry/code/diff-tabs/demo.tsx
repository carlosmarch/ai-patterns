import { DiffTabs, type DiffTabFile } from "./component";

const files: DiffTabFile[] = [
  {
    id: "component",
    name: "thinking-loader/component.tsx",
    additions: 4,
    deletions: 1,
    lines: [
      { type: "context", content: "  return (" },
      { type: "remove", content: "    <div className=\"flex items-center gap-3 rounded-xl border\">" },
      { type: "add", content: "    <div" },
      { type: "add", content: "      aria-live=\"polite\"" },
      { type: "add", content: "      className=\"flex items-center gap-3 rounded-xl border\"" },
      { type: "add", content: "    >" },
    ],
  },
  {
    id: "pattern",
    name: "thinking-loader/pattern.ts",
    additions: 1,
    deletions: 1,
    lines: [
      { type: "context", content: "## Accessibility" },
      {
        type: "remove",
        content: "- The elapsed-time counter is decorative; screen readers don't need every digit.",
      },
      {
        type: "add",
        content: "- Wrap in an aria-live=\"polite\" region so label changes are announced without interrupting.",
      },
    ],
  },
];

export default function DiffTabsDemo() {
  return <DiffTabs files={files} className="max-w-md" />;
}
