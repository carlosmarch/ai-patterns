"use client";

import * as React from "react";
import { AtSign, GitPullRequest, Layers } from "lucide-react";

import { AgentTrigger, AgentTriggers } from "../agent-triggers/component";
import {
  AGENT_ICONS,
  CreateAgent,
  CreateAgentPayload,
  TriggerSourceId,
} from "./component";

const SOURCE_TRIGGER_MAP: Record<TriggerSourceId, Omit<AgentTrigger, "enabled">> = {
  github: {
    id: "github-issue",
    icon: GitPullRequest,
    event: "Issue labeled pattern-request",
    context: "in carlosmarch/ai-patterns",
  },
  slack: {
    id: "slack-mention",
    icon: AtSign,
    event: "When agent is mentioned",
    context: "in Slack",
  },
  figma: {
    id: "figma-ready",
    icon: Layers,
    event: "Frame marked ready for dev",
    context: "in any Figma file",
    needsSetup: true,
  },
};

const ALL_SOURCE_IDS: TriggerSourceId[] = ["github", "slack", "figma"];

export default function CreateAgentDemo() {
  const [payload, setPayload] = React.useState<CreateAgentPayload | null>(null);

  if (payload) {
    const agentIconEntry = AGENT_ICONS.find((i) => i.id === payload.iconId)!;

    const triggers: AgentTrigger[] = ALL_SOURCE_IDS.map((sourceId) => ({
      ...SOURCE_TRIGGER_MAP[sourceId],
      enabled: payload.triggerSources.includes(sourceId),
    }));

    return (
      <div className="flex flex-col items-center gap-3">
        <AgentTriggers
          agent={{ name: payload.name, icon: agentIconEntry.icon }}
          title={payload.name}
          triggers={triggers}
        />
        <button
          type="button"
          onClick={() => setPayload(null)}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Create another
        </button>
      </div>
    );
  }

  return <CreateAgent onCreateAgent={setPayload} />;
}
