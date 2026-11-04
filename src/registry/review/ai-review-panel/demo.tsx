"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

import { AiReviewPanel, type Evidence, type ReviewField } from "./component";

// A fictional regulatory notice the model extracted fields from. Every
// evidence quote below is an exact substring of one of these paragraphs.
const DOCUMENT = {
  title: "Direction 2026/14 — Sustainability Ratings Providers",
  meta: "Northbridge Markets Authority · Published 3 Nov 2026",
  paragraphs: [
    "This Direction is made by the Northbridge Markets Authority under the powers conferred by section 12 of the Sustainability Ratings Order 2026.",
    "It sets out the application periods during which firms must apply to the Authority for permission to provide sustainability ratings. Firms that do not apply within their window may not continue to provide ratings after 30 June 2027.",
    "The first application window opens on 1 February 2027 and closes on 30 April 2027. It applies to firms providing ratings to more than 50 professional clients.",
    "This Direction comes into force on 1 January 2027. Comments on the accompanying guidance may be sent to the Authority by 15 December 2026; the Direction itself is not subject to consultation.",
  ],
};

const ev = (id: string, quote: string): Evidence => ({ id, quote });

const FIELDS: ReviewField[] = [
  {
    key: "binding",
    label: "Degree of binding force",
    value: "Mandatory",
    reasoning:
      "This is a Direction made under a statutory power in the Sustainability Ratings Order. It sets windows in which firms ‘must apply’, so it binds of its own force and is not a consultation.",
    evidence: [
      ev("binding-1", "application periods during which firms must apply to"),
      ev("binding-2", "the Direction itself is not subject to consultation"),
    ],
  },
  {
    key: "issuer",
    label: "Issuing body",
    value: "Northbridge Markets Authority",
    reasoning: "The opening sentence names the Authority as the maker of the Direction.",
    evidence: [ev("issuer-1", "the Northbridge Markets Authority")],
    status: "accepted",
  },
  {
    key: "type",
    label: "Instrument type",
    value: "Direction",
    reasoning: "The document calls itself a Direction throughout, and cites the power it is made under.",
    evidence: [ev("type-1", "This Direction is made by")],
    status: "accepted",
  },
  {
    key: "effective",
    label: "Effective date",
    value: "1 Jan 2027",
    reasoning: "The commencement sentence gives a single in-force date.",
    evidence: [ev("effective-1", "comes into force on 1 January 2027")],
  },
  {
    key: "window",
    label: "Application window",
    value: "1 Feb – 30 Apr 2027",
    reasoning: "Only the first window is dated in this document; later windows aren't mentioned.",
    evidence: [ev("window-1", "opens on 1 February 2027 and closes on 30 April 2027")],
  },
  {
    key: "deadline",
    label: "Consultation deadline",
    value: "15 Dec 2026",
    reasoning:
      "The date given is for comments on the guidance, not the Direction. It may not count as a consultation deadline.",
    evidence: [ev("deadline-1", "sent to the Authority by 15 December 2026")],
    status: "dismissed",
  },
  {
    key: "scope",
    label: "Affected firms",
    value: "Ratings providers, 50+ professional clients",
    reasoning: "The threshold is stated for the first window only.",
    evidence: [ev("scope-1", "firms providing ratings to more than 50 professional clients")],
  },
  {
    key: "description",
    label: "Initiative description",
    value: "Application windows for ratings permission",
    reasoning:
      "The Direction's purpose is to set when firms must apply for permission, and the cut-off after which unpermitted firms must stop.",
    evidence: [
      ev("description-1", "permission to provide sustainability ratings"),
      ev("description-2", "may not continue to provide ratings after 30 June 2027"),
    ],
  },
];

const QUOTES = FIELDS.flatMap((f) => f.evidence);

/** Splits a paragraph around every evidence quote it contains. */
function segments(text: string) {
  const hits = QUOTES.map((q) => ({ q, at: text.indexOf(q.quote) }))
    .filter((h) => h.at >= 0)
    .sort((a, b) => a.at - b.at);
  const out: { text: string; id?: string }[] = [];
  let i = 0;
  for (const { q, at } of hits) {
    if (at < i) continue;
    if (at > i) out.push({ text: text.slice(i, at) });
    out.push({ text: q.quote, id: q.id });
    i = at + q.quote.length;
  }
  if (i < text.length) out.push({ text: text.slice(i) });
  return out;
}

export default function AiReviewPanelDemo() {
  const [run, setRun] = React.useState(0);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState<string | null>(null);
  const marks = React.useRef<Record<string, HTMLElement | null>>({});
  const doc = React.useRef<HTMLElement>(null);

  function open(e: Evidence) {
    setPinned(e.id);
    marks.current[e.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const active = preview ?? pinned;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex h-[580px] w-full gap-3 overflow-hidden rounded-2xl border bg-card p-3">
        {/* The source document the values were extracted from */}
        <article ref={doc} className="hidden min-w-0 flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed sm:block">
          <h2 className="font-medium">{DOCUMENT.title}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{DOCUMENT.meta}</p>
          {DOCUMENT.paragraphs.map((p, i) => (
            <p key={i} className="mb-3 text-muted-foreground">
              <span className="mr-2 text-xs tabular-nums text-muted-foreground/60">{i + 1}.</span>
              {segments(p).map((s, j) =>
                s.id ? (
                  <mark
                    key={j}
                    ref={(el) => {
                      marks.current[s.id!] = el;
                    }}
                    className={cn(
                      "rounded-sm bg-transparent text-inherit transition-colors duration-200 [box-decoration-break:clone]",
                      active === s.id && "bg-violet-500/20 text-foreground ring-1 ring-violet-500/40"
                    )}
                  >
                    {s.text}
                  </mark>
                ) : (
                  <React.Fragment key={j}>{s.text}</React.Fragment>
                )
              )}
            </p>
          ))}
        </article>

        <AiReviewPanel
          key={run}
          fields={FIELDS}
          onEvidencePreview={(e) => setPreview(e?.id ?? null)}
          onEvidenceOpen={open}
          onViewSource={() => doc.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="sm:w-[22rem] sm:shrink-0"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          setRun((r) => r + 1);
          setPinned(null);
        }}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="size-3" />
        Reset
      </button>
    </div>
  );
}
