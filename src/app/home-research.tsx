import Link from "next/link";

import { registry } from "@/registry";
import { JOBS } from "@/registry/jobs";
import { AUTHOR, RESEARCH_QUESTION, RESEARCH_STATEMENT } from "@/lib/research";

// The home page's framing block: the catalogue as an open research project.
// The method's numbers and the open questions come from the registry, so the
// block stays true as patterns are added.

export function HomeResearch() {
  const teams = new Set(registry.flatMap((e) => e.seenIn.map((s) => s.team))).size;
  const byJob = JOBS.map((job) => ({ ...job, count: registry.filter((e) => e.job === job.id).length }));

  const method = [
    {
      step: "Observe",
      body: `Every pattern starts in a product people already use. ${registry.length} patterns, traced to ${teams} teams shipping AI today.`,
    },
    {
      step: "Specify",
      body: "Each one is written down as a contract — when to use it, when not to, anatomy, behavior, accessibility — apart from any one design system.",
    },
    {
      step: "Test",
      body: "The spec is the experiment. Agents read it through the skill, MCP and Markdown; the code shows what it turns into.",
    },
  ];

  return (
    <section aria-labelledby="research-title" className="py-6">
      <h2 id="research-title" className="max-w-3xl text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl">
        {RESEARCH_QUESTION}
        <span className="block text-muted-foreground">We study it one pattern at a time.</span>
      </h2>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{RESEARCH_STATEMENT}</p>

      <ol className="mt-10 grid overflow-hidden rounded-xl border sm:grid-cols-3">
        {method.map((m, i) => (
          <li key={m.step} className={`bg-muted/40 p-5 ${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""}`}>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">0{i + 1}</span>
            <h3 className="mt-6 text-sm font-medium">{m.step}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <h3 className="text-sm font-medium">Open questions</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          What people need from an AI, in their words. Each question is a line of inquiry; the patterns are what we have so far.
        </p>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {byJob.map((job) => (
            <li key={job.id} className="bg-background">
              <Link
                href={`/patterns?job=${job.id}`}
                className="flex h-full flex-col p-5 transition-colors hover:bg-muted/50"
              >
                <span className="text-base font-medium tracking-tight">&ldquo;{job.question}&rdquo;</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{job.description}</span>
                <span className="mt-4 font-mono text-[11px] text-muted-foreground">
                  {job.label} · {job.count} {job.count === 1 ? "pattern" : "patterns"} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Led and maintained by{" "}
          <a href={AUTHOR.url} target="_blank" rel="noreferrer" className="text-foreground hover:underline">
            {AUTHOR.name}
          </a>
          . Findings are provisional: patterns get rewritten as products change, and each one is dated by when it
          joined — a snapshot of a field still in motion.
        </p>
        <Link
          href="/research"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Read the research brief
        </Link>
      </div>
    </section>
  );
}
