"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** What the agent does about one kind of action in a mode. */
export type Permission = "auto" | "ask" | "suggest";

export interface Capability {
  id: string;
  /** Short verb phrase: "Read files", "Edit files", "Run commands". */
  label: string;
}

export interface AutonomyMode {
  id: string;
  label: string;
  /** One line on what the agent does in this mode. */
  description: string;
  /** Permission per capability id. Missing ids read as "ask". */
  permissions: Record<string, Permission>;
}

export interface AutonomyModePickerProps {
  /** Ordered from least to most autonomous. */
  modes: AutonomyMode[];
  capabilities: Capability[];
  value: string;
  onChange: (id: string) => void;
  /** Cycle modes with ⌘. / Ctrl+. while focus is anywhere in the page. */
  shortcut?: boolean;
  side?: "up" | "down";
  className?: string;
}

const PERMISSION_TEXT: Record<Permission, string> = {
  auto: "runs without asking",
  ask: "asks first",
  suggest: "suggests only",
};

export function AutonomyModePicker({
  modes,
  capabilities,
  value,
  onChange,
  shortcut = true,
  side = "up",
  className,
}: AutonomyModePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [announcement, setAnnouncement] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const id = React.useId();

  const index = Math.max(0, modes.findIndex((m) => m.id === value));
  const selected = modes[index];
  const level = index + 1;
  const highest = index === modes.length - 1;

  const select = React.useCallback(
    (i: number) => {
      const mode = modes[i];
      if (!mode) return;
      onChange(mode.id);
      setAnnouncement(`${mode.label} mode. ${mode.description}`);
    },
    [modes, onChange]
  );

  React.useEffect(() => {
    if (!shortcut) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        select((index + 1) % modes.length);
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [shortcut, index, modes.length, select]);

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function openMenu() {
    setActive(index);
    setOpen(true);
    requestAnimationFrame(() => listRef.current?.focus());
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % modes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + modes.length) % modes.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(active);
      close();
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close();
    }
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={`Mode: ${selected?.label}`}
        title={shortcut ? "Change mode (⌘.)" : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors",
          // The most autonomous mode stays visibly different, so it's never on by accident.
          highest
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "text-muted-foreground hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground"
        )}
      >
        <LevelBars level={level} max={modes.length} />
        <span>{selected?.label}</span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: side === "up" ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === "up" ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className={cn(
              "absolute left-0 z-20 w-80 overflow-hidden rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10",
              side === "up" ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left"
            )}
          >
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-label="How much the agent can do on its own"
              aria-activedescendant={`${id}-opt-${active}`}
              onKeyDown={handleListKeyDown}
              className="outline-none"
            >
              {modes.map((mode, i) => {
                const isSelected = i === index;
                return (
                  <li
                    key={mode.id}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-describedby={`${id}-desc-${i}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      select(i);
                      close();
                    }}
                    className={cn("cursor-pointer rounded-lg px-2.5 py-2", i === active && "bg-accent")}
                  >
                    <div className="flex items-center gap-2">
                      <LevelBars level={i + 1} max={modes.length} />
                      <span className="flex-1 text-sm font-medium">{mode.label}</span>
                      {isSelected && <Check className="size-4 shrink-0" aria-hidden />}
                    </div>
                    <div id={`${id}-desc-${i}`}>
                      <p className="mt-0.5 text-xs text-pretty text-muted-foreground">{mode.description}</p>
                      <ul className="mt-1.5 flex flex-wrap gap-1">
                        {capabilities.map((cap) => {
                          const p = mode.permissions[cap.id] ?? "ask";
                          return (
                            <li
                              key={cap.id}
                              className={cn(
                                "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]",
                                p === "auto" ? "border-foreground/40 text-foreground" : "text-muted-foreground",
                                p === "suggest" && "border-dashed"
                              )}
                            >
                              <PermissionMark permission={p} />
                              {cap.label}
                              <span className="sr-only">: {PERMISSION_TEXT[p]}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 border-t px-2.5 pt-1.5 pb-1 text-[11px] text-muted-foreground">
              <PermissionMark permission="auto" /> runs · <PermissionMark permission="ask" /> asks ·{" "}
              <PermissionMark permission="suggest" /> suggests
              {shortcut && <span className="float-right">⌘. to switch</span>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

/** Filled bars for how much the agent may do: one per mode, filled up to this one. */
function LevelBars({ level, max }: { level: number; max: number }) {
  return (
    <span className="flex h-3 items-end gap-px" aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-sm bg-current", i >= level && "opacity-25")}
          style={{ height: `${((i + 1) / max) * 100}%` }}
        />
      ))}
    </span>
  );
}

function PermissionMark({ permission }: { permission: Permission }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block align-middle",
        permission === "auto" && "size-2 rounded-full bg-current",
        permission === "ask" && "size-2 rounded-full border-[1.5px] border-current",
        // A dash: proposed, not done.
        permission === "suggest" && "h-[1.5px] w-2 rounded-full bg-current"
      )}
    />
  );
}
