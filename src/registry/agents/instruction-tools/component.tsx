"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  ChevronsLeftRightEllipsis,
  Cloud,
  CreditCard,
  Diamond,
  EllipsisVertical,
  Plus,
  ShoppingBag,
  SquareArrowUpRight,
  Tag,
  Webhook,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface InstructionToolOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Tailwind classes for the option's icon, e.g. a brand color. */
  iconClassName?: string;
}

export interface InstructionTool {
  id: string;
  /** Name shown in the first-step menu, e.g. "Use Data Connector". */
  label: string;
  /** Bold verb shown in the pill and chip, e.g. "Use". */
  verb: string;
  icon: LucideIcon;
  /** When present, picking the tool opens a second step to pick one of these. */
  options?: InstructionToolOption[];
  /** Placeholder for the second step's search, e.g. "Select Data Connector…". */
  optionPlaceholder?: string;
  /** Footer action in the second step, e.g. "Create new Data Connector". */
  createLabel?: string;
}

export type InstructionSegment =
  | { type: "text"; text: string }
  | { type: "tool"; toolId: string; optionId?: string };

export interface InstructionToolsProps {
  tools?: InstructionTool[];
  /** Initial plain-text content, one string per numbered step. */
  defaultSteps?: string[];
  placeholder?: string;
  onChange?: (steps: InstructionSegment[][]) => void;
  /** Called when the user picks a tool's "Create new…" footer action. */
  onCreateOption?: (toolId: string) => void;
  className?: string;
}

export const DEFAULT_TOOLS: InstructionTool[] = [
  {
    id: "data-connector",
    label: "Use Data Connector",
    verb: "Use",
    icon: Webhook,
    optionPlaceholder: "Select Data Connector…",
    createLabel: "Create new Data Connector",
    options: [
      { id: "upcoming-invoice", label: "Get upcoming invoice", icon: CreditCard, iconClassName: "text-indigo-500" },
      { id: "order-info", label: "Get order info", icon: ShoppingBag, iconClassName: "text-lime-600" },
      { id: "transition-issue", label: "Transition issue to 'In progress'", icon: Diamond, iconClassName: "text-blue-500" },
      { id: "attach-case", label: "Attach case to contact", icon: Cloud, iconClassName: "text-sky-500" },
    ],
  },
  {
    id: "read-attribute",
    label: "Read an attribute",
    verb: "Read",
    icon: ChevronsLeftRightEllipsis,
    optionPlaceholder: "Select attribute…",
    options: [
      { id: "email", label: "Customer email" },
      { id: "order-id", label: "Order ID" },
      { id: "plan", label: "Plan tier" },
    ],
  },
  {
    id: "update-attribute",
    label: "Update an attribute",
    verb: "Update",
    icon: ArrowUp,
    optionPlaceholder: "Select attribute…",
    options: [
      { id: "status", label: "Order status" },
      { id: "priority", label: "Priority" },
      { id: "plan", label: "Plan tier" },
    ],
  },
  {
    id: "tag",
    label: "Tag conversation",
    verb: "Tag",
    icon: Tag,
    optionPlaceholder: "Select tag…",
    options: [
      { id: "damaged", label: "Damaged item" },
      { id: "refund", label: "Refund request" },
      { id: "vip", label: "VIP" },
    ],
  },
  { id: "escalate", label: "Escalate", verb: "Escalate", icon: SquareArrowUpRight },
];

interface PickerState {
  anchor: HTMLSpanElement;
  stage: "tool" | "option";
  tool?: InstructionTool;
  query: string;
  activeIndex: number;
}

interface ChipState {
  id: string;
  el: HTMLSpanElement;
  tool: InstructionTool;
  option?: InstructionToolOption;
}

const INLINE_HOST_CLASS = "relative mx-0.5 inline-block align-baseline";

function makeHost() {
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.className = INLINE_HOST_CLASS;
  return span;
}

