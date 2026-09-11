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
    return <ResolvedRow toolName={toolName} resolution={resolution} className={className} />;
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-semibold">{toolName}</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      {detail && (
        <div className="px-4 pb-3.5">
          <code className="block overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-sm">{detail}</code>
        </div>
      )}

      <div className="flex items-center gap-2 border-t px-4 py-3">
        <button
          type="button"
          onClick={() => resolve("deny")}
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Deny
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div ref={scopeRef} className="relative shrink-0">
            <div className="flex items-center overflow-hidden rounded-full border">
              <button
                type="button"
                onClick={() => resolve("always-allow", scopes[0])}
                className="px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Always allow
              </button>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={scopeOpen}
                aria-label="Choose scope for always allow"
                onClick={() => setScopeOpen((v) => !v)}
                className="flex h-full items-center border-l px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", scopeOpen && "rotate-180")} />
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
                  className="absolute bottom-full right-0 z-10 mb-2 w-44 overflow-hidden rounded-xl border bg-popover shadow-md"
                >
                  {scopes.map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      role="menuitem"
                      onClick={() => resolve("always-allow", scope)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
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
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}

function ResolvedRow({
  toolName,
  resolution,
  className,
}: {
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

  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm", className)}>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          resolution.decision === "deny"
            ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
        )}
      >
        {resolution.decision === "deny" ? (
          <X className="size-4" />
        ) : resolution.decision === "always-allow" ? (
          <ShieldCheck className="size-4" />
        ) : (
          <Check className="size-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toolName}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
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
