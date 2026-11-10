"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ModelOption {
  id: string;
  label: string;
  /** One line on what the model is good at — not a spec sheet. */
  description?: string;
  /** A short tag such as "New" or "Beta". */
  badge?: string;
  /** Not available on the user's plan: shown, but not selectable. */
  locked?: boolean;
}

export interface ModelPickerProps {
  models: ModelOption[];
  value: string;
  onChange: (id: string) => void;
  /** Show an extended-thinking switch under the list when this is defined. */
  thinking?: boolean;
  onThinkingChange?: (thinking: boolean) => void;
  thinkingLabel?: string;
  upgradeLabel?: string;
  onUpgrade?: () => void;
  /** Which way the menu opens. Composers sit at the bottom, so "up" is the default. */
  side?: "up" | "down";
  className?: string;
}

export function ModelPicker({
  models,
  value,
  onChange,
  thinking,
  onThinkingChange,
  thinkingLabel = "Extended thinking",
  upgradeLabel = "Upgrade",
  onUpgrade,
  side = "up",
  className,
}: ModelPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const id = React.useId();

  const selected = models.find((m) => m.id === value) ?? models[0];

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function openMenu() {
    setActive(Math.max(0, models.findIndex((m) => m.id === selected?.id)));
    setOpen(true);
    requestAnimationFrame(() => listRef.current?.focus());
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(index: number) {
    const model = models[index];
    if (!model) return;
    if (model.locked) {
      // A locked row is an upgrade path, not a dead end.
      if (onUpgrade) {
        setOpen(false);
        onUpgrade();
      }
      return;
    }
    onChange(model.id);
    close();
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % models.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + models.length) % models.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(models.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
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
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground"
      >
        <span>{selected?.label}</span>
        {thinking && <span className="text-muted-foreground/70">· Thinking</span>}
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
              "absolute left-0 z-20 w-72 overflow-hidden rounded-2xl bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10",
              side === "up" ? "bottom-full mb-2 origin-bottom-left" : "top-full mt-2 origin-top-left"
            )}
          >
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-label="Model"
              aria-activedescendant={`${id}-opt-${active}`}
              onKeyDown={handleListKeyDown}
              className="outline-none"
            >
              {models.map((model, i) => {
                const isSelected = model.id === selected?.id;
                return (
                  <li
                    key={model.id}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={model.locked || undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2",
                      i === active && "bg-accent",
                      model.locked && !onUpgrade && "cursor-default"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-medium", model.locked && "text-muted-foreground")}>
                          {model.label}
                        </span>
                        {model.badge && (
                          <span className="rounded-full px-1.5 text-[10px] leading-4 text-muted-foreground bg-muted">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="mt-0.5 text-xs text-pretty text-muted-foreground">{model.description}</p>
                      )}
                    </div>
                    {model.locked ? (
                      onUpgrade ? (
                        // Not a nested button: the whole row is the upgrade action.
                        <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-medium text-foreground bg-muted">
                          <Lock className="size-3" aria-hidden />
                          {upgradeLabel}
                        </span>
                      ) : (
                        <Lock className="mt-1 size-3.5 shrink-0 text-muted-foreground" aria-label="Locked" />
                      )
                    ) : (
                      isSelected && <Check className="mt-1 size-4 shrink-0" aria-hidden />
                    )}
                  </li>
                );
              })}
            </ul>

            {thinking !== undefined && (
              <div className="mt-1 border-t px-2.5 pt-2 pb-1.5">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="text-sm">{thinkingLabel}</span>
                  <Switch checked={thinking} onCheckedChange={(v) => onThinkingChange?.(v)} label={thinkingLabel} />
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">Slower, more careful answers for hard problems.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-foreground" : "bg-muted-foreground/30"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn("size-4 rounded-full bg-background shadow-sm", checked ? "ml-[18px]" : "ml-0.5")}
      />
    </button>
  );
}
