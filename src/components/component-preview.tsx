"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

import { usePatternExpand } from "@/components/pattern-expand";
import type { PagerLink } from "@/components/pattern-pager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackTabChanged } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ComponentPreview({
  title,
  preview,
  code,
  pattern,
  prev,
  next,
}: {
  title: string;
  preview: ReactNode;
  code: ReactNode;
  pattern?: ReactNode;
  prev?: PagerLink;
  next?: PagerLink;
}) {
  const pathname = usePathname();
  const { expanded, setExpanded } = usePatternExpand();
  const [tab, setTab] = useState("preview");

  function handleTabChange(value: string) {
    setTab(value);
    const match = pathname?.match(/\/patterns\/([^/]+)\/([^/]+)/);
    if (match) {
      trackTabChanged({ tab: value, category: match[1], slug: match[2] });
    }
  }

  function expand() {
    if (tab !== "preview") handleTabChange("preview");
    setExpanded(true);
  }

  // Esc leaves the expanded view.
  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented) setExpanded(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded, setExpanded]);

  const isExpanded = expanded && tab === "preview";

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <div className="flex items-center justify-between gap-4">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          {pattern && <TabsTrigger value="pattern">Guardrails</TabsTrigger>}
        </TabsList>
        <Button type="button" variant="ghost" size="sm" onClick={expand} aria-label="Expand preview to full width">
          <Maximize2 />
          Expand
        </Button>
      </div>

      {/* The same wrapper is kept in both states so the demo isn't remounted on expand. */}
      <div
        role={isExpanded ? "region" : undefined}
        aria-label={isExpanded ? `${title} preview, full width` : undefined}
        className={cn(isExpanded ? "fixed inset-x-0 top-14 bottom-0 z-30 flex flex-col bg-background" : "contents")}
      >
        {isExpanded && (
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
            <ExpandedPagerLink link={prev} direction="prev" />
            <ExpandedPagerLink link={next} direction="next" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setExpanded(false)}
              aria-keyshortcuts="Escape"
              className="ml-2"
            >
              <Minimize2 />
              Collapse
              <kbd className="hidden rounded border bg-background px-1 font-sans text-xs leading-4 font-medium text-muted-foreground sm:inline">
                Esc
              </kbd>
            </Button>
          </div>
        )}
        <TabsContent
          value="preview"
          forceMount
          className={cn(
            "flex items-center justify-center bg-muted/30 p-10 data-[state=inactive]:hidden",
            isExpanded ? "min-h-0 flex-1 overflow-auto" : "min-h-[280px] rounded-lg border"
          )}
        >
          {preview}
        </TabsContent>
      </div>

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

function ExpandedPagerLink({ link, direction }: { link?: PagerLink; direction: "prev" | "next" }) {
  const isNext = direction === "next";
  const Icon = isNext ? ChevronRight : ChevronLeft;
  const label = isNext ? "Next" : "Previous";

  if (!link) {
    return (
      <Button type="button" variant="ghost" size="sm" disabled aria-label={label}>
        <Icon />
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="sm">
      <Link
        href={link.href}
        rel={direction}
        aria-label={`${label}: ${link.title}`}
        aria-keyshortcuts={isNext ? "ArrowRight" : "ArrowLeft"}
        title={`${label}: ${link.title}`}
      >
        {!isNext && <Icon />}
        <span className="hidden max-w-40 truncate md:inline">{link.title}</span>
        {isNext && <Icon />}
      </Link>
    </Button>
  );
}
