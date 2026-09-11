"use client";

import { ThinkingLoader } from "./component";

export default function ThinkingLoaderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <ThinkingLoader label="Thinking" className="w-full" />
    </div>
  );
}
