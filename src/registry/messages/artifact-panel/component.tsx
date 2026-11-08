"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Code2, Copy, FileText, LayoutPanelLeft, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ArtifactVersion {
  id: string;
  /** What changed in this version, e.g. "Shorter, one page". Shown under the title. */
  note?: string;
  /** The rendered artifact for the Preview tab. */
  preview: React.ReactNode;
  /** Source for the Code tab and for Copy. Omit to hide the tab. */
  source?: string;
}

export interface Artifact {
  id: string;
  title: string;
  /** A short type label: "Document", "React", "HTML", "Diagram"… */
  kind: string;
  versions: ArtifactVersion[];
}

/* ------------------------------------------------------------------ */
/* Inline card: the artifact's place in the transcript                 */
/* ------------------------------------------------------------------ */

export interface ArtifactCardProps {
  artifact: Artifact;
  /** Index of the version this message produced. */
  version?: number;
  open?: boolean;
  /** Still being written. The card stays clickable so people can watch it fill. */
  generating?: boolean;
  onOpen: () => void;
  className?: string;
}

export const ArtifactCard = React.forwardRef<HTMLButtonElement, ArtifactCardProps>(function ArtifactCard(
  { artifact, version = artifact.versions.length - 1, open, generating, onOpen, className },
  ref
) {
  const Icon = artifact.versions[version]?.source && artifact.kind !== "Document" ? Code2 : FileText;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-expanded={open}
      className={cn(
        "group flex w-full max-w-xs items-center gap-3 rounded-xl border bg-card p-2 pr-3 text-left transition-colors hover:bg-accent/60",
        open && "border-foreground/30 bg-accent/40",
        className
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{artifact.title}</span>
        <span className="block text-xs text-muted-foreground">
          {generating ? "Writing…" : `${artifact.kind} · v${version + 1}`}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-muted-foreground group-hover:text-foreground">
        {open ? "Viewing" : "View"}
      </span>
    </button>
  );
});

/* ------------------------------------------------------------------ */
/* Split layout: chat beside the panel, or the panel over the chat     */
/* ------------------------------------------------------------------ */

export interface ArtifactSplitProps {
  open: boolean;
  chat: React.ReactNode;
  panel: React.ReactNode;
  className?: string;
}

/**
 * Side by side when the container is at least 42rem wide; below that the
 * panel covers the chat, because two cramped columns serve neither.
 */
export function ArtifactSplit({ open, chat, panel, className }: ArtifactSplitProps) {
  return (
    <div className={cn("@container relative flex h-full w-full overflow-hidden", className)}>
      <div className={cn("flex min-w-0 flex-1 flex-col", open && "@max-2xl:invisible")}>{chat}</div>
      <AnimatePresence initial={false}>{open && panel}</AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The panel                                                           */
/* ------------------------------------------------------------------ */

export interface ArtifactPanelProps {
  artifact: Artifact;
  version: number;
  onVersionChange: (index: number) => void;
  onClose: () => void;
  /** The model is writing a new version right now. */
  generating?: boolean;
  className?: string;
}

export function ArtifactPanel({
  artifact,
  version,
  onVersionChange,
  onClose,
  generating,
  className,
}: ArtifactPanelProps) {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [copied, setCopied] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const id = React.useId();

  const current = artifact.versions[version];
  const count = artifact.versions.length;
  const hasSource = Boolean(current?.source);
  const activeTab = hasSource ? tab : "preview";

  // Move focus into the panel when it opens so keyboard and screen-reader
  // users land on the thing they asked to see. Whoever opened it gets focus
  // back on close (see the demo's card ref).
  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    const text = current?.source ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (iframes, permissions); fail quietly.
    }
  }

  return (
    <motion.aside
      aria-labelledby={`${id}-title`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "absolute inset-0 z-10 flex flex-col bg-background @2xl:static @2xl:w-[58%] @2xl:shrink-0 @2xl:border-l",
        className
      )}
    >
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          <h3
            ref={headingRef}
            id={`${id}-title`}
            tabIndex={-1}
            className="truncate text-sm font-medium outline-none"
          >
            {artifact.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground" aria-live="polite">
            {generating ? "Writing a new version…" : current?.note ?? artifact.kind}
          </p>
        </div>

        {count > 1 && (
          <div className="flex items-center rounded-lg border text-xs" role="group" aria-label="Version">
            <IconBtn
              label="Previous version"
              disabled={version === 0}
              onClick={() => onVersionChange(version - 1)}
            >
              <ChevronLeft className="size-3.5" aria-hidden />
            </IconBtn>
            <span className="px-1 tabular-nums text-muted-foreground" aria-live="polite">
              v{version + 1}
              <span className="sr-only"> of {count}</span>
              <span aria-hidden>/{count}</span>
            </span>
            <IconBtn
              label="Next version"
              disabled={version === count - 1}
              onClick={() => onVersionChange(version + 1)}
            >
              <ChevronRight className="size-3.5" aria-hidden />
            </IconBtn>
          </div>
        )}

        {hasSource && (
          <IconBtn label={copied ? "Copied" : "Copy"} onClick={copy} className="rounded-lg">
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          </IconBtn>
        )}
        <IconBtn label="Close panel" onClick={onClose} className="rounded-lg">
          <X className="size-4" aria-hidden />
        </IconBtn>
      </header>

      {hasSource && (
        <div role="tablist" aria-label="View" className="flex gap-1 border-b px-3 py-1.5">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`${id}-tab-${t}`}
              aria-selected={activeTab === t}
              aria-controls={`${id}-body`}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                activeTab === t && "bg-accent text-foreground"
              )}
            >
              {t === "preview" ? (
                <LayoutPanelLeft className="size-3.5" aria-hidden />
              ) : (
                <Code2 className="size-3.5" aria-hidden />
              )}
              {t === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
      )}

      <div
        id={`${id}-body`}
        role={hasSource ? "tabpanel" : undefined}
        aria-labelledby={hasSource ? `${id}-tab-${activeTab}` : undefined}
        aria-busy={generating || undefined}
        tabIndex={0}
        className="relative min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${current?.id}-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: generating ? 0.45 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "code" ? (
              <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {current?.source}
              </pre>
            ) : (
              <div className="p-5">{current?.preview}</div>
            )}
          </motion.div>
        </AnimatePresence>
        {generating && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-muted">
            <motion.div
              className="h-full w-1/3 bg-foreground/40"
              animate={reduce ? undefined : { x: ["-100%", "300%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}
