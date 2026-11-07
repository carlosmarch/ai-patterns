"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { PromptTemplate, type TemplatePart } from "./component";

const templates: { name: string; parts: TemplatePart[] }[] = [
  {
    name: "Email",
    parts: [
      "Write a ",
      { id: "tone", placeholder: "tone", options: ["friendly", "formal", "direct"], value: "friendly" },
      " email to ",
      { id: "to", placeholder: "recipient" },
      " about ",
      { id: "topic", placeholder: "topic" },
      ", under ",
      { id: "length", placeholder: "length", options: ["100 words", "200 words", "300 words"], value: "200 words" },
      ".",
    ],
  },
  {
    name: "Product description",
    parts: [
      "Describe ",
      { id: "product", placeholder: "product" },
      " for ",
      { id: "audience", placeholder: "audience" },
      ", highlighting ",
      { id: "feature", placeholder: "key feature" },
      ".",
    ],
  },
];

export default function PromptTemplateDemo() {
  const [active, setActive] = React.useState(0);
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {templates.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => {
              setActive(i);
              setSent(null);
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              active === i ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <PromptTemplate key={active} title={`Template · ${templates[active].name}`} parts={templates[active].parts} onSubmit={setSent} />

      {sent && (
        <p className="px-1 text-xs text-muted-foreground">
          Prompt sent: <span className="text-foreground">{sent}</span>
        </p>
      )}
    </div>
  );
}
