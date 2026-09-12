"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToolApprovalDecision = "allow" | "always-allow" | "deny";

export interface ToolApprovalScope {
  id: string;
  label: string;
}

export interface ToolApprovalProps {
  icon: React.ComponentType<{ className?: string }>;
  toolName: string;
  summary: string;
  detail?: string;
  scopes?: ToolApprovalScope[];
  onDecision?: (decision: ToolApprovalDecision, scope?: ToolApprovalScope) => void;
  className?: string;
}

const defaultScopes: ToolApprovalScope[] = [
  { id: "command", label: "this command" },
  { id: "project", label: "this project" },
  { id: "always", label: "always" },
];

interface Resolution {
  decision: ToolApprovalDecision;
  scope?: ToolApprovalScope;
}

export function ToolApproval({
  icon: Icon,
  toolName,
  summary,
  detail,
  scopes = defaultScopes,
  onDecision,
  className,
}: ToolApprovalProps) {
  const [resolution, setResolution] = React.useState<Resolution | null>(null);
  const [scopeOpen, setScopeOpen] = React.useState(false);
  const scopeRef = useClickOutside<HTMLDivElement>(() => setScopeOpen(false));

  function resolve(decision: ToolApprovalDecision, scope?: ToolApprovalScope) {
    setScopeOpen(false);
    setResolution({ decision, scope });
    onDecision?.(decision, scope);
  }

  if (resolution) {
    return <ResolvedRow icon={Icon} toolName={toolName} resolution={resolution} className={className} />;
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-sm">
          <span className="font-medium">{toolName}</span>
          <span className="text-muted-foreground"> · {summary}</span>
        </p>
      </div>

      {detail && (
        <div className="px-3.5 pb-2.5">
          <code className="block overflow-x-auto rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs">{detail}</code>
        </div>
      )}

      <div className="flex items-center gap-1.5 border-t px-3.5 py-2">
        <button
          type="button"
          onClick={() => resolve("deny")}
          className="rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Deny
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div ref={scopeRef} className="relative shrink-0">
            <div className="flex items-center overflow-hidden rounded-full border">
              <button
                type="button"
                onClick={() => resolve("always-allow", scopes[0])}
                className="px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                Always allow
              </button>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={scopeOpen}
                aria-label="Choose scope for always allow"
                onClick={() => setScopeOpen((v) => !v)}
                className="flex h-full items-center border-l px-1.5 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronDown className={cn("size-3 transition-transform", scopeOpen && "rotate-180")} />
              </button>
            </div>
            <AnimatePresence>
              {scopeOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full right-0 z-10 mb-2 w-40 overflow-hidden rounded-lg border bg-popover shadow-md"
                >
                  {scopes.map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      role="menuitem"
                      onClick={() => resolve("always-allow", scope)}
                      className="block w-full px-2.5 py-1.5 text-left text-xs hover:bg-accent"
                    >
                      Always allow for {scope.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => resolve("allow")}
            className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}

function ResolvedRow({
  icon: Icon,
  toolName,
  resolution,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  toolName: string;
  resolution: Resolution;
  className?: string;
}) {
  const label =
    resolution.decision === "deny"
      ? "Denied"
      : resolution.decision === "always-allow"
        ? `Always allowed for ${resolution.scope?.label ?? "this project"}`
        : "Allowed";

  const StatusIcon = resolution.decision === "deny" ? X : resolution.decision === "always-allow" ? ShieldCheck : Check;
  const statusColor =
    resolution.decision === "deny"
      ? "text-red-600 dark:text-red-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className={cn("flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5", className)}>
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{toolName}</span>
        <span className="text-muted-foreground"> · {label}</span>
      </p>
      <StatusIcon className={cn("size-3.5 shrink-0", statusColor)} />
    </div>
  );
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}
