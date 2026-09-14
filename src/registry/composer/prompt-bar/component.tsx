"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Mic, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { StopGenerationButton, type GenerationState } from "../../buttons/stop-generation-button/component";

export type PromptBarVariant = "rounded" | "pill";

export interface PromptBarItem {
  id: string;
  label: string;
  description?: string;
}

export interface PromptBarProps {
  variant?: PromptBarVariant;
  placeholder?: string;
  sources?: PromptBarItem[];
  commands?: PromptBarItem[];
  models?: PromptBarItem[];
  onSubmit?: (value: string) => void;
  className?: string;
}

const defaultSources: PromptBarItem[] = [
  { id: "docs", label: "Docs" },
  { id: "codebase", label: "Codebase" },
  { id: "web", label: "Web" },
  { id: "figma", label: "Figma" },
];

const defaultCommands: PromptBarItem[] = [
  { id: "summarize", label: "/summarize", description: "Summarize the thread" },
  { id: "draft", label: "/draft", description: "Draft a reply" },
  { id: "translate", label: "/translate", description: "Translate this message" },
];

const defaultModels: PromptBarItem[] = [
  { id: "model-5", label: "Model 5" },
  { id: "model-5-mini", label: "Model 5 mini" },
  { id: "model-4", label: "Model 4" },
];

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

export function PromptBar({
  variant = "rounded",
  placeholder = "Write a message...",
  sources = defaultSources,
  commands = defaultCommands,
  models = defaultModels,
  onSubmit,
  className,
}: PromptBarProps) {
  const [model, setModel] = React.useState(models[0]?.label ?? "");
  const [modelOpen, setModelOpen] = React.useState(false);
  const [dictating, setDictating] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [suppressed, setSuppressed] = React.useState(false);
  const [generationState, setGenerationState] = React.useState<GenerationState>("idle");
  const [textBeforeCursor, setTextBeforeCursor] = React.useState("");
  const [hasContent, setHasContent] = React.useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const modelMenuRef = useClickOutside<HTMLDivElement>(() => setModelOpen(false));

  const isDisabled = generationState === "generating";

  const trigger = getActiveTrigger(textBeforeCursor);
  const suggestions = trigger
    ? (trigger.type === "source" ? sources : commands).filter((item) =>
        item.label
          .toLowerCase()
          .replace(/^\//, "")
          .includes(trigger.query.replace(/^\//, ""))
      )
    : [];
  const showSuggestions = Boolean(trigger) && !suppressed && suggestions.length > 0;
  const canSend = hasContent;

  const triggerKey = trigger ? `${trigger.type}:${trigger.start}` : null;
  const prevTriggerKeyRef = React.useRef(triggerKey);
  if (triggerKey !== prevTriggerKeyRef.current) {
    prevTriggerKeyRef.current = triggerKey;
    if (activeIndex !== 0) setActiveIndex(0);
    if (suppressed) setSuppressed(false);
  }

  React.useEffect(() => {
    if (generationState !== "generating") return;
    const id = window.setTimeout(() => setGenerationState("idle"), 2600);
    return () => window.clearTimeout(id);
  }, [generationState]);

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
    const space = document.createTextNode(" ");
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

  function handleSubmit() {
    const content = serializeEditor();
    if (!content || isDisabled) return;
    onSubmit?.(content);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setHasContent(false);
    setTextBeforeCursor("");
    setGenerationState("generating");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertChip(suggestions[activeIndex]);
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
    <div className={cn("relative w-full", className)}>
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 z-10 mb-2 w-full max-w-xs overflow-hidden rounded-xl border bg-popover shadow-md"
          >
            {suggestions.map((item, i) => (
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

      <div
        className={cn(
          "flex flex-wrap items-end gap-1.5 border bg-card p-2.5 shadow-sm sm:flex-nowrap sm:gap-1 sm:p-2",
          variant === "pill" ? "rounded-3xl sm:rounded-full" : "rounded-2xl"
        )}
      >
        <button
          type="button"
          className="order-2 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:order-none"
          aria-label="Add attachment"
        >
          <Plus className="size-4" />
        </button>

        <div className="relative order-1 w-full min-w-0 basis-full sm:order-none sm:w-auto sm:flex-1">
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
              "max-h-40 min-h-[1.5rem] overflow-x-hidden overflow-y-auto break-words bg-transparent py-1.5 text-sm outline-none leading-normal",
              isDisabled && "pointer-events-none text-muted-foreground"
            )}
          />
          {!hasContent && (
            <span className="pointer-events-none absolute left-0 top-1.5 text-sm text-muted-foreground">
              {placeholder}
            </span>
          )}
        </div>

        <div ref={modelMenuRef} className="relative order-2 ml-auto shrink-0 sm:order-none sm:ml-0">
          <button
            type="button"
            onClick={() => setModelOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {model}
            <ChevronDown className={cn("size-3.5 transition-transform", modelOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {modelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-full right-0 z-10 mb-2 w-40 overflow-hidden rounded-xl border bg-popover shadow-md"
              >
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setModel(m.label);
                      setModelOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm hover:bg-accent",
                      m.label === model && "font-medium"
                    )}
                  >
                    {m.label}
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
            "relative order-2 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors sm:order-none",
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
          onSubmit={handleSubmit}
          onStop={() => setGenerationState("idle")}
          className="order-2 sm:order-none"
        />
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
