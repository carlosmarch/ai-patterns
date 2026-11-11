import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { CodeBlock } from "@/components/code-block";
import { BackdropOrb } from "./backdrop-orb";
import { formatAdded } from "@/components/new-badge";
import { getEntryHref } from "@/registry";
import { SITE_SHARE_IMAGE } from "@/lib/share";
import {
  ABSTRACT,
  AUTHOR,
  FIELD,
  KEYWORDS,
  LIMITATIONS,
  METHOD,
  NEXT_STEPS,
  OBJECTIVES,
  REFERENCES,
  RELATED_WORK,
  RESEARCH_GAP,
  RESEARCH_QUESTION,
  RESEARCH_STATEMENT,
  RESEARCH_SUBTITLE,
  RESEARCH_TITLE,
  SCOPE,
  SUB_QUESTIONS,
  getAnswers,
  getCitation,
  getCorpus,
  getHypotheses,
  getOutputs,
} from "@/lib/research";

const DESCRIPTION =
  "A research thesis, written and maintained in the open by Carlos March, on how user experience changes as AI moves from answering to acting — research questions, related work, method, results, discussion and outcomes.";

export const metadata: Metadata = {
  title: "Research — AI Patterns",
  description: DESCRIPTION,
  openGraph: { siteName: "AI Patterns", title: "Research — AI Patterns", description: DESCRIPTION, url: "/research", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/research.md", "text/plain": "/llms.txt" } },
};

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

const TOC = [
  { id: "abstract", n: "", label: "Abstract" },
  { id: "introduction", n: "1", label: "Introduction" },
  { id: "background", n: "2", label: "Background & related work" },
  { id: "method", n: "3", label: "Methodology" },
  { id: "results", n: "4", label: "Results" },
  { id: "discussion", n: "5", label: "Discussion" },
  { id: "limitations", n: "6", label: "Limitations" },
  { id: "conclusions", n: "7", label: "Conclusions & outcomes" },
  { id: "references", n: "", label: "References" },
  { id: "appendix", n: "A", label: "Citation & contributing" },
];

export default function ResearchPage() {
  const c = getCorpus();
  const hypotheses = getHypotheses(c);
  const answers = getAnswers(c);
  const outputs = getOutputs(c);
  const maxGrowth = Math.max(...c.growth.map((g) => g.added));
  const maxJob = Math.max(...c.jobs.map((x) => x.share));
  const maxBand = Math.max(...c.convergence.map((x) => x.share));
  const [converged] = c.convergence;

  const facts = [
    { label: "Author", value: <External href={AUTHOR.url}>{AUTHOR.name}</External> },
    { label: "Field", value: "HCI · Interaction design" },
    { label: "Status", value: "Working draft · open" },
    { label: "Started", value: c.started },
    { label: "Last revision", value: c.updated },
    { label: "Corpus", value: `${c.total} patterns · ${c.categories} categories` },
  ];

  const structuredAbstract = [
    { label: "Background", text: ABSTRACT.background },
    { label: "Aim", text: ABSTRACT.aim },
    { label: "Method", text: ABSTRACT.method },
    {
      label: "Results",
      text: `The corpus holds ${c.total} patterns across ${c.categories} categories, crediting ${c.teams} product teams; ${c.coverage}% are observed in at least one shipping product. Oversight and trust account for ${c.oversightShare}% of the corpus, and ${converged.share}% of patterns have converged across three or more products.`,
    },
    {
      label: "Conclusions",
      text: "The new design work in AI products sits between the request and the result: following, checking and reversing what the AI does. Products earn acceptance by making action inspectable rather than by signalling confidence. Whether specifications can carry this knowledge to coding agents remains the open question.",
    },
  ];

  return (
    <div className="relative isolate overflow-x-clip bg-background">
      <BackdropOrb />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        {/* Title page */}
        <header className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Research thesis · Working draft · Rev. {c.updated}
          </p>
          <h1 className="mt-3 text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">{RESEARCH_TITLE}</h1>
          <p className="mt-4 text-lg text-balance text-muted-foreground italic">{RESEARCH_SUBTITLE}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            <External href={AUTHOR.url} className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
              {AUTHOR.name}
            </External>{" "}
            · Independent research · {FIELD}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#abstract"
              className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Read the abstract
            </a>
            <Link href="/patterns" className="inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted">
              Browse the corpus
            </Link>
            <a
              href={AUTHOR.writingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Carlos&apos;s writing on AI
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </header>

        <dl className="mt-12 grid grid-cols-2 overflow-hidden rounded-xl border sm:grid-cols-3">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={`bg-muted/40 p-4 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""} sm:border-l-0 sm:border-t-0 ${
                i % 3 !== 0 ? "sm:border-l" : ""
              } ${i >= 3 ? "sm:border-t" : ""}`}
            >
              <dt className="font-mono text-[11px] text-muted-foreground">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Contents" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Contents</p>
              <ol className="mt-3 space-y-2 text-sm">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="flex gap-2 text-muted-foreground transition-colors hover:text-foreground">
                      <span className="w-4 shrink-0 font-mono text-xs leading-5 tabular-nums">{t.n}</span>
                      <span>{t.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="max-w-3xl min-w-0 space-y-20">
            {/* Front matter */}
            <Chapter id="abstract" title="Abstract">
              <dl className="space-y-4">
                {structuredAbstract.map((a) => (
                  <div key={a.label}>
                    <dt className="inline font-medium text-foreground">{a.label}. </dt>
                    <dd className="inline">{a.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="border-t pt-4 text-sm">
                <span className="font-medium text-foreground">Keywords: </span>
                {KEYWORDS.join(" · ")}
              </p>
            </Chapter>

            {/* 1 */}
            <Chapter id="introduction" n="1" title="Introduction">
              <Section n="1.1" title="Motivation">
                <p>{RESEARCH_STATEMENT}</p>
              </Section>

              <Section n="1.2" title="Research questions">
                <p className="text-xl font-medium tracking-tight text-balance text-foreground">{RESEARCH_QUESTION}</p>
                <p>The central question is broken into three sub-questions, each answerable on its own:</p>
                <ol className="space-y-3">
                  {SUB_QUESTIONS.map((q) => (
                    <li key={q.id} className="flex gap-4">
                      <span className="w-9 shrink-0 font-mono text-xs leading-6 text-foreground">{q.id}</span>
                      <span>{q.text}</span>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section n="1.3" title="Objectives">
                <Figure kind="Table" n="1.1" caption="Research objectives and the question each serves.">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                        <th className="py-2 pr-3 font-normal">#</th>
                        <th className="py-2 pr-3 font-normal">Objective</th>
                        <th className="py-2 text-right font-normal">Serves</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OBJECTIVES.map((o) => (
                        <tr key={o.id} className="border-b align-baseline last:border-0">
                          <td className="py-2.5 pr-3 font-mono text-xs text-foreground">{o.id}</td>
                          <td className="py-2.5 pr-3">{o.text}</td>
                          <td className="py-2.5 text-right font-mono text-xs">{o.rq}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Figure>
              </Section>

              <Section n="1.4" title="Scope and delimitations">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ScopeList title="In scope" items={SCOPE.in} />
                  <ScopeList title="Out of scope" items={SCOPE.out} />
                </div>
              </Section>

              <Section n="1.5" title="Contributions">
                <p>The study makes three contributions, detailed as research outputs in §7.2:</p>
                <ol className="list-decimal space-y-2 pl-5 marker:font-mono marker:text-xs marker:text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">A taxonomy</span> that codes AI interface patterns by form and,
                    separately, by the job they do for the person.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">An evidence-backed corpus</span> of {c.total} patterns, each a UX
                    specification traced to the products that ship it.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">A specification format and instruments</span> that let the same
                    findings be read by designers and acted on by coding agents.
                  </li>
                </ol>
              </Section>
            </Chapter>

            {/* 2 */}
            <Chapter id="background" n="2" title="Background & related work">
              {RELATED_WORK.map((r) => (
                <Section key={r.id} n={r.id} title={r.title}>
                  <p>
                    <Cited text={r.body} />
                  </p>
                </Section>
              ))}
              <Section n="2.6" title="Research gap">
                <blockquote className="border-l-2 border-foreground pl-5 text-foreground">{RESEARCH_GAP}</blockquote>
              </Section>
            </Chapter>

            {/* 3 */}
            <Chapter id="method" n="3" title="Methodology">
              <p>
                <Cited text="The study is qualitative and longitudinal: a pattern-mining design in the tradition of [1]–[3], run as a repeating loop — observe, specify, test — over a corpus that grows as products ship. Each step has explicit rules, so a pattern's place in the catalogue can be explained and disputed." />
              </p>
              <ol className="divide-y rounded-xl border">
                {METHOD.map((m) => (
                  <li key={m.id} className="grid gap-1 p-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
                    <div>
                      <span className="font-mono text-[11px] text-muted-foreground">§{m.id}</span>
                      <h3 className="text-sm font-medium text-foreground">{m.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed">{m.body}</p>
                  </li>
                ))}
              </ol>
              <Figure kind="Table" n="3.1" caption="Coding scheme for the job facet (§3.2), adapted from [10].">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                      <th className="py-2 pr-3 font-normal">Code</th>
                      <th className="py-2 pr-3 font-normal">The person asks…</th>
                      <th className="hidden py-2 font-normal sm:table-cell">Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.jobs.map((j) => (
                      <tr key={j.id} className="border-b align-baseline last:border-0">
                        <td className="py-2.5 pr-3 font-medium text-foreground">{j.label}</td>
                        <td className="py-2.5 pr-3">&ldquo;{j.question}&rdquo;</td>
                        <td className="hidden py-2.5 sm:table-cell">{j.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Figure>
            </Chapter>

            {/* 4 */}
            <Chapter id="results" n="4" title="Results">
              <p>
                {c.total} patterns across {c.categories} categories, crediting {c.teams} product teams. {c.observed} patterns
                ({c.coverage}%) cite at least one public source showing the pattern in a shipping product. Every figure in this
                chapter is computed from the live corpus.
              </p>

              <Section n="4.1" title="Composition by job">
                <Figure kind="Table" n="4.1" caption="Patterns by job — what each does for the person using the AI.">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                        <th className="py-2 pr-3 font-normal">Job</th>
                        <th className="py-2 pr-3 text-right font-normal">n</th>
                        <th className="w-[55%] py-2 font-normal">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.jobs.map((j) => (
                        <tr key={j.id} className="border-b last:border-0">
                          <td className="py-2.5 pr-3">
                            <Link href={`/patterns?job=${j.id}`} className="font-medium text-foreground hover:underline">
                              {j.label}
                            </Link>
                          </td>
                          <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground">{j.count}</td>
                          <td className="py-2.5">
                            <Bar value={j.share} max={maxJob} label={`${j.share}%`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Figure>
              </Section>

              <Section n="4.2" title="Convergence across products">
                <p>
                  How settled is each solution? Patterns are banded by how many distinct product teams ship them — a proxy for
                  convergence (RQ2).
                </p>
                <Figure kind="Table" n="4.2" caption="Patterns by number of shipping products.">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                        <th className="py-2 pr-3 font-normal">Band</th>
                        <th className="hidden py-2 pr-3 font-normal sm:table-cell">Rule</th>
                        <th className="py-2 pr-3 text-right font-normal">n</th>
                        <th className="w-[38%] py-2 font-normal">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.convergence.map((b) => (
                        <tr key={b.id} className="border-b last:border-0">
                          <td className="py-2.5 pr-3 font-medium text-foreground">{b.label}</td>
                          <td className="hidden py-2.5 pr-3 sm:table-cell">{b.rule}</td>
                          <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground">{b.count}</td>
                          <td className="py-2.5">
                            <Bar value={b.share} max={maxBand} label={`${b.share}%`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Figure>
                <p>
                  Most widely shipped:{" "}
                  {c.mostShared.map((e, i) => (
                    <span key={e.slug}>
                      <Link href={getEntryHref(e)} className="font-medium text-foreground hover:underline">
                        {e.title}
                      </Link>{" "}
                      <span className="font-mono text-xs">({e.teams})</span>
                      {i < c.mostShared.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </p>
              </Section>

              <Section n="4.3" title="Corpus growth">
                <Figure kind="Figure" n="4.3" caption="Patterns added per month, with the running total.">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                        <th className="py-2 pr-3 font-normal">Month</th>
                        <th className="py-2 pr-3 text-right font-normal">Added</th>
                        <th className="py-2 pr-3 text-right font-normal">Total</th>
                        <th className="w-[45%] py-2 font-normal" aria-hidden />
                      </tr>
                    </thead>
                    <tbody>
                      {c.growth.map((g) => (
                        <tr key={g.month} className="border-b last:border-0">
                          <td className="py-2.5 pr-3 font-mono text-foreground">{g.month}</td>
                          <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground">+{g.added}</td>
                          <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{g.total}</td>
                          <td className="py-2.5">
                            <Bar value={g.added} max={maxGrowth} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Figure>
              </Section>

              <Section n="4.4" title="Latest additions">
                <ul className="divide-y rounded-xl border px-5 text-sm">
                  {c.latest.map((e) => (
                    <li key={e.slug} className="flex items-baseline justify-between gap-4 py-2.5">
                      <Link href={getEntryHref(e)} className="min-w-0 truncate font-medium text-foreground hover:underline">
                        {e.title}
                        <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">{e.category}</span>
                      </Link>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{formatAdded(e.added)}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </Chapter>

            {/* 5 */}
            <Chapter id="discussion" n="5" title="Discussion">
              <p>
                The results suggest four propositions. Each is stated so it can be wrong, with its current status and what it
                would take to test it properly.
              </p>
              <ol className="space-y-4">
                {hypotheses.map((h) => (
                  <li key={h.id} className="rounded-xl border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{h.id}</span>
                      <Status value={h.status} />
                    </div>
                    <p className="mt-1 font-medium text-foreground">{h.claim}</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{h.evidence}</p>
                    <p className="mt-3 border-t pt-3 text-sm leading-relaxed">
                      <span className="font-medium text-foreground">To test: </span>
                      {h.test}
                    </p>
                  </li>
                ))}
              </ol>
            </Chapter>

            {/* 6 */}
            <Chapter id="limitations" n="6" title="Limitations & threats to validity">
              <p>Threats to validity, grouped by type and stated plainly so readers can weigh the findings.</p>
              <dl className="divide-y rounded-xl border">
                {LIMITATIONS.map((l) => (
                  <div key={l.title} className="grid gap-1 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
                    <dt>
                      <span className="block font-mono text-[11px] text-muted-foreground">{l.validity} validity</span>
                      <span className="text-sm font-medium text-foreground">{l.title}</span>
                    </dt>
                    <dd className="text-sm leading-relaxed">{l.body}</dd>
                  </div>
                ))}
              </dl>
            </Chapter>

            {/* 7 */}
            <Chapter id="conclusions" n="7" title="Conclusions & outcomes">
              <Section n="7.1" title="Answers to the research questions">
                <ol className="divide-y rounded-xl border">
                  {answers.map((a) => (
                    <li key={a.id} className="grid gap-1 p-5 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-6">
                      <div className="flex items-center gap-2 sm:block">
                        <span className="font-mono text-xs text-foreground">{a.id}</span>
                        <div className="sm:mt-1.5">
                          <Status value={a.status} />
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{a.answer}</p>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section n="7.2" title="Research outputs">
                <p>What the study has produced so far, each tied to the objective it delivers.</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {outputs.map((o) => {
                    const inner = (
                      <>
                        <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
                          <span>{o.kind}</span>
                          <span>{o.objective}</span>
                        </div>
                        <p className="mt-2 font-medium text-foreground">{o.title}</p>
                        <p className="mt-1 text-sm leading-relaxed">{o.body}</p>
                      </>
                    );
                    const cls = "block h-full rounded-xl border p-5 transition-colors hover:bg-muted/50";
                    return (
                      <li key={o.title}>
                        {o.href.startsWith("http") ? (
                          <External href={o.href} className={cls}>
                            {inner}
                          </External>
                        ) : (
                          <Link href={o.href} className={cls}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <Section n="7.3" title="Future work">
                <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
                  {NEXT_STEPS.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </Section>
            </Chapter>

            {/* Back matter */}
            <Chapter id="references" title="References">
              <ol className="space-y-3 text-sm">
                {REFERENCES.map((r) => (
                  <li key={r.id} id={`ref-${r.id}`} className="flex scroll-mt-24 gap-4">
                    <span className="w-7 shrink-0 font-mono text-xs leading-5 text-foreground">[{r.id}]</span>
                    <span className="leading-relaxed">{r.text}</span>
                  </li>
                ))}
              </ol>
            </Chapter>

            <Chapter id="appendix" n="A" title="Citation & contributing">
              <p>
                Cite the thesis as below. To propose a pattern, open an issue with at least one public source showing it in a
                shipping product — the inclusion criteria in §3.1 apply. Text and code are MIT-licensed; the full revision history
                is public.
              </p>
              <CodeBlock code={getCitation(c)} lang="markdown" />
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <External href={`${REPO_URL}/issues/new`}>Propose a pattern ↗</External>
                <External href={REPO_URL}>Source & history on GitHub ↗</External>
                <a href="/research.md" className="transition-colors hover:text-foreground">
                  This thesis as Markdown
                </a>
              </div>
            </Chapter>

            <footer className="border-t pt-8 text-sm text-muted-foreground">
              <p>
                Written and maintained by{" "}
                <External href={AUTHOR.url} className="font-medium text-foreground hover:underline">
                  {AUTHOR.name}
                </External>
                . More on AI and interfaces in{" "}
                <External href={AUTHOR.writingUrl} className="font-medium text-foreground hover:underline">
                  Carlos&apos;s writing on AI
                </External>
                .
              </p>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}

function Chapter({ id, n, title, children }: { id: string; n?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      {n && (
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {/^\d+$/.test(n) ? `Chapter ${n}` : `Appendix ${n}`}
        </p>
      )}
      <h2 id={`${id}-title`} className="mt-1 border-b pb-3 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-6 space-y-6 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="flex gap-3 text-base font-semibold tracking-tight text-foreground">
        <span className="font-mono text-sm leading-6 font-normal text-muted-foreground tabular-nums">{n}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Figure({ kind, n, caption, children }: { kind: "Figure" | "Table"; n: string; caption: string; children: ReactNode }) {
  return (
    <figure className="rounded-xl border px-5 pt-2 pb-4">
      {children}
      <figcaption className="mt-3 border-t pt-3 text-xs">
        <span className="font-mono text-foreground">
          {kind} {n}
        </span>{" "}
        — <Cited text={caption} />
      </figcaption>
    </figure>
  );
}

/** Renders "[n]" citation keys in text as links to the reference list. */
function Cited({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        return m ? (
          <a key={i} href={`#ref-${m[1]}`} className="font-mono text-xs text-foreground hover:underline">
            {part}
          </a>
        ) : (
          part
        );
      })}
    </>
  );
}

function Status({ value }: { value: string }) {
  const open = value === "Open";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
        open ? "text-muted-foreground" : "text-foreground"
      }`}
    >
      <span className={`size-1.5 rounded-full ${open ? "border border-muted-foreground" : "bg-foreground"}`} aria-hidden />
      {value}
    </span>
  );
}

function ScopeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border p-5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-4 text-sm marker:text-muted-foreground">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

// A single-series bar inside a table row: the value is always printed, so
// the bar only adds the shape.
function Bar({ value, max, label }: { value: number; max: number; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1" aria-hidden>
        <div className="h-full rounded-r-[4px] bg-foreground/80" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      {label && <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">{label}</span>}
    </div>
  );
}

function External({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className ?? "transition-colors hover:text-foreground"}>
      {children}
    </a>
  );
}