function placeCaret(setup: (range: Range) => void) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  setup(range);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function InstructionTools({
  tools = DEFAULT_TOOLS,
  defaultSteps = [""],
  placeholder = "Type / to insert a tool",
  onChange,
  onCreateOption,
  className,
}: InstructionToolsProps) {
  const [steps, setSteps] = React.useState(() =>
    (defaultSteps.length ? defaultSteps : [""]).map((text, i) => ({ id: `step-${i}`, text }))
  );
  const editors = React.useRef(new Map<string, HTMLDivElement>());
  const values = React.useRef(new Map<string, InstructionSegment[]>());
  const nextId = React.useRef(steps.length);
  const pendingFocus = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pendingFocus.current) return;
    const el = editors.current.get(pendingFocus.current);
    pendingFocus.current = null;
    if (!el) return;
    el.focus();
    placeCaret((r) => {
      r.selectNodeContents(el);
      r.collapse(false);
    });
  }, [steps]);

  function emit(order = steps) {
    onChange?.(order.map((s) => values.current.get(s.id) ?? []));
  }

  function updateSteps(next: typeof steps) {
    setSteps(next);
    emit(next);
  }

  function addStepAfter(id: string) {
    const step = { id: `step-${nextId.current++}`, text: "" };
    const i = steps.findIndex((s) => s.id === id);
    pendingFocus.current = step.id;
    updateSteps([...steps.slice(0, i + 1), step, ...steps.slice(i + 1)]);
  }

  function removeStep(id: string) {
    const i = steps.findIndex((s) => s.id === id);
    if (i <= 0) return;
    pendingFocus.current = steps[i - 1].id;
    values.current.delete(id);
    updateSteps(steps.filter((s) => s.id !== id));
  }

  return (
    <ol className={cn("w-full space-y-2 text-sm", className)}>
      {steps.map((step, i) => (
        <li key={step.id} className="flex gap-3">
          <span className="w-4 shrink-0 pt-[3px] text-right font-mono text-xs text-muted-foreground tabular-nums">
            {i + 1}.
          </span>
          <StepEditor
            initialText={step.text}
            tools={tools}
            placeholder={i === 0 ? placeholder : undefined}
            onCreateOption={onCreateOption}
            registerEditor={(el) => {
              if (el) editors.current.set(step.id, el);
              else editors.current.delete(step.id);
            }}
            onSegments={(segments) => {
              values.current.set(step.id, segments);
              emit();
            }}
            onEnter={() => addStepAfter(step.id)}
            onBackspaceEmpty={() => removeStep(step.id)}
          />
        </li>
      ))}
    </ol>
  );
}

interface StepEditorProps {
  initialText: string;
  tools: InstructionTool[];
  placeholder?: string;
  onCreateOption?: (toolId: string) => void;
  registerEditor: (el: HTMLDivElement | null) => void;
  onSegments: (segments: InstructionSegment[]) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

function StepEditor({
  initialText,
  tools,
  placeholder,
  onCreateOption,
  registerEditor,
  onSegments,
  onEnter,
  onBackspaceEmpty,
}: StepEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [picker, setPickerState] = React.useState<PickerState | null>(null);
  // Mirrors `picker` so blur/close handlers fired mid-transition see the latest value.
  const pickerRef = React.useRef<PickerState | null>(null);
  const [chips, setChips] = React.useState<ChipState[]>([]);
  const [isEmpty, setIsEmpty] = React.useState(!initialText);
  const chipSeq = React.useRef(0);

  function setPicker(next: PickerState | null) {
    pickerRef.current = next;
    setPickerState(next);
  }

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.textContent = initialText;
    registerEditor(el);
    return () => registerEditor(null);
    // Mount-only: the editor is uncontrolled after its initial text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    const el = editorRef.current;
    if (!el) return;
    // Chips deleted by the browser (backspace, cut) leave their host detached.
    setChips((prev) => (prev.some((c) => !c.el.isConnected) ? prev.filter((c) => c.el.isConnected) : prev));
    setIsEmpty(!(el.textContent ?? "").trim() && !el.querySelector("[data-chip]"));
    onSegments(serialize(el, tools));
  }

  function openPicker(anchor: HTMLSpanElement, stage: PickerState["stage"] = "tool", tool?: InstructionTool) {
    setPicker({ anchor, stage, tool, query: "", activeIndex: 0 });
  }

  /** Swaps the picker's host for `replacement` (or nothing) and returns the caret to the editor. */
  function closePicker(replacement?: Node, pad = true) {
    const current = pickerRef.current;
    const el = editorRef.current;
    if (!current || !el) return;
    setPicker(null);
    el.focus();
    const anchor = current.anchor;
    if (!anchor.isConnected) return sync();
    if (replacement && pad) {
      // Chips get a trailing space so typing continues outside them.
      const space = document.createTextNode(" ");
      anchor.replaceWith(replacement, space);
      placeCaret((r) => r.setStart(space, 1));
    } else if (replacement) {
      anchor.replaceWith(replacement);
      placeCaret((r) => r.setStartAfter(replacement));
    } else {
      placeCaret((r) => r.setStartBefore(anchor));
      anchor.remove();
    }
    sync();
  }

  function cancelPicker() {
    const current = pickerRef.current;
    if (!current) return;
    const literal = current.stage === "tool" ? `/${current.query}` : "";
    closePicker(literal ? document.createTextNode(literal) : undefined, false);
  }

