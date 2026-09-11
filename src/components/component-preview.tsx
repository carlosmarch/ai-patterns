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
        className="flex min-h-[280px] items-center justify-center rounded-lg border bg-muted/30 p-10"
      >
        {preview}
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
      {pattern && <TabsContent value="pattern">{pattern}</TabsContent>}
    </Tabs>
  );
}
