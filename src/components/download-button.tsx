"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DownloadButton({
  filename,
  content,
  className,
}: {
  filename: string;
  content: string;
  className?: string;
}) {
  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleDownload} className={className}>
      <Download />
      Download .md
    </Button>
  );
}
