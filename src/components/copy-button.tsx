"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackCodeCopied, type CodeCopiedType } from "@/lib/analytics";

export function CopyButton({
  text,
  className,
  trackAs,
}: {
  text: string;
  className?: string;
  /** Override the content type for tracking. Defaults to "component" on pattern pages. */
  trackAs?: CodeCopiedType;
}) {
  const [copied, setCopied] = React.useState(false);
  const pathname = usePathname();

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);

    const patternMatch = pathname?.match(/\/patterns\/([^/]+)\/([^/]+)/);
    if (patternMatch) {
      trackCodeCopied({ type: trackAs ?? "component", category: patternMatch[1], slug: patternMatch[2] });
    } else if (trackAs) {
      trackCodeCopied({ type: trackAs });
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className={cn("size-7", className)}
      onClick={handleCopy}
      aria-label="Copy code"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
