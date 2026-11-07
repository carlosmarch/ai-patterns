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
  const [panelTab, setPanelTab] = useState(pattern ? "pattern" : "code");

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

      {/* The same wrappers are kept in both states so the demo isn't remounted on expand. */}
      <div
        role={isExpanded ? "region" : undefined}
        aria-label={isExpanded ? `${title} preview, full width` : undefined}
        className={cn(isExpanded ? "fixed inset-x-0 top-14 bottom-0 z-30 flex bg-background" : "contents")}
      >
        {/* Left side: header with title and pager, above the live preview. */}
        <div className={cn(isExpanded ? "flex min-w-0 flex-1 flex-col" : "contents")}>
          {isExpanded && (
            <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
              <ExpandedPagerLink link={prev} direction="prev" />
              <ExpandedPagerLink link={next} direction="next" />
              {/* Without room for the side panel, Collapse lives here instead. */}
              <CollapseButton onClick={() => setExpanded(false)} className="ml-2 lg:hidden" />
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
        {/* Right side: resizable panel with the guardrails or code. */}
        {isExpanded && (
          <ExpandedSidePanel
            title={title}
            code={code}
            pattern={pattern}
            value={panelTab}
            onValueChange={setPanelTab}
            onCollapse={() => setExpanded(false)}
          />
        )}
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

const PANEL_WIDTH_KEY = "ai-patterns:expanded-panel-width";
const PANEL_DEFAULT_WIDTH = 480;
const PANEL_MIN_WIDTH = 320;
/** Space always left to the preview beside the panel. */
const PREVIEW_MIN_WIDTH = 360;

function clampPanelWidth(width: number) {
  const max = Math.max(PANEL_MIN_WIDTH, window.innerWidth - PREVIEW_MIN_WIDTH);
  return Math.round(Math.min(Math.max(width, PANEL_MIN_WIDTH), max));
}

function readStoredPanelWidth() {
  try {
    const stored = Number(window.localStorage.getItem(PANEL_WIDTH_KEY));
    if (stored > 0) return clampPanelWidth(stored);
  } catch {}
  return clampPanelWidth(PANEL_DEFAULT_WIDTH);
}

function storePanelWidth(width: number) {
  try {
    window.localStorage.setItem(PANEL_WIDTH_KEY, String(width));
  } catch {}
}

/**
 * Side panel of the expanded view: shows the pattern's guardrails next to the
 * live preview, with a switcher in its header to swap in the code instead.
 * Its left edge can be dragged (or moved with the arrow keys) to resize it;
 * the width is remembered across patterns and visits.
 */
function ExpandedSidePanel({
  title,
  code,
  pattern,
  value,
  onValueChange,
  onCollapse,
}: {
  title: string;
  code: ReactNode;
  pattern?: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  onCollapse: () => void;
}) {
  // The panel only renders client-side (after expanding), so storage is safe to read here.
  const [width, setWidth] = useState(readStoredPanelWidth);
  const [dragging, setDragging] = useState(false);

  // Keep the panel within bounds when the window shrinks.
  useEffect(() => {
    function onResize() {
      setWidth((w) => clampPanelWidth(w));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function resizeTo(next: number) {
    const clamped = clampPanelWidth(next);
    setWidth(clamped);
    storePanelWidth(clamped);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setWidth(clampPanelWidth(window.innerWidth - e.clientX));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    storePanelWidth(width);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 64 : 16;
    if (e.key === "ArrowLeft") resizeTo(width + step);
    else if (e.key === "ArrowRight") resizeTo(width - step);
    else if (e.key === "Home") resizeTo(Number.POSITIVE_INFINITY);
    else if (e.key === "End") resizeTo(PANEL_MIN_WIDTH);
    else return;
    e.preventDefault();
  }

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      asChild
      style={{ width }}
      className="relative hidden shrink-0 gap-0 border-l bg-background lg:flex"
    >
      <aside aria-label={`${title} details`}>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
          aria-valuenow={width}
          aria-valuemin={PANEL_MIN_WIDTH}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          className={cn(
            "absolute inset-y-0 -left-1.5 z-10 w-3 cursor-col-resize touch-none outline-none",
            "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:transition-colors",
            "hover:after:w-0.5 hover:after:bg-ring focus-visible:after:w-0.5 focus-visible:after:bg-ring",
            dragging && "after:w-0.5 after:bg-ring"
          )}
        />
        {/* While dragging, cover the page so the demo and text don't eat pointer events or get selected. */}
        {dragging && <div aria-hidden className="fixed inset-0 z-[5] cursor-col-resize select-none" />}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <TabsList>
            {pattern && <TabsTrigger value="pattern">Guardrails</TabsTrigger>}
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <CollapseButton onClick={onCollapse} className="ml-auto" />
        </div>
        {/* The panel scrolls as a whole, so lift the code blocks' own height cap. */}
        <div className="min-h-0 flex-1 overflow-auto p-4 [&_[data-code-scroll]]:max-h-none">
          {pattern && (
            <TabsContent value="pattern" forceMount className="data-[state=inactive]:hidden">
              {pattern}
            </TabsContent>
          )}
          <TabsContent value="code" forceMount className="data-[state=inactive]:hidden">
            {code}
          </TabsContent>
        </div>
      </aside>
    </Tabs>
  );
}

function CollapseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      aria-keyshortcuts="Escape"
      className={className}
    >
      <Minimize2 />
      Collapse
      <kbd className="hidden rounded border bg-background px-1 font-sans text-xs leading-4 font-medium text-muted-foreground sm:inline">
        Esc
      </kbd>
    </Button>
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
