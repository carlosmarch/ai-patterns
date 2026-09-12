"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CompareResponse {
  id: string;
  label: string;
  content: string;
}

export interface ResponseCompareProps {
  prompt?: string;
  responses: [CompareResponse, CompareResponse];
  onPick?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  className?: string;
}

export function ResponseCompare({ prompt, responses, onPick, onRegenerate, className }: ResponseCompareProps) {
  const [pickedId, setPickedId] = React.useState<string | null>(null);

  function handlePick(id: string) {
    setPickedId(id);
    onPick?.(id);
  }

  function handleRegenerate(id: string) {
    setPickedId((current) => (current === id ? null : current));
    onRegenerate?.(id);
  }

  return (
    <div className={cn("w-full", className)}>
      {prompt && <p className="mb-3 text-sm text-muted-foreground">{prompt}</p>}
      <div role="radiogroup" aria-label="Preferred response" className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {responses.map((response) => (
          <ResponsePanel
            key={response.id}
            response={response}
            picked={pickedId === response.id}
            dimmed={pickedId !== null && pickedId !== response.id}
            onPick={() => handlePick(response.id)}
            onRegenerate={() => handleRegenerate(response.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ResponsePanel({
  response,
  picked,
  dimmed,
  onPick,
  onRegenerate,
}: {
  response: CompareResponse;
  picked: boolean;
  dimmed: boolean;
  onPick: () => void;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(response.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      role="radio"
      aria-checked={picked}
      aria-label={response.label}
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick();
        }
      }}
      className={cn(
        "flex h-80 cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-opacity outline-none",
        picked ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/20",
        dimmed && "opacity-60",
        "focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <span className="text-xs font-medium">{response.label}</span>
        {picked && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            <Sparkles className="size-3" />
            Preferred
          </motion.span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{response.content}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <IconButton
            label="Copy"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </IconButton>
          <IconButton
            label={`Regenerate ${response.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
          >
            <RotateCcw className="size-3.5" />
          </IconButton>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPick();
          }}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            picked ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          {picked ? "Chosen" : "Choose this"}
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
