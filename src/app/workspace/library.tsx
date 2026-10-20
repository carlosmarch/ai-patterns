"use client";

import * as React from "react";
import { ArrowUpRight, Search } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { DownloadButton } from "@/components/download-button";
import { GithubMark } from "@/components/github-mark";
import { cn } from "@/lib/utils";
import { getCategories, registry, type RegistryEntry } from "@/registry";
import { INSTALL_COMMAND, SKILL_MODES, SKILL_PILLARS, SKILL_STATS_BODY, SKILL_STEPS, SKILL_TAGLINE, SkillPitch } from "@/app/skill/content";
import { SkillExamples, type SkillExample } from "@/app/skill/skill-examples";

import { AGENT_ICON, AGENT_NAME } from "./data";
import { entryPath, findEntry, loadSource, type PatternSource } from "./catalogue";
import { Scroll, Tabs, ViewHeader } from "./views";

// The same catalogue and skill docs as /patterns and /skill, as views inside
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
        ) : (
          <PatternGrid query={query} onQuery={setQuery} onSelect={onSelect} category={category} onCategory={onCategory} />
        )}
      </div>
    </>
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
            <Highlighted html={source === "error" ? null : source?.specHtml} text={entry.uxDoc} error={source === "error"} wrap />
          </div>
        ) : (
          <Highlighted html={source === "error" ? null : source?.codeHtml} text={source === "error" ? undefined : source?.code} error={source === "error"} />
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

function Highlighted({ html, text, error, wrap }: { html?: string | null; text?: string; error?: boolean; wrap?: boolean }) {
  if (error && !text) return <p className="rounded-2xl border p-6 text-sm text-muted-foreground">Couldn&apos;t load the source. Try again in a moment.</p>;
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

// ---------------------------------------------------------------------------
// Skill
// ---------------------------------------------------------------------------

export function SkillView({
  version,
  onOpenPatterns,
  onTry,
}: {
  version: string;
  onOpenPatterns: (category?: string) => void;
  onTry: (example: SkillExample) => void;
}) {
  return (
    <>
      <ViewHeader title="Skill" badge={`v${version}`}>
        <a
          href="https://github.com/carlosmarch/ai-patterns/tree/main/plugins/ai-patterns"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          <GithubMark className="size-3.5" />
          Source
        </a>
      </ViewHeader>
      <Scroll className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-14 pb-10">
          <section className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Claude Code skill · v{version}</p>
            <h3 className="text-3xl font-semibold tracking-tight">ai-patterns</h3>
            <p className="max-w-xl text-lg text-muted-foreground">{SKILL_TAGLINE}</p>
            <p className="max-w-xl text-muted-foreground">
              <SkillPitch />
            </p>
            <div className="relative pt-3">
              <CopyButton text={INSTALL_COMMAND} className="absolute right-3 top-6" trackAs="install_command" />
              <pre className="overflow-x-auto rounded-lg border bg-[#24292e] p-4 text-sm text-[#e1e4e8]">{INSTALL_COMMAND}</pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Then invoke <span className="font-mono text-foreground">/ai-patterns</span> in any project — or just describe what you need and it routes itself.
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {SKILL_PILLARS.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border bg-card p-5">
                <h4 className="font-medium">{pillar.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{pillar.body}</p>
              </div>
            ))}
          </section>

          <section>
            <h4 className="text-lg font-semibold tracking-tight">Three modes, one command</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything runs through <span className="font-mono text-foreground">/ai-patterns</span> — describe what you need and it routes itself, or name a mode directly.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {SKILL_MODES.map((command) => (
                <div key={command.mode} className="rounded-2xl border bg-card p-5">
                  <p className="font-mono text-sm font-medium">{command.mode}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{command.body}</p>
                  <p className="mt-3 font-mono text-xs text-muted-foreground">{command.trigger}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-lg font-semibold tracking-tight">Try it on a real request</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Copy a prompt into your own agent, or run it with {AGENT_NAME} here to watch the skill pick a pattern.
            </p>
            <SkillExamples onBrowse={() => onOpenPatterns()} onTry={onTry} />
          </section>

          <section>
            <h4 className="text-lg font-semibold tracking-tight">How &ldquo;patterns apply&rdquo; works</h4>
            <ol className="mt-4 space-y-5">
              {SKILL_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium text-muted-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h4 className="text-lg font-semibold tracking-tight">
              {registry.length} patterns, {CATEGORIES.length} categories — and growing
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">{SKILL_STATS_BODY}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => onOpenPatterns(c)}
                    className="rounded-full border px-3 py-1 text-sm capitalize text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Scroll>
    </>
  );
}
