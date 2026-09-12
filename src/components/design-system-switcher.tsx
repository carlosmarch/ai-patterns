"use client";

import * as React from "react";
import { ChevronDown, Palette } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DEFAULT_DESIGN_SYSTEM,
  DESIGN_SYSTEM_STORAGE_KEY,
  designSystems,
  isDesignSystemId,
  type DesignSystemId,
} from "@/lib/design-systems";

function applyDesignSystem(id: DesignSystemId) {
  document.documentElement.setAttribute("data-design-system", id);
}

function getStoredDesignSystem(): DesignSystemId {
  if (typeof window === "undefined") return DEFAULT_DESIGN_SYSTEM;
  const stored = localStorage.getItem(DESIGN_SYSTEM_STORAGE_KEY);
  return isDesignSystemId(stored) ? stored : DEFAULT_DESIGN_SYSTEM;
}

export function DesignSystemSwitcher({ className }: { className?: string }) {
  // Start from the SSR default so the first client render matches the server
  // markup exactly; a controlled <select>'s value isn't force-synced during
  // the hydration commit itself, so reading localStorage here would leave
  // the dropdown showing the wrong option even though the page repainted
  // correctly (the inline init script in layout.tsx already applied the
  // real design system before hydration). Correct it in an effect instead,
  // which is a normal post-hydration render.
  const [value, setValue] = React.useState<DesignSystemId>(DEFAULT_DESIGN_SYSTEM);

  React.useEffect(() => {
    setValue(getStoredDesignSystem());
  }, []);

  React.useEffect(() => {
    applyDesignSystem(value);
    localStorage.setItem(DESIGN_SYSTEM_STORAGE_KEY, value);
  }, [value]);

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <Palette className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
      <select
        value={value}
        suppressHydrationWarning
        onChange={(event) => setValue(event.target.value as DesignSystemId)}
        aria-label="Design system"
        className="h-8 cursor-pointer appearance-none rounded-full border bg-background py-1 pr-7 pl-8 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {designSystems.map((system) => (
          <option key={system.id} value={system.id}>
            {system.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
    </div>
  );
}
