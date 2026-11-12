"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { RotateCcw, Search, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RefineSearchColumn<Row> {
  key: string;
  label: string;
  /** Renders the cell; defaults to `String(row[key])`. */
  render?: (row: Row) => React.ReactNode;
  className?: string;
}

/** A filter the AI proposes for the current results. */
export interface RefineProposal<Row> {
  id: string;
  /** What the filter narrows on, e.g. "Status". Shown on the applied chip. */
  field: string;
  /** The value, e.g. "Beta". Shown on the proposal pill. */
  label: string;
  test: (row: Row) => boolean;
}

export interface RefineSearchProps<Row extends { id: string }> {
  columns: RefineSearchColumn<Row>[];
  rows: Row[];
  /** Text the keyword search matches against. */
  searchText: (row: Row) => string;
  /**
   * Proposes filters for the current results. Counts are computed here from
   * `results`, not trusted from the model, and proposals that wouldn't narrow
   * the set (0 rows, or every row) are dropped.
   */
  onPropose: (query: string, results: Row[], applied: RefineProposal<Row>[]) => Promise<RefineProposal<Row>[]>;
  initialQuery?: string;
  placeholder?: string;
  /** Completes "There are N search results sorted by …". */
  sortLabel?: string;
  /** Most proposals shown at once. */
  maxProposals?: number;
  className?: string;
}

