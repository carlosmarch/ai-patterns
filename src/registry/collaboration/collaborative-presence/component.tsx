"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Tailwind background color class, e.g. "bg-violet-500" */
  color: string;
  isOnline: boolean;
}

export interface CollaborativePresenceProps {
  collaborators: Collaborator[];
  /** Max avatars shown before collapsing into "+N" chip. Default 4. */
  visibleCap?: number;
  className?: string;
}

export function CollaborativePresence({
  collaborators,
  visibleCap = 4,
  className,
}: CollaborativePresenceProps) {
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();

  const sorted = React.useMemo(
    () => [...collaborators].sort((a, b) => Number(b.isOnline) - Number(a.isOnline)),
    [collaborators],
  );

  const visible = sorted.slice(0, visibleCap);
  const overflowCount = Math.max(0, sorted.length - visibleCap);
  const onlineCount = collaborators.filter((c) => c.isOnline).length;

  React.useEffect(() => {
    if (!panelOpen) return;
    function onOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [panelOpen]);

  const tooltipsActive = !panelOpen;

  return (
    <div ref={containerRef} className={cn("flex flex-col items-end", className)}>
      {/* Clickable avatar row */}
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-controls={panelId}
        aria-label="View collaborators"
        onClick={() => {
          setPanelOpen((v) => !v);
          setHoveredId(null);
        }}
        className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex -space-x-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((collab, i) => (
              <AvatarPip
                key={collab.id}
                collab={collab}
                zIndex={visibleCap - i}
                showTooltip={tooltipsActive && hoveredId === collab.id}
                onMouseEnter={() => setHoveredId(collab.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            ))}
          </AnimatePresence>
        </div>

        {overflowCount > 0 && (
          <div
            className="relative ml-1 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground"
            onMouseEnter={() => setHoveredId("__overflow")}
            onMouseLeave={() => setHoveredId(null)}
          >
            +{overflowCount}
            <AnimatePresence>
              {tooltipsActive && hoveredId === "__overflow" && (
                <Tooltip>{overflowCount} more · click to see all</Tooltip>
              )}
            </AnimatePresence>
          </div>
        )}
      </button>

      {/* Inline detail panel — pushes page content down */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="mt-2 w-64 overflow-hidden rounded-xl border bg-popover shadow-md"
          >
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {onlineCount > 0
                ? `${onlineCount} online now · ${collaborators.length} with access`
                : `${collaborators.length} with access`}
            </p>
            <ul role="list">
              <AnimatePresence initial={false}>
                {sorted.map((collab) => (
                  <motion.li
                    key={collab.id}
                    layout
                    className="flex items-center gap-2.5 px-3 py-1.5"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity",
                          collab.color,
                          !collab.isOnline && "opacity-60",
                        )}
                      >
                        {collab.initials}
                      </div>
                      {collab.isOnline && (
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-1 ring-background"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium leading-snug">{collab.name}</p>
                      <p className="truncate text-[10px] leading-snug text-muted-foreground">{collab.role}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[10px]",
                        collab.isOnline
                          ? "text-emerald-500 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {collab.isOnline ? "Online" : "Has access"}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AvatarPipProps {
  collab: Collaborator;
  zIndex: number;
  showTooltip: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function AvatarPip({ collab, zIndex, showTooltip, onMouseEnter, onMouseLeave }: AvatarPipProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: collab.isOnline ? 1 : 0.55 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{ zIndex }}
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white",
          collab.color,
          collab.isOnline && "ring-2 ring-emerald-400",
        )}
      >
        {collab.initials}
      </div>

      <AnimatePresence>
        {collab.isOnline && (
          <motion.span
            key="dot"
            aria-hidden
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-1 ring-background"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTooltip && (
          <Tooltip>
            <span className="block font-semibold">{collab.name}</span>
            <span className="block text-muted-foreground">
              {collab.role} · {collab.isOnline ? "Online now" : "Has access"}
            </span>
          </Tooltip>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
    >
      {children}
    </motion.div>
  );
}
