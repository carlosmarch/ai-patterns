"use client";

import { Origami } from "lucide-react";

import { AgentTriggers } from "./component";

export default function AgentTriggersDemo() {
  return (
    <AgentTriggers
      agent={{ name: "AI-Patterns", icon: Origami }}
      title="AI-Patterns"
      description="When should this agent run?"
    />
  );
}
