"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { NewBadge } from "@/components/new-badge";

export interface WheelItem {
  slug: string;
  href: string;
  title: string;
  category: string;
  description: string;
  /** Pre-formatted date added, e.g. "Nov 7, 2026". */
  added: string;
  /** The pattern's thumbnail, rendered on the server. */
  thumb: ReactNode;
}

// Degrees per second while the wheel spins on its own.
const SPEED = 7;
// Degrees of spin per pixel dragged.
const DRAG = 0.22;

// The home page's "New" block: the newest patterns on a wheel whose upper
// half shows, turning slowly on its own. Hover or focus pauses it; drag it,
// or use the arrows, to spin it by hand. The card at the top is the active
// one, described in the hollow of the arc.
export function NewWheel({ items }: { items: WheelItem[] }) {
  const step = 360 / items.length;
  const rotation = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; rotation: number; moved: boolean } | null>(null);
  // Set when a drag ends, so the click that follows doesn't open a card.
  const suppressClick = useRef(false);
  const tween = useRef<ReturnType<typeof animate> | null>(null);

  const paused = reduceMotion || hovered || focused || dragging;

  useAnimationFrame((_, delta) => {
    if (!paused && !tween.current) rotation.set(rotation.get() - (SPEED * delta) / 1000);
    const index = mod(Math.round(-rotation.get() / step), items.length);
    if (index !== active) setActive(index);
  });

  // Turn the wheel so card `index` sits at the top, the short way round.
  const goTo = (index: number) => {
    const current = rotation.get();
    const target = -index * step;
    const diff = mod(target - current + 180, 360) - 180;
    tween.current?.stop();
    tween.current = animate(rotation, current + diff, {
      type: "spring",
      stiffness: 120,
      damping: 22,
      onComplete: () => (tween.current = null),
    });
  };

  const item = items[active];

  return (
    <div
      className="relative [--card:8.5rem] [--r:15rem] sm:[--card:11rem] sm:[--r:25rem]"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className="relative h-[calc(var(--r)+var(--card)*0.62)] touch-pan-y overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
        onPointerDown={(e) => {
          tween.current?.stop();
          tween.current = null;
          drag.current = { x: e.clientX, rotation: rotation.get(), moved: false };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (!d.moved && Math.abs(dx) > 4) {
            d.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          rotation.set(d.rotation + dx * DRAG);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          setDragging(false);
          if (!d?.moved) return;
          goTo(mod(Math.round(-rotation.get() / step), items.length));
          suppressClick.current = true;
          setTimeout(() => (suppressClick.current = false), 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* Track: a faint ring the cards ride on */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 size-[calc(var(--r)*2)] -translate-x-1/2 translate-y-1/2 rounded-full border border-dashed"
        />

        {/* The wheel: rotates around the bottom-centre of the frame */}
        <motion.ul className="absolute bottom-0 left-1/2 size-0" style={{ rotate: rotation }}>
          {items.map((entry, i) => (
            <WheelCard
              key={entry.slug}
              entry={entry}
              angle={i * step}
              rotation={rotation}
              onFocus={() => {
                setFocused(true);
                goTo(i);
              }}
              onBlur={() => setFocused(false)}
            />
          ))}
        </motion.ul>

        {/* The hollow of the arc: what the top card is */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-3 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
              className="max-w-sm"
            >
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <NewBadge />
                <span className="capitalize">{item.category}</span>·<span>{item.added}</span>
              </div>
              <p className="mt-2 text-lg font-medium tracking-tight sm:text-xl">{item.title}</p>
              <p className="mt-1 line-clamp-2 hidden text-sm text-muted-foreground sm:block">{item.description}</p>
              <Link
                href={item.href}
                className="pointer-events-auto mt-3 inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                Open pattern
                <ArrowUpRight className="size-3" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <WheelButton label="Previous pattern" onClick={() => goTo(mod(active - 1, items.length))}>
          <ChevronLeft className="size-4" />
        </WheelButton>
        <div className="flex gap-1.5" role="tablist" aria-label="New patterns">
          {items.map((entry, i) => (
            <button
              key={entry.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={entry.title}
              onClick={() => goTo(i)}
              className="group flex h-4 items-center"
            >
              <span
                className={
                  "block h-1.5 rounded-full transition-all duration-300 " +
                  (i === active ? "w-5 bg-foreground" : "w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60")
                }
              />
            </button>
          ))}
        </div>
        <WheelButton label="Next pattern" onClick={() => goTo(mod(active + 1, items.length))}>
          <ChevronRight className="size-4" />
        </WheelButton>
      </div>
    </div>
  );
}

function WheelCard({
  entry,
  angle,
  rotation,
  onFocus,
  onBlur,
}: {
  entry: WheelItem;
  angle: number;
  rotation: MotionValue<number>;
  onFocus: () => void;
  onBlur: () => void;
}) {
  // How far this card is from the top of the wheel, 0..1 over a quarter turn.
  const distance = useTransform(rotation, (r) => Math.min(Math.abs(mod(angle + r + 180, 360) - 180), 90) / 90);
  const scale = useTransform(distance, (d) => 1.06 - d * 0.22);
  const opacity = useTransform(distance, (d) => 1 - d * 0.55);
  const zIndex = useTransform(distance, (d) => Math.round((1 - d) * 100));

  return (
    <motion.li
      className="absolute top-0 left-0"
      style={{
        zIndex,
        transform: `rotate(${angle}deg) translateY(calc(-1 * var(--r)))`,
      }}
    >
      <motion.div style={{ x: "-50%", y: "-50%", scale, opacity }}>
        <Link
          href={entry.href}
          draggable={false}
          onFocus={onFocus}
          onBlur={onBlur}
          className="group block w-[var(--card)] rounded-xl border bg-muted/60 p-1.5 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur transition-colors hover:bg-muted"
        >
          <div className="aspect-[5/3] rounded-lg border bg-card p-1.5 dark:bg-background">{entry.thumb}</div>
          <p className="truncate px-1 pt-1.5 pb-0.5 text-[11px] font-medium sm:text-xs">{entry.title}</p>
        </Link>
      </motion.div>
    </motion.li>
  );
}

function WheelButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