export function RefineSearch<Row extends { id: string }>({
  columns,
  rows,
  searchText,
  onPropose,
  initialQuery = "",
  placeholder = "Search",
  sortLabel = "latest update",
  maxProposals = 3,
  className,
}: RefineSearchProps<Row>) {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = React.useState(initialQuery);
  const [query, setQuery] = React.useState(initialQuery);
  const [applied, setApplied] = React.useState<RefineProposal<Row>[]>([]);
  /** The last proposal response, tagged with the result set it was for. */
  const [response, setResponse] = React.useState<{ key: string; proposals: RefineProposal<Row>[] } | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const requestId = React.useRef(0);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) => (!q || searchText(row).toLowerCase().includes(q)) && applied.every((f) => f.test(row))
    );
  }, [rows, query, applied, searchText]);

  // Re-propose whenever the result set changes: a new search or a filter
  // added/removed. Responses for an older result set are ignored, and the
  // panel shows its loading state until the current one arrives.
  const key = JSON.stringify([query, applied.map((f) => f.id)]);
  React.useEffect(() => {
    const id = ++requestId.current;
    const appliedKeys = new Set(applied.map((f) => `${f.field}:${f.label}`));
    onPropose(query, results, applied)
      .then((next) => {
        if (id !== requestId.current) return;
        setResponse({
          key,
          proposals: next
            .filter((p) => !appliedKeys.has(`${p.field}:${p.label}`))
            .filter((p) => {
              const n = results.filter(p.test).length;
              return n > 0 && n < results.length;
            })
            .slice(0, maxProposals),
        });
      })
      // A failed request collapses the panel; search keeps working.
      .catch(() => {
        if (id === requestId.current) setResponse({ key, proposals: [] });
      });
    // `key` captures query + applied; `results` derives from them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const status = response?.key === key ? "ready" : "loading";
  const proposals = status === "ready" ? response!.proposals : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.trim() === query.trim()) return;
    setQuery(draft.trim());
    setDismissed(false);
  }

  function apply(p: RefineProposal<Row>) {
    setApplied((prev) => [...prev, p]);
  }

  function remove(id: string) {
    setApplied((prev) => prev.filter((f) => f.id !== id));
  }

  function reset() {
    setApplied([]);
    setDraft("");
    setQuery("");
    setDismissed(false);
  }

  const showPanel = !dismissed && (status === "loading" || proposals.length > 0);
  const transition = reduceMotion ? { duration: 0 } : { type: "spring" as const, bounce: 0.15, duration: 0.4 };

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card text-sm", className)}>
      <LayoutGroup>
        <div className="flex flex-col gap-3 p-3">
          {/* Search */}
          <form onSubmit={submit} role="search" className="flex h-10 items-stretch overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/40">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              aria-label="Search"
              className="min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Run search"
              className="flex w-10 shrink-0 items-center justify-center border-l text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
          </form>

          {/* Applied filters */}
          <AnimatePresence initial={false}>
            {applied.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="-mb-1 overflow-hidden"
              >
                <ul aria-label="Applied filters" className="flex flex-wrap items-center gap-1.5 pb-1">
                  <AnimatePresence initial={false} mode="popLayout">
                    {applied.map((f) => (
                      <motion.li
                        key={f.id}
                        layoutId={`refine-${f.id}`}
                        transition={transition}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex h-7 items-center gap-1.5 rounded-md border bg-background pl-2.5 pr-1 text-xs"
                      >
                        <Sparkles className="size-3 shrink-0 text-muted-foreground" aria-label="Suggested by AI" />
                        <span className="text-muted-foreground">{f.field}</span>
                        <span>{f.label}</span>
                        <button
                          type="button"
                          onClick={() => remove(f.id)}
                          aria-label={`Remove filter: ${f.field} ${f.label}`}
                          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <X className="size-3" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  <li>
                    <button
                      type="button"
                      onClick={reset}
                      className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="size-3" aria-hidden />
                      Reset
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI proposals */}
          <AnimatePresence initial={false}>
            {showPanel && (
              <motion.section
                key="refine"
                aria-labelledby="refine-search-title"
                aria-busy={status === "loading"}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="overflow-hidden rounded-lg bg-muted/60"
              >
                <div className="flex flex-col gap-2.5 px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles
                      className={cn(
                        "size-3.5 shrink-0 text-muted-foreground",
                        status === "loading" && !reduceMotion && "animate-pulse"
                      )}
                      aria-hidden
                    />
                    <h3 id="refine-search-title" className="text-xs font-medium">
                      Refine your search
                    </h3>
                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      aria-label="Hide suggestions"
                      className="ml-auto flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex min-h-7 flex-wrap gap-1.5">
                    {status === "loading" ? (
                      <span role="status" className="flex flex-wrap gap-1.5">
                        <span className="sr-only">Finding ways to narrow these results</span>
                        {[64, 84, 72].map((w) => (
                          <span
                            key={w}
                            aria-hidden
                            style={{ width: w }}
                            className={cn("h-7 rounded-md border bg-background/60", !reduceMotion && "animate-pulse")}
                          />
                        ))}
                      </span>
                    ) : (
                      proposals.map((p, i) => {
                        const count = results.filter(p.test).length;
                        return (
                          <motion.button
                            key={p.id}
                            layoutId={`refine-${p.id}`}
                            type="button"
                            onClick={() => apply(p)}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...transition, delay: reduceMotion ? 0 : i * 0.05 }}
                            title={`${p.field}: ${p.label}`}
                            aria-label={`Refine by ${p.field} ${p.label}, ${count} results`}
                            className="flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs transition-colors hover:bg-accent"
                          >
                            <span>{p.label}</span>
                            <span className="text-muted-foreground tabular-nums">({count})</span>
                            <Search className="size-3 text-muted-foreground" aria-hidden />
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {/* Result count */}
      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground" aria-live="polite">
        There {results.length === 1 ? "is" : "are"}{" "}
        <span className="font-medium text-foreground tabular-nums">{results.length}</span> search{" "}
        {results.length === 1 ? "result" : "results"} sorted by {sortLabel}
      </p>

      {/* Results */}
      <div className="max-h-72 overflow-auto border-t">
        <table className="w-full border-collapse" aria-busy={status === "loading"}>
          <thead className="sticky top-0 z-[1] bg-card">
            <tr className="border-b text-left text-xs text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn("px-4 py-2 font-medium", c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {results.map((row) => (
                <motion.tr
                  key={row.id}
                  layout={reduceMotion ? false : "position"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  className="border-b last:border-b-0"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-2.5", c.className)}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {results.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <p className="text-muted-foreground">No results match this search.</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium underline-offset-2 hover:underline"
            >
              Reset search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
