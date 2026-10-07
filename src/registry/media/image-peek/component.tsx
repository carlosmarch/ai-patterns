"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PeekImage {
  id: string;
  src: string;
  alt: string;
  /** Short provenance label shown under the enlarged image, e.g. "Read" or "Generated". */
  label?: string;
}

export interface ImagePeekProps {
  images: PeekImage[];
  /** How many of the most recent thumbnails stay visible; older ones collapse into a "+N" chip. */
  max?: number;
  /** Delay before a hover opens the peek, so sweeping the pointer past doesn't flash it. */
  openDelay?: number;
  className?: string;
}

const spring = { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as const;

export function ImagePeek({ images, max = 3, openDelay = 150, className }: ImagePeekProps) {
  const reduceMotion = useReducedMotion();
  const peekId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const openTimer = React.useRef<number | undefined>(undefined);
  const closeTimer = React.useRef<number | undefined>(undefined);

  const [active, setActive] = React.useState<number | null>(null);
  const [pinned, setPinned] = React.useState(false);
  const [direction, setDirection] = React.useState(0);

  const hiddenCount = Math.max(0, images.length - max);
  const visible = images.slice(hiddenCount);
  const open = active !== null;
  const current = active !== null ? images[active] : undefined;

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  React.useEffect(() => clearTimers, []);

  const show = (index: number) => {
    setDirection(active === null ? 0 : Math.sign(index - active));
    setActive(index);
  };

  const close = () => {
    clearTimers();
    setActive(null);
    setPinned(false);
  };

  const step = (delta: number) => {
    if (active === null) return;
    show((active + delta + images.length) % images.length);
  };

  const hoverIn = (index: number) => {
    clearTimers();
    if (open) show(index);
    else openTimer.current = window.setTimeout(() => show(index), openDelay);
  };

  const hoverOut = () => {
    window.clearTimeout(openTimer.current);
    if (pinned) return;
    closeTimer.current = window.setTimeout(() => setActive(null), 120);
  };

  const toggle = (index: number) => {
    clearTimers();
    if (pinned && active === index) close();
    else {
      show(index);
      setPinned(true);
    }
  };

  // Clicking anywhere outside dismisses a pinned peek.
  React.useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setActive(null);
      setPinned(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  // Grow the card out of the active thumbnail rather than from the card's center.
  const visibleIndex = active !== null ? Math.max(0, active - hiddenCount) : visible.length - 1;
  const originX = `calc(100% - ${(visible.length - 1 - visibleIndex) * 44 + 20}px)`;

  if (images.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex", className)}
      onPointerLeave={hoverOut}
      onPointerEnter={() => window.clearTimeout(closeTimer.current)}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          step(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          step(-1);
        }
      }}
      onBlur={(e) => {
        if (!pinned && !rootRef.current?.contains(e.relatedTarget as Node)) setActive(null);
      }}
    >
      <ul className="flex items-center gap-1">
        {hiddenCount > 0 && (
          <li>
            <button
              type="button"
              aria-label={`Show ${hiddenCount} earlier image${hiddenCount === 1 ? "" : "s"}`}
              aria-expanded={open}
              aria-controls={peekId}
              onClick={() => toggle(hiddenCount - 1)}
              className="flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              +{hiddenCount}
            </button>
          </li>
        )}
        {visible.map((image, i) => {
          const index = hiddenCount + i;
          const isActive = active === index;
          return (
            <li key={image.id}>
              <motion.button
                type="button"
                aria-label={`Enlarge ${image.alt}`}
                aria-expanded={isActive}
                aria-controls={peekId}
                onPointerEnter={(e) => e.pointerType === "mouse" && hoverIn(index)}
                onFocus={() => !open && show(index)}
                onClick={() => toggle(index)}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                className={cn(
                  "block h-7 w-10 overflow-hidden rounded-md border bg-muted outline-none transition-[box-shadow,border-color] focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "border-foreground/40 ring-2 ring-foreground/15" : "border-border hover:border-foreground/25"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt="" className="size-full object-cover" draggable={false} />
              </motion.button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {current && (
          <motion.figure
            id={peekId}
            key="peek"
            role="group"
            aria-roledescription="image preview"
            aria-label={`${current.alt}, ${active! + 1} of ${images.length}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.35, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -4, transition: { duration: 0.14 } }}
            transition={reduceMotion ? { duration: 0.12 } : spring}
            style={{ transformOrigin: `${originX} 0px` }}
            className="absolute right-0 top-full z-20 mt-3.5 w-72 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl shadow-black/10 sm:w-80"
          >
            <div className="group/peek relative aspect-[16/10] overflow-hidden bg-muted">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                  key={current.id}
                  src={current.src}
                  alt={current.alt}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * 24 }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * -24 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute inset-0 size-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => step(-1)}
                    className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover/peek:opacity-100"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => step(1)}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover/peek:opacity-100"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>

            <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="truncate font-medium">{current.label ?? current.alt}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {active! + 1} of {images.length}
              </span>
            </figcaption>
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  );
}
