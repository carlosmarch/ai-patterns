import { DiffSummaryCard, type DiffFile } from "./component";

const files: DiffFile[] = [
  { id: "1", name: "src/app/components/[category]/[slug]/page.tsx", additions: 20, deletions: 1 },
  { id: "2", name: "src/app/page.tsx", additions: 36, deletions: 14 },
  { id: "3", name: "src/components/code-block.tsx", additions: 15, deletions: 2 },
  { id: "4", name: "src/components/component-preview.tsx", additions: 4, deletions: 0 },
  { id: "5", name: "src/components/download-button.tsx", additions: 34, deletions: 0 },
  { id: "6", name: "src/registry/buttons/shiny-button/pattern.ts", additions: 36, deletions: 0 },
  { id: "7", name: "src/registry/composer/prompt-bar/pattern.ts", additions: 40, deletions: 0 },
  { id: "8", name: "src/registry/index.ts", additions: 12, deletions: 0 },
  { id: "9", name: "src/registry/loaders/thinking-loader/pattern.ts", additions: 37, deletions: 0 },
  { id: "10", name: "src/registry/text/streaming-text/pattern.ts", additions: 40, deletions: 0 },
  { id: "11", name: "src/registry/traces/expandable-trace/pattern.ts", additions: 37, deletions: 0 },
];

export default function DiffSummaryCardDemo() {
  return <DiffSummaryCard files={files} className="max-w-md" />;
}
