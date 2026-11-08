"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
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

// Wheel geometry in px: radius of the ring, card width and height. Plain
// numbers (not CSS variables or percentages) so every browser — iOS Safari
// included — puts each card exactly on the ring.
const SIZES = {
  sm: { r: 270, w: 120, h: 88 },
  lg: { r: 400, w: 176, h: 128 },
};
type Size = (typeof SIZES)["lg"];

const WIDE_QUERY = "(min-width: 640px)";
function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useSize(): Size {
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );
  return wide ? SIZES.lg : SIZES.sm;
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
  const size = useSize();
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
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        style={{ height: size.r + size.h * 0.6 + 12 }}
        className="relative touch-pan-y overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
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
          style={{ width: size.r * 2, height: size.r * 2, left: `calc(50% - ${size.r}px)`, bottom: -size.r }}
          className="pointer-events-none absolute rounded-full border border-dashed"
        />

        {/* The wheel: cards orbit the bottom-centre of the frame */}
        <ul className="absolute bottom-0 left-1/2 size-0">
          {items.map((entry, i) => (
            <WheelCard
              key={entry.slug}
              entry={entry}
              angle={i * step}
              rotation={rotation}
              size={size}
              onFocus={() => {
                setFocused(true);
                goTo(i);
              }}
              onBlur={() => setFocused(false)}
            />
          ))}
        </ul>

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
  size,
  onFocus,
  onBlur,
}: {
  entry: WheelItem;
  angle: number;
  rotation: MotionValue<number>;
  size: Size;
  onFocus: () => void;
  onBlur: () => void;
}) {
  // This card's place on the ring: 0° is the top, clockwise positive.
  const theta = useTransform(rotation, (r) => mod(angle + r + 180, 360) - 180);
  const x = useTransform(theta, (t) => size.r * Math.sin((t * Math.PI) / 180));
  const y = useTransform(theta, (t) => -size.r * Math.cos((t * Math.PI) / 180));
  // How far from the top, 0..1 over a quarter turn.
  const distance = useTransform(theta, (t) => Math.min(Math.abs(t), 90) / 90);
  const scale = useTransform(distance, (d) => 1.06 - d * 0.22);
  const opacity = useTransform(distance, (d) => 1 - d * 0.55);
  const zIndex = useTransform(distance, (d) => Math.round((1 - d) * 100));

  return (
    <motion.li
      className="absolute"
      style={{
        left: -size.w / 2,
        top: -size.h / 2,
        width: size.w,
        height: size.h,
        x,
        y,
        rotate: theta,
        scale,
        opacity,
        zIndex,
      }}
    >
      <Link
        href={entry.href}
        draggable={false}
        onFocus={onFocus}
        onBlur={onBlur}
        className="group flex size-full flex-col rounded-xl border bg-muted/60 p-1.5 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur transition-colors hover:bg-muted"
      >
        <div className="min-h-0 flex-1 rounded-lg border bg-card p-1 dark:bg-background">{entry.thumb}</div>
        <p className="truncate px-1 pt-1.5 pb-0.5 text-[11px] font-medium sm:text-xs">{entry.title}</p>
      </Link>
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
