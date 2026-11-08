"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { ArtifactCard, ArtifactPanel, ArtifactSplit, type Artifact } from "./component";

const V1_SOURCE = `# Q3 beta launch plan

## Goal
Get 200 teams onto the beta and 40 using it weekly by September 30.

## Audience
Design-led teams of 5–30 who already export to code.

## Milestones
- Jul 8 — Invite the first 50 waitlist teams
- Jul 22 — Open self-serve sign-up
- Aug 19 — Pricing test with 3 plans
- Sep 16 — Public launch post

## Risks
- Onboarding takes too long to reach a first export.
- Support load during the self-serve week.`;

const V2_SOURCE = `# Q3 beta launch plan

**Goal:** 200 teams on the beta, 40 weekly active by Sep 30.

- Jul 8 — First 50 waitlist teams
- Jul 22 — Self-serve sign-up
- Sep 16 — Public launch

**Biggest risk:** time to first export.`;

function Doc({ source }: { source: string }) {
  return (
    <div className="max-w-prose space-y-2 text-sm leading-relaxed">
      {source.split("\n").map((line, i) => {
        if (line.startsWith("# ")) return <h4 key={i} className="text-base font-semibold">{line.slice(2)}</h4>;
        if (line.startsWith("## ")) return <h5 key={i} className="pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{line.slice(3)}</h5>;
        if (line.startsWith("- ")) return <p key={i} className="pl-3 text-muted-foreground">• {line.slice(2)}</p>;
        if (!line.trim()) return null;
        return (
          <p key={i} className="text-muted-foreground">
            {line.split(/\*\*(.+?)\*\*/).map((part, j) => (j % 2 ? <strong key={j} className="text-foreground">{part}</strong> : part))}
          </p>
        );
      })}
    </div>
  );
}

const V1 = { id: "v1", note: "First draft", preview: <Doc source={V1_SOURCE} />, source: V1_SOURCE };
const V2 = { id: "v2", note: "Shorter, one screen", preview: <Doc source={V2_SOURCE} />, source: V2_SOURCE };

type Msg = { role: "user" | "assistant"; text: string; version?: number };

export default function ArtifactPanelDemo() {
  const [versions, setVersions] = React.useState([V1]);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "user", text: "Draft a one-page launch plan for our Q3 beta." },
    { role: "assistant", text: "Here's a first draft with a goal, milestones and the two risks I'd watch.", version: 0 },
  ]);
  const [open, setOpen] = React.useState(true);
  const [version, setVersion] = React.useState(0);
  const [generating, setGenerating] = React.useState(false);
  const cardRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});
  const lastOpener = React.useRef<number>(0);

  const artifact: Artifact = { id: "plan", title: "Q3 beta launch plan", kind: "Document", versions };

  function openAt(v: number) {
    lastOpener.current = v;
    setVersion(v);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    requestAnimationFrame(() => cardRefs.current[lastOpener.current]?.focus());
  }

  function askShorter() {
    if (generating || versions.length > 1) return;
    setMessages((m) => [...m, { role: "user", text: "Make it shorter — it should fit on one screen." }]);
    setOpen(true);
    setGenerating(true);
    setTimeout(() => {
      setVersions([V1, V2]);
      setVersion(1);
      lastOpener.current = 1;
      setGenerating(false);
      setMessages((m) => [...m, { role: "assistant", text: "Cut it to the goal, three dates and the main risk.", version: 1 }]);
    }, 1600);
  }

  const chat = (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm">
              {m.text}
            </p>
          ) : (
            <div key={i} className="space-y-2">
              <p className="text-sm text-muted-foreground">{m.text}</p>
              {m.version !== undefined && (
                <ArtifactCard
                  ref={(el) => {
                    cardRefs.current[m.version!] = el;
                  }}
                  artifact={artifact}
                  version={m.version}
                  open={open && version === m.version}
                  onOpen={() => openAt(m.version!)}
                />
              )}
            </div>
          )
        )}
        {generating && (
          <ArtifactCard artifact={artifact} version={1} generating open onOpen={() => setOpen(true)} />
        )}
      </div>
      <div className="p-3 pt-0">
        <button
          type="button"
          onClick={askShorter}
          disabled={generating || versions.length > 1}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <span className="truncate">
            {versions.length > 1 ? "Ask anything…" : "Make it shorter — it should fit on one screen."}
          </span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <ArrowUp className="size-3.5" aria-hidden />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[30rem] w-full max-w-4xl overflow-hidden rounded-2xl border bg-background">
      <ArtifactSplit
        open={open}
        chat={chat}
        panel={
          <ArtifactPanel
            key="panel"
            artifact={artifact}
            version={Math.min(version, versions.length - 1)}
            onVersionChange={setVersion}
            onClose={close}
            generating={generating}
          />
        }
      />
    </div>
  );
}
