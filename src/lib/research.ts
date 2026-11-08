// The project framed as an open research exercise: the question, method,
// corpus numbers and working hypotheses behind /research, the home page's
// research block and their Markdown twins. Everything numeric is derived from
// the registry, so the brief stays true as patterns are added.

import { getCategories, registry } from "@/registry";
import { JOBS } from "@/registry/jobs";

export const AUTHOR = {
  name: "Carlos March",
  url: "https://carlosmarch.es/",
  /** Where Carlos's writing on AI lives. */
  writingUrl: "https://carlosmarch.es/",
} as const;

/** The question the project exists to answer. */
export const RESEARCH_QUESTION = "How do interfaces change when software starts acting for us?";
export const RESEARCH_TITLE = "AI Patterns: a field study of interfaces for AI that acts";
export const RESEARCH_STATEMENT =
  "AI Patterns is a working notebook on the user experience of AI. Chat was the first answer, not the last: as models move from replying to acting, people need new ways to start, steer, oversee and trust them — and nobody has settled what those look like yet. We collect what shipping products are trying, write each idea down as a pattern, and test it the way that matters now: by handing it to an agent and seeing what it builds.";

export const SUB_QUESTIONS = [
  {
    id: "RQ1",
    text: "Which interaction problems are new when an AI acts on someone's behalf, rather than answering them?",
  },
  {
    id: "RQ2",
    text: "Which solutions to those problems are converging across shipping products, and which are still contested?",
  },
  {
    id: "RQ3",
    text: "Can a pattern be specified precisely enough that an agent reproduces its intent in a codebase it has never seen?",
  },
];

export const SCOPE = {
  in: [
    "Interface patterns specific to generative and agentic AI: input, steering, progress, oversight, provenance and failure.",
    "Patterns observable in products people use today, at the level of behavior rather than visual style.",
    "Specifications both people and agents can read and act on.",
  ],
  out: [
    "General UI components with no AI-specific behavior.",
    "Model quality, evaluation and prompt engineering.",
    "Brand, visual identity and marketing surfaces.",
  ],
};

export const METHOD = [
  {
    id: "3.1",
    title: "Sampling",
    body: "Candidates come from shipping products' public documentation, help centres and changelogs. A candidate is included when it (a) addresses a problem that exists because an AI is involved, (b) is observed in at least one public product, or argued from a documented failure, and (c) differs from existing entries in behavior, not only appearance. Sampling is automated: a weekly scout searches a watchlist of products' changelogs and help centres, codes each finding against these criteria and the current corpus, and proposes new candidates and new sources for existing patterns as a reviewable report. Nothing enters the corpus without review.",
  },
  {
    id: "3.2",
    title: "Coding",
    body: "Each pattern is coded on two orthogonal facets. Category records its form — what kind of UI it is. Job records its function — what it does for the person, one of six adapted from The Shape of AI. Every pattern has exactly one job; ties are broken by the person's goal, not the element (a cost meter is Oversee, an error card is Recover).",
  },
  {
    id: "3.3",
    title: "Specification",
    body: "Each pattern is written as a portable contract in a fixed order: Summary, When to use, When not to use, Anatomy, Behavior, Content guidelines, Accessibility, Related patterns. The contract is the finding; it is kept apart from any one design system.",
  },
  {
    id: "3.4",
    title: "Reference implementation",
    body: "Every spec ships with one default expression in React, TypeScript, Tailwind, Motion and Radix, with a live preview. It proves the contract can be built and gives agents a concrete starting point — it is one answer, not the answer.",
  },
  {
    id: "3.5",
    title: "Validation",
    body: "The spec is tested by its second reader. Agents receive it through a Claude Code skill, an MCP server and Markdown endpoints, and their output is compared with what the same agent writes without it. 'When not to use' and 'Accessibility' act as acceptance criteria.",
  },
  {
    id: "3.6",
    title: "Versioning",
    body: "Every pattern is timestamped when it joins the corpus, and specs are revised as products change. The full history lives in the public repository, so any claim can be traced to the commit that introduced it.",
  },
];

export const LIMITATIONS = [
  {
    title: "Sampling bias",
    body: "Sources skew toward English-language, Western and developer-facing products, where public documentation is richest.",
  },
  {
    title: "Observation, not usage",
    body: "Patterns are inferred from what products ship and document, not from usage data or controlled studies with people.",
  },
  {
    title: "Automated sampling",
    body: "The scout is a language model reading public pages: it can miss features, misread them or over-report variants, and its watchlist is curated by hand. Its reports are leads to verify, not findings.",
  },
  {
    title: "Single coder",
    body: "Categories and jobs are assigned by one maintainer; there is no inter-rater reliability measure yet.",
  },
  {
    title: "Platform bias",
    body: "Reference implementations are web and React; voice, mobile-native and ambient interfaces are under-represented.",
  },
  {
    title: "Qualitative validation",
    body: "Agent reproduction is judged by inspection, not by a scored benchmark.",
  },
];

