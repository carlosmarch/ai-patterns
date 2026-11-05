"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Code2, Copy, Play, WrapText } from "lucide-react";

import { cn } from "@/lib/utils";

export type PreviewLanguage = "svg" | "html";

export interface CodePreviewBlockProps {
  /** The source to show and render. */
  code: string;
  /** Renderable language. Drives both highlighting and the preview document. */
  lang?: PreviewLanguage;
  /** Start on the rendered preview instead of the code. */
  defaultView?: "code" | "preview";
  /** Height of the preview frame, in px. */
  previewHeight?: number;
  className?: string;
}

export function CodePreviewBlock({
  code,
  lang = "svg",
  defaultView = "code",
  previewHeight = 240,
  className,
}: CodePreviewBlockProps) {
  const [view, setView] = React.useState(defaultView);
  const [wrap, setWrap] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const html = useHighlighted(code, lang);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const ink = useInkColor(rootRef, view);
  const preview = view === "preview";

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "rounded-2xl border bg-muted/40 text-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-2 py-2 pl-4 pr-2">
        <Code2 className="size-4 text-muted-foreground" aria-hidden />
        <span className="text-sm">{lang}</span>

        <div className="ml-auto flex items-center gap-0.5">
          <AnimatePresence initial={false} mode="popLayout">
            {!preview && (
              <motion.div
                key="code-actions"
                className="flex items-center gap-0.5"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
              >
                <IconButton
                  label={wrap ? "Don't wrap lines" : "Wrap lines"}
                  pressed={wrap}
                  onClick={() => setWrap((w) => !w)}
                >
                  <WrapText />
                </IconButton>
                <IconButton label={copied ? "Copied" : "Copy"} onClick={copy}>
                  {copied ? <Check /> : <Copy />}
                </IconButton>
              </motion.div>
            )}
          </AnimatePresence>
          <IconButton
            label={preview ? "Code" : "Preview"}
            onClick={() => setView(preview ? "code" : "preview")}
            className="bg-muted"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={view}
                className="flex"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15 }}
              >
                {preview ? <Code2 /> : <Play />}
              </motion.span>
            </AnimatePresence>
          </IconButton>
        </div>
      </div>

      {/* Clip the body, not the root, so header tooltips can overflow the block. */}
      <div className="overflow-hidden rounded-b-2xl">
        <AnimatePresence initial={false} mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <iframe
                title={`${lang} preview`}
                // No allow-same-origin: generated code can't reach the host page.
                sandbox={lang === "html" ? "allow-scripts" : ""}
                srcDoc={toDocument(code, lang, ink)}
                className="block w-full border-0"
                style={{ height: previewHeight }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "max-h-[420px] overflow-auto px-4 pb-4 font-mono text-[13px] leading-relaxed",
                "[&_pre]:!bg-transparent [&_code]:block",
                "dark:[&_span]:!text-[var(--shiki-dark)]",
                wrap
                  ? "[&_code]:whitespace-pre-wrap [&_code]:break-words"
                  : "[&_code]:whitespace-pre",
              )}
            >
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <pre>
                  <code>{code}</code>
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IconButton({
  label,
  pressed,
  onClick,
  className,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [hint, setHint] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        onMouseEnter={() => setHint(true)}
        onMouseLeave={() => setHint(false)}
        onFocus={() => setHint(true)}
        onBlur={() => setHint(false)}
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4",
          pressed && "text-foreground",
          className,
        )}
      >
        {children}
      </button>
      <AnimatePresence>
        {hint && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute bottom-full right-0 z-10 mb-1.5 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Highlights with Shiki (loaded lazily), in both themes at once via CSS variables. */
function useHighlighted(code: string, lang: PreviewLanguage) {
  const [html, setHtml] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    import("shiki").then(({ codeToHtml }) =>
      codeToHtml(code, {
        lang: lang === "svg" ? "xml" : "html",
        themes: { light: "github-light", dark: "github-dark" },
      }).then((out) => {
        if (!cancelled) setHtml(out);
      }),
    );
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  return html;
}

/** The block's text color, so `currentColor` in the preview matches the theme. */
function useInkColor(ref: React.RefObject<HTMLElement | null>, view: string) {
  const [ink, setInk] = React.useState("#000");
  React.useLayoutEffect(() => {
    if (ref.current) setInk(getComputedStyle(ref.current).color);
  }, [ref, view]);
  return ink;
}

function toDocument(code: string, lang: PreviewLanguage, ink: string) {
  if (lang === "html") return code;
  return `<!doctype html><html><head><style>
html,body{margin:0;height:100%;background:transparent;color:${ink}}
body{display:grid;place-items:center}
svg{width:64px;height:64px}
</style></head><body>${code}</body></html>`;
}
