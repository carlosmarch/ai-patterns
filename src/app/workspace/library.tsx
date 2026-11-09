"use client";

import * as React from "react";
import { ArrowUpRight, Search } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import { cn } from "@/lib/utils";
import { ConnectivityError } from "@/registry/errors/connectivity-error/component";
import {
  DescribeFiltersTable,
  type DescribeFiltersColumn,
  type DescribedFilter,
} from "@/registry/tables/describe-filters/component";
import { JOBS } from "@/registry/jobs";
import { getCategories, registry, type RegistryEntry } from "@/registry";

import { AGENT_ICON, AGENT_NAME } from "./data";
import { entryPath, findEntry, loadSource, specSection, type PatternSource } from "./catalogue";
import { Scroll, Tabs, ViewHeader } from "./views";

// The same catalogue as /patterns, as a view inside
// the workspace — so Origami's product shows the patterns it's built from.

const CATEGORIES = getCategories();

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

type DetailTab = "preview" | "code" | "guardrails";

export function PatternsView({
  selected,
  onSelect,
  category,
  onCategory,
  onAsk,
}: {
  /** "category/slug" of the open pattern, or null for the catalogue grid. */
  selected: string | null;
  onSelect: (path: string | null) => void;
  category: string | null;
  onCategory: (category: string | null) => void;
  onAsk: (entry: RegistryEntry) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [layout, setLayout] = React.useState<"grid" | "table">("grid");
  // Kept across patterns, so browsing the menu on the Code tab stays on Code.
  const [tab, setTab] = React.useState<DetailTab>("preview");
  const entry = findEntry(selected);

  function openCategory(c: string | null) {
    onCategory(c);
    onSelect(null);
  }

  return (
    <>
      {entry ? (
        <ViewHeader title={entry.title}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: "preview", label: "Preview" },
              { id: "code", label: "Code" },
              { id: "guardrails", label: "Guardrails" },
            ]}
          />
        </ViewHeader>
      ) : (
        <ViewHeader title="Patterns" badge={`${registry.length}`}>
          <Tabs
            value={layout}
            onChange={setLayout}
            items={[
              { id: "grid", label: "Grid" },
              { id: "table", label: "Table" },
            ]}
          />
          <label className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring/40 sm:flex">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patterns"
              aria-label="Search patterns"
              className="w-40 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
        </ViewHeader>
      )}
      <div className="flex min-h-0 flex-1">
        <PatternMenu selected={entry ? selected : null} category={entry ? null : category} onSelect={onSelect} onCategory={openCategory} />
        {entry ? (
          <PatternDetail key={selected} entry={entry} tab={tab} onSelect={onSelect} onAsk={onAsk} />
        ) : layout === "table" ? (
          <Scroll className="p-4 sm:p-6">
            <PatternTable onSelect={onSelect} />
          </Scroll>
        ) : (
          <PatternGrid query={query} onQuery={setQuery} onSelect={onSelect} category={category} onCategory={onCategory} />
        )}
      </div>
    </>
  );
}

interface PatternRow {
  id: string;
  name: string;
  category: string;
  job: string;
  added: string;
  /** Hidden: what the describe field matches by meaning. */
  about: string;
}

const PATTERN_ROWS: PatternRow[] = registry.map((e) => ({
  id: entryPath(e),
  name: e.title,
  category: e.category,
  job: JOBS.find((j) => j.id === e.job)?.label ?? e.job,
  added: e.added,
  about: `${e.title} ${e.description} ${specSection(e.uxDoc, "Summary")}`.toLowerCase(),
}));

const addedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

let filterId = 0;
const fid = () => `pf${++filterId}`;

const STOP_WORDS = new Set(["show", "me", "patterns", "pattern", "for", "the", "a", "an", "of", "that", "with", "about", "and", "to", "in", "on", "only", "all", "what", "which", "added", "new"]);

