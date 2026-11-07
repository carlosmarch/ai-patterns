"use client";

import { Download } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackSpecDownloaded } from "@/lib/analytics";

export function DownloadButton({
  filename,
  content,
  className,
  iconOnly = false,
  trackSpec = filename.endsWith(".md"),
}: {
  filename: string;
  content: string;
  className?: string;
  /** Compact icon button, as used inside code blocks next to Copy. */
  iconOnly?: boolean;
  /** Report the download as a spec download in analytics. */
  trackSpec?: boolean;
}) {
  const pathname = usePathname();

  function handleDownload() {
    const type = filename.endsWith(".md") ? "text/markdown" : "text/plain";
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const match = pathname?.match(/\/patterns\/([^/]+)\/([^/]+)/);
    if (trackSpec && match) {
      trackSpecDownloaded({ category: match[1], slug: match[2] });
    }
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={handleDownload}
        aria-label={`Download ${filename}`}
        title={`Download ${filename}`}
        className={cn("size-7", className)}
      >
        <Download className="size-3.5" />
      </Button>
    );
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleDownload} className={className}>
      <Download />
      Download .md
    </Button>
  );
}
