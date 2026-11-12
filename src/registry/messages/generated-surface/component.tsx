"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ChevronLeft, ChevronRight, Sparkles, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SurfaceSource {
  label: string;
  href: string;
}

export interface GeneratedSurfaceProps {
  /** Names the thing that was built, e.g. "Wait-time pattern picker". */
  title: string;
  /**
   * The generated HTML document (or body fragment). While `building`, pass
   * the partial page at section boundaries — every change reloads the frame.
   */
  html?: string;
  /** The model is still writing this version. */
  building?: boolean;
  /** What the build is doing right now, e.g. "Wiring interactions". */
  step?: string;
  /** The same answer as plain content, for the Text view and as the fallback when the view breaks. */
  text: React.ReactNode;
  /** Zero-based index of the version on show, and how many exist. */
  version?: number;
  versionCount?: number;
  onVersionChange?: (index: number) => void;
  /** Ask the model to repair the runtime errors the frame reported. Omit to hide "Fix it". */
  onFix?: (issues: string[]) => void;
  /** What the view was built from. Shown in the footer. */
  sources?: SurfaceSource[];
  /** Upper bound for the auto-sized frame, in px. Taller pages scroll inside it. */
  maxHeight?: number;
  className?: string;
}

/**
 * A frame for UI the model generated for one answer. The page runs in a
 * sandboxed iframe with no access to the host; a small injected script
 * reports its height and any runtime errors back to the frame, which
 * surfaces them instead of leaving a silently broken view.
 */