  function insertChip(tool: InstructionTool, option?: InstructionToolOption) {
    const host = makeHost();
    host.dataset.chip = "true";
    host.dataset.tool = tool.id;
    if (option) host.dataset.option = option.id;
    setChips((prev) => [...prev, { id: `chip-${chipSeq.current++}`, el: host, tool, option }]);
    closePicker(host);
  }

  function choose(index: number) {
    const current = pickerRef.current;
    if (!current) return;
    if (current.stage === "tool") {
      const tool = filterTools(tools, current.query)[index];
      if (!tool) return;
      if (tool.options?.length) {
        setPicker({ ...current, stage: "option", tool, query: "", activeIndex: 0 });
      } else {
        insertChip(tool);
      }
      return;
    }
    const tool = current.tool!;
    const options = filterOptions(tool, current.query);
    if (index < options.length) {
      insertChip(tool, options[index]);
    } else if (tool.createLabel) {
      closePicker();
      onCreateOption?.(tool.id);
    }
  }

  function editChip(chip: ChipState) {
    const host = makeHost();
    chip.el.replaceWith(host);
    setChips((prev) => prev.filter((c) => c.id !== chip.id));
    openPicker(host, "option", chip.tool);
  }

  function removeChip(chip: ChipState) {
    const el = editorRef.current;
    el?.focus();
    placeCaret((r) => r.setStartBefore(chip.el));
    chip.el.remove();
    sync();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const el = editorRef.current;
    if (!el) return;
    if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return;
      const caret = sel.getRangeAt(0);
      const before = document.createRange();
      before.setStart(el, 0);
      before.setEnd(caret.startContainer, caret.startOffset);
      // Only at a word boundary, so "and/or" and URLs stay plain text.
      if (!/(^|\s)$/.test(before.toString())) return;
      e.preventDefault();
      caret.deleteContents();
      const host = makeHost();
      caret.insertNode(host);
      openPicker(host);
      return;
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
      return;
    }
    if (e.key === "Backspace" && isEmpty && !el.textContent) {
      e.preventDefault();
      onBackspaceEmpty();
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Instruction step"
        onInput={sync}
        onKeyDown={handleKeyDown}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
        className="min-h-6 whitespace-pre-wrap break-words leading-7 outline-none"
      />
      {isEmpty && !picker && placeholder && (
        <span className="pointer-events-none absolute left-0 top-0 leading-7 text-muted-foreground">
          {placeholder}
        </span>
      )}

      {chips.map((chip) =>
        createPortal(
          <ToolChip chip={chip} onEdit={() => editChip(chip)} onRemove={() => removeChip(chip)} />,
          chip.el,
          chip.id
        )
      )}

      {picker &&
        createPortal(
          <ToolPicker
            picker={picker}
            tools={tools}
            onQuery={(query) => setPicker({ ...picker, query, activeIndex: 0 })}
            onActive={(activeIndex) => setPicker({ ...picker, activeIndex })}
            onChoose={choose}
            onBack={() => setPicker({ ...picker, stage: "tool", tool: undefined, query: "", activeIndex: 0 })}
            onCancel={cancelPicker}
            onDismiss={() => closePicker()}
          />,
          picker.anchor,
          "picker"
        )}
    </div>
  );
}

function filterTools(tools: InstructionTool[], query: string) {
  const q = query.trim().toLowerCase();
  return tools.filter((t) => t.label.toLowerCase().includes(q));
}

function filterOptions(tool: InstructionTool, query: string) {
  const q = query.trim().toLowerCase();
  return (tool.options ?? []).filter((o) => o.label.toLowerCase().includes(q));
}

function serialize(el: HTMLElement, tools: InstructionTool[]): InstructionSegment[] {
  const segments: InstructionSegment[] = [];
  let text = "";
  el.childNodes.forEach((node) => {
    if (node instanceof HTMLElement && node.dataset.chip === "true") {
      if (text) segments.push({ type: "text", text });
      text = "";
      const tool = tools.find((t) => t.id === node.dataset.tool);
      if (tool) segments.push({ type: "tool", toolId: tool.id, optionId: node.dataset.option });
    } else if (node instanceof HTMLBRElement) {
      text += "\n";
    } else if (node.nodeType === Node.TEXT_NODE) {
      text += (node.textContent ?? "").replace(/ /g, " ");
    }
  });
  if (text) segments.push({ type: "text", text });
  return segments;
}

interface ToolPickerProps {
  picker: PickerState;
  tools: InstructionTool[];
  onQuery: (query: string) => void;
  onActive: (index: number) => void;
  onChoose: (index: number) => void;
  onBack: () => void;
  onCancel: () => void;
  onDismiss: () => void;
}

