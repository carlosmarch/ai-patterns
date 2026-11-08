"use client";

import * as React from "react";
import { PanelRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { AiFillDrawer, type FieldDef, type FillResult } from "@/registry/tables/ai-fill-drawer/component";
import { AiReviewPanel, type Evidence } from "@/registry/review/ai-review-panel/component";
import { NaturalLanguageQuery, type QueryColumn } from "@/registry/tables/natural-language-query/component";

import { AGENT_NAME, COPY_EVENTS, PRODUCT_FILL, REQUEST_DOC, REQUEST_FIELDS, TRACKED_PRODUCTS, type CopyEvent, type TrackedProduct } from "./data";
import { Scroll, Tabs, ViewHeader } from "./views";

// What the team learns from the catalogue: which patterns get copied, which
// products the research scout tracks, and pattern requests Origami has read.

export type InsightsTab = "usage" | "products" | "requests";

export function InsightsView({
  tab,
  onTabChange,
  onToast,
}: {
  tab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
  onToast: (message: string) => void;
}) {
  return (
    <>
      <ViewHeader title="Insights">
        <Tabs
          value={tab}
          onChange={onTabChange}
          items={[
            { id: "usage", label: "Usage" },
            { id: "products", label: "Products" },
            { id: "requests", label: "Requests" },
          ]}
        />
      </ViewHeader>
      {tab === "usage" ? <UsageQuery /> : tab === "products" ? <ProductsTable onToast={onToast} /> : <RequestReview onToast={onToast} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Usage — ask the copy-events table in plain language
// ---------------------------------------------------------------------------

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const muted = (v: string) => <span className="text-muted-foreground">{v}</span>;

const EVENT_COLUMNS: QueryColumn<CopyEvent>[] = [
  { key: "pattern", className: "min-w-36 font-medium" },
  { key: "category", render: (r) => muted(r.category) },
  { key: "source", render: (r) => <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{r.source}</span> },
  { key: "week", render: (r) => muted(`Week of ${shortDate.format(new Date(r.week))}`), className: "whitespace-nowrap" },
  { key: "copies", render: (r) => r.copies.toLocaleString("en-US"), className: "text-right tabular-nums" },
];

// Stands in for a model given the table schema.
async function translate(text: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  const t = text.toLowerCase();
  const where: string[] = [];
  // No column says "agent work" — the model maps it onto categories.
  if (/agent|oversight/.test(t)) where.push("category IN ('agents', 'permissions')");
  else if (/voice|speech/.test(t)) where.push("category = 'voice'");
  else if (/loader|loading|wait/.test(t)) where.push("category = 'loaders'");
  else if (/error|fail/.test(t)) where.push("category = 'errors'");
  if (/skill/.test(t)) where.push("source = 'Skill'");
  else if (/mcp/.test(t)) where.push("source = 'MCP'");
  else if (/site|website/.test(t)) where.push("source = 'Site'");
  const over = t.match(/(?:over|above|more than|>)\s*(\d+)/);
  if (over) where.push(`copies > ${over[1]}`);
  const under = t.match(/(?:under|below|fewer than|less than|<)\s*(\d+)/);
  if (under) where.push(`copies < ${under[1]}`);
  if (/this week|latest/.test(t)) where.push("week = '2026-11-02'");
  else if (/last week/.test(t)) where.push("week = '2026-10-26'");
  else if (/october/.test(t)) where.push("week BETWEEN '2026-10-01' AND '2026-10-31'");
  if (where.length === 0) throw new Error("No mapping");
  return where.join(" AND ");
}

type Value = string | number;
type Pred = (row: CopyEvent) => boolean;
const KEYS = new Set(Object.keys(COPY_EVENTS[0]).filter((k) => k !== "id"));

/** A tiny WHERE-clause evaluator, so the generated (or hand-edited) SQL actually runs. */
function compile(where: string): Pred {
  const tokens = where.match(/'(?:[^']|'')*'|\d+(?:\.\d+)?|[A-Za-z_]\w*|>=|<=|<>|!=|[=<>(),]|\S/g) ?? [];
  let i = 0;
  const peek = () => tokens[i]?.toUpperCase();
  const next = () => tokens[i++];
  const expect = (t: string) => {
    if (peek() !== t) throw new Error(`Expected ${t} near "${tokens[i] ?? "end of query"}"`);
    i++;
  };
  const value = (): Value => {
    const t = next();
    if (t === undefined) throw new Error("Query ends too early");
    if (t.startsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
    if (/^\d/.test(t)) return Number(t);
    throw new Error(`Expected a value, got "${t}"`);
  };
  function or(): Pred {
    let left = and();
    while (peek() === "OR") {
      next();
      const l = left;
      const r = and();
      left = (row) => l(row) || r(row);
    }
    return left;
  }
  function and(): Pred {
    let left = not();
    while (peek() === "AND") {
      next();
      const l = left;
      const r = not();
      left = (row) => l(row) && r(row);
    }
    return left;
  }
  function not(): Pred {
    if (peek() === "NOT") {
      next();
      const p = not();
      return (row) => !p(row);
    }
    return primary();
  }
  function primary(): Pred {
    if (peek() === "(") {
      next();
      const p = or();
      expect(")");
      return p;
    }
    const col = next();
    if (!col || !KEYS.has(col)) throw new Error(`Unknown column "${col ?? ""}" — try ${[...KEYS].join(", ")}`);
    const get = (row: CopyEvent) => row[col as keyof CopyEvent] as Value;
    const op = next()?.toUpperCase();
    if (op === "IN") {
      expect("(");
      const list: Value[] = [value()];
      while (peek() === ",") {
        next();
        list.push(value());
      }
      expect(")");
      return (row) => list.includes(get(row));
    }
    if (op === "BETWEEN") {
      const lo = value();
      expect("AND");
      const hi = value();
      return (row) => get(row) >= lo && get(row) <= hi;
    }
    const v = value();
    const cmp: Record<string, (a: Value) => boolean> = {
      "=": (a) => a === v,
      "!=": (a) => a !== v,
      "<>": (a) => a !== v,
      ">": (a) => a > v,
      "<": (a) => a < v,
      ">=": (a) => a >= v,
      "<=": (a) => a <= v,
    };
    if (!op || !cmp[op]) throw new Error(`Unknown operator "${op ?? ""}"`);
    return (row) => cmp[op](get(row));
  }
  const pred = or();
  if (i < tokens.length) throw new Error(`Unexpected "${tokens[i]}"`);
  return pred;
}

async function runQuery(where: string): Promise<CopyEvent[]> {
  await new Promise((r) => setTimeout(r, 250));
  const clause = where.replace(/^\s*(select\s+\*\s+from\s+\w+\s+)?where\s+/i, "");
  return clause ? COPY_EVENTS.filter(compile(clause)) : COPY_EVENTS;
}

function UsageQuery() {
  return (
    <Scroll className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <h3 className="text-xl font-semibold tracking-tight">Copy events</h3>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          Every copy from the site, the skill and the MCP server. Ask in plain language — the SQL stays editable.
        </p>
        <NaturalLanguageQuery
          table="copy_events"
          columns={EVENT_COLUMNS}
          onTranslate={translate}
          onRun={runQuery}
          initialRows={COPY_EVENTS}
          examples={["agent patterns copied from the skill", "voice copies this week", "anything with fewer than 150 copies"]}
        />
      </div>
    </Scroll>
  );
}

// ---------------------------------------------------------------------------
// Products — the research scout's watchlist, filled in by Origami
// ---------------------------------------------------------------------------

function productFields(p: TrackedProduct): FieldDef[] {
  return [
    { key: "name", label: "Product", value: p.name, fillable: false },
    { key: "domain", label: "Domain", value: p.domain },
    { key: "category", label: "Category", value: p.category },
    { key: "surface", label: "AI surface", value: p.surface },
    { key: "patterns", label: "Patterns spotted", value: p.patterns },
    { key: "changelog", label: "Changelog", value: p.changelog },
    { key: "owner", label: "Watched by", value: p.owner, fillable: false },
  ];
}

function mockFill(key: string): Promise<FillResult> {
  const a = PRODUCT_FILL[key] ?? { value: null, ms: 1000 };
  return new Promise((resolve) => setTimeout(() => resolve({ value: a.value, source: a.source }), a.ms));
}

function ProductsTable({ onToast }: { onToast: (message: string) => void }) {
  const [products, setProducts] = React.useState(TRACKED_PRODUCTS);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const open = products.find((p) => p.id === openId);
  const empty = (p: TrackedProduct) => [p.category, p.surface, p.patterns, p.changelog].filter((v) => !v).length;

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <Scroll className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-xl font-semibold tracking-tight">Tracked products</h3>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            The research scout&apos;s watchlist. Open a product and {AGENT_NAME} fills the gaps from its docs and changelog.
          </p>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Patterns spotted</th>
                  <th className="px-4 py-2.5 font-medium">Watched by</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setOpenId(p.id)}
                    className={cn("cursor-pointer border-b transition-colors last:border-0 hover:bg-accent/60", openId === p.id && "bg-accent")}
                  >
                    <td className="px-4 py-3">
                      <button type="button" className="flex items-center gap-2 font-medium" onClick={() => setOpenId(p.id)}>
                        {p.name}
                        {empty(p) > 0 && (
                          <span className="rounded-full border border-dashed px-1.5 text-[10px] font-normal text-muted-foreground">
                            {empty(p)} empty
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="hidden max-w-64 truncate px-4 py-3 text-muted-foreground md:table-cell">{p.patterns ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!open && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <PanelRight className="size-3.5" />
              Try Linear — it was added yesterday and most of its fields are empty.
            </p>
          )}
        </div>
      </Scroll>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full justify-end">
        {open && (
          <AiFillDrawer
            key={open.id}
            open
            onClose={() => setOpenId(null)}
            title={open.name}
            subtitle={`Product · ${open.domain}`}
            fields={productFields(open)}
            onFill={mockFill}
            onChange={(key, value) => {
              setProducts((prev) => prev.map((p) => (p.id === open.id ? { ...p, [key]: value } : p)));
              if (value) onToast(`Saved ${key} for ${open.name}.`);
            }}
            className="pointer-events-auto"
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requests — fields Origami pulled out of a pattern request, with evidence
// ---------------------------------------------------------------------------

const QUOTES = REQUEST_FIELDS.flatMap((f) => f.evidence);

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

function RequestReview({ onToast }: { onToast: (message: string) => void }) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState<string | null>(null);
  const marks = React.useRef<Record<string, HTMLElement | null>>({});
  const doc = React.useRef<HTMLElement>(null);
  const active = preview ?? pinned;

  function open(e: Evidence) {
    setPinned(e.id);
    marks.current[e.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="flex min-h-0 flex-1 p-3 sm:p-4">
    {/* The request and the fields pulled from it are one review: evidence in the panel lights up the text beside it. */}
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-3 sm:flex-row">
      <article ref={doc} className="min-h-48 min-w-0 flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed">
        <h3 className="font-medium">{REQUEST_DOC.title}</h3>
        <p className="mb-4 text-xs text-muted-foreground">{REQUEST_DOC.meta}</p>
        {REQUEST_DOC.paragraphs.map((p, i) => (
          <p key={i} className="mb-3 text-muted-foreground">
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
        title="Pattern request"
        fields={REQUEST_FIELDS}
        onEvidencePreview={(e) => setPreview(e?.id ?? null)}
        onEvidenceOpen={open}
        onViewSource={() => doc.current?.scrollTo({ top: 0, behavior: "smooth" })}
        onStatusChange={(key, status) => status === "accepted" && onToast(`Accepted ${REQUEST_FIELDS.find((f) => f.key === key)?.label}.`)}
        className="min-h-0 sm:w-[22rem] sm:shrink-0"
      />
    </div>
    </div>
  );
}