// Stands in for a model reading the column schema and the description.
async function describePatterns(description: string) {
  await new Promise((r) => setTimeout(r, 900));
  const d = description.toLowerCase();
  const filters: DescribedFilter<PatternRow>[] = [];
  const job = JOBS.find((j) => d.includes(j.label.toLowerCase()) || d.includes(j.id));
  if (job) filters.push({ id: fid(), kind: "column", field: "Job", operator: "is", value: job.label, test: (r) => r.job === job.label });
  const category = getCategories().find((c) => d.includes(c));
  if (category) filters.push({ id: fid(), kind: "column", field: "Category", operator: "is", value: category, test: (r) => r.category === category });
  if (/this month|recent|lately|new/.test(d)) {
    filters.push({ id: fid(), kind: "column", field: "Added", operator: "is after", value: "Oct 1", test: (r) => r.added >= "2026-10-01" });
  }
  const words = d.split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w) && w !== job?.id && w !== category);
  if (words.length && !(job || category) ) {
    filters.push({ id: fid(), kind: "semantic", field: "About", operator: "matches", value: words.join(" "), test: (r) => words.some((w) => r.about.includes(w.replace(/s$/, ""))) });
  }
  if (filters.length === 0) throw new Error("Nothing to filter on");
  return { filters };
}

function PatternTable({ onSelect }: { onSelect: (path: string) => void }) {
  const columns: DescribeFiltersColumn<PatternRow>[] = [
    {
      key: "name",
      label: "Pattern",
      render: (r) => (
        <button type="button" onClick={() => onSelect(r.id)} className="font-medium hover:underline">
          {r.name}
        </button>
      ),
    },
    { key: "category", label: "Category", render: (r) => <span className="text-muted-foreground">{r.category}</span> },
    { key: "job", label: "Job", render: (r) => <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{r.job}</span> },
    { key: "added", label: "Added", className: "whitespace-nowrap", render: (r) => <span className="text-muted-foreground">{addedDate.format(new Date(r.added))}</span> },
  ];
  return (
    <DescribeFiltersTable
      columns={columns}
      rows={PATTERN_ROWS}
      onDescribe={describePatterns}
      searchText={(r) => `${r.name} ${r.category}`}
      suggestions={["Patterns that help people recover", "Voice patterns added recently", "Anything about permission"]}
      describePlaceholder="Show me patterns for…"
      className="mx-auto max-w-4xl"
    />
  );
}

