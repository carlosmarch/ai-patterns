"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Globe, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TrustedSource {
  title: string;
  domain: string;
  description: string;
  url: string;
  /** Falls back to a globe icon when omitted or when the image fails to load. */
  faviconUrl?: string;
  /** Shows a "Trusted" badge; hovering or focusing it reveals why the source is trusted. */
  trustReason?: string;
}

export interface SourceTrustCardProps {
  sources: TrustedSource[];
  defaultIndex?: number;
  className?: string;
}

export function SourceTrustCard({ sources, defaultIndex = 0, className }: SourceTrustCardProps) {
  const [index, setIndex] = React.useState(defaultIndex);
  const [direction, setDirection] = React.useState(0);
  const source = sources[index];

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + sources.length) % sources.length);
  }

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }

  return (
    <div className={cn("w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={sources.length < 2}
            aria-label="Previous source"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
            {index + 1}/{sources.length}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={sources.length < 2}
            aria-label="Next source"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {sources.length} source{sources.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            initial={{ x: direction >= 0 ? 24 : -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -24 : 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-3"
          >
            <div className="relative">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="-m-1 flex items-start gap-2.5 rounded-lg p-1 transition-colors hover:bg-accent/50"
              >
                <Favicon source={source} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-xs text-muted-foreground", source.trustReason && "pr-16")}>
                    {source.domain}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {source.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {source.description}
                  </span>
                </span>
              </a>

              {source.trustReason && (
                <TrustBadge domain={source.domain} reason={source.trustReason} url={source.url} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
          {sources.map((s, i) => (
            <button
              key={s.url}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === index}
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs transition-colors",
                i === index
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-transparent bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {s.domain}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Favicon({ source }: { source: TrustedSource }) {
  const [errored, setErrored] = React.useState(false);
  const showImage = source.faviconUrl && !errored;

  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source.faviconUrl} alt="" className="size-full object-cover" onError={() => setErrored(true)} />
      ) : (
        <Globe className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}

const TOOLTIP_WIDTH = 224;
const MARGIN = 8;

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

function TrustBadge({ domain, reason, url }: { domain: string; reason: string; url: string }) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<Position | null>(null);
  const mounted = useMounted();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const tooltipId = React.useId();

  const reposition = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const placement: Position["placement"] = rect.top > 140 ? "top" : "bottom";
    const left = Math.min(
      Math.max(rect.right, TOOLTIP_WIDTH + MARGIN),
      window.innerWidth - MARGIN
    );
    setPosition({ top: placement === "top" ? rect.top - MARGIN : rect.bottom + MARGIN, left, placement });
  }, []);

  function show() {
    reposition();
    setOpen(true);
  }
  function hide() {
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/70"
      >
        <ShieldCheck className="size-3" aria-hidden />
        Trusted
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <div
                ref={tooltipRef}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: TOOLTIP_WIDTH,
                  transform:
                    position.placement === "top"
                      ? `translate(-100%, -100%)`
                      : `translate(-100%, 0)`,
                }}
                className="z-50"
              >
                <motion.div
                  id={tooltipId}
                  role="tooltip"
                  initial={{ opacity: 0, y: position.placement === "top" ? 4 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: position.placement === "top" ? 4 : -4 }}
                  transition={{ duration: 0.12 }}
                  className="rounded-xl border bg-popover p-3 text-left shadow-md"
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    Trusted
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/80">{domain}</span> {reason}
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Learn more
                  </a>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

/** True only once the client has rendered — lets a portal target `document.body` without an SSR mismatch. */
function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
