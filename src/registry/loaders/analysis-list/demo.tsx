"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { AnalysisList, type AnalysisItem } from "./component";

const RESULTS: Omit<AnalysisItem, "status">[] = [
  { id: "1", title: "components/StopButton.tsx", info: "Matches Stop Generation Button" },
  { id: "2", title: "components/ToolBadge.tsx", info: "Matches Tool Call Chip" },
  { id: "3", title: "components/ChatMessage.tsx", info: "Matches Chat Bubble" },
  { id: "4", title: "components/UploadTray.tsx", info: "Matches Attachment Chip" },
  { id: "5", title: "components/CommandMenu.tsx", info: "Matches Command Palette" },
];

function initialItems(): AnalysisItem[] {
  return RESULTS.map((result, i) => ({ ...result, status: i === 0 ? "loading" : "pending" }));
}

export default function AnalysisListDemo() {
  const [items, setItems] = React.useState<AnalysisItem[]>(initialItems);
  const analyzing = items.some((item) => item.status !== "done");

  React.useEffect(() => {
    const loadingIndex = items.findIndex((item) => item.status === "loading");
    if (loadingIndex === -1) return;

    const id = window.setTimeout(
      () => {
        setItems((prev) =>
          prev.map((item, i) => {
            if (i === loadingIndex) return { ...item, status: "done" };
            if (i === loadingIndex + 1) return { ...item, status: "loading" };
            return item;
          })
        );
      },
      850 + Math.random() * 500
    );

    return () => window.clearTimeout(id);
  }, [items]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <AnalysisList items={items} analyzing={analyzing} className="w-full" />
      {!analyzing && (
        <button
          type="button"
          onClick={() => setItems(initialItems())}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Replay
        </button>
      )}
    </div>
  );
}
