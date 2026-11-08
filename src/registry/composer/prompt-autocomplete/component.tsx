"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PromptAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * Returns the text that would continue `prompt` (not the whole prompt),
   * or an empty string for no suggestion. Called after the person pauses.
   */
  getSuggestion: (prompt: string, signal: AbortSignal) => Promise<string>;
  onSubmit?: (prompt: string) => void;
  placeholder?: string;
  /** Pause, in ms, before asking for a suggestion. */
  delay?: number;
  /** Prompts shorter than this many characters get no suggestion. */
  minLength?: number;
  className?: string;
}

export function PromptAutocomplete({
  value,
  onChange,
  getSuggestion,
  onSubmit,
  placeholder = "Ask anything…",
  delay = 300,
  minLength = 3,
  className,
}: PromptAutocompleteProps) {
  const [suggestion, setSuggestion] = React.useState("");
  // The prompt the current suggestion was made for. A suggestion only shows
  // while the text is still exactly that, so a stale one never flashes.
  const [suggestedFor, setSuggestedFor] = React.useState("");
  const [caretAtEnd, setCaretAtEnd] = React.useState(true);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const hintId = React.useId();
  const reduceMotion = useReducedMotion();

  const ghost = caretAtEnd && suggestedFor === value ? suggestion : "";

  React.useEffect(() => {
    if (value.trim().length < minLength || !caretAtEnd) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getSuggestion(value, controller.signal)
        .then((next) => {
          if (controller.signal.aborted) return;
          setSuggestion(next);
          setSuggestedFor(value);
        })
        .catch(() => {
          // A failed suggestion is silent: the person just keeps typing.
        });
    }, delay);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, caretAtEnd, delay, minLength, getSuggestion]);

  function accept(text: string) {
    const next = value + text;
    const rest = suggestion.slice(text.length);
    onChange(next);
    // Keep the rest of the suggestion on screen after a partial accept.
    setSuggestion(rest);
    setSuggestedFor(next);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) el.setSelectionRange(next.length, next.length);
    });
  }

  function dismiss() {
    setSuggestion("");
    setSuggestedFor("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (ghost) {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        accept(ghost);
        return;
      }
      // The caret is at the end whenever a ghost shows, so → has nothing else to do.
      if (e.key === "ArrowRight" && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        accept(nextWord(ghost));
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && onSubmit && value.trim()) {
      e.preventDefault();
      onSubmit(value);
    }
  }

  function syncCaret() {
    const el = textareaRef.current;
    if (!el) return;
    setCaretAtEnd(el.selectionStart === el.value.length && el.selectionEnd === el.value.length);
  }

  // Both layers share these so the ghost lines up with the typed text.
  const textLayer = "px-4 pt-3 pb-12 text-sm leading-relaxed whitespace-pre-wrap break-words";

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="relative rounded-2xl border bg-card shadow-sm focus-within:border-foreground/30">
        {/* Mirror layer: sizes the box and draws the ghost after the text. */}
        <div aria-hidden className={cn(textLayer, "min-h-24")}>
          <span className="text-transparent">{value}</span>
          <AnimatePresence>
            {ghost && (
              <motion.span
                key={suggestedFor}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ duration: 0.18 }}
                className="text-muted-foreground/60"
              >
                {ghost}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Keeps a trailing newline from collapsing the last line. */}
          <span>{"​"}</span>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            const typed = next.slice(value.length);
            // Typing what the ghost already says keeps the rest of it.
            if (ghost && next.startsWith(value) && typed && ghost.startsWith(typed)) {
              setSuggestion(ghost.slice(typed.length));
              setSuggestedFor(next);
            }
            onChange(next);
            setCaretAtEnd(e.target.selectionStart === e.target.value.length);
          }}
          onKeyDown={onKeyDown}
          onSelect={syncCaret}
          onBlur={dismiss}
          placeholder={placeholder}
          aria-label="Prompt"
          aria-describedby={ghost ? hintId : undefined}
          aria-autocomplete="inline"
          spellCheck
          className={cn(
            textLayer,
            "absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-muted-foreground"
          )}
        />

        <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-2">
          <AnimatePresence>
            {ghost ? (
              <motion.button
                key="accept"
                type="button"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.15 }}
                // Keep focus in the textarea, so the tap doesn't blur and dismiss it.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => accept(ghost)}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <kbd className="rounded border bg-muted px-1 font-sans text-[10px] font-medium">Tab</kbd>
                to accept
              </motion.button>
            ) : (
              <span />
            )}
          </AnimatePresence>

          {onSubmit && (
            <button
              type="button"
              aria-label="Send"
              disabled={!value.trim()}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSubmit(value)}
              className="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Read once, not on every keystroke: the hint names the suggestion and the keys. */}
      <p id={hintId} className="sr-only" aria-live="polite">
        {ghost ? `Suggestion: ${value.split(/\s+/).slice(-2).join(" ")}${ghost}. Press Tab to accept, Right Arrow for one word, Escape to dismiss.` : ""}
      </p>
    </div>
  );
}

/** The leading whitespace plus the first word of `text`. */
function nextWord(text: string) {
  const match = text.match(/^\s*\S+/);
  return match ? match[0] : text;
}