/** Every category with its patterns, shown beside both the grid and a pattern's detail. */
function PatternMenu({
  selected,
  category,
  onSelect,
  onCategory,
}: {
  selected: string | null;
  category: string | null;
  onSelect: (path: string) => void;
  onCategory: (category: string | null) => void;
}) {
  const activeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <nav aria-label="Patterns" className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r p-3 lg:flex">
      <button
        type="button"
        onClick={() => onCategory(null)}
        aria-current={!selected && !category ? "page" : undefined}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
          !selected && !category ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        )}
      >
        All patterns
        <span className="text-xs tabular-nums text-muted-foreground">{registry.length}</span>
      </button>
      {CATEGORIES.map((c) => {
        const items = registry.filter((e) => e.category === c);
        return (
          <div key={c} className="mt-3">
            <button
              type="button"
              onClick={() => onCategory(c)}
              aria-current={category === c ? "page" : undefined}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-1 text-left text-xs font-medium capitalize transition-colors",
                category === c ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {c}
              <span className="tabular-nums">{items.length}</span>
            </button>
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {items.map((e) => {
                const path = entryPath(e);
                const active = path === selected;
                return (
                  <li key={e.slug}>
                    <button
                      ref={active ? activeRef : undefined}
                      type="button"
                      onClick={() => onSelect(path)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "w-full truncate rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                        active ? "bg-accent font-medium" : "hover:bg-accent/60"
                      )}
                    >
                      {e.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function PatternGrid({
  query,
  onQuery,
  onSelect,
  category,
  onCategory,
}: {
  query: string;
  onQuery: (query: string) => void;
  onSelect: (path: string) => void;
  category: string | null;
  onCategory: (category: string | null) => void;
}) {
  const q = query.trim().toLowerCase();
  const matches = registry.filter(
    (e) => (!category || e.category === category) && (!q || `${e.title} ${e.description} ${e.category}`.toLowerCase().includes(q))
  );
  const groups = CATEGORIES.map((c) => ({ category: c, items: matches.filter((e) => e.category === c) })).filter((g) => g.items.length);

  return (
    <Scroll className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search patterns"
            aria-label="Search patterns"
            className="w-full rounded-full border bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40 sm:hidden"
          />
          {[null, ...CATEGORIES].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => onCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                category === c ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c ?? "All"}
            </button>
          ))}
        </div>
        {groups.map((g) => (
          <section key={g.category}>
            <h3 className="mb-3 text-sm font-medium capitalize text-muted-foreground">{g.category}</h3>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {g.items.map(({ Thumbnail, ...e }) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(entryPath(e))}
                    className="group block h-full w-full overflow-hidden rounded-2xl border bg-card text-left transition-colors hover:bg-accent/60"
                  >
                    <div className="aspect-[5/3] border-b bg-muted/40 p-3 transition-colors group-hover:bg-muted/70">
                      <Thumbnail />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-sm text-muted-foreground">No patterns match “{query}”.</p>}
      </div>
    </Scroll>
  );
}

function PatternDetail({
  entry,
  tab,
  onSelect,
  onAsk,
}: {
  entry: RegistryEntry;
  tab: DetailTab;
  onSelect: (path: string) => void;
  onAsk: (entry: RegistryEntry) => void;
}) {
  const [source, setSource] = React.useState<PatternSource | "error" | null>(null);
  const path = entryPath(entry);
  const Demo = entry.Demo;
  const index = registry.indexOf(entry);
  const prev = registry[index - 1];
  const next = registry[index + 1];

  React.useEffect(() => {
    if (tab === "preview" || source) return;
    let live = true;
    loadSource(path).then(
      (s) => live && setSource(s),
      () => live && setSource("error")
    );
    return () => {
      live = false;
    };
  }, [tab, path, source]);

  return (
    <Scroll className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-2xl space-y-1.5">
            <p className="text-sm font-medium capitalize text-muted-foreground">{entry.category}</p>
            <h3 className="text-2xl font-semibold tracking-tight">{entry.title}</h3>
            <p className="text-muted-foreground">{entry.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`/patterns/${path}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
            >
              Open page
              <ArrowUpRight className="size-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onAsk(entry)}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <AGENT_ICON className="size-3.5" />
              Ask {AGENT_NAME}
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-muted/30 p-6 sm:p-10">
            <Demo />
          </div>
        ) : tab === "guardrails" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                A UX spec for this pattern — written for agents implementing or reusing it, not the code.
              </p>
              <DownloadButton filename={`${entry.slug}.pattern.md`} content={entry.uxDoc} className="shrink-0" />
            </div>
            <Highlighted html={source === "error" ? null : source?.specHtml} text={entry.uxDoc} wrap />
          </div>
        ) : (
          source === "error" ? (
            <ConnectivityError
              title="Couldn't load the code"
              description="The component source didn't come through. Your place is kept — try again."
              onRetry={() => setSource(null)}
              className="w-full max-w-none"
            />
          ) : (
            <Highlighted html={source?.codeHtml} text={source?.code} />
          )
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t pt-4 text-sm">
          {prev ? (
            <button type="button" onClick={() => onSelect(entryPath(prev))} className="truncate text-muted-foreground transition-colors hover:text-foreground">
              ← {prev.title}
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button type="button" onClick={() => onSelect(entryPath(next))} className="truncate text-muted-foreground transition-colors hover:text-foreground">
              {next.title} →
            </button>
          )}
        </div>
      </div>
    </Scroll>
  );
}

function Highlighted({ html, text, wrap }: { html?: string | null; text?: string; wrap?: boolean }) {
  return (
    <div className="relative">
      {text && <CopyButton text={text} className="absolute right-3 top-3 z-10" trackAs={wrap ? "spec" : "component"} />}
      {html ? (
        <div
          className={cn(
            "max-h-[640px] overflow-auto rounded-lg border text-sm [&_pre]:p-4",
            wrap && "[&_code]:whitespace-pre-wrap [&_code]:break-words"
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : text ? (
        <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap break-words rounded-lg border bg-[#24292e] p-4 text-sm text-[#e1e4e8]">{text}</pre>
      ) : (
        <div className="h-64 animate-pulse rounded-lg border bg-muted/50" aria-label="Loading" />
      )}
    </div>
  );
}
