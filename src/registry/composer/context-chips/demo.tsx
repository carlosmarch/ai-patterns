"use client";

import * as React from "react";
import { FileCode2, FileText, Folder, Globe, HardDrive, MessageSquare, PanelTop } from "lucide-react";

import { ContextChipsComposer, type ContextSource } from "./component";

const sources: ContextSource[] = [
  { id: "f1", group: "Files", label: "pricing.ts", detail: "src/lib/pricing.ts", icon: FileCode2 },
  { id: "f2", group: "Files", label: "checkout", detail: "src/app/checkout/", icon: Folder },
  { id: "f3", group: "Files", label: "PRD — Annual plans.md", detail: "docs/", icon: FileText },
  { id: "c1", group: "Connectors", label: "Pricing review notes", detail: "Drive · edited yesterday", icon: HardDrive },
  { id: "c2", group: "Connectors", label: "#billing-launch", detail: "Slack · 214 messages", icon: MessageSquare },
  { id: "w1", group: "Web", label: "Stripe Billing docs", detail: "docs.stripe.com/billing", icon: Globe },
];

export default function ContextChipsDemo() {
  const [value, setValue] = React.useState<string[]>(["f1"]);
  const [includeOpen, setIncludeOpen] = React.useState(true);
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-lg flex-col gap-3 pt-80">
      <ContextChipsComposer
        sources={sources}
        value={value}
        onChange={setValue}
        auto={{
          label: "Checkout page",
          icon: PanelTop,
          description: "The page you have open",
          included: includeOpen,
          onIncludedChange: setIncludeOpen,
        }}
        onSubmit={(text, ids) => {
          const n = ids.length + (includeOpen ? 1 : 0);
          setSent(`Sent “${text}” with ${n} context item${n === 1 ? "" : "s"}.`);
        }}
      />
      <p className="px-1 text-xs text-muted-foreground" aria-live="polite">
        {sent ?? "Click + or type @ to add context. Backspace in an empty box removes the last chip."}
      </p>
    </div>
  );
}
