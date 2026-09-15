"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Antenna,
  AtSign,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Database,
  Eye,
  FlaskConical,
  GitBranch,
  Globe,
  Layers,
  Lightbulb,
  Plus,
  Rocket,
  Search,
  Server,
  Sparkles,
  Star,
  Terminal,
  Webhook,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ── Trigger sources ──────────────────────────────────────────────────────────

interface TriggerField {
  id: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export const TRIGGER_SOURCES = [
  {
    id: "github" as const,
    label: "GitHub",
    icon: GitBranch,
    description: "Issues, pull requests, and labels",
    fields: [
      {
        id: "repo",
        label: "Repository",
        type: "text" as const,
        placeholder: "e.g. carlosmarch/ai-patterns",
      },
      {
        id: "event",
        label: "Event",
        type: "select" as const,
        options: [
          { value: "issue-labeled", label: "Issue labeled" },
          { value: "pr-opened", label: "PR opened" },
          { value: "pr-merged", label: "PR merged" },
        ],
      },
    ] satisfies TriggerField[],
  },
  {
    id: "slack" as const,
    label: "Slack",
    icon: AtSign,
    description: "Mentions, messages, and reactions",
    fields: [
      {
        id: "channel",
        label: "Channel",
        type: "text" as const,
        placeholder: "e.g. #design-requests",
      },
      {
        id: "event",
        label: "Trigger on",
        type: "select" as const,
        options: [
          { value: "mention", label: "Agent mentioned" },
          { value: "keyword", label: "Keyword match" },
        ],
      },
    ] satisfies TriggerField[],
  },
  {
    id: "figma" as const,
    label: "Figma",
    icon: Layers,
    description: "Frame status changes and comments",
    fields: [
      {
        id: "scope",
        label: "Files",
        type: "select" as const,
        options: [
          { value: "any", label: "Any Figma file" },
          { value: "specific", label: "Specific file URL" },
        ],
      },
      {
        id: "event",
        label: "Event",
        type: "select" as const,
        options: [
          { value: "ready-for-dev", label: "Frame ready for dev" },
          { value: "comment", label: "New comment" },
        ],
      },
    ] satisfies TriggerField[],
  },
] as const;

export type TriggerSourceId = (typeof TRIGGER_SOURCES)[number]["id"];

// ── Agent icons ───────────────────────────────────────────────────────────────

export const AGENT_ICONS = [
  { id: "bot" as const, icon: Bot, label: "Bot" },
  { id: "sparkles" as const, icon: Sparkles, label: "Sparkles" },
  { id: "zap" as const, icon: Zap, label: "Zap" },
  { id: "brain" as const, icon: Brain, label: "Brain" },
  { id: "rocket" as const, icon: Rocket, label: "Rocket" },
] as const;

export const EXTRA_AGENT_ICONS = [
  { id: "cpu" as const, icon: Cpu, label: "CPU" },
  { id: "globe" as const, icon: Globe, label: "Globe" },
  { id: "terminal" as const, icon: Terminal, label: "Terminal" },
  { id: "code2" as const, icon: Code2, label: "Code" },
  { id: "wrench" as const, icon: Wrench, label: "Wrench" },
  { id: "search" as const, icon: Search, label: "Search" },
  { id: "eye" as const, icon: Eye, label: "Eye" },
  { id: "star" as const, icon: Star, label: "Star" },
  { id: "database" as const, icon: Database, label: "Database" },
  { id: "server" as const, icon: Server, label: "Server" },
  { id: "lightbulb" as const, icon: Lightbulb, label: "Lightbulb" },
  { id: "compass" as const, icon: Compass, label: "Compass" },
  { id: "flask" as const, icon: FlaskConical, label: "Flask" },
  { id: "antenna" as const, icon: Antenna, label: "Antenna" },
] as const;

export const ALL_AGENT_ICONS = [...AGENT_ICONS, ...EXTRA_AGENT_ICONS];

export type AgentIconId = (typeof ALL_AGENT_ICONS)[number]["id"];

// ── Payload ───────────────────────────────────────────────────────────────────

export interface SelectedTrigger {
  sourceId: TriggerSourceId;
  config: Record<string, string>;
}

export interface CustomTrigger {
  id: string;
  name: string;
  event: string;
}

export interface CreateAgentPayload {
  name: string;
  instructions: string;
  iconId: AgentIconId;
  triggers: SelectedTrigger[];
  customTriggers: CustomTrigger[];
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CreateAgentProps {
  onCreateAgent?: (payload: CreateAgentPayload) => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateAgent({ onCreateAgent, className }: CreateAgentProps) {
  const [step, setStep] = React.useState<0 | 1>(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [name, setName] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [iconId, setIconId] = React.useState<AgentIconId>("bot");
  const [selectedSources, setSelectedSources] = React.useState<TriggerSourceId[]>([]);
  const [triggerConfigs, setTriggerConfigs] = React.useState<
    Partial<Record<TriggerSourceId, Record<string, string>>>
  >({});
  const [customTriggers, setCustomTriggers] = React.useState<CustomTrigger[]>([]);
  const [showMoreIcons, setShowMoreIcons] = React.useState(false);

  const selectedIcon = ALL_AGENT_ICONS.find((i) => i.id === iconId)!;
  const SelectedIconComp = selectedIcon.icon;

  function goToStep1() {
    setDirection(1);
    setStep(1);
  }

  function goToStep0() {
    setDirection(-1);
    setStep(0);
  }

  function toggleSource(id: TriggerSourceId) {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function setTriggerField(sourceId: TriggerSourceId, fieldId: string, value: string) {
    setTriggerConfigs((prev) => ({
      ...prev,
      [sourceId]: { ...prev[sourceId], [fieldId]: value },
    }));
  }

  function addCustomTrigger() {
    setCustomTriggers((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: "", event: "" },
    ]);
  }

  function updateCustomTrigger(id: string, field: keyof Omit<CustomTrigger, "id">, value: string) {
    setCustomTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function removeCustomTrigger(id: string) {
    setCustomTriggers((prev) => prev.filter((t) => t.id !== id));
  }

  function buildPayload(): CreateAgentPayload {
    return {
      name: name.trim() || "Unnamed Agent",
      instructions: instructions.trim(),
      iconId,
      triggers: selectedSources.map((sourceId) => ({
        sourceId,
        config: triggerConfigs[sourceId] ?? {},
      })),
      customTriggers,
    };
  }

  const variants = {
    enter: (dir: number) => ({ x: dir * 16, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -16, opacity: 0 }),
  };

  return (
    <div className={cn("w-full max-w-xs overflow-hidden rounded-2xl border bg-card", className)}>
      {/* Header preview */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SelectedIconComp className="size-3.5" />
          </span>
          <p className="truncate text-sm font-semibold text-foreground">
            {name.trim() || "New agent"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1" aria-hidden>
          {[0, 1].map((i) => (
            <span
              key={i}
              className={cn(
                "block h-1.5 rounded-full transition-all duration-200",
                step === i ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-identity"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="px-4 pb-4 pt-3"
            >
              <p className="text-sm font-semibold">Name your agent</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Give it a name, instructions, and an icon.
              </p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AI-Patterns"
                aria-label="Agent name"
                className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground/50 focus-visible:ring-2"
              />

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. When a GitHub issue is labeled pattern-request in carlosmarch/ai-patterns, triage it and suggest a matching component."
                aria-label="Agent instructions"
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground/50 focus-visible:ring-2"
              />

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {AGENT_ICONS.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={label}
                      aria-pressed={iconId === id}
                      onClick={() => setIconId(id)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        iconId === id
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label={showMoreIcons ? "Show fewer icons" : "Show more icons"}
                    aria-expanded={showMoreIcons}
                    onClick={() => setShowMoreIcons((v) => !v)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-colors",
                      showMoreIcons
                        ? "bg-muted text-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Plus className={cn("size-4 transition-transform duration-150", showMoreIcons && "rotate-45")} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showMoreIcons && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {EXTRA_AGENT_ICONS.map(({ id, icon: Icon, label }) => (
                          <button
                            key={id}
                            type="button"
                            aria-label={label}
                            aria-pressed={iconId === id}
                            onClick={() => { setIconId(id); setShowMoreIcons(false); }}
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg transition-colors",
                              iconId === id
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="size-4" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={goToStep1}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Choose triggers
                <ChevronRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onCreateAgent?.(buildPayload())}
                className="mt-2 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip triggers
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step-triggers"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="px-4 pb-4 pt-3"
            >
              <p className="text-sm font-semibold">Choose triggers</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select the sources that activate this agent.
              </p>

              <ul className="mt-3 flex flex-col gap-2">
                {TRIGGER_SOURCES.map(({ id, label, icon: Icon, description, fields }) => {
                  const isSelected = selectedSources.includes(id);
                  const config = triggerConfigs[id] ?? {};

                  return (
                    <li key={id} className={cn("rounded-xl border transition-colors", isSelected ? "border-foreground/20 bg-muted/40" : "")}>
                      {/* Toggle row */}
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSource(id)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium">{label}</span>
                          <span className="block text-[11px] text-muted-foreground">{description}</span>
                        </span>
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <Check className="size-2.5" strokeWidth={3} />}
                        </span>
                      </button>

                      {/* Expanded config */}
                      <AnimatePresence initial={false}>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-2 border-t px-3 pb-3 pt-2.5">
                              {fields.map((field) => (
                                <div key={field.id} className="flex flex-col gap-1">
                                  <label className="text-[11px] font-medium text-muted-foreground">
                                    {field.label}
                                  </label>
                                  {field.type === "text" ? (
                                    <input
                                      type="text"
                                      value={config[field.id] ?? ""}
                                      onChange={(e) => setTriggerField(id, field.id, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none ring-ring placeholder:text-muted-foreground/40 focus-visible:ring-2"
                                    />
                                  ) : (
                                    <select
                                      value={config[field.id] ?? field.options?.[0]?.value ?? ""}
                                      onChange={(e) => setTriggerField(id, field.id, e.target.value)}
                                      className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none ring-ring focus-visible:ring-2"
                                    >
                                      {field.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              {/* Custom triggers */}
              <AnimatePresence initial={false}>
                {customTriggers.map((ct) => (
                  <motion.div
                    key={ct.id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-xl border border-foreground/20 bg-muted/40">
                      <div className="flex items-center gap-2 px-3 py-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                          <Webhook className="size-3.5" />
                        </span>
                        <span className="flex-1 text-xs font-medium text-muted-foreground">
                          Custom trigger
                        </span>
                        <button
                          type="button"
                          aria-label="Remove custom trigger"
                          onClick={() => removeCustomTrigger(ct.id)}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 border-t px-3 pb-3 pt-2.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Name
                          </label>
                          <input
                            type="text"
                            value={ct.name}
                            onChange={(e) => updateCustomTrigger(ct.id, "name", e.target.value)}
                            placeholder="e.g. Webhook received"
                            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none ring-ring placeholder:text-muted-foreground/40 focus-visible:ring-2"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Event source
                          </label>
                          <input
                            type="text"
                            value={ct.event}
                            onChange={(e) => updateCustomTrigger(ct.id, "event", e.target.value)}
                            placeholder="e.g. POST /webhooks/my-agent"
                            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs outline-none ring-ring placeholder:text-muted-foreground/40 focus-visible:ring-2"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addCustomTrigger}
                className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add custom trigger
              </button>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={goToStep0}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => onCreateAgent?.(buildPayload())}
                  className="flex-1 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Create agent
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
