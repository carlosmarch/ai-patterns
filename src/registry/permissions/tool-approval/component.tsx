"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ShieldAlert, Terminal, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ToolApprovalProps {
  toolName: string;
  command: string;
  description?: string;
  /** Marks the action as consequential/hard to undo — swaps the icon and accents the border. */
  destructive?: boolean;
  onAllow?: () => void;
  onAllowAlways?: () => void;
  onDeny?: (reason?: string) => void;
  className?: string;
}

type Status = "pending" | "allowed" | "always-allowed" | "denied";

export function ToolApproval({
  toolName,
  command,
  description,
  destructive = false,
  onAllow,
  onAllowAlways,
  onDeny,
  className,
}: ToolApprovalProps) {
  const [status, setStatus] = React.useState<Status>("pending");
  const [denying, setDenying] = React.useState(false);
  const [reason, setReason] = React.useState("");

  function allow() {
    setStatus("allowed");
    onAllow?.();
  }
  function allowAlways() {
    setStatus("always-allowed");
    onAllowAlways?.();
  }
  function deny() {
    setStatus("denied");
    onDeny?.(reason.trim() || undefined);
  }

  return (
    <div
      role="group"
      aria-label={`Approve running ${toolName}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && status === "pending") deny();
      }}
      className={cn(
        "w-full max-w-md overflow-hidden rounded-2xl border bg-card shadow-sm",
        destructive && status === "pending" && "border-destructive/40",
        className
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            destructive ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}
        >
          {destructive ? <ShieldAlert className="size-4" /> : <Terminal className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Run <span className="font-mono">{toolName}</span>?
          </p>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground/90">
            {command}
          </pre>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "pending" ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t"
          >
            {!denying ? (
              <div className="flex items-center gap-2 px-4 py-2.5">
                <button
                  type="button"
                  onClick={allow}
                  className="rounded-full bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Allow
                </button>
                <button
                  type="button"
                  onClick={allowAlways}
                  className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Always allow
                </button>
                <button
                  type="button"
                  onClick={() => setDenying(true)}
                  className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Deny
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5">
                <input
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && deny()}
                  placeholder="Tell it what to do instead (optional)"
                  className="min-w-0 flex-1 rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
                <button
                  type="button"
                  onClick={deny}
                  className="shrink-0 rounded-full bg-destructive px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Deny
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="resolved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 border-t px-4 py-2.5 text-sm text-muted-foreground"
          >
            {status === "denied" ? (
              <>
                <X className="size-3.5" /> Denied{reason.trim() ? `: ${reason.trim()}` : ""}
              </>
            ) : (
              <>
                <Check className="size-3.5" /> {status === "always-allowed" ? "Always allowed" : "Allowed"}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
