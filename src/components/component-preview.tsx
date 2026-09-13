"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ComponentPreview({
  preview,
  code,
  pattern,
}: {
  preview: ReactNode;
  code: ReactNode;
  pattern?: ReactNode;
}) {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        {pattern && <TabsTrigger value="pattern">Pattern</TabsTrigger>}
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
