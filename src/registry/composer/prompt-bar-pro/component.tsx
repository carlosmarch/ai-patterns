"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronDown, ChevronRight, Folder, Link2, Mic, Monitor, Paperclip, Plus, Search, Shuffle } from "lucide-react";

import { Attachment, AttachmentChip } from "../../uploads/attachment-chip/component";

import { cn } from "@/lib/utils";
import { StopGenerationButton, type GenerationState } from "../../buttons/stop-generation-button/component";

interface ConnectorItem {
  id: string;
  name: string;
  color: string;
  initials: string;
}

const ALL_CONNECTORS: ConnectorItem[] = [
  { id: "gmail", name: "Gmail with Calendar", color: "#EA4335", initials: "G" },
  { id: "outlook", name: "Outlook", color: "#0078D4", initials: "Ou" },
  { id: "hubspot", name: "HubSpot", color: "#FF7A59", initials: "Hs" },
  { id: "monday", name: "Monday.com", color: "#FF3D57", initials: "Mo" },
  { id: "supabase", name: "Supabase", color: "#3ECF8E", initials: "Sb" },
  { id: "vercel", name: "Vercel", color: "#000000", initials: "Vc" },
  { id: "snowflake", name: "Snowflake", color: "#29B5E8", initials: "Sn" },
  { id: "linear", name: "Linear", color: "#5E6AD2", initials: "Li" },
  { id: "github", name: "GitHub", color: "#24292F", initials: "Gh" },
  { id: "notion", name: "Notion", color: "#191919", initials: "No" },
  { id: "slack", name: "Slack", color: "#4A154B", initials: "Sl" },
  { id: "figma", name: "Figma", color: "#F24E1E", initials: "Fi" },
  { id: "jira", name: "Jira", color: "#0052CC", initials: "Ji" },
  { id: "salesforce", name: "Salesforce", color: "#00A1E0", initials: "Sf" },
  { id: "zendesk", name: "Zendesk", color: "#03363D", initials: "Zd" },
];

const SAMPLE_PROJECTS = [
  { id: "p1", name: "Design System Audit" },
  { id: "p2", name: "Product Roadmap 2027" },
  { id: "p3", name: "Customer Research" },
  { id: "p4", name: "Engineering Planning" },
];

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
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [attachMenuOpen, setAttachMenuOpen] = React.useState(false);
  const [attachPanel, setAttachPanel] = React.useState<"main" | "connectors" | "projects">("main");
  const [connectorSearch, setConnectorSearch] = React.useState("");
  const [randomConnectors, setRandomConnectors] = React.useState<ConnectorItem[]>([]);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const environmentRef = useClickOutside<HTMLDivElement>(() => setEnvironmentOpen(false));
  const orchestratorRef = useClickOutside<HTMLDivElement>(() => setOrchestratorOpen(false));
  const attachMenuRef = useClickOutside<HTMLDivElement>(() => {
    setAttachMenuOpen(false);
    setAttachPanel("main");
    setConnectorSearch("");
  });

  const isDisabled = generationState === "generating";

  function addAttachments(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      progress: 100,
      status: "done" as const,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

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
  const canSend = hasContent || attachments.length > 0;

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
    if (!content && attachments.length === 0) return;
    onSubmit?.(content);
    if (editorRef.current) editorRef.current.innerHTML = "";
    setHasContent(false);
    setTextBeforeCursor("");
    attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    setAttachments([]);
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

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addAttachments(e.target.files)}
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
        />

        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm">
          <div className="w-full">
            <AnimatePresence initial={false}>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <ul className="flex gap-2 overflow-x-auto pt-2 pr-2 pb-2">
                    {attachments.map((att) => (
                      <AttachmentChip key={att.id} attachment={att} onRemove={removeAttachment} />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
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
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-1">
            <div ref={attachMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!attachMenuOpen) {
                    setRandomConnectors(pickRandom(ALL_CONNECTORS, 8));
                    setAttachPanel("main");
                    setConnectorSearch("");
                  }
                  setAttachMenuOpen((v) => !v);
                }}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Add attachment"
              >
                <Plus className="size-4" />
              </button>
              <AnimatePresence>
                {attachMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-0 z-20 mb-1.5 w-64 overflow-hidden rounded-xl border bg-popover shadow-md"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {attachPanel === "main" && (
                        <motion.div
                          key="main"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.1 }}
                        >
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); setAttachMenuOpen(false); }}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-accent"
                          >
                            <Paperclip className="size-4 text-muted-foreground" />
                            Upload files or images
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttachPanel("connectors")}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Link2 className="size-4" />
                            Connectors
                            <ChevronRight className="ml-auto size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttachPanel("projects")}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Folder className="size-4" />
                            Projects
                            <ChevronRight className="ml-auto size-3.5" />
                          </button>
                        </motion.div>
                      )}
                      {attachPanel === "connectors" && (
                        <motion.div
                          key="connectors"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div className="flex items-center gap-1.5 border-b px-2 py-2">
                            <button
                              type="button"
                              onClick={() => { setAttachPanel("main"); setConnectorSearch(""); }}
                              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <ArrowLeft className="size-3.5" />
                            </button>
                            <span className="text-sm font-medium">Connectors</span>
                          </div>
                          <div className="border-b px-2 py-2">
                            <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5">
                              <Search className="size-3.5 shrink-0 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="Search apps..."
                                value={connectorSearch}
                                onChange={(e) => setConnectorSearch(e.target.value)}
                                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>
                          <div className="max-h-52 overflow-y-auto py-1">
                            {(connectorSearch
                              ? ALL_CONNECTORS.filter((c) =>
                                  c.name.toLowerCase().includes(connectorSearch.toLowerCase())
                                )
                              : randomConnectors
                            ).map((connector) => (
                              <button
                                key={connector.id}
                                type="button"
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent"
                              >
                                <span
                                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                                  style={{ backgroundColor: connector.color }}
                                >
                                  {connector.initials}
                                </span>
                                <span className="flex-1 truncate text-left">{connector.name}</span>
                                <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {attachPanel === "projects" && (
                        <motion.div
                          key="projects"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div className="flex items-center gap-1.5 border-b px-2 py-2">
                            <button
                              type="button"
                              onClick={() => setAttachPanel("main")}
                              className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <ArrowLeft className="size-3.5" />
                            </button>
                            <span className="text-sm font-medium">Projects</span>
                          </div>
                          <div className="py-1">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium hover:bg-accent"
                            >
                              <span className="flex size-6 items-center justify-center rounded-md border border-dashed border-muted-foreground/50">
                                <Plus className="size-3.5 text-muted-foreground" />
                              </span>
                              New project
                            </button>
                            <div className="mx-3 my-1 border-t" />
                            {SAMPLE_PROJECTS.map((project) => (
                              <button
                                key={project.id}
                                type="button"
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                              >
                                <Folder className="size-4 shrink-0" />
                                <span className="truncate text-left">{project.name}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