export function GeneratedSurface({
  title,
  html,
  building,
  step,
  text,
  version = 0,
  versionCount = 1,
  onVersionChange,
  onFix,
  sources,
  maxHeight = 420,
  className,
}: GeneratedSurfaceProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const rootRef = React.useRef<HTMLElement>(null);
  const probeRef = React.useRef<HTMLSpanElement>(null);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [view, setView] = React.useState<"view" | "text">("view");
  const [issues, setIssues] = React.useState<string[]>([]);
  const [height, setHeight] = React.useState(160);

  const tokens = useHostTokens(rootRef, probeRef);

  // Only rebuild the document when the HTML changes, and treat that as a fresh
  // run: forget the old page's errors. Theme changes are posted into the
  // running page instead, so its state survives a light/dark switch.
  const [built, setBuilt] = React.useState<{ html?: string; doc?: string }>({});
  if (built.html !== html) {
    setBuilt({ html, doc: html ? toDocument(html, tokens) : undefined });
    setIssues([]);
  }
  const doc = built.doc;

  React.useEffect(() => {
    frameRef.current?.contentWindow?.postMessage({ __surface: true, type: "tokens", tokens }, "*");
  }, [tokens]);

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Trust only messages from this frame's own window.
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { __surface?: boolean; type?: string; message?: string; height?: number };
      if (!data?.__surface) return;
      // A hidden frame reports 0; keep the last real height for when it's shown again.
      if (data.type === "height" && typeof data.height === "number" && data.height > 0) setHeight(Math.ceil(data.height));
      if (data.type === "issue" && data.message) {
        setIssues((prev) => (prev.includes(data.message!) ? prev : [...prev, data.message!]));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const broken = !building && issues.length > 0;
  const status = building ? `Building${step ? ` · ${step}` : "…"}` : broken ? plural(issues.length, "issue") : "Ready";
  const showText = view === "text";

  return (
    <section
      ref={rootRef}
      aria-labelledby={`${id}-title`}
      className={cn("w-full overflow-hidden rounded-2xl border bg-card text-card-foreground", className)}
    >
      {/* Reads the host's muted and border colours for the generated page. */}
      <span ref={probeRef} aria-hidden className="hidden border-border bg-muted text-muted-foreground" />

      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2">
        <div className="flex min-w-40 flex-1 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 id={`${id}-title`} className="truncate text-sm font-medium">
              {title}
            </h3>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground" aria-live="polite">
              <span className="shrink-0 rounded border px-1 py-px text-[10px] font-medium tracking-wide uppercase">
                Generated
              </span>
              <span className="truncate">{status}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div role="group" aria-label="Show as" className="flex rounded-lg border p-0.5 text-xs">
            {(["view", "text"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground",
                  view === v && "bg-accent text-foreground"
                )}
              >
                {v === "view" ? "View" : "Text"}
              </button>
            ))}
          </div>

          {versionCount > 1 && onVersionChange && (
            <div className="flex items-center rounded-lg border text-xs" role="group" aria-label="Version">
              <IconBtn
                label="Previous version"
                disabled={building || version === 0}
                onClick={() => onVersionChange(version - 1)}
              >
                <ChevronLeft className="size-3.5" aria-hidden />
              </IconBtn>
              <span className="px-0.5 tabular-nums text-muted-foreground" aria-live="polite">
                v{version + 1}
                <span className="sr-only"> of {versionCount}</span>
                <span aria-hidden>/{versionCount}</span>
              </span>
              <IconBtn
                label="Next version"
                disabled={building || version === versionCount - 1}
                onClick={() => onVersionChange(version + 1)}
              >
                <ChevronRight className="size-3.5" aria-hidden />
              </IconBtn>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence initial={false}>
        {broken && !showText && (
          <motion.div
            key="issues"
            role="status"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-b bg-muted/50"
          >
            <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-3 py-2.5 text-xs">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium">Part of this view didn&apos;t load, so some controls may not respond.</p>
                <details className="mt-1 text-muted-foreground">
                  <summary className="cursor-pointer select-none hover:text-foreground">Details</summary>
                  <ul className="mt-1 space-y-0.5 font-mono text-[11px] break-words">
                    {issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </details>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setView("text")}
                  className="rounded-md border bg-background px-2 py-1 font-medium transition-colors hover:bg-accent"
                >
                  Show as text
                </button>
                {onFix && (
                  <button
                    type="button"
                    onClick={() => onFix(issues)}
                    className="flex items-center gap-1 rounded-md bg-foreground px-2 py-1 font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <Wrench className="size-3" aria-hidden />
                    Fix it
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative" aria-busy={building || undefined}>
        {building && !showText && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
            <motion.div
              className="h-full w-1/3 bg-foreground/40"
              animate={reduce ? undefined : { x: ["-100%", "300%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        {showText && <div className="max-w-prose p-4 text-sm leading-relaxed">{text}</div>}
        {doc ? (
          // Stays mounted under the Text view so the page keeps its state.
          <iframe
            ref={frameRef}
            title={title}
            // No allow-same-origin: the generated page can't read the host's
            // cookies, storage or DOM. It talks back only through postMessage.
            sandbox="allow-scripts"
            srcDoc={doc}
            className={cn("block w-full border-0 bg-transparent", showText && "hidden")}
            style={{ height: Math.min(height, maxHeight) }}
          />
        ) : (
          !showText && <Skeleton />
        )}
      </div>

      {(sources?.length || !building) && (
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>Built by AI for this answer. Its controls only change this view.</span>
          {sources && sources.length > 0 && (
            <span className="flex flex-wrap items-center gap-1">
              <span>Based on</span>
              {sources.map((s, i) => (
                <React.Fragment key={s.href}>
                  <a href={s.href} className="text-foreground underline-offset-2 hover:underline">
                    {s.label}
                  </a>
                  {i < sources.length - 1 && <span aria-hidden>·</span>}
                </React.Fragment>
              ))}
            </span>
          )}
        </footer>
      )}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 p-4" aria-hidden>
      <div className="h-4 w-2/5 rounded bg-muted" />
      <div className="h-3 w-3/5 rounded bg-muted" />
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="h-16 rounded-lg border bg-muted/50" />
        <div className="h-16 rounded-lg border bg-muted/50" />
        <div className="h-16 rounded-lg border bg-muted/50" />
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/* ------------------------------------------------------------------ */
/* Host theme → generated page                                          */
/* ------------------------------------------------------------------ */

type Tokens = { fg: string; bg: string; muted: string; mutedFg: string; border: string; font: string };

const FALLBACK: Tokens = {
  fg: "#111",
  bg: "#fff",
  muted: "#f4f4f5",
  mutedFg: "#71717a",
  border: "#e4e4e7",
  font: "system-ui, sans-serif",
};

/** Reads the host's colours and font so the generated page matches light and dark mode. */
function useHostTokens(rootRef: React.RefObject<HTMLElement | null>, probeRef: React.RefObject<HTMLSpanElement | null>) {
  const [tokens, setTokens] = React.useState<Tokens>(FALLBACK);

  React.useEffect(() => {
    function read() {
      const root = rootRef.current;
      const probe = probeRef.current;
      if (!root || !probe) return;
      const r = getComputedStyle(root);
      const p = getComputedStyle(probe);
      setTokens({
        fg: r.color,
        bg: r.backgroundColor,
        muted: p.backgroundColor,
        mutedFg: p.color,
        border: p.borderTopColor,
        // The host's self-hosted fonts aren't loaded in the frame; end on system ones.
        font: `${r.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
      });
    }
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => observer.disconnect();
  }, [rootRef, probeRef]);

  return tokens;
}

function tokenCss(t: Tokens) {
  return `--fg:${t.fg};--bg:${t.bg};--muted:${t.muted};--muted-fg:${t.mutedFg};--border:${t.border};--font:${t.font};`;
}

/**
 * Wraps the generated HTML with the host's theme variables and a tiny
 * reporter: it posts the page height and any runtime error to the parent,
 * and applies theme updates the parent posts back.
 */
function toDocument(html: string, tokens: Tokens) {
  const reporter = `<script>(function(){
var post=function(m){m.__surface=true;parent.postMessage(m,"*")};
addEventListener("error",function(e){post({type:"issue",message:(e.error&&e.error.name?e.error.name+": ":"")+e.message})});
addEventListener("unhandledrejection",function(e){var r=e.reason;post({type:"issue",message:"Unhandled rejection: "+(r&&r.message||r)})});
addEventListener("message",function(e){var d=e.data;if(d&&d.__surface&&d.type==="tokens"){var t=d.tokens,s=document.documentElement.style;
s.setProperty("--fg",t.fg);s.setProperty("--bg",t.bg);s.setProperty("--muted",t.muted);s.setProperty("--muted-fg",t.mutedFg);s.setProperty("--border",t.border);s.setProperty("--font",t.font)}});
var h=function(){post({type:"height",height:document.documentElement.scrollHeight})};
addEventListener("load",h);if(window.ResizeObserver)new ResizeObserver(h).observe(document.body||document.documentElement);
})();</script>`;
  const base = `<style>:root{${tokenCss(tokens)}color-scheme:light dark}
html,body{margin:0;background:transparent;color:var(--fg);font-family:var(--font);font-size:14px;line-height:1.5}
*{box-sizing:border-box}</style>`;
  const body = /<html[\s>]/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}${reporter}${base}`) : `<!doctype html><html><head><meta charset="utf-8">${reporter}${base}</head><body>${html}</body></html>`;
  return body;
}
