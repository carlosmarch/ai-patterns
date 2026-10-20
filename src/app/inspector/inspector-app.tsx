"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleDashed,
  Copy,
  FileCode2,
  GitBranch,
  Play,
  RefreshCw,
  ScanSearch,
  Wand2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { ToolCallChip, type ToolCallStatus } from "@/registry/loaders/tool-call-chip/component";
import { entryPath, findEntry, specSection } from "@/app/workspace/catalogue";

import { BRANCH, GAPS, REPO, SURFACES, UNMATCHED, type Finding, type Surface, type Verdict } from "./data";

// ---------------------------------------------------------------------------
// Model: a surface's clauses are the Behavior and Accessibility bullets of
// its pattern's real spec, each paired with the scan's finding (if any).
// ---------------------------------------------------------------------------

const SECTIONS = ["Behavior", "Accessibility"] as const;
type Section = (typeof SECTIONS)[number];

interface Clause {
  key: string;
  section: Section;
  index: number;
  text: string;
  finding?: Finding;
  status: Verdict;
  note: string;
  /** Its fix has been applied to the working tree. */
  fixed?: boolean;
}

/** What the user has done to a clause: applied its fix, or verified it in a browser. */
type Override = { status: Verdict; note: string; fixed?: boolean };

type Step = { verb: string; target: string; done: string; kind: "file" | "code" | "network" };
type Busy = { key: string; steps: (Step & { status: ToolCallStatus })[] } | null;

type Filter = "all" | Verdict;
type PanelTab = "evidence" | "fix" | "reference";

