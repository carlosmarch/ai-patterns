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

export interface PromptBarItem {
  id: string;
  label: string;
  description?: string;
}

export interface PromptBarProProps {
  suggestions: SessionSuggestion[];
  visibleCount?: number;
  environments?: SessionOption[];
  orchestrators?: SessionOption[];
  sources?: PromptBarItem[];
  commands?: PromptBarItem[];
  placeholder?: string;
  onSubmit?: (value: string) => void;
  /** Controls the generating/idle state from outside (e.g. a parent tracking a whole run). When omitted, the composer manages it internally. */
  generating?: boolean;
  /** Called when Stop is clicked while `generating` is controlled from outside. */
  onStop?: () => void;
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

const defaultSources: PromptBarItem[] = [
  { id: "drive", label: "Drive" },
  { id: "github", label: "GitHub" },
  { id: "linear", label: "Linear" },
];

const defaultCommands: PromptBarItem[] = [
  { id: "summarize", label: "/summarize", description: "Summarize the current context" },
  { id: "plan", label: "/plan", description: "Draft a step-by-step plan" },
  { id: "research", label: "/research", description: "Research a topic before starting" },
];

function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

interface Trigger {
  type: "source" | "command";
  query: string;
  start: number;
}

function getActiveTrigger(text: string): Trigger | null {
  const match = text.match(/(?:^|\s)([@/])(\S*)$/);
  if (!match) return null;
  const [full, symbol, query] = match;
  return {
    type: symbol === "@" ? "source" : "command",
    query: query.toLowerCase(),
    start: text.length - full.length + full.indexOf(symbol),
  };
}

const CHIP_CLASS =
  "inline-block rounded-sm bg-primary/10 text-primary px-1.5 py-1 text-xs font-medium leading-none select-none align-middle mx-px mb-1 mr-1";

export function PromptBarPro({
  suggestions,
  visibleCount = 3,
  environments = defaultEnvironments,
  orchestrators = defaultOrchestrators,
  sources = defaultSources,
  commands = defaultCommands,
  placeholder = "Start a session",
  onSubmit,
  generating,
  onStop,
  className,
}: PromptBarProProps) {
  const [visible, setVisible] = React.useState(() => suggestions.slice(0, visibleCount));
  const [environment, setEnvironment] = React.useState(environments[0]?.label ?? "");
  const [environmentOpen, setEnvironmentOpen] = React.useState(false);
  const [orchestrator, setOrchestrator] = React.useState(orchestrators[0]?.label ?? "");
  const [orchestratorOpen, setOrchestratorOpen] = React.useState(false);
  const [dictating, setDictating] = React.useState(false);
  const [internalGenerationState, setInternalGenerationState] = React.useState<GenerationState>("idle");
  const isControlled = generating !== undefined;
  const generationState: GenerationState = isControlled ? (generating ? "generating" : "idle") : internalGenerationState;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [suppressed, setSuppressed] = React.useState(false);
  const [textBeforeCursor, setTextBeforeCursor] = React.useState("");
  const [hasContent, setHasContent] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const environmentRef = useClickOutside<HTMLDivElement>(() => setEnvironmentOpen(false));
  const orchestratorRef = useClickOutside<HTMLDivElement>(() => setOrchestratorOpen(false));

  const isDisabled = generationState === "generating";

  const trigger = getActiveTrigger(textBeforeCursor);
  const autocompleteSuggestions = trigger
    ? (trigger.type === "source" ? sources : commands).filter((item) =>
        item.label
          .toLowerCase()
          .replace(/^\//, "")
          .includes(trigger.query.replace(/^\//, ""))
      )
    : [];
  const showAutocomplete = Boolean(trigger) && !suppressed && autocompleteSuggestions.length > 0;
  const canSend = hasContent;

  const triggerKey = trigger ? `${trigger.type}:${trigger.start}` : null;
  const prevTriggerKeyRef = React.useRef(triggerKey);
  if (triggerKey !== prevTriggerKeyRef.current) {
    prevTriggerKeyRef.current = triggerKey;
    if (activeIndex !== 0) setActiveIndex(0);
    if (suppressed) setSuppressed(false);
  }

  React.useEffect(() => {
    if (isControlled || internalGenerationState !== "generating") return;
    const id = window.setTimeout(() => setInternalGenerationState("idle"), 2600);
    return () => window.clearTimeout(id);
  }, [isControlled, internalGenerationState]);

  function getTextBeforeCursor(): string {
    const sel = window.getSelection();
    const el = editorRef.current;
    if (!sel?.rangeCount || !el) return "";
    const cursorRange = sel.getRangeAt(0);
    const range = document.createRange();
    range.setStart(el, 0);
    range.setEnd(cursorRange.startContainer, cursorRange.startOffset);
    const frag = range.cloneContents();
    let text = "";
    frag.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.chip === "true") {
        text += `@${node.dataset.label}`;
      }
    });
    return text;
  }

  function serializeEditor(): string {
    const el = editorRef.current;
    if (!el) return "";
    let text = "";
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.chip === "true") {
        text += `@${node.dataset.label}`;
      }
    });
    return text.trim();
  }

  function updateEditorState() {
    const el = editorRef.current;
    if (!el) return;
    const hasText = (el.textContent ?? "").trim().length > 0;
    const hasChips = el.querySelector("[data-chip]") !== null;
    setHasContent(hasText || hasChips);
    setTextBeforeCursor(getTextBeforeCursor());
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function insertChip(item: PromptBarItem) {
    const sel = window.getSelection();
    const el = editorRef.current;
    if (!sel?.rangeCount || !el) return;

    const range = sel.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;

    // Delete the @query text from the current text node
    if (container.nodeType === Node.TEXT_NODE) {
      const text = container.textContent ?? "";
      const textBefore = text.slice(0, offset);
      const atIndex = textBefore.lastIndexOf("@");
      if (atIndex !== -1) {
        container.textContent = text.slice(0, atIndex) + text.slice(offset);
        const newRange = document.createRange();
        newRange.setStart(container, atIndex);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }

    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.chip = "true";
    chip.dataset.label = item.label;
    chip.textContent = `@${item.label}`;
    chip.className = CHIP_CLASS;

    const insertRange = sel.getRangeAt(0);
    insertRange.insertNode(chip);

    // Place cursor in a text node right after the chip
    const space = document.createTextNode(" ");
    const afterRange = document.createRange();
    afterRange.setStartAfter(chip);
    afterRange.insertNode(space);
    afterRange.setStartAfter(space);
    afterRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(afterRange);

    updateEditorState();
    el.focus();
  }

  function handleSubmit(overrideValue?: string) {
    if (isDisabled) return;
    if (overrideValue) {
      onSubmit?.(overrideValue);
      if (!isControlled) setInternalGenerationState("generating");
      return;
    }
    const content = serializeEditor();
    if (!content) return;
    onSubmit?.(content);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setHasContent(false);
    setTextBeforeCursor("");
    if (!isControlled) setInternalGenerationState("generating");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (showAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % autocompleteSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertChip(autocompleteSuggestions[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSuppressed(true);
        return;
      }
    }
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
            onClick={() => handleSubmit(s.label)}
            disabled={isDisabled}
            className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
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

      <div className="relative">
        <AnimatePresence>
          {showAutocomplete && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full left-0 z-10 mb-2 w-full max-w-xs overflow-hidden rounded-xl border bg-popover shadow-md"
            >
              {autocompleteSuggestions.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertChip(item);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm",
                    i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  )}
                >
                  <span className="font-medium">
                    {trigger?.type === "source" ? `@${item.label}` : item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm">
          <div className="relative w-full">
            <div
              ref={editorRef}
              contentEditable={!isDisabled}
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label={placeholder}
              onInput={updateEditorState}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className={cn(
                "max-h-40 min-h-14 w-full overflow-x-hidden overflow-y-auto break-words bg-transparent px-1 py-1 text-base outline-none leading-normal",
                isDisabled && "pointer-events-none text-muted-foreground"
              )}
            />
            {!hasContent && (
              <span className="pointer-events-none absolute left-1 top-1 text-base text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Add attachment"
            >
              <Plus className="size-4" />
            </button>

            <div ref={environmentRef} className="relative hidden shrink-0 sm:block">
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
                    animate={{ scale: [1, 1.4], opacity: [0, 0.6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <Mic className="size-4" />
              </button>

              <StopGenerationButton
                state={generationState}
                disabled={!canSend}
                onSubmit={() => handleSubmit()}
                onStop={() => (isControlled ? onStop?.() : setInternalGenerationState("idle"))}
                className="size-9"
              />
            </div>
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
