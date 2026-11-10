"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, CornerDownLeft, Pencil, Square, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QueuedMessage {
  id: string;
  text: string;
}

export type SendMode = "now" | "queued";

export interface MessageQueueComposerProps {
  /** True while the agent is working on a turn. ⌘/Ctrl+Enter queues only while busy. */
  busy: boolean;
  /**
   * Called when a message goes out. `"now"` is a message sent directly (Enter, or
   * "Send now" on a queued item — the host decides whether that steers or interrupts
   * the running turn); `"queued"` is a queued message auto-sent when the turn ended.
   */
  onSend: (text: string, mode: SendMode) => void;
  onStop?: () => void;
  placeholder?: string;
  className?: string;
}

const spring = { type: "spring", stiffness: 520, damping: 40 } as const;

let uid = 0;
const nextId = () => `q${++uid}`;

const noop = () => () => {};

function useIsMac() {
  return React.useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => true
  );
}

export function MessageQueueComposer({
  busy,
  onSend,
  onStop,
  placeholder = "Ask anything",
  className,
}: MessageQueueComposerProps) {
  const [value, setValue] = React.useState("");
  const [queue, setQueue] = React.useState<QueuedMessage[]>([]);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const reduceMotion = useReducedMotion();
  const mac = useIsMac();
  const mod = mac ? "⌘" : "Ctrl";

  // When the running turn ends, the oldest queued message goes out on its own.
  const wasBusy = React.useRef(busy);
  React.useEffect(() => {
    if (wasBusy.current && !busy && queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      onSend(next.text, "queued");
    }
    wasBusy.current = busy;
  }, [busy, queue, onSend]);

  function focusInput() {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  function submit(toQueue: boolean) {
    const text = value.trim();
    if (!text) return;
    setValue("");
    if (toQueue && busy) setQueue((q) => [...q, { id: nextId(), text }]);
    else onSend(text, "now");
  }

  function sendNow(item: QueuedMessage) {
    setQueue((q) => q.filter((m) => m.id !== item.id));
    onSend(item.text, "now");
  }

  function edit(item: QueuedMessage) {
    const draft = value.trim();
    // Pull the message back into the composer; an unsent draft takes its slot so nothing is lost.
    setQueue((q) => q.flatMap((m) => (m.id !== item.id ? [m] : draft ? [{ id: nextId(), text: draft }] : [])));
    setValue(item.text);
    focusInput();
  }

  function remove(item: QueuedMessage) {
    setQueue((q) => q.filter((m) => m.id !== item.id));
    focusInput();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit(e.metaKey || e.ctrlKey);
    } else if (e.key === "ArrowUp" && !value && queue.length > 0) {
      // Up on an empty composer recalls the last queued message for editing.
      e.preventDefault();
      edit(queue[queue.length - 1]);
    }
  }

  const hint = busy ? `↵ to send, ${mod}↵ to queue` : placeholder;

  return (
    <div className={cn("w-full", className)}>
      <ul aria-label="Queued messages" className="flex flex-col gap-1.5 empty:hidden">
        <AnimatePresence initial={false}>
          {queue.map((item, i) => (
            <motion.li
              key={item.id}
              layout={!reduceMotion}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
              transition={spring}
              className="mx-2 flex items-center gap-2 rounded-xl bg-muted py-1.5 pr-1.5 pl-3 text-sm last:mb-1.5"
            >
              <span className="shrink-0 font-medium text-foreground">
                {i === 0 ? (queue.length === 1 ? "1 queued" : `${queue.length} queued`) : `#${i + 1}`}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground" title={item.text}>
                {item.text}
              </span>
              <QueueAction label="Send now" onClick={() => sendNow(item)}>
                <CornerDownLeft className="size-3.5" />
              </QueueAction>
              <QueueAction label="Edit" onClick={() => edit(item)}>
                <Pencil className="size-3.5" />
              </QueueAction>
              <QueueAction label="Remove from queue" onClick={() => remove(item)}>
                <X className="size-3.5" />
              </QueueAction>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
        className="flex items-end gap-2 rounded-2xl bg-card p-2 pl-3.5 focus-within:ring-2 focus-within:ring-ring/30 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={hint}
          aria-label="Message"
          aria-keyshortcuts={busy ? `Enter ${mac ? "Meta" : "Control"}+Enter` : "Enter"}
          className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none [field-sizing:content] placeholder:text-muted-foreground"
        />
        {busy && value.trim() && (
          <button
            type="button"
            onClick={() => submit(true)}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground bg-muted"
          >
            Queue
            <kbd className="font-sans text-[10px]">{mod}↵</kbd>
          </button>
        )}
        <motion.button
          type={busy && !value.trim() ? "button" : "submit"}
          onClick={busy && !value.trim() ? onStop : undefined}
          disabled={!busy && !value.trim()}
          aria-label={busy && !value.trim() ? "Stop" : "Send"}
          whileTap={{ scale: 0.92 }}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors disabled:bg-muted disabled:text-muted-foreground"
        >
          {busy && !value.trim() ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-4" />}
        </motion.button>
      </form>
      <p aria-live="polite" className="sr-only">
        {queue.length > 0 ? `${queue.length} message${queue.length > 1 ? "s" : ""} queued` : ""}
      </p>
    </div>
  );
}

function QueueAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:bg-background focus-visible:text-foreground focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