function ToolPicker({ picker, tools, onQuery, onActive, onChoose, onBack, onCancel, onDismiss }: ToolPickerProps) {
  const { stage, tool, query, activeIndex } = picker;
  const listId = React.useId();
  const toolItems = stage === "tool" ? filterTools(tools, query) : [];
  const optionItems = stage === "option" && tool ? filterOptions(tool, query) : [];
  const hasCreate = stage === "option" && Boolean(tool?.createLabel);
  const count = stage === "tool" ? toolItems.length : optionItems.length + (hasCreate ? 1 : 0);
  const inputPlaceholder = stage === "tool" ? "Search tools…" : (tool?.optionPlaceholder ?? "Search…");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (count) onActive((activeIndex + (e.key === "ArrowDown" ? 1 : count - 1)) % count);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (count) onChoose(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (stage === "option") onBack();
      else onCancel();
    } else if (e.key === "Backspace" && !query) {
      e.preventDefault();
      if (stage === "option") onBack();
      else onDismiss();
    }
  }

  return (
    <>
      <span className="inline-flex items-center rounded-md bg-muted px-1.5 leading-6">
        <span className="text-foreground">/</span>
        {stage === "option" && tool && <span className="mr-1 font-medium">{tool.verb}</span>}
        <input
          autoFocus
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onCancel}
          placeholder={inputPlaceholder}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={count ? `${listId}-${activeIndex}` : undefined}
          aria-label={inputPlaceholder}
          style={{ width: `${Math.max(query.length, inputPlaceholder.length) + 1}ch` }}
          className="border-l border-foreground/60 bg-transparent pl-px text-sm outline-none placeholder:text-muted-foreground"
        />
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
          id={listId}
          role="listbox"
          // Keep focus in the input while clicking items.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[80vw] overflow-hidden rounded-xl border bg-popover p-1 text-sm text-popover-foreground shadow-md"
        >
          {count === 0 && <p className="px-2.5 py-2 text-muted-foreground">No matches</p>}

          {toolItems.map((t, i) => (
            <MenuItem
              key={t.id}
              id={`${listId}-${i}`}
              active={i === activeIndex}
              onHover={() => onActive(i)}
              onClick={() => onChoose(i)}
              icon={<t.icon className="size-3.5" />}
              label={t.label}
            />
          ))}

          {optionItems.map((o, i) => {
            const Icon = o.icon ?? tool!.icon;
            return (
              <MenuItem
                key={o.id}
                id={`${listId}-${i}`}
                active={i === activeIndex}
                onHover={() => onActive(i)}
                onClick={() => onChoose(i)}
                icon={<Icon className={cn("size-3.5", o.iconClassName)} />}
                label={o.label}
              />
            );
          })}

          {hasCreate && (
            <>
              <div className="mx-1 my-1 border-t border-dashed" />
              <MenuItem
                id={`${listId}-${optionItems.length}`}
                active={activeIndex === optionItems.length}
                onHover={() => onActive(optionItems.length)}
                onClick={() => onChoose(optionItems.length)}
                icon={<Plus className="size-3.5" />}
                label={tool!.createLabel!}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

interface MenuItemProps {
  id: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onHover: () => void;
  onClick: () => void;
}

function MenuItem({ id, active, icon, label, onHover, onClick }: MenuItemProps) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5",
        active && "bg-accent text-accent-foreground"
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

interface ToolChipProps {
  chip: ChipState;
  onEdit: () => void;
  onRemove: () => void;
}

function ToolChip({ chip, onEdit, onRemove }: ToolChipProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  const { tool, option } = chip;

  React.useEffect(() => {
    if (!menuOpen) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-flex select-none items-center gap-1 rounded-md bg-muted py-0 pl-1.5 pr-0.5 leading-6"
    >
      <tool.icon className="size-3.5 shrink-0" aria-hidden />
      <span className="font-semibold">{tool.verb}</span>
      {option && <span>{option.label}</span>}
      <button
        type="button"
        aria-label={`${tool.verb} ${option?.label ?? ""} options`.trim()}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setMenuOpen((v) => !v)}
        className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
      >
        <EllipsisVertical className="size-3.5" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.span
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-30 mt-1 flex w-40 flex-col rounded-lg border bg-popover p-1 text-sm shadow-md"
          >
            {tool.options?.length ? (
              <button
                type="button"
                role="menuitem"
                onClick={onEdit}
                className="rounded-md px-2 py-1.5 text-left hover:bg-accent"
              >
                Change
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={onRemove}
              className="rounded-md px-2 py-1.5 text-left text-destructive hover:bg-destructive/10"
            >
              Remove
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
