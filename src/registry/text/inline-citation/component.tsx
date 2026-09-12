"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface CitationSource {
  title: string;
  domain: string;
  snippet?: string;
  url: string;
}

export interface InlineCitationProps {
  index: number;
  source: CitationSource;
  className?: string;
}

const POPOVER_WIDTH = 256;
const MARGIN = 8;

interface Position {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

export function InlineCitation({ index, source, className }: InlineCitationProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<Position | null>(null);
  const mounted = useMounted();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const popoverId = React.useId();

  const reposition = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const placement: Position["placement"] = rect.top > 180 ? "top" : "bottom";
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, POPOVER_WIDTH / 2 + MARGIN),
      window.innerWidth - POPOVER_WIDTH / 2 - MARGIN
    );
    setPosition({ top: placement === "top" ? rect.top : rect.bottom, left, placement });
  }, []);

  function show() {
    reposition();
    setOpen(true);
  }

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
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
        aria-describedby={open ? popoverId : undefined}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
        className={cn(
          "mx-0.5 inline-flex size-4 -translate-y-1.5 items-center justify-center rounded-full bg-muted align-super text-[10px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        {index}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              // Positioning lives on this plain element, not the motion.div below — Motion owns the
              // `transform` style for its own x/y animation, so a hand-written translate() here would
              // get silently overwritten by it.
              <div
                ref={popoverRef}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: POPOVER_WIDTH,
                  transform:
                    position.placement === "top"
                      ? `translate(-50%, calc(-100% - ${MARGIN}px))`
                      : `translate(-50%, ${MARGIN}px)`,
                }}
                className="z-50"
              >
                <motion.div
                  id={popoverId}
                  role="tooltip"
                  initial={{ opacity: 0, y: position.placement === "top" ? 4 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: position.placement === "top" ? 4 : -4 }}
                  transition={{ duration: 0.12 }}
                  className="rounded-xl border bg-popover p-3 text-left shadow-md"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm font-medium text-foreground hover:underline"
                  >
                    {source.title}
                  </a>
                  <p className="mt-0.5 text-xs text-muted-foreground">{source.domain}</p>
                  {source.snippet && <p className="mt-1.5 text-xs text-foreground/80">{source.snippet}</p>}
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
