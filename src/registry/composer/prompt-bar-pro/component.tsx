"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Mic, Monitor, Plus, Shuffle } from "lucide-react";

import { cn } from "@/lib/utils";
import { StopGenerationButton, type GenerationState } from "../../buttons/stop-generation-button/component";

export interface SessionSuggestion {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SessionOption {
  id: string;
  label: string;
}

export interface PromptBarProProps {
  suggestions: SessionSuggestion[];
  visibleCount?: number;
  environments?: SessionOption[];
  orchestrators?: SessionOption[];
  placeholder?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

const defaultEnvironments: SessionOption[] = [
  { id: "computer", label: "Computer" },
  { id: "browser", label: "Browser" },
  { id: "cloud", label: "Cloud" },
];

const defaultOrchestrators: SessionOption[] = [
  { id: "orchestrator", label: "Orchestrator" },
  { id: "researcher", label: "Researcher" },
  { id: "coder", label: "Coder" },
];

function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

export function PromptBarPro({
  suggestions,
  visibleCount = 3,
  environments = defaultEnvironments,
  orchestrators = defaultOrchestrators,
  placeholder = "Start a session",
  onSubmit,
  className,
}: PromptBarProProps) {
  const [visible, setVisible] = React.useState(() => suggestions.slice(0, visibleCount));
  const [value, setValue] = React.useState("");
  const [environment, setEnvironment] = React.useState(environments[0]?.label ?? "");
  const [environmentOpen, setEnvironmentOpen] = React.useState(false);
  const [orchestrator, setOrchestrator] = React.useState(orchestrators[0]?.label ?? "");
  const [orchestratorOpen, setOrchestratorOpen] = React.useState(false);
  const [dictating, setDictating] = React.useState(false);
  const [generationState, setGenerationState] = React.useState<GenerationState>("idle");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const environmentRef = useClickOutside<HTMLDivElement>(() => setEnvironmentOpen(false));
  const orchestratorRef = useClickOutside<HTMLDivElement>(() => setOrchestratorOpen(false));

  const canSend = value.trim().length > 0;

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  React.useEffect(() => {
    if (generationState !== "generating") return;
    const id = window.setTimeout(() => setGenerationState("idle"), 2600);
    return () => window.clearTimeout(id);
  }, [generationState]);

  function handleSubmit() {
    if (!canSend || generationState === "generating") return;
    onSubmit?.(value.trim());
    setValue("");
    setGenerationState("generating");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setValue(s.label)}
            className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors hover:bg-accent"
          >
            <s.icon className="size-4 text-muted-foreground" />
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setVisible(pickRandom(suggestions, visibleCount))}
          aria-label="Shuffle suggestions"
          className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Shuffle className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={generationState === "generating"}
          className="max-h-40 min-h-14 w-full resize-none bg-transparent px-1 py-1 text-base outline-none placeholder:text-muted-foreground disabled:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Add attachment"
          >
            <Plus className="size-4" />
          </button>

          <div ref={environmentRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setEnvironmentOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Monitor className="size-3.5 text-muted-foreground" />
              {environment}
              <ChevronDown className={cn("size-3.5 transition-transform", environmentOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {environmentOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full left-0 z-10 mb-2 w-36 overflow-hidden rounded-xl border bg-popover shadow-md"
                >
                  {environments.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        setEnvironment(e.label);
                        setEnvironmentOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-sm hover:bg-accent",
                        e.label === environment && "font-medium"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <div ref={orchestratorRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOrchestratorOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {orchestrator}
                <ChevronDown className={cn("size-3.5 transition-transform", orchestratorOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {orchestratorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full right-0 z-10 mb-2 w-36 overflow-hidden rounded-xl border bg-popover shadow-md"
                  >
                    {orchestrators.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setOrchestrator(o.label);
                          setOrchestratorOpen(false);
                        }}
                        className={cn(
                          "block w-full px-3 py-2 text-left text-sm hover:bg-accent",
                          o.label === orchestrator && "font-medium"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setDictating((v) => !v)}
              aria-pressed={dictating}
              aria-label="Toggle dictation"
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                dictating ? "text-destructive" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {dictating && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-destructive/20"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <Mic className="size-4" />
            </button>

            <StopGenerationButton
              state={generationState}
              disabled={!canSend}
              onSubmit={handleSubmit}
              onStop={() => setGenerationState("idle")}
              className="size-9"
            />
          </div>
        </div>
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
