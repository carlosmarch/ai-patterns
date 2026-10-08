"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Square,
  Terminal,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type BackgroundTaskStatus = "running" | "done" | "error" | "stopped";

export interface BackgroundTask {
  id: string;
  title: string;
  /** "agent" tasks show live stats and a transcript link; "shell" tasks show their command and output. */
  kind: "agent" | "shell";
  /** Short label for the kind, e.g. "Agent" or "Bash". */
  kindLabel?: string;
  status: BackgroundTaskStatus;
  elapsedSeconds: number;
  /** Present-tense label for what the task is doing right now. */
  activity?: string;
  /** Compact live facts, e.g. ["Opus", "54.4k tokens", "6 tool uses"]. */
  stats?: string[];
  command?: string;
  output?: string;
}

export interface BackgroundTasksDrawerProps {
  open: boolean;
  onClose: () => void;
  tasks: BackgroundTask[];
  onStop?: (id: string) => void;
  onClearFinished?: () => void;
  onViewTranscript?: (id: string) => void;
  title?: string;
  className?: string;
}

const STATUS_LABEL: Record<Exclude<BackgroundTaskStatus, "running">, string> = {
  done: "Completed",
  error: "Failed",
  stopped: "Stopped",
};

function formatElapsed(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function BackgroundTasksDrawer({
  open,
  onClose,
  tasks,
  onStop,
  onClearFinished,
  onViewTranscript,
  title = "Background tasks",
  className,
}: BackgroundTasksDrawerProps) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);
  const [finishedOpen, setFinishedOpen] = React.useState(true);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const running = tasks.filter((t) => t.status === "running");
  const finished = tasks.filter((t) => t.status !== "running");

  React.useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={panelRef}
          tabIndex={-1}
          role="complementary"
          aria-label={title}
          initial={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          className={cn(
            "flex h-full flex-col overflow-hidden border-l bg-background shadow-xl outline-none transition-[width] duration-300",
            expanded ? "w-full" : "w-full max-w-sm",
            className
          )}
        >
          <header className="flex items-center gap-1 px-4 pb-2 pt-3">
            <h2 className="flex-1 text-sm font-medium">{title}</h2>
            <IconButton
              label="Clear finished tasks"
              onClick={onClearFinished}
              disabled={finished.length === 0}
            >
              <Trash2 className="size-3.5" />
            </IconButton>
            <IconButton
              label={expanded ? "Collapse panel" : "Expand panel"}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </IconButton>
            <IconButton label="Close" onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </header>

          <p aria-live="polite" className="sr-only">
            {running.length > 0
              ? `${running.length} task${running.length === 1 ? "" : "s"} running`
              : "No tasks running"}
          </p>

          <LayoutGroup>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="py-2 text-xs text-muted-foreground">Running</h3>
                {running.length === 0 ? (
                  <p className="rounded-xl border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                    Nothing running right now
                  </p>
                ) : (
                  <ul className="space-y-2">
                    <AnimatePresence initial={false} mode="popLayout">
                      {running.map((task) => (
                        <RunningCard
                          key={task.id}
                          task={task}
                          onStop={onStop}
                          onViewTranscript={onViewTranscript}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </section>

              {finished.length > 0 && (
                <motion.section layout="position">
                  <button
                    type="button"
                    onClick={() => setFinishedOpen((v) => !v)}
                    aria-expanded={finishedOpen}
                    className="flex items-center gap-1 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Finished {finished.length}
                    <ChevronDown
                      className={cn("size-3 transition-transform", !finishedOpen && "-rotate-90")}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {finishedOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="space-y-2 overflow-hidden"
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          {finished.map((task) => (
                            <FinishedRow key={task.id} task={task} />
                          ))}
                        </AnimatePresence>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.section>
              )}
            </div>
          </LayoutGroup>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function RunningCard({
  task,
  onStop,
  onViewTranscript,
}: {
  task: BackgroundTask;
  onStop?: (id: string) => void;
  onViewTranscript?: (id: string) => void;
}) {
  const KindIcon = task.kind === "agent" ? Bot : Terminal;
  const meta = task.stats ?? [];

  return (
    <motion.li
      layoutId={task.id}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      className="relative overflow-hidden rounded-xl bg-muted/60 p-3"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <KindIcon className="size-3" aria-hidden />
            {task.kindLabel ?? (task.kind === "agent" ? "Agent" : "Shell")}
            <span className="font-mono tabular-nums">{formatElapsed(task.elapsedSeconds)}</span>
          </p>
        </div>
        {onStop && (
          <button
            type="button"
            onClick={() => onStop(task.id)}
            aria-label={`Stop ${task.title}`}
            className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground"
          >
            <Square className="size-2.5 fill-current" />
          </button>
        )}
      </div>

      {(meta.length > 0 || task.activity) && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {meta.join(" · ")}
          {task.activity && (
            <>
              {meta.length > 0 && " · "}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={task.activity}
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, var(--muted-foreground) 30%, var(--foreground) 50%, var(--muted-foreground) 70%)",
                    backgroundSize: "200% 100%",
                  }}
                  initial={{ opacity: 0, backgroundPositionX: "150%" }}
                  animate={{ opacity: 1, backgroundPositionX: "-50%" }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.15 },
                    backgroundPositionX: { repeat: Infinity, repeatType: "loop", duration: 1.4, ease: "linear", repeatDelay: 0.8 },
                  }}
                >
                  {task.activity}
                </motion.span>
              </AnimatePresence>
            </>
          )}
        </p>
      )}

      {task.kind === "agent" && onViewTranscript && (
        <button
          type="button"
          onClick={() => onViewTranscript(task.id)}
          className="mt-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
        >
          View transcript
        </button>
      )}

      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.li>
  );
}

function FinishedRow({ task }: { task: BackgroundTask }) {
  const [open, setOpen] = React.useState(false);
  const hasDetails = Boolean(task.command || task.output);
  const status = task.status as Exclude<BackgroundTaskStatus, "running">;

  return (
    <motion.li
      layoutId={task.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        open ? "bg-background" : "bg-muted/40"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={hasDetails ? open : undefined}
        disabled={!hasDetails}
        className="flex w-full items-start gap-2 p-3 text-left disabled:cursor-default"
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm text-foreground/70">
            {task.title}
            {hasDetails && (
              <ChevronRight
                className={cn("size-3.5 shrink-0 transition-transform", open && "rotate-90")}
                aria-hidden
              />
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {task.kindLabel ?? (task.kind === "agent" ? "Agent" : "Shell")}
            <StatusBadge status={status} />
            <span className="font-mono tabular-nums">{formatElapsed(task.elapsedSeconds)}</span>
          </p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3">
              {task.command && (
                <pre className="whitespace-pre-wrap break-words rounded-lg border bg-background px-3 py-2 font-mono text-[11px] leading-relaxed">
                  <span className="select-none text-muted-foreground">$ </span>
                  {task.command}
                </pre>
              )}
              {task.output && (
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted px-3 py-2 font-mono text-[11px] leading-relaxed text-foreground/80">
                  {task.output}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function StatusBadge({ status }: { status: Exclude<BackgroundTaskStatus, "running"> }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        status === "done" && "text-emerald-700 dark:text-emerald-400",
        status === "error" && "text-destructive"
      )}
    >
      {status === "done" && <Check className="size-3" aria-hidden />}
      {status === "error" && <X className="size-3" aria-hidden />}
      {status === "stopped" && <Square className="size-2.5" aria-hidden />}
      {STATUS_LABEL[status]}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={label}
      title={label}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
