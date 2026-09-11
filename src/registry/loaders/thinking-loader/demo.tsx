"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { ThinkingLoader, type ThinkingLoaderVariant } from "./component";

const variants: { value: ThinkingLoaderVariant; label: string }[] = [
  { value: "drive", label: "Drive" },
  { value: "dots", label: "Dots" },
  { value: "orbit", label: "Orbit" },
  { value: "surfer", label: "Surfer" },
];

export default function ThinkingLoaderDemo() {
  const [variant, setVariant] = React.useState<ThinkingLoaderVariant>("drive");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <ThinkingLoader key={variant} label="Churning" variant={variant} className="w-full" />
      <div className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1">
        {variants.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setVariant(v.value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-colors",
              variant === v.value
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
