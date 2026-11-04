"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, PanelRight, Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QuickChatDockProps {
  placeholder?: string;
  /** Called with the question when the floating prompt bar is submitted. */
  onSubmit?: (value: string) => void;
  /** Called when the user asks to open the full agent panel (with any draft typed so far). */
  onOpenAgent?: (draft: string) => void;
  /** Listen for ⇧Enter (quick chat) and ⇧A (open agent) anywhere on the page. */
  shortcuts?: boolean;
  /** Positioning is up to the host: `absolute` inside a relative canvas, or `fixed` app-wide. */
  className?: string;
}

const spring = { type: "spring", stiffness: 520, damping: 38 } as const;

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function QuickChatDock({
  placeholder = "Search or ask anything...",
  onSubmit,
  onOpenAgent,
  shortcuts = true,
  className,
}: QuickChatDockProps) {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const leaveTimer = React.useRef<number | undefined>(undefined);
  const reduceMotion = useReducedMotion();

  const expanded = !open && (hovered || focused);

  const openChat = React.useCallback(() => {
    setOpen(true);
    setHovered(false);
    setFocused(false);
  }, []);

  const closeChat = React.useCallback(() => {
    setOpen(false);
    setValue("");
  }, []);

  const openAgent = React.useCallback(
    (draft = "") => {
      onOpenAgent?.(draft);
      closeChat();
      setFocused(false);
    },
    [onOpenAgent, closeChat]
  );

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  React.useEffect(() => {
    if (!shortcuts) return;
    function onKey(e: KeyboardEvent) {
      if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        openChat();
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        openAgent();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts, openChat, openAgent]);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeChat();
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, closeChat]);

  React.useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  function handleEnter() {
    window.clearTimeout(leaveTimer.current);
    setHovered(true);
  }

  function handleLeave() {
    // A short grace period so the dock doesn't flicker shut when the pointer grazes its edge.
    leaveTimer.current = window.setTimeout(() => setHovered(false), 180);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit?.(text);
    closeChat();
  }

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {open ? (
          <motion.form
            key="bar"
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                closeChat();
              }
            }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={spring}
            className="pointer-events-auto mx-3 mb-3 flex w-full max-w-xl items-center gap-1.5 rounded-xl border border-primary bg-card py-1.5 pr-1.5 pl-3.5 shadow-lg ring-4 ring-primary/15"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => openAgent(value.trim())}
              aria-label="Continue in agent panel"
              title="Continue in agent panel"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <PanelRight className="size-4" />
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Ask"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="dock"
            role="toolbar"
            aria-label="Assistant"
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            // The invisible hot zone: a generous strip along the bottom edge that wakes the dock.
            className="pointer-events-auto flex h-16 w-64 max-w-full items-end justify-center pb-3"
          >
            <motion.div
              layout={!reduceMotion}
              transition={spring}
              style={{ borderRadius: 10 }}
              className={cn(
                "flex items-center overflow-visible border",
                expanded
                  ? "gap-1.5 border-foreground/10 bg-foreground/80 p-1 shadow-lg backdrop-blur"
                  : "h-2.5 w-10 border-foreground/20 bg-muted-foreground/60"
              )}
            >
              {expanded ? (
                <>
                  <DockButton label="Quick chat" keys={["⇧", "Enter"]} onClick={openChat} autoFocus={focused}>
                    <Sparkle className="size-4" />
                  </DockButton>
                  <DockButton label="Open Agent" keys={["⇧", "A"]} onClick={() => openAgent()}>
                    <PanelRight className="size-4" />
                  </DockButton>
                </>
              ) : (
                // Keeps the collapsed handle reachable by keyboard; focusing it expands the dock.
                <button type="button" aria-label="Show assistant actions" className="size-full rounded-[inherit] outline-none" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DockButton({
  label,
  keys,
  onClick,
  autoFocus,
  children,
}: {
  label: string;
  keys: string[];
  onClick: () => void;
  autoFocus?: boolean;
  children: React.ReactNode;
}) {
  const [tip, setTip] = React.useState(false);
  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        onPointerEnter={() => setTip(true)}
        onPointerLeave={() => setTip(false)}
        onFocus={() => setTip(true)}
        onBlur={() => setTip(false)}
        aria-label={label}
        autoFocus={autoFocus}
        aria-keyshortcuts={keys.join("+").replace("⇧", "Shift")}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.04 }}
        className="flex h-7 w-10 items-center justify-center rounded-md border border-background/25 text-background transition-colors hover:bg-background/15 focus-visible:ring-2 focus-visible:ring-background/60 focus-visible:outline-none"
      >
        {children}
      </motion.button>
      <AnimatePresence>
        {tip && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 4, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 flex items-center gap-2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-background shadow-md"
          >
            {label}
            <span className="flex gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded bg-background/20 px-1.5 py-0.5 font-sans text-[10px] leading-none font-medium"
                >
                  {k}
                </kbd>
              ))}
            </span>
            <span className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
