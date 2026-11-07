"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ConnectPanel = { value: string; label: string; content: ReactNode };

// Client shell for the home page's "Use it from your agent" tabs; the panel
// contents are rendered (and highlighted) on the server.
export function ConnectTabs({ panels }: { panels: ConnectPanel[] }) {
  return (
    <Tabs defaultValue={panels[0]?.value} className="gap-6">
      <TabsList className="w-full sm:w-fit">
        {panels.map((p) => (
          <TabsTrigger key={p.value} value={p.value} className="px-3">
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((p) => (
        <TabsContent key={p.value} value={p.value}>
          {p.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
