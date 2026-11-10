"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SetupAgent {
  id: string;
  label: string;
  /** A small mark (~16px). Brand marks read best as monochrome or their own colours. */
  icon: React.ReactNode;
}

export interface AgentSetupPillProps {
  /** Outcome-first label, e.g. "Onboard your agent to Acme". */
  label: string;
  /** Says what the click does before it happens. */
  tooltip?: string;
  /** The setup prompt copied to the clipboard. */
  prompt: string;
  /** The coding agents the prompt works in, shown as a row of marks. */
  agents: SetupAgent[];
  /** Shown in place of the label for a moment after copying. */
  copiedLabel?: string;
  onCopy?: () => void;
  /** Omit to hide the dismiss button. */
  onDismiss?: () => void;
  className?: string;
}

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;

export function AgentSetupPill({
  label,
  tooltip = "Copies a setup prompt for your AI coding tool",
  prompt,
  agents,
  copiedLabel = "Prompt copied — paste it into your agent",
  onCopy,
  onDismiss,
  className,
}: AgentSetupPillProps) {
  const reduce = useReducedMotion();
  const tooltipId = React.useId();
  const [copied, setCopied] = React.useState(false);
  const [hint, setHint] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard can be blocked (insecure context, iframe); still confirm.
    }
    setCopied(true);
    setHint(false);
    onCopy?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
      transition={spring}
      className={cn("flex items-center gap-2", className)}
    >
      <div className="relative">
        <AnimatePresence>
          {hint && !copied && (
            <motion.div
              id={tooltipId}
              role="tooltip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-xl bg-popover px-3 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            >
              {tooltip}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={copy}
          onPointerEnter={() => setHint(true)}
          onPointerLeave={() => setHint(false)}
          onFocus={() => setHint(true)}
          onBlur={() => setHint(false)}
          onKeyDown={(e) => e.key === "Escape" && setHint(false)}
          aria-describedby={hint ? tooltipId : undefined}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          layout={!reduce}
          transition={spring}
          className="group flex h-10 items-center gap-3 rounded-full border bg-card pr-3 pl-4 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="relative grid overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={copied ? "copied" : "idle"}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                {copied && <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />}
                {copied ? copiedLabel : label}
              </motion.span>
            </AnimatePresence>
          </span>

          <AnimatePresence initial={false}>
            {!copied && (
              <motion.span
                aria-hidden
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                {agents.map((agent, i) => (
                  <motion.span
                    key={agent.id}
                    title={agent.label}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: reduce ? 0 : 0.15 + i * 0.05 }}
                    className="grid size-5 place-items-center transition-[margin,transform] duration-200 not-first:ml-0.5 group-hover:not-first:ml-1.5 group-hover:-translate-y-px [&_svg]:size-4"
                  >
                    {agent.icon}
                  </motion.span>
                ))}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <span className="sr-only" aria-live="polite">
          {copied ? copiedLabel : ""}
        </span>
      </div>

      {onDismiss && (
        <motion.button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          whileTap={reduce ? undefined : { scale: 0.92 }}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ring-1 ring-black/5 dark:ring-white/10"
        >
          <X className="size-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