export const NEXT_STEPS = [
  "A second coder for categories and jobs, with agreement reported per facet.",
  "A per-pattern revision log, so changes to a spec are visible on its page.",
  "A scored benchmark for agent reproduction (RQ3), run against every spec.",
  "Wider sampling beyond developer tools: consumer, voice and enterprise products.",
];

// ---------------------------------------------------------------------------
// Corpus statistics

// H2's two groups: ways to inspect or undo AI work, and ways to label how sure it is.
const REVIEW_SLUGS = ["tool-approval", "human-in-the-loop", "plan-review", "diff-summary", "diff-tabs", "code-preview", "stop-generation-button", "response-compare", "ai-review-panel"];
const CONFIDENCE_SLUGS = ["confidence-indicator"];

const pct = (n: number, total: number) => Math.round((n / total) * 100);
const day = (iso: string) => iso.slice(0, 10);

export function getCorpus() {
  const total = registry.length;
  const sorted = [...registry].sort((a, b) => a.added.localeCompare(b.added));
  const teams = new Set(registry.flatMap((e) => e.seenIn.map((s) => s.team))).size;
  const observed = registry.filter((e) => e.seenIn.length > 0).length;

  const jobs = JOBS.map((job) => {
    const count = registry.filter((e) => e.job === job.id).length;
    return { ...job, count, share: pct(count, total) };
  });
  const byCount = [...jobs].sort((a, b) => b.count - a.count);

  const months = new Map<string, number>();
  for (const e of sorted) months.set(e.added.slice(0, 7), (months.get(e.added.slice(0, 7)) ?? 0) + 1);
  let running = 0;
  const growth = [...months].map(([month, added]) => ({ month, added, total: (running += added) }));

  const has = (slugs: string[]) => registry.filter((e) => slugs.includes(e.slug)).length;
  const reviewCount = has(REVIEW_SLUGS);
  const confidenceCount = has(CONFIDENCE_SLUGS);

  const oversight = jobs.filter((j) => j.id === "oversee" || j.id === "trust").reduce((n, j) => n + j.count, 0);

  return {
    total,
    categories: getCategories().length,
    teams,
    observed,
    coverage: pct(observed, total),
    started: day(sorted[0].added),
    updated: day(sorted[sorted.length - 1].added),
    jobs,
    largest: byCount[0],
    smallest: byCount[byCount.length - 1],
    reviewCount,
    confidenceCount,
    oversightShare: pct(oversight, total),
    growth,
    latest: [...sorted].reverse().slice(0, 6),
  };
}

export type Corpus = ReturnType<typeof getCorpus>;

/** Working hypotheses: claims the corpus suggests and the next round of research should test. */
export function getHypotheses(c: Corpus) {
  return [
    {
      id: "H1",
      claim: "Most new interface lives between the request and the result.",
      evidence: `Oversee and Trust together hold ${c.oversightShare}% of the corpus; the single largest job is ${c.largest.label} (${c.largest.count} patterns). The hard problem is no longer getting intent in, but following and checking what the AI does with it.`,
    },
    {
      id: "H2",
      claim: "Reversibility earns more trust than confidence.",
      evidence: `Patterns that let people review or reverse AI work — approvals, plan review, diffs, stop, compare — outnumber confidence signals ${c.reviewCount} to ${c.confidenceCount}. Products appear to earn acceptance by making action inspectable, not by labelling it as likely correct.`,
    },
    {
      id: "H3",
      claim: "Every pattern now has two readers.",
      evidence: "The same pattern is used by a person and implemented by an agent. A spec that only shows the UI fails the second reader; written as a contract, it can travel between codebases (RQ3).",
    },
    {
      id: "H4",
      claim: "The gaps in the corpus are findings too.",
      evidence: `The least-populated job is ${c.smallest.label} — "${c.smallest.question}" — with ${c.smallest.count} patterns. Fewer conventions exist where AI fails or reaches its limits than where it succeeds.`,
    },
  ];
}

export function getCitation(c: Corpus) {
  return `@misc{march${c.started.slice(0, 4)}aipatterns,
  author       = {March, Carlos},
  title        = {${RESEARCH_TITLE}},
  year         = {${c.started.slice(0, 4)}},
  howpublished = {\\url{https://ai-patterns.app/research}},
  note         = {Ongoing research project, ${c.total} patterns as of ${c.updated}}
}`;
}
