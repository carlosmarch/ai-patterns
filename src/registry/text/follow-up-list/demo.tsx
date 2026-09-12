"use client";

import * as React from "react";

import { FollowUpList } from "./component";

const SUGGESTIONS = [
  "Show me every pattern in the composer category",
  "How do I install the ai-patterns skill?",
  "What's the difference between Prompt Bar and Prompt Bar Pro?",
  "Walk me through adding a new pattern to the registry",
  "Which pattern fits a multi-step agent trace?",
];

export default function FollowUpListDemo() {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-md">
      <FollowUpList suggestions={SUGGESTIONS} onSelect={setSelected} />
      {selected && (
        <p className="mt-3 text-xs text-muted-foreground">Selected: &ldquo;{selected}&rdquo;</p>
      )}
    </div>
  );
}
