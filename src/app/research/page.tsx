import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { CodeBlock } from "@/components/code-block";
import { formatAdded } from "@/components/new-badge";
import { getEntryHref } from "@/registry";
import { SITE_SHARE_IMAGE } from "@/lib/share";
import {
  AUTHOR,
  LIMITATIONS,
  METHOD,
  NEXT_STEPS,
  RESEARCH_QUESTION,
  RESEARCH_STATEMENT,
  RESEARCH_TITLE,
  SCOPE,
  SUB_QUESTIONS,
  getCitation,
  getCorpus,
  getHypotheses,
} from "@/lib/research";

const DESCRIPTION =
  "An open research project, led and maintained by Carlos March, on how user experience changes as AI moves from answering to acting — question, method, corpus, working hypotheses and limitations.";

export const metadata: Metadata = {
  title: "Research — AI Patterns",
  description: DESCRIPTION,
  openGraph: { siteName: "AI Patterns", title: "Research — AI Patterns", description: DESCRIPTION, url: "/research", images: SITE_SHARE_IMAGE },
  alternates: { types: { "text/markdown": "/research.md", "text/plain": "/llms.txt" } },
};

const REPO_URL = "https://github.com/carlosmarch/ai-patterns";

const TOC = [
  { id: "question", label: "1. Research question" },
  { id: "scope", label: "2. Scope" },
  { id: "method", label: "3. Method" },
  { id: "corpus", label: "4. Corpus" },
  { id: "hypotheses", label: "5. Working hypotheses" },
  { id: "limitations", label: "6. Limitations" },
  { id: "next", label: "7. Next steps" },
  { id: "cite", label: "8. Cite & contribute" },
];

