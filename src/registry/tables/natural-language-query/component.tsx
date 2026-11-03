"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Sparkles, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QueryColumn<Row> {
  /** Column name as used in SQL. */
  key: string;
  label?: string;
  render?: (row: Row) => React.ReactNode;
  className?: string;
}

export interface NaturalLanguageQueryProps<Row extends { id: string }> {
  /** Table name, shown in the query context line. */
  table: string;
  columns: QueryColumn<Row>[];
  /** Turns plain language into a WHERE clause for `table`. */
  onTranslate: (text: string) => Promise<string>;
  /** Runs a WHERE clause (empty = all rows). Throw an Error with a readable message on invalid SQL. */
  onRun: (where: string) => Promise<Row[]>;
  /** Rows shown before the first query runs — usually the unfiltered table. */
  initialRows: Row[];
  /** Plain-language examples shown under the bar when it's empty. */
  examples?: string[];
  className?: string;
}

/** On error, the last good rows stay visible alongside the message. */
type Result<Row> = { rows: Row[]; ms?: number; error?: string };

const OPERATOR = String.raw`(?:=|!=|<>|>=|<=|>|<|\b(?:not\s+)?(?:in|like|ilike)\b|\bis\s+(?:not\s+)?null\b)`;

/** True when the text reads as a WHERE clause rather than plain language. */
export function looksLikeSql(text: string, columns: string[]) {
  if (/^\s*(select|where)\b/i.test(text)) return true;
  // Any identifier compared to a literal is SQL, even with an unknown column —
  // running it gives a clear "unknown column" error instead of a translation.
  if (/(?:^|\(|\s)[A-Za-z_]\w*\s*(?:=|!=|<>|>=|<=|>|<)\s*(?:'|\d)/.test(text)) return true;
  const cols = columns.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(String.raw`(?:^|\(|\s)(?:${cols})\s*${OPERATOR}`, "i").test(text);
}

export function NaturalLanguageQuery<Row extends { id: string }>({
  table,
  columns,
  onTranslate,
  onRun,
  initialRows,
  examples = [],
  className,
}: NaturalLanguageQueryProps<Row>) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<"idle" | "translating" | "typing" | "running">("idle");
  /** The plain-language request the current SQL came from, until the user edits it. */
  const [translatedFrom, setTranslatedFrom] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Result<Row>>({ rows: initialRows });
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();

  const columnKeys = React.useMemo(() => columns.map((c) => c.key), [columns]);
  const isSql = !text.trim() || looksLikeSql(text, columnKeys);
  const busy = phase !== "idle";

  async function run(where: string) {
    setPhase("running");
    const start = performance.now();
    try {
      const rows = await onRun(where.trim());
      setResult({ rows, ms: Math.round(performance.now() - start) });
    } catch (e) {
      const error = e instanceof Error ? e.message : "Query failed";
      setResult((r) => ({ rows: r.rows, error }));
    } finally {
      setPhase("idle");
    }
  }

  async function submit(value = text) {
    if (busy) return;
    if (!value.trim() || looksLikeSql(value, columnKeys)) {
      run(value);
      return;
    }

    setText(value);
    setPhase("translating");
    let sql: string;
    try {
      sql = await onTranslate(value.trim());
    } catch {
      setResult((r) => ({ rows: r.rows, error: "Couldn't translate that into a query. Try naming a column or value." }));
      setPhase("idle");
      return;
    }

    setTranslatedFrom(value.trim());
    // Type the query out so the user sees plain text become SQL.
    if (!reduceMotion) {
      setPhase("typing");
      const step = Math.max(1, Math.ceil(sql.length / 40));
      for (let i = step; i < sql.length; i += step) {
        setText(sql.slice(0, i));
        await new Promise((r) => setTimeout(r, 16));
      }
    }
    setText(sql);
    inputRef.current?.focus();
    run(sql);
  }

  function undo() {
    if (!translatedFrom) return;
    setText(translatedFrom);
    setTranslatedFrom(null);
    inputRef.current?.focus();
  }

  const mode = phase === "translating" ? "translating" : isSql ? "sql" : "ask";

  return (
    <div className={cn("w-full overflow-hidden rounded-2xl border bg-card text-sm shadow-sm", className)}>
      <div className="border-b p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex h-10 items-center gap-2 rounded-xl border bg-background pl-1.5 pr-1.5 focus-within:ring-2 focus-within:ring-ring/40"
        >
          <ModeBadge mode={mode} />

          <div className="relative min-w-0 flex-1 self-stretch">
            {/* Highlighted copy of the text, under a transparent input. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden font-mono text-[13px]"
            >
              <span className="whitespace-pre" style={{ transform: `translateX(${-scrollLeft}px)` }}>
                {isSql ? <SqlTokens sql={text} columns={columnKeys} /> : text}
              </span>
            </div>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTranslatedFrom(null);
              }}
              onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
              onSelect={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
              readOnly={busy}
              spellCheck={false}
              autoComplete="off"
              aria-label={`Query ${table}: write a SQL WHERE clause, or describe what you want in plain language`}
              aria-describedby={hintId}
              placeholder="status = 'Shipped'  — or just describe it"
              className="relative h-full w-full bg-transparent font-mono text-[13px] text-transparent caret-foreground outline-none placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground selection:bg-foreground/15"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <span className="sr-only sm:not-sr-only">{mode === "ask" ? "Translate" : "Run"}</span>
            <CornerDownLeft className="size-3" aria-hidden />
          </button>
        </form>

        {/* Context line: what Enter will do, or where the SQL came from. */}
        <div id={hintId} className="flex min-h-7 items-center gap-1.5 px-1 pt-2 text-xs text-muted-foreground" aria-live="polite">
          {translatedFrom && phase !== "translating" ? (
            <>
              <Sparkles className="size-3 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">
                Translated from <span className="text-foreground">“{translatedFrom}”</span>
              </span>
              <button
                type="button"
                onClick={undo}
                disabled={busy}
                className="ml-auto flex shrink-0 items-center gap-1 font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50"
              >
                <Undo2 className="size-3" aria-hidden />
                Edit request
              </button>
            </>
          ) : mode === "translating" ? (
            <span className="animate-pulse">Writing the query…</span>
          ) : mode === "ask" ? (
            <span>Plain language — Enter translates it to SQL you can review.</span>
          ) : text.trim() ? (
            <span>
              <span className="font-mono">SELECT * FROM {table} WHERE …</span> — Enter runs it.
            </span>
          ) : examples.length > 0 ? (
            <span className="flex min-w-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap">
              Try
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => submit(ex)}
                  className="rounded-full border px-2 py-0.5 text-foreground transition-colors hover:bg-accent"
                >
                  {ex}
                </button>
              ))}
            </span>
          ) : (
            <span>Write SQL or plain language.</span>
          )}
        </div>
      </div>

      {/* Result status */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground" role="status">
        {phase === "running" ? (
          <span>Running…</span>
        ) : result.error ? (
          <span className="text-destructive">{result.error}</span>
        ) : (
          <span>
            {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
            {result.ms !== undefined && ` · ${result.ms} ms`}
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-auto">
        <table className="w-full border-collapse" aria-busy={busy}>
          <thead className="sticky top-0 z-[1] bg-card">
            <tr className="border-b text-left text-xs text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn("whitespace-nowrap px-4 py-2.5 font-mono font-normal", c.className)}>
                  {c.label ?? c.key}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody animate={{ opacity: busy ? 0.4 : 1 }} transition={{ duration: 0.2 }}>
            <AnimatePresence initial={false}>
              {result.rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
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
          </motion.tbody>
        </table>
        {!result.error && result.rows.length === 0 && (
          <p className="px-4 py-10 text-center text-muted-foreground">No rows match this query.</p>
        )}
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: "sql" | "ask" | "translating" }) {
  return (
    <span className="relative flex h-7 shrink-0 items-center overflow-hidden rounded-lg bg-muted px-2 text-xs font-medium">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={mode === "sql" ? "sql" : "ask"}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className={cn("flex items-center gap-1", mode === "sql" && "font-mono text-muted-foreground")}
        >
          {mode === "sql" ? (
            "WHERE"
          ) : (
            <>
              <Sparkles className={cn("size-3", mode === "translating" && "animate-spin [animation-duration:2s]")} aria-hidden />
              Ask
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const KEYWORDS = new Set(["and", "or", "not", "in", "like", "ilike", "is", "null", "between", "select", "from", "where", "true", "false"]);

function SqlTokens({ sql, columns }: { sql: string; columns: string[] }) {
  const tokens = sql.match(/'(?:[^']|'')*'?|\d+(?:\.\d+)?|[A-Za-z_][\w.]*|[=<>!]+|\s+|./g) ?? [];
  return (
    <>
      {tokens.map((t, i) => {
        const lower = t.toLowerCase();
        const cls = t.startsWith("'")
          ? "text-emerald-700 dark:text-emerald-400"
          : /^\d/.test(t)
            ? "text-amber-700 dark:text-amber-400"
            : KEYWORDS.has(lower)
              ? "text-violet-700 dark:text-violet-400"
              : columns.includes(t)
                ? "text-foreground"
                : /^[=<>!]+$/.test(t)
                  ? "text-muted-foreground"
                  : "text-foreground";
        return (
          <span key={i} className={cls}>
            {t}
          </span>
        );
      })}
    </>
  );
}