function bullets(doc: string, heading: string) {
  return specSection(doc, heading)
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

function clauseKey(surface: Surface, section: Section, index: number) {
  return `${surface.id}:${section}:${index}`;
}

function clausesFor(surface: Surface, overrides: Record<string, Override>): Clause[] {
  const doc = findEntry(surface.pattern)?.uxDoc ?? "";
  const raw = SECTIONS.flatMap((section) =>
    bullets(doc, section).map((text, index) => ({
      key: clauseKey(surface, section, index),
      section,
      index,
      text,
      finding: surface.findings.find((f) => text.includes(f.match)),
    }))
  );
  const fixedMatches = new Set(raw.filter((c) => overrides[c.key]?.status === "pass").map((c) => c.finding?.match));

  return raw.map((c) => {
    const override = overrides[c.key];
    if (override) return { ...c, ...override };
    if (c.finding?.fixedBy && fixedMatches.has(c.finding.fixedBy)) {
      return { ...c, status: "pass" as const, note: "Resolved by a related fix." };
    }
    return { ...c, status: c.finding?.status ?? "pass", note: c.finding?.note ?? "Matches the spec." };
  });
}

/** The surface's file with every applied fix patched in. */
function patchedCode(surface: Surface, clauses: Clause[]) {
  return clauses.reduce((code, c) => {
    const fix = c.finding?.fix;
    return fix && c.fixed ? code.replace(fix.before, fix.after) : code;
  }, surface.code);
}

/** 1-indexed line range of `needle` in `code`, or null. */
function locate(code: string, needle: string): [number, number] | null {
  const at = code.indexOf(needle);
  if (at === -1) return null;
  const start = code.slice(0, at).split("\n").length;
  return [start, start + needle.split("\n").length - 1];
}

/** Where a clause's evidence sits in the current (possibly patched) file. */
function evidenceRange(surface: Surface, clause: Clause, code: string): [number, number] | null {
  const f = clause.finding;
  if (!f) return null;
  if (f.fix) return locate(code, clause.fixed ? f.fix.after : f.fix.before);
  if (!f.lines) return null;
  const original = surface.code.split("\n").slice(f.lines[0] - 1, f.lines[1]).join("\n");
  return locate(code, original);
}

/** The whole lines a fix touches, before and after — so a substring fix still reads as a line diff. */
function fixHunk(code: string, fix: { before: string; after: string }) {
  const at = code.indexOf(fix.before);
  if (at === -1) return null;
  const start = code.lastIndexOf("\n", at) + 1;
  const endAt = code.indexOf("\n", at + fix.before.length);
  const end = endAt === -1 ? code.length : endAt;
  const old = code.slice(start, end);
  return {
    line: code.slice(0, start).split("\n").length,
    removed: old.split("\n"),
    added: old.replace(fix.before, fix.after).split("\n"),
  };
}

function count(clauses: Clause[]) {
  return {
    pass: clauses.filter((c) => c.status === "pass").length,
    fail: clauses.filter((c) => c.status === "fail").length,
    unknown: clauses.filter((c) => c.status === "unknown").length,
    total: clauses.length,
  };
}

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

function agentPrompt(surface: Surface, clause: Clause) {
  return `/ai-patterns apply ${surface.pattern} to ${surface.file} — fix: ${clause.text.replace(/`/g, "")}`;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function InspectorApp({ skillVersion }: { skillVersion: string }) {
  const [surfaceId, setSurfaceId] = React.useState(SURFACES[0].id);
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [tab, setTab] = React.useState<PanelTab>("evidence");
  const [overrides, setOverrides] = React.useState<Record<string, Override>>({});
  const [busy, setBusy] = React.useState<Busy>(null);
  const [scan, setScan] = React.useState<{ running: boolean; file?: string; at: string }>({ running: false, at: "2 min ago" });
  const [toast, setToast] = React.useState<string | null>(null);

  const all = React.useMemo(() => SURFACES.map((s) => ({ surface: s, clauses: clausesFor(s, overrides) })), [overrides]);
  const current = all.find((a) => a.surface.id === surfaceId)!;
  const { surface, clauses } = current;
  const entry = findEntry(surface.pattern);
  const visible = clauses.filter((c) => filter === "all" || c.status === filter);
  const selected = clauses.find((c) => c.key === selectedKey) ?? visible.find((c) => c.status !== "pass") ?? visible[0] ?? clauses[0];
  const code = patchedCode(surface, clauses);
  const totals = count(all.flatMap((a) => a.clauses));
  const score = Math.round((totals.pass / Math.max(totals.total, 1)) * 100);
  const fixable = clauses.filter((c) => c.status === "fail" && c.finding?.fix);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  function selectSurface(id: string) {
    setSurfaceId(id);
    setSelectedKey(null);
    setFilter("all");
  }

  function selectClause(key: string) {
    setSelectedKey(key);
    setTab((t) => (t === "reference" ? "evidence" : t));
  }

  // Each scripted run shows the agent's steps as tool-call chips, then lands its result.
  function run(key: string, steps: Step[], done: () => void) {
    setBusy({ key, steps: [{ ...steps[0], status: "running" }] });
    steps.forEach((_, i) => {
      window.setTimeout(() => {
        setBusy({
          key,
          steps: steps.slice(0, i + 2).map((s, j) => ({ ...s, status: j <= i ? "success" : "running" })),
        });
        if (i === steps.length - 1) {
          window.setTimeout(() => {
            setBusy(null);
            done();
          }, 450);
        }
      }, 650 * (i + 1));
    });
  }

  function applyFixes(targets: Clause[]) {
    if (!targets.length || busy) return;
    const key = targets.length === 1 ? targets[0].key : `${surface.id}:all`;
    run(
      key,
      [
        { verb: "Reading", target: `reference/${surface.pattern}.md`, done: `Read the ${entry?.title ?? surface.pattern} spec`, kind: "file" },
        { verb: "Editing", target: fileName(surface.file), done: `Edited ${fileName(surface.file)}`, kind: "code" },
        { verb: "Linting", target: fileName(surface.file), done: "Lint passed", kind: "code" },
      ],
      () => {
        setOverrides((o) => ({
          ...o,
          ...Object.fromEntries(targets.map((c) => [c.key, { status: "pass" as const, note: "Fixed in your working tree.", fixed: true }])),
        }));
        setToast(targets.length === 1 ? `Fixed in ${fileName(surface.file)}` : `${targets.length} fixes applied to ${fileName(surface.file)}`);
      }
    );
  }

  function verify(clause: Clause) {
    if (busy) return;
    run(
      clause.key,
      [
        { verb: "Launching", target: "headless Chromium", done: "Launched headless Chromium", kind: "network" },
        { verb: "Driving", target: `${surface.name} states`, done: `Drove every ${surface.name} state`, kind: "code" },
      ],
      () => {
        setOverrides((o) => ({ ...o, [clause.key]: { status: "pass", note: "Verified at runtime in headless Chromium." } }));
        setToast("Runtime check passed");
      }
    );
  }

  function rescan() {
    if (scan.running) return;
    SURFACES.forEach((s, i) => window.setTimeout(() => setScan({ running: true, file: s.file, at: "" }), i * 220));
    window.setTimeout(() => setScan({ running: false, at: "just now" }), SURFACES.length * 220 + 200);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied — paste it into your agent");
    } catch {
      setToast("Couldn't access the clipboard");
    }
  }

  // j/k walk the visible clauses, f applies the selected clause's fix.
  const keyState = React.useRef({ visible, selected, applyFixes });
  React.useEffect(() => {
    keyState.current = { visible, selected, applyFixes };
  });
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      const { visible, selected, applyFixes } = keyState.current;
      const i = visible.findIndex((c) => c.key === selected?.key);
      if (e.key === "j" || e.key === "k") {
        const next = visible[Math.min(Math.max(i + (e.key === "j" ? 1 : -1), 0), visible.length - 1)];
        if (next) setSelectedKey(next.key);
      } else if (e.key === "f" && selected?.status === "fail" && selected.finding?.fix) {
        applyFixes([selected]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-full flex-col bg-background text-[13px] text-foreground">
      {/* Title bar */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b px-3">
        <Link href="/" aria-label="Back to AI Patterns" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="flex items-center gap-1.5 font-semibold">
          <ScanSearch className="size-4" />
          Inspector
        </span>
        <span className="hidden h-4 border-l sm:block" />
        <span className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex">
          <span className="text-foreground">{REPO}</span>
          <span className="flex items-center gap-1">
            <GitBranch className="size-3.5" />
            {BRANCH}
          </span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">{scan.running ? "Scanning…" : `Scanned ${scan.at}`}</span>
          <button
            type="button"
            onClick={rescan}
            disabled={scan.running}
            className="flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium hover:bg-accent disabled:opacity-60"
          >
            <RefreshCw className={cn("size-3.5", scan.running && "animate-spin")} />
            Rescan
          </button>
          <ScoreBadge score={score} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Surfaces */}
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r md:flex">
          <PanelHeading label="Surfaces" count={SURFACES.length} />
          <nav aria-label="Surfaces" className="flex flex-col px-1.5">
            {all.map(({ surface: s, clauses: cs }) => {
              const n = count(cs);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSurface(s.id)}
                  aria-current={s.id === surfaceId ? "true" : undefined}
                  className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-accent", s.id === surfaceId && "bg-accent")}
                >
                  <StatusDot status={n.fail ? "fail" : n.unknown ? "unknown" : "pass"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">{fileName(s.file)}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {n.pass}/{n.total}
                  </span>
                </button>
              );
            })}
          </nav>

          <PanelHeading label="Gaps" count={GAPS.length} className="mt-4" />
          <div className="flex flex-col gap-1 px-1.5">
            {GAPS.map((g) => {
              const gapEntry = findEntry(g.pattern);
              return (
                <div key={g.id} className="rounded-md px-2 py-1.5">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="size-2 shrink-0 rotate-45 bg-amber-500" aria-hidden />
                    {g.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.reason}</p>
                  <button
                    type="button"
                    onClick={() => copy(`/ai-patterns apply ${g.pattern}`)}
                    className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="size-3" />
                    apply {gapEntry?.title ?? g.pattern}
                  </button>
                </div>
              );
            })}
          </div>

          <PanelHeading label="No match" count={UNMATCHED.length} className="mt-4" />
          <div className="px-1.5 pb-4">
            {UNMATCHED.map((u) => (
              <div key={u.file} className="rounded-md px-2 py-1.5">
                <p className="flex items-center gap-2 font-mono text-xs">
                  <CircleDashed className="size-3.5 shrink-0 text-muted-foreground" />
                  {fileName(u.file)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Closest: {findEntry(u.closest)?.title ?? u.closest} ({Math.round(u.confidence * 100)}%). Too weak to check against.
                </p>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:flex-row">
          {/* Contract */}
          <main className="flex min-w-0 flex-1 flex-col lg:min-h-0">
            <div className="shrink-0 border-b px-4 py-3">
              <label className="mb-2 block md:hidden">
                <span className="sr-only">Surface</span>
                <select
                  value={surfaceId}
                  onChange={(e) => selectSurface(e.target.value)}
                  className="w-full rounded-md border bg-background px-2 py-1.5"
                >
                  {all.map(({ surface: s, clauses: cs }) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {count(cs).pass}/{cs.length}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-base font-semibold tracking-tight">{surface.name}</h2>
                <span className="font-mono text-xs text-muted-foreground">{surface.file}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Checked against{" "}
                  {entry && (
                    <Link href={`/patterns/${entryPath(entry)}`} className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-2 hover:underline">
                      {entry.title}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  )}
                </span>
                <span>match {Math.round(surface.confidence * 100)}%</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <FilterTabs value={filter} onChange={setFilter} counts={count(clauses)} />
                <button
                  type="button"
                  onClick={() => applyFixes(fixable)}
                  disabled={!fixable.length || !!busy}
                  className="flex h-7 items-center gap-1.5 rounded-md bg-foreground px-2.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
                >
                  <Wand2 className="size-3.5" />
                  {fixable.length ? `Fix ${fixable.length} in this file` : "Nothing to auto-fix"}
                </button>
              </div>
              <ProgressBar counts={count(clauses)} />
            </div>

            <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {SECTIONS.map((section) => {
                const rows = visible.filter((c) => c.section === section);
                if (!rows.length) return null;
                return (
                  <section key={section} aria-label={section}>
                    <h3 className="sticky top-0 z-10 border-b bg-muted/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                      {section}
                    </h3>
                    <ul>
                      {rows.map((c) => (
                        <li key={c.key}>
                          <button
                            type="button"
                            onClick={() => selectClause(c.key)}
                            aria-current={selected?.key === c.key ? "true" : undefined}
                            className={cn(
                              "flex w-full items-start gap-3 border-b border-l-2 border-l-transparent px-4 py-2.5 text-left hover:bg-accent/60",
                              selected?.key === c.key && "border-l-foreground bg-accent/60"
                            )}
                          >
                            <VerdictIcon status={c.status} />
                            <span className="min-w-0 flex-1 leading-relaxed">
                              <InlineCode text={c.text} />
                            </span>
                            {c.finding?.lines && (
                              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">L{c.finding.lines[0]}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
              {!visible.length && <p className="px-4 py-8 text-center text-muted-foreground">No clauses with this verdict.</p>}
            </div>
          </main>

          {/* Detail */}
          <aside className="flex shrink-0 flex-col border-t lg:min-h-0 lg:w-[440px] lg:border-l lg:border-t-0">
            <div role="tablist" aria-label="Detail" className="flex h-9 shrink-0 items-end gap-4 border-b px-4">
              {(["evidence", "fix", "reference"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "-mb-px border-b-2 pb-2 text-xs font-medium capitalize",
                    tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                  {t === "fix" && fixable.length > 0 && <span className="ml-1.5 rounded bg-muted px-1 font-mono text-[10px]">{fixable.length}</span>}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {selected && tab === "evidence" && (
                <EvidencePanel
                  surface={surface}
                  clause={selected}
                  code={code}
                  busy={busy}
                  onVerify={() => verify(selected)}
                  onFix={() => setTab("fix")}
                />
              )}
              {selected && tab === "fix" && (
                <FixPanel
                  surface={surface}
                  clause={selected}
                  code={code}
                  busy={busy}
                  onApply={() => applyFixes([selected])}
                  onCopy={copy}
                />
              )}
              {tab === "reference" && entry && (
                <div className="p-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    The reference implementation of {entry.title}. Every clause in the contract is true of this.
                  </p>
                  <div className="overflow-hidden rounded-lg border bg-muted/30 p-4">
                    <entry.Demo />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Status bar */}
      <footer className="flex h-7 shrink-0 items-center gap-4 overflow-hidden border-t bg-muted/50 px-3 font-mono text-[11px] text-muted-foreground">
        {scan.running ? (
          <span className="truncate">scanning {scan.file}</span>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <StatusDot status="fail" />
              {totals.fail} failing
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot status="unknown" />
              {totals.unknown} unverified
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot status="pass" />
              {totals.pass} passing
            </span>
          </>
        )}
        <span className="ml-auto hidden md:inline">j/k move · f fix</span>
        <span className="hidden sm:inline">specs: ai-patterns skill v{skillVersion}</span>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panels
// ---------------------------------------------------------------------------

function AgentSteps({ busy }: { busy: NonNullable<Busy> }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {busy.steps.map((s) => (
        <ToolCallChip key={s.verb} kind={s.kind} verb={s.verb} target={s.target} status={s.status} result={s.done} />
      ))}
    </div>
  );
}

function ClauseSummary({ clause }: { clause: Clause }) {
  return (
    <div className="flex items-start gap-3">
      <VerdictIcon status={clause.status} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {clause.section} · clause {clause.index + 1}
        </p>
        <p className="mt-1 leading-relaxed">
          <InlineCode text={clause.note} />
        </p>
      </div>
    </div>
  );
}

function EvidencePanel({
  surface,
  clause,
  code,
  busy,
  onVerify,
  onFix,
}: {
  surface: Surface;
  clause: Clause;
  code: string;
  busy: Busy;
  onVerify: () => void;
  onFix: () => void;
}) {
  const range = evidenceRange(surface, clause, code);

  return (
    <div className="space-y-4 p-4">
      <ClauseSummary clause={clause} />
      {busy?.key === clause.key ? (
        <AgentSteps busy={busy} />
      ) : clause.status === "unknown" ? (
        <button type="button" onClick={onVerify} disabled={!!busy} className="flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium hover:bg-accent disabled:opacity-40">
          <Play className="size-3.5" />
          Run browser check
        </button>
      ) : clause.status === "fail" ? (
        <button type="button" onClick={onFix} className="flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium hover:bg-accent">
          <Wand2 className="size-3.5" />
          See the fix
        </button>
      ) : null}
      <CodeView file={surface.file} code={code} range={range} tone={clause.status} />
    </div>
  );
}

function FixPanel({
  surface,
  clause,
  code,
  busy,
  onApply,
  onCopy,
}: {
  surface: Surface;
  clause: Clause;
  code: string;
  busy: Busy;
  onApply: () => void;
  onCopy: (text: string) => void;
}) {
  const fix = clause.finding?.fix;
  const hunk = fix && clause.status === "fail" ? fixHunk(code, fix) : null;
  const running = busy && (busy.key === clause.key || busy.key === `${surface.id}:all`);

  return (
    <div className="space-y-4 p-4">
      <ClauseSummary clause={clause} />
      {clause.status === "pass" ? (
        <p className="text-muted-foreground">Nothing to fix — this clause passes.</p>
      ) : clause.status === "unknown" ? (
        <p className="text-muted-foreground">Unverified clauses need a runtime check before there&apos;s anything to fix. Run it from the Evidence tab.</p>
      ) : running ? (
        <AgentSteps busy={busy!} />
      ) : hunk ? (
        <>
          <div className="overflow-hidden rounded-lg border font-mono text-xs">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground">
              <FileCode2 className="size-3.5" />
              {surface.file}
            </div>
            <pre className="overflow-x-auto py-1">
              {hunk.removed.map((l, i) => (
                <div key={`r${i}`} className="flex bg-red-500/10 text-red-700 dark:text-red-300">
                  <span className="w-10 shrink-0 select-none pr-2 text-right opacity-60">{hunk.line + i}</span>
                  <span className="select-none pr-2">-</span>
                  <span className="whitespace-pre pr-3">{l}</span>
                </div>
              ))}
              {hunk.added.map((l, i) => (
                <div key={`a${i}`} className="flex bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <span className="w-10 shrink-0 select-none pr-2 text-right opacity-60">{hunk.line + i}</span>
                  <span className="select-none pr-2">+</span>
                  <span className="whitespace-pre pr-3">{l}</span>
                </div>
              ))}
            </pre>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onApply}
              disabled={!!busy}
              className="flex h-7 items-center gap-1.5 rounded-md bg-foreground px-2.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40"
            >
              <Check className="size-3.5" />
              Apply fix
              <kbd className="ml-1 rounded bg-background/20 px-1 font-mono text-[10px]">f</kbd>
            </button>
            <span className="text-xs text-muted-foreground">Writes to your working tree. Nothing is committed.</span>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">
            {clause.finding?.fixedBy
              ? "This one goes away with a related fix in this file — apply that one first, or hand the whole clause to your agent:"
              : "There's no one-line patch for this. Hand it to your agent with the spec attached:"}
          </p>
          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-xs">
            <span className="min-w-0 flex-1 break-words">{agentPrompt(surface, clause)}</span>
            <button type="button" onClick={() => onCopy(agentPrompt(surface, clause))} aria-label="Copy prompt" className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
              <Copy className="size-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CodeView({ file, code, range, tone }: { file: string; code: string; range: [number, number] | null; tone: Verdict }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const lines = code.split("\n");

  const start = range?.[0];

  // Scroll only the code box, not the page around it.
  React.useEffect(() => {
    const box = ref.current;
    const hit = box?.querySelector<HTMLElement>("[data-hit]");
    if (box && hit) box.scrollTo({ top: hit.offsetTop - box.clientHeight / 3, behavior: "smooth" });
  }, [start, file]);

  return (
    <div className="overflow-hidden rounded-lg border font-mono text-xs">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground">
        <FileCode2 className="size-3.5" />
        {file}
      </div>
      <div ref={ref} className="relative max-h-[420px] overflow-auto py-1">
        <pre>
          {lines.map((l, i) => {
            const n = i + 1;
            const hit = range && n >= range[0] && n <= range[1];
            return (
              <div
                key={i}
                data-hit={hit && n === range[0] ? "" : undefined}
                className={cn(
                  "flex border-l-2 border-transparent",
                  hit && tone === "fail" && "border-red-500 bg-red-500/10",
                  hit && tone === "pass" && "border-emerald-500 bg-emerald-500/10",
                  hit && tone === "unknown" && "border-amber-500 bg-amber-500/10"
                )}
              >
                <span className="w-10 shrink-0 select-none pr-3 text-right text-muted-foreground/60">{n}</span>
                <span className="whitespace-pre pr-3">{l || " "}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bits
// ---------------------------------------------------------------------------

function PanelHeading({ label, count, className }: { label: string; count: number; className?: string }) {
  return (
    <p className={cn("flex items-center justify-between px-3.5 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground", className)}>
      {label}
      <span className="font-mono tabular-nums">{count}</span>
    </p>
  );
}

const VERDICT_LABEL: Record<Verdict, string> = { pass: "Passes", fail: "Fails", unknown: "Unverified" };

function VerdictIcon({ status }: { status: Verdict }) {
  return (
    <span
      role="img"
      aria-label={VERDICT_LABEL[status]}
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
        status === "pass" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        status === "fail" && "bg-red-500/15 text-red-600 dark:text-red-400",
        status === "unknown" && "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      )}
    >
      {status === "pass" ? <Check className="size-3" /> : status === "fail" ? <X className="size-3" /> : <span className="text-[10px] font-bold leading-none">?</span>}
    </span>
  );
}

function StatusDot({ status }: { status: Verdict }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        status === "pass" && "bg-emerald-500",
        status === "fail" && "bg-red-500",
        status === "unknown" && "bg-amber-500"
      )}
    />
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="flex h-7 items-center gap-2 rounded-md border px-2.5 text-xs" title="Share of contract clauses that pass across every surface">
      <span className="hidden text-muted-foreground sm:inline">AI UX score</span>
      <motion.span key={score} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-mono font-semibold tabular-nums">
        {score}
      </motion.span>
    </span>
  );
}

function FilterTabs({ value, onChange, counts }: { value: Filter; onChange: (f: Filter) => void; counts: ReturnType<typeof count> }) {
  const items: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All", n: counts.total },
    { id: "fail", label: "Failing", n: counts.fail },
    { id: "unknown", label: "Unverified", n: counts.unknown },
    { id: "pass", label: "Passing", n: counts.pass },
  ];
  return (
    <div role="tablist" aria-label="Filter clauses" className="flex gap-0.5 rounded-md bg-muted p-0.5">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            "rounded px-2 py-0.5 text-xs",
            value === it.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {it.label} <span className="font-mono tabular-nums opacity-60">{it.n}</span>
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ counts }: { counts: ReturnType<typeof count> }) {
  const pct = (n: number) => `${(n / Math.max(counts.total, 1)) * 100}%`;
  return (
    <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
      <motion.div className="bg-emerald-500" animate={{ width: pct(counts.pass) }} />
      <motion.div className="bg-amber-500" animate={{ width: pct(counts.unknown) }} />
      <motion.div className="bg-red-500" animate={{ width: pct(counts.fail) }} />
    </div>
  );
}

/** Renders `code` spans in spec text. */
function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.92em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}
