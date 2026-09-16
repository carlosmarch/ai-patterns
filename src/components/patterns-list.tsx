"use client";

import { useState } from "react";

import { PatternDrawer } from "@/components/pattern-drawer";
import { registry, type RegistryEntry } from "@/registry";

export function PatternsList() {
  const [selected, setSelected] = useState<RegistryEntry | null>(null);

  const byCategory: Record<string, RegistryEntry[]> = {};
  for (const entry of registry) {
    (byCategory[entry.category] ??= []).push(entry);
  }

  return (
    <>
      <div className="mt-10 space-y-10">
        {Object.entries(byCategory).map(([category, entries]) => (
          <section key={category} id={category} className="scroll-mt-20">
            <h2 className="mb-4 text-lg font-medium capitalize">{category}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <button
                    type="button"
                    onClick={() => setSelected(entry)}
                    className="block w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                  >
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {selected && (
        <PatternDrawer
          entry={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
