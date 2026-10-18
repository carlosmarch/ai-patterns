"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Copy, ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CodingTool {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SetupAlternative {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export type PromptOnboardingStatus = "waiting" | "received";

export interface PromptOnboardingProps {
  title: string;
  /** Shown masked in the header with a copy control. The prompt should already embed it. */
  apiKey?: string;
  /** The setup prompt the user hands to their coding agent. */
  prompt: string;
  /** Manual fallback: the classic SDK snippet or install commands. */
  snippet: string;
  /** One-line explainers under the method toggle. */
  hints?: Record<Mode, string>;
  /** Agents the prompt can be opened in. The first one is the split button's default. */
  tools: CodingTool[];
  alternatives?: SetupAlternative[];
  /** "waiting" until the product sees the first real signal (event, request, webhook). */
  status: PromptOnboardingStatus;
  statusLabels?: Record<PromptOnboardingStatus, string>;
  onOpenIn?: (tool: CodingTool) => void;
  onCopy?: (mode: "prompt" | "snippet") => void;
  onSkip?: () => void;
  onFinish?: () => void;
  className?: string;
}

type Mode = "prompt" | "snippet";

const DEFAULT_HINTS: Record<Mode, string> = {
  prompt: "Paste this prompt into an AI coding tool — it reads your codebase and wires up the integration.",
  snippet: "Prefer to do it by hand? Install the SDK and add this where your app starts.",
};

const DEFAULT_STATUS_LABELS: Record<PromptOnboardingStatus, string> = {
  waiting: "Waiting for your events…",
  received: "First event received",
};

export function PromptOnboarding({
  title,
  apiKey,
  prompt,
  snippet,
  tools,
  alternatives = [],
  status,
  hints = DEFAULT_HINTS,
  statusLabels = DEFAULT_STATUS_LABELS,
  onOpenIn,
  onCopy,
  onSkip,
  onFinish,
  className,
}: PromptOnboardingProps) {
  const [mode, setMode] = React.useState<Mode>("prompt");
  const [expanded, setExpanded] = React.useState(false);
  const [copied, setCopied] = useCopied();
  const [toolId, setToolId] = React.useState(tools[0]?.id);
  const tool = tools.find((t) => t.id === toolId) ?? tools[0];
  const body = mode === "prompt" ? prompt : snippet;
  const received = status === "received";

  async function copyBody() {
    await writeClipboard(body);
    setCopied(mode);
    onCopy?.(mode);
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {apiKey && <ApiKeyChip apiKey={apiKey} />}
      </div>

      <div className="px-5 pt-4">
        <div className="relative rounded-xl border border-primary/30 p-4 shadow-[0_0_0_4px] shadow-primary/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{mode === "prompt" ? "AI prompt" : "Snippet"}</span>
            {mode === "prompt" && (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Recommended
              </span>
            )}
          </div>

          <div role="tablist" aria-label="Setup method" className="mt-3 inline-flex rounded-lg border p-0.5">
            {(["prompt", "snippet"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === m && (
                  <motion.span
                    layoutId="prompt-onboarding-tab"
                    className="absolute inset-0 rounded-md bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative">{m === "prompt" ? "AI prompt" : "Snippet"}</span>
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{hints[mode]}</p>

          <div role="tabpanel" className="relative mt-3 overflow-hidden rounded-lg bg-muted/60">
            <motion.pre
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, height: expanded ? "auto" : 72 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden whitespace-pre-wrap px-3 pt-2.5 pb-6 font-mono text-[11px] leading-relaxed text-foreground/90"
            >
              {body}
            </motion.pre>
            {!expanded && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-muted to-transparent" />
            )}
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              className="absolute inset-x-0 bottom-0 flex justify-center py-1 text-muted-foreground hover:text-foreground"
            >
              <span className="sr-only">{expanded ? "Collapse" : "Show full"} {mode}</span>
              <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {mode === "prompt" && tool && (
              <OpenInButton tools={tools} tool={tool} onSelect={setToolId} onOpen={() => onOpenIn?.(tool)} />
            )}
            <button
              type="button"
              onClick={copyBody}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.97]"
            >
              <SwapIcon done={copied === mode} />
              {copied === mode ? "Copied" : mode === "prompt" ? "Copy prompt" : "Copy snippet"}
            </button>
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="px-5 pt-5">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or set up another way
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {alternatives.map((alt) => (
              <button
                key={alt.id}
                type="button"
                onClick={alt.onClick}
                className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-accent/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <alt.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{alt.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{alt.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col items-center gap-2 border-t bg-muted/40 px-5 py-3">
        <div role="status" aria-live="polite" className="flex items-center gap-2 text-xs font-medium">
          <StatusDot received={received} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {statusLabels[status]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          {!received && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-medium text-primary hover:underline"
            >
              Skip for now
            </button>
          )}
          <button
            type="button"
            onClick={onFinish}
            disabled={!received}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors",
              received
                ? "bg-primary text-primary-foreground"
                : "cursor-not-allowed bg-muted text-muted-foreground/70"
            )}
          >
            Finish setup
            <ArrowRight className="size-3" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function OpenInButton({
  tools,
  tool,
  onSelect,
  onOpen,
}: {
  tools: CodingTool[];
  tool: CodingTool;
  onSelect: (id: string) => void;
  onOpen: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Icon = tool.icon;

  return (
    <div ref={ref} className="relative inline-flex h-8 rounded-lg border text-xs font-medium">
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 rounded-l-lg px-3 transition-colors hover:bg-accent/60"
      >
        {Icon && <Icon className="size-3.5" aria-hidden />}
        Open in {tool.label}
      </button>
      {tools.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Choose coding tool"
          className="inline-flex items-center rounded-r-lg border-l px-2 transition-colors hover:bg-accent/60"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 bottom-full z-10 mb-1.5 min-w-44 origin-bottom-right rounded-lg border bg-popover p-1 shadow-lg"
          >
            {tools.map((t) => {
              const ItemIcon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={t.id === tool.id}
                  onClick={() => {
                    onSelect(t.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent"
                >
                  {ItemIcon && <ItemIcon className="size-3.5 text-muted-foreground" aria-hidden />}
                  <span className="flex-1">{t.label}</span>
                  {t.id === tool.id && <Check className="size-3.5" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApiKeyChip({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useCopied();
  const masked = `${apiKey.slice(0, 4)}${"•".repeat(10)}${apiKey.slice(-4)}`;

  return (
    <div className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">API key</span>
      <code className="font-mono text-[11px]">{masked}</code>
      <button
        type="button"
        onClick={async () => {
          await writeClipboard(apiKey);
          setCopied("key");
        }}
        aria-label={copied ? "API key copied" : "Copy API key"}
        className="text-muted-foreground hover:text-foreground"
      >
        <SwapIcon done={copied === "key"} />
      </button>
    </div>
  );
}

function SwapIcon({ done }: { done: boolean }) {
  return (
    <span className="relative inline-flex size-3.5">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "check" : "copy"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0"
        >
          {done ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function StatusDot({ received }: { received: boolean }) {
  return (
    <span className="relative flex size-2.5" aria-hidden>
      {!received && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary"
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.span
        className={cn("relative size-2.5 rounded-full", received ? "bg-emerald-500" : "bg-primary")}
        animate={received ? { scale: [0.6, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
      />
    </span>
  );
}

function useCopied() {
  const [copied, setCopied] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  return [copied, setCopied] as const;
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard can be blocked (insecure context, iframe); the UI still confirms.
  }
}
