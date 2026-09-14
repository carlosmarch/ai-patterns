"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackTabChanged } from "@/lib/analytics";

export function ComponentPreview({
  preview,
  code,
  pattern,
}: {
  preview: ReactNode;
  code: ReactNode;
  pattern?: ReactNode;
}) {
  const pathname = usePathname();

  function handleTabChange(tab: string) {
    const match = pathname?.match(/\/patterns\/([^/]+)\/([^/]+)/);
    if (match) {
      trackTabChanged({ tab, category: match[1], slug: match[2] });
    }
  }

  return (
    <Tabs defaultValue="preview" onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        {pattern && <TabsTrigger value="pattern">Guardrails</TabsTrigger>}
      </TabsList>
      <TabsContent
        value="preview"
        forceMount
        className="flex min-h-[280px] items-center justify-center rounded-lg border bg-muted/30 p-10 data-[state=inactive]:hidden"
      >
        {preview}
      </TabsContent>
      <TabsContent value="code" forceMount className="data-[state=inactive]:hidden">
        {code}
      </TabsContent>
      {pattern && (
        <TabsContent value="pattern" forceMount className="data-[state=inactive]:hidden">
          {pattern}
        </TabsContent>
      )}
    </Tabs>
  );
}
