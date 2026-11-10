"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bot, CircleCheck, CircleDashed, CircleX, Globe, ListChecks, LoaderCircle, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckStatus = "pending" | "running" | "passed" | "failed";

export interface PublishCheck {
  id: string;
  label: string;
  /** `rule`: a deterministic check. `agent`: a model reviewing the build. */
  source: "rule" | "agent";
  status: CheckStatus;
  /** On failure: what is wrong and where, in one sentence. */
  detail?: string;
  /** On failure: the agent is fixing it right now. */
  fixing?: boolean;
}

export type PublishGateStage = "checking" | "blocked" | "ready" | "publishing" | "published";

export interface PublishGateProps {
  /** Where the app will go live ("pricing-calculator.acme.app"). */
  target: string;
  checks: PublishCheck[];
  stage: PublishGateStage;
  /** Hand a failed check back to the agent. */
  onFix: (id: string) => void;
  /** Only callable when every check has passed. */
  onPublish: () => void;
  /** Who can open the app once it's live ("Only people at Acme"). */
  audience?: string;
  /** An admin can publish a blocked build; omit for everyone else. */
  onOverride?: () => void;
  className?: string;
}

const SOURCE_LABEL = { rule: "Rule", agent: "Agent review" } as const;

/**
 * The step between "the agent built it" and "it's live". Automated rules and
 * an agent review run against the build; a failed check says what is wrong
 * and can be handed back to the agent to fix; Publish stays disabled until
 * every check passes, and going live is always the person's explicit click.
 */
export function PublishGate({
  target,
  checks,
  stage,
  onFix,
  onPublish,
  audience,
  onOverride,
  className,
}: PublishGateProps) {
  const reduce = useReducedMotion();
  const passed = checks.filter((c) => c.status === "passed").length;
  const failed = checks.filter((c) => c.status === "failed");
  const allPassed = passed === checks.length;
  const statusId = React.useId();

  const summary =
    stage === "published"
      ? "Published"
      : stage === "checking"
        ? `Running checks · ${passed} of ${checks.length} passed`
        : failed.length > 0
          ? `${failed.length} ${failed.length === 1 ? "check" : "checks"} failed · nothing has been published`
          : "All checks passed · ready to publish";

  return (
    <section aria-label="Publish app" className={cn("flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-black/5 dark:ring-white/10", className)}>
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-mono text-xs">{target}</span>
        {audience && <span className="shrink-0 text-[11px] text-muted-foreground">{audience}</span>}
      </header>

      <div className="px-4 pt-3">
        <p id={statusId} role="status" className="flex items-center gap-1.5 text-xs font-medium">
          <ListChecks className="size-3.5 text-muted-foreground" aria-hidden />
          {summary}
        </p>
      </div>

      <ul className="flex flex-col gap-1 px-2 py-2" aria-describedby={statusId}>
        {checks.map((check) => (
          <li key={check.id} className="rounded-lg px-2 py-1.5">
            <div className="flex items-center gap-2">
              <StatusIcon status={check.status} fixing={check.fixing} />
              <span className="min-w-0 flex-1 text-sm">{check.label}</span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                {check.source === "agent" && <Bot className="size-3" aria-hidden />}
                {SOURCE_LABEL[check.source]}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {check.status === "failed" && (
                <motion.div
                  initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="ml-6 mt-1.5 flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 text-xs text-muted-foreground">{check.detail}</p>
                    <button
                      type="button"
                      onClick={() => onFix(check.id)}
                      disabled={check.fixing}
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition-colors hover:bg-foreground/10 disabled:opacity-60 bg-muted"
                    >
                      {check.fixing ? (
                        <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />
                      ) : (
                        <Wrench className="size-3" aria-hidden />
                      )}
                      {check.fixing ? "Agent is fixing…" : "Ask agent to fix"}
                      <span className="sr-only">: {check.label}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>

      <footer className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2.5">
        {stage === "published" ? (
          <p className="flex flex-1 items-center gap-1.5 text-xs">
            <CircleCheck className="size-3.5 text-muted-foreground" aria-hidden />
            Live at <span className="font-mono">{target}</span>
          </p>
        ) : (
          <>
            <p className="min-w-0 flex-1 text-[11px] text-muted-foreground">
              {allPassed ? "Nothing goes live until you publish." : "Publish unlocks when every check passes."}
            </p>
            {onOverride && failed.length > 0 && stage === "blocked" && (
              <button
                type="button"
                onClick={onOverride}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Publish anyway (admin)
              </button>
            )}
            <button
              type="button"
              onClick={onPublish}
              disabled={!allPassed || stage === "publishing"}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity disabled:opacity-40"
            >
              {stage === "publishing" && <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden />}
              {stage === "publishing" ? "Publishing…" : "Publish"}
            </button>
          </>
        )}
      </footer>
    </section>
  );
}

function StatusIcon({ status, fixing }: { status: CheckStatus; fixing?: boolean }) {
  const cls = "size-4 shrink-0";
  if (status === "running" || fixing)
    return (
      <>
        <LoaderCircle className={cn(cls, "animate-spin text-muted-foreground motion-reduce:animate-none")} aria-hidden />
        <span className="sr-only">{fixing ? "Being fixed:" : "Running:"}</span>
      </>
    );
  if (status === "passed")
    return (
      <>
        <CircleCheck className={cn(cls, "text-muted-foreground")} aria-hidden />
        <span className="sr-only">Passed:</span>
      </>
    );
  if (status === "failed")
    return (
      <>
        <CircleX className={cn(cls, "text-destructive")} aria-hidden />
        <span className="sr-only">Failed:</span>
      </>
    );
  return (
    <>
      <CircleDashed className={cn(cls, "text-muted-foreground/60")} aria-hidden />
      <span className="sr-only">Waiting:</span>
    </>
  );
}
