"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AtSign,
  Bot,
  Brain,
  Check,
  ChevronRight,
  GitBranch,
  Layers,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const TRIGGER_SOURCES = [
  {
    id: "github" as const,
    label: "GitHub",
    icon: GitBranch,
    description: "Issues, pull requests, and labels",
  },
  {
    id: "slack" as const,
    label: "Slack",
    icon: AtSign,
    description: "Mentions, messages, and reactions",
  },
  {
    id: "figma" as const,
    label: "Figma",
    icon: Layers,
    description: "Frame status changes and comments",
  },
] as const;

export type TriggerSourceId = (typeof TRIGGER_SOURCES)[number]["id"];

export const AGENT_ICONS = [
  { id: "bot" as const, icon: Bot, label: "Bot" },
  { id: "sparkles" as const, icon: Sparkles, label: "Sparkles" },
  { id: "zap" as const, icon: Zap, label: "Zap" },
  { id: "brain" as const, icon: Brain, label: "Brain" },
  { id: "rocket" as const, icon: Rocket, label: "Rocket" },
] as const;

export type AgentIconId = (typeof AGENT_ICONS)[number]["id"];

export interface CreateAgentPayload {
  name: string;
  iconId: AgentIconId;
  triggerSources: TriggerSourceId[];
}

export interface CreateAgentProps {
  onCreateAgent?: (payload: CreateAgentPayload) => void;
  className?: string;
}

export function CreateAgent({ onCreateAgent, className }: CreateAgentProps) {
  const [step, setStep] = React.useState<0 | 1>(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [name, setName] = React.useState("");
  const [iconId, setIconId] = React.useState<AgentIconId>("bot");
  const [selectedSources, setSelectedSources] = React.useState<TriggerSourceId[]>([]);

  const selectedIcon = AGENT_ICONS.find((i) => i.id === iconId)!;
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

  function handleCreate() {
    onCreateAgent?.({ name: name.trim() || "Unnamed Agent", iconId, triggerSources: selectedSources });
  }

  const variants = {
    enter: (dir: number) => ({ x: dir * 16, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -16, opacity: 0 }),
  };

  return (
    <div className={cn("w-full max-w-xs overflow-hidden rounded-2xl border bg-card", className)}>
      {/* Header preview row */}
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

      {/* Step content */}
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
                Give it a name and pick an icon to identify it.
              </p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pattern Bot"
                aria-label="Agent name"
                className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground/50 focus-visible:ring-2"
              />

              <div className="mt-3 flex items-center gap-1.5">
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
              </div>

              <button
                type="button"
                onClick={goToStep1}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Choose triggers
                <ChevronRight className="size-3.5" />
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
                {TRIGGER_SOURCES.map(({ id, label, icon: Icon, description }) => {
                  const isSelected = selectedSources.includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        role="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleSource(id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          isSelected
                            ? "border-foreground/20 bg-muted/60"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium">{label}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {description}
                          </span>
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
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={goToStep0}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
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
