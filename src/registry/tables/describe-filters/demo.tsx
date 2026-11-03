"use client";

import { DescribeFiltersTable, type DescribeFiltersColumn, type DescribedFilter } from "./component";

interface PatternRow {
  id: string;
  name: string;
  category: string;
  updated: string; // ISO date
  status: "Stable" | "Beta";
  /** Hidden from the table — stands in for whatever the model would read to match by meaning. */
  about: string;
}

const ROWS: PatternRow[] = [
  { id: "1", name: "Tool Approval", category: "permissions", updated: "2026-10-28", status: "Stable", about: "pause agent ask user allow deny oversight trust safety" },
  { id: "2", name: "Human in the Loop", category: "agents", updated: "2026-10-21", status: "Stable", about: "pause agent question user choice oversight" },
  { id: "3", name: "Thinking Loader", category: "loaders", updated: "2026-09-12", status: "Stable", about: "waiting progress elapsed time status" },
  { id: "4", name: "Analysis List", category: "loaders", updated: "2026-10-30", status: "Beta", about: "waiting progress skeleton status" },
  { id: "5", name: "Background Tasks", category: "agents", updated: "2026-10-14", status: "Beta", about: "progress running stop agent oversight status" },
  { id: "6", name: "Rate Limit", category: "errors", updated: "2026-10-02", status: "Stable", about: "quota countdown waiting failure" },
  { id: "7", name: "Generation Error", category: "errors", updated: "2026-11-01", status: "Stable", about: "failure retry console" },
  { id: "8", name: "Listening State", category: "voice", updated: "2026-08-19", status: "Beta", about: "microphone speech input audio" },
  { id: "9", name: "Live Transcript", category: "voice", updated: "2026-09-03", status: "Beta", about: "speech audio text streaming" },
  { id: "10", name: "Confidence Indicator", category: "indicators", updated: "2026-10-09", status: "Stable", about: "trust certainty accuracy badge" },
  { id: "11", name: "Source Trust Card", category: "text", updated: "2026-10-25", status: "Stable", about: "trust citation sources credibility" },
  { id: "12", name: "Multi-Agent Trace", category: "traces", updated: "2026-09-27", status: "Beta", about: "agent steps progress oversight status" },
];

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const COLUMNS: DescribeFiltersColumn<PatternRow>[] = [
  { key: "name", label: "Pattern", className: "font-medium" },
  { key: "category", label: "Category", render: (r) => <span className="text-muted-foreground">{r.category}</span> },
  {
    key: "updated",
    label: "Updated",
    className: "whitespace-nowrap",
    render: (r) => <span className="text-muted-foreground">{date.format(new Date(r.updated))}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{r.status}</span>
    ),
  },
];

let nextId = 0;
const id = () => `f${++nextId}`;

/** "No column for this" — matched by meaning against the hidden `about` text. */
function about(concept: string, keywords: string[]): DescribedFilter<PatternRow> {
  return {
    id: id(),
    kind: "semantic",
    field: "About",
    operator: "matches",
    value: concept,
    test: (r) => keywords.some((k) => `${r.about} ${r.name}`.toLowerCase().includes(k)),
  };
}

const category = (value: string): DescribedFilter<PatternRow> => ({
  id: id(),
  kind: "column",
  field: "Category",
  operator: "is",
  value,
  test: (r) => r.category === value,
});

const status = (value: PatternRow["status"]): DescribedFilter<PatternRow> => ({
  id: id(),
  kind: "column",
  field: "Status",
  operator: "is",
  value,
  test: (r) => r.status === value,
});

const updatedAfter = (iso: string): DescribedFilter<PatternRow> => ({
  id: id(),
  kind: "column",
  field: "Updated",
  operator: "is after",
  value: date.format(new Date(iso)),
  test: (r) => r.updated > iso,
});

const STOP_WORDS = new Set(["show", "me", "patterns", "pattern", "for", "the", "a", "an", "of", "that", "with", "about", "and", "to", "in", "on", "only", "all"]);

// Stands in for a model call that reads the column schema + the description
// and returns structured filters.
async function mockDescribe(description: string) {
  await new Promise((r) => setTimeout(r, 1200));
  const d = description.toLowerCase();
  const filters: DescribedFilter<PatternRow>[] = [];

  if (/oversight|supervis|control.*agent|agent.*control/.test(d)) filters.push(about("agent oversight", ["oversight"]));
  else if (/progress|waiting|loading/.test(d)) filters.push(about("progress & waiting", ["progress", "waiting"]));
  else if (/trust|credib|reliab/.test(d)) filters.push(about("trust", ["trust"]));
  else if (/voice|speech|audio/.test(d)) filters.push(category("voice"));
  else if (/error|fail/.test(d)) filters.push(category("errors"));

  if (/\bbeta\b|experimental/.test(d)) filters.push(status("Beta"));
  else if (/\bstable\b/.test(d)) filters.push(status("Stable"));

  if (/this month|recent|last few weeks/.test(d)) filters.push(updatedAfter("2026-10-01"));

  if (filters.length === 0) {
    const words = d.split(/[^a-z]+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length === 0) throw new Error("Nothing to filter on");
    filters.push(about(words.join(" "), words));
  }
  return { filters };
}

export default function DescribeFiltersDemo() {
  return (
    <div className="w-full max-w-2xl">
      <DescribeFiltersTable
        columns={COLUMNS}
        rows={ROWS}
        onDescribe={mockDescribe}
        searchText={(r) => `${r.name} ${r.category}`}
        suggestions={["Show me patterns for agent oversight", "Patterns about trust updated this month", "Beta patterns for showing progress"]}
        describePlaceholder="Show me patterns for…"
      />
    </div>
  );
}