export default function ResearchPage() {
  const c = getCorpus();
  const hypotheses = getHypotheses(c);
  const maxGrowth = Math.max(...c.growth.map((g) => g.added));

  const facts = [
    { label: "Lead & maintainer", value: <External href={AUTHOR.url}>{AUTHOR.name}</External> },
    { label: "Status", value: "Ongoing · open" },
    { label: "Started", value: c.started },
    { label: "Last addition", value: c.updated },
    { label: "Corpus", value: `${c.total} patterns · ${c.categories} categories` },
    { label: "Licence", value: "MIT" },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Research brief</p>
        <h1 className="mt-3 text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">{RESEARCH_TITLE}</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          An open research project led and maintained by{" "}
          <External href={AUTHOR.url} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
            {AUTHOR.name}
          </External>
          , exploring how user experience evolves as artificial intelligence moves from answering to acting.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={AUTHOR.writingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Read Carlos&apos;s writing on AI
            <ArrowUpRight className="size-3.5" />
          </a>
          <Link
            href="/patterns"
            className="inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            Browse the corpus
          </Link>
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

      <div className="mt-16 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-14">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-24 space-y-2 text-sm">
            <li>
              <a href="#abstract" className="text-muted-foreground transition-colors hover:text-foreground">
                Abstract
              </a>
            </li>
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl min-w-0 space-y-16">
          <Block id="abstract" title="Abstract">
            <p>{RESEARCH_STATEMENT}</p>
            <p>
              This brief documents the study as it stands: the question it asks, what it covers, how patterns are
              collected, coded, specified and tested, what the corpus currently contains, the hypotheses it suggests and
              where its evidence is weak. Every number on this page is computed from the live catalogue.
            </p>
          </Block>

          <Block id="question" title="1. Research question">
            <p className="text-xl font-medium tracking-tight text-foreground">{RESEARCH_QUESTION}</p>
            <ol className="mt-4 space-y-3">
              {SUB_QUESTIONS.map((q) => (
                <li key={q.id} className="flex gap-4">
                  <span className="w-9 shrink-0 font-mono text-xs leading-6 text-muted-foreground">{q.id}</span>
                  <span>{q.text}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="scope" title="2. Scope">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScopeList title="In scope" items={SCOPE.in} />
              <ScopeList title="Out of scope" items={SCOPE.out} />
            </div>
          </Block>

          <Block id="method" title="3. Method">
            <p>
              The study runs a repeating loop — observe, specify, test — over a growing corpus. Each step has explicit
              rules, so a pattern&apos;s place in the catalogue can be explained and disputed.
            </p>
            <ol className="mt-2 divide-y rounded-xl border">
              {METHOD.map((m) => (
                <li key={m.id} className="grid gap-1 p-5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
                  <div>
                    <span className="font-mono text-[11px] text-muted-foreground">{m.id}</span>
                    <h3 className="text-sm font-medium text-foreground">{m.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed">{m.body}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="corpus" title="4. Corpus">
            <p>
              {c.total} patterns across {c.categories} categories, crediting {c.teams} product teams. {c.observed} patterns
              ({c.coverage}%) cite at least one public source showing the pattern in a shipping product.
            </p>

            <Figure n="4.1" caption="Patterns by job — what each does for the person using the AI.">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left font-mono text-[11px] text-muted-foreground">
                    <th className="py-2 pr-3 font-normal">Job</th>
                    <th className="hidden py-2 pr-3 font-normal sm:table-cell">Question</th>
                    <th className="py-2 pr-3 text-right font-normal">n</th>
                    <th className="w-[38%] py-2 font-normal">Share</th>
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
                      <td className="hidden py-2.5 pr-3 sm:table-cell">&ldquo;{j.question}&rdquo;</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-foreground">{j.count}</td>
                      <td className="py-2.5">
                        <Bar value={j.share} max={Math.max(...c.jobs.map((x) => x.share))} label={`${j.share}%`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Figure>

            <Figure n="4.2" caption="Corpus growth — patterns added per month, with the running total.">
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

            <Figure n="4.3" caption="Latest additions to the corpus.">
              <ul className="divide-y text-sm">
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
            </Figure>
          </Block>

          <Block id="hypotheses" title="5. Working hypotheses">
            <p>
              Claims the corpus suggests so far. They are stated so they can be wrong: each is a target for the next round
              of research, not a conclusion.
            </p>
            <ol className="mt-2 space-y-4">
              {hypotheses.map((h) => (
                <li key={h.id} className="rounded-xl border p-5">
                  <span className="font-mono text-[11px] text-muted-foreground">{h.id}</span>
                  <p className="mt-1 font-medium text-foreground">{h.claim}</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{h.evidence}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="limitations" title="6. Limitations">
            <p>Threats to validity, stated plainly so readers can weigh the findings.</p>
            <dl className="mt-2 divide-y rounded-xl border">
              {LIMITATIONS.map((l) => (
                <div key={l.title} className="grid gap-1 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-sm font-medium text-foreground">{l.title}</dt>
                  <dd className="text-sm leading-relaxed">{l.body}</dd>
                </div>
              ))}
            </dl>
          </Block>

          <Block id="next" title="7. Next steps">
            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
              {NEXT_STEPS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Block>

          <Block id="cite" title="8. Cite & contribute">
            <p>
              Cite the project as below. To propose a pattern, open an issue with at least one public source showing it in
              a shipping product — the inclusion criteria in §3.1 apply.
            </p>
            <CodeBlock code={getCitation(c)} lang="markdown" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <External href={`${REPO_URL}/issues/new`}>Propose a pattern ↗</External>
              <External href={REPO_URL}>Source & history on GitHub ↗</External>
              <a href="/research.md" className="transition-colors hover:text-foreground">
                This brief as Markdown
              </a>
            </div>
          </Block>

          <footer className="border-t pt-8 text-sm">
            <p>
              Led and maintained by <External href={AUTHOR.url} className="font-medium text-foreground hover:underline">{AUTHOR.name}</External>.
              More on AI and interfaces in{" "}
              <External href={AUTHOR.writingUrl} className="font-medium text-foreground hover:underline">
                Carlos&apos;s writing on AI
              </External>
              .
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Figure({ n, caption, children }: { n: string; caption: string; children: ReactNode }) {
  return (
    <figure className="rounded-xl border px-5 pt-2 pb-4">
      {children}
      <figcaption className="mt-3 border-t pt-3 text-xs">
        <span className="font-mono text-foreground">Fig. {n}</span> — {caption}
      </figcaption>
    </figure>
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
