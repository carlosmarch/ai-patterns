"use client";

import { RefineSearch, type RefineProposal, type RefineSearchColumn } from "./component";

interface PatternRow {
  id: string;
  name: string;
  category: string;
  job: "Start" | "Ask" | "Steer" | "Oversee" | "Trust" | "Recover";
  status: "Stable" | "Beta";
  updated: string; // ISO date
  /** Hidden — what the keyword search reads. */
  about: string;
}

const ROWS: PatternRow[] = [
  { id: "1", name: "Tool Approval", category: "permissions", job: "Oversee", status: "Stable", updated: "2026-11-09", about: "agent pause allow deny" },
  { id: "2", name: "Human in the Loop", category: "agents", job: "Oversee", status: "Stable", updated: "2026-11-06", about: "agent question pause" },
  { id: "3", name: "Background Tasks", category: "agents", job: "Oversee", status: "Beta", updated: "2026-11-04", about: "agent running progress stop" },
  { id: "4", name: "Agent Run Card", category: "agents", job: "Oversee", status: "Beta", updated: "2026-11-02", about: "agent run summary status" },
  { id: "5", name: "Plan Review", category: "agents", job: "Steer", status: "Stable", updated: "2026-10-30", about: "agent plan approve edit" },
  { id: "6", name: "Agent Triggers", category: "agents", job: "Steer", status: "Beta", updated: "2026-10-27", about: "agent schedule event automation" },
  { id: "7", name: "Procedure Builder", category: "agents", job: "Steer", status: "Beta", updated: "2026-10-24", about: "agent steps instructions" },
  { id: "8", name: "Create Agent", category: "agents", job: "Start", status: "Stable", updated: "2026-10-20", about: "agent setup onboarding" },
  { id: "9", name: "Agent Setup Pill", category: "onboarding", job: "Start", status: "Beta", updated: "2026-10-18", about: "agent setup onboarding" },
  { id: "10", name: "Multi-Agent Trace", category: "traces", job: "Oversee", status: "Beta", updated: "2026-10-15", about: "agent steps reasoning" },
  { id: "11", name: "Checkpoint Restore", category: "agents", job: "Recover", status: "Stable", updated: "2026-10-11", about: "agent undo rollback" },
  { id: "12", name: "Thinking Loader", category: "loaders", job: "Oversee", status: "Stable", updated: "2026-10-08", about: "waiting progress" },
  { id: "13", name: "Rate Limit", category: "errors", job: "Recover", status: "Stable", updated: "2026-10-05", about: "quota countdown" },
  { id: "14", name: "Cost Estimate", category: "indicators", job: "Oversee", status: "Beta", updated: "2026-10-02", about: "tokens price budget" },
  { id: "15", name: "Source Trust Card", category: "text", job: "Trust", status: "Stable", updated: "2026-09-28", about: "citation credibility" },
];

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const COLUMNS: RefineSearchColumn<PatternRow>[] = [
  { key: "name", label: "Pattern", className: "font-medium" },
  { key: "job", label: "Job", render: (r) => <span className="text-muted-foreground">{r.job}</span> },
  {
    key: "status",
    label: "Status",
    render: (r) => <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{r.status}</span>,
  },
  {
    key: "updated",
    label: "Updated",
    className: "whitespace-nowrap text-right",
    render: (r) => <span className="text-muted-foreground">{date.format(new Date(r.updated))}</span>,
  },
];

const FACETS: { field: string; value: (r: PatternRow) => string; format?: (v: string) => string }[] = [
  { field: "Status", value: (r) => r.status },
  { field: "Job", value: (r) => r.job },
  { field: "Category", value: (r) => r.category, format: (v) => v[0].toUpperCase() + v.slice(1) },
];

// Stands in for a model call that reads the query and the current results
// and proposes the filters that would split them most usefully.
async function mockPropose(_query: string, results: PatternRow[], applied: RefineProposal<PatternRow>[]) {
  await new Promise((r) => setTimeout(r, 900));
  const usedFields = new Set(applied.map((f) => f.field));
  const candidates: (RefineProposal<PatternRow> & { score: number })[] = [];

  for (const facet of FACETS) {
    if (usedFields.has(facet.field)) continue;
    const counts = new Map<string, number>();
    for (const r of results) counts.set(facet.value(r), (counts.get(facet.value(r)) ?? 0) + 1);
    for (const [value, n] of counts) {
      if (n < 2 || n === results.length) continue;
      candidates.push({
        id: `${facet.field}:${value}`,
        field: facet.field,
        label: facet.format ? facet.format(value) : value,
        test: (r) => facet.value(r) === value,
        // Prefer filters that cut the set roughly in half.
        score: -Math.abs(n / results.length - 0.5),
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export default function RefineSearchDemo() {
  return (
    <div className="w-full max-w-2xl">
      <RefineSearch
        columns={COLUMNS}
        rows={ROWS}
        searchText={(r) => `${r.name} ${r.category} ${r.about}`}
        onPropose={mockPropose}
        initialQuery="agent"
        placeholder="E.g. Tool Approval"
      />
    </div>
  );
}
