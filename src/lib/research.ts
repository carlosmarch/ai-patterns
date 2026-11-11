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
export const RESEARCH_SUBTITLE =
  "A pattern-language study of interaction design for generative and agentic AI, with specifications tested on human and machine readers";
export const FIELD = "Human–computer interaction · Interaction design";
export const KEYWORDS = [
  "human–AI interaction",
  "agentic AI",
  "interaction design patterns",
  "pattern languages",
  "design specification",
  "mixed-initiative interfaces",
  "trust in automation",
];
export const RESEARCH_STATEMENT =
  "AI Patterns is a working notebook on the user experience of AI. Chat was the first answer, not the last: as models move from replying to acting, people need new ways to start, steer, oversee and trust them — and nobody has settled what those look like yet. We collect what shipping products are trying, write each idea down as a pattern, and test it the way that matters now: by handing it to an agent and seeing what it builds.";

/** The structured abstract, in the order a thesis would give it. */
export const ABSTRACT = {
  background:
    "Interfaces for AI were first built around conversation: a person asks, a model answers. As models gain tools and act on people's behalf — editing files, browsing, calling services — the interaction problem shifts from getting a good answer to delegating work safely. Established human–AI guidelines describe principles, but there is no shared, testable vocabulary of interface patterns for this shift.",
  aim: "To identify the interaction problems that are specific to AI that acts, document the solutions shipping products are converging on, and determine whether those solutions can be specified precisely enough to be reproduced by both designers and coding agents.",
  method:
    "A qualitative, longitudinal pattern-mining study. Candidate patterns are sampled from the public documentation and changelogs of shipping AI products, coded on two orthogonal facets (form and function), written up as fixed-structure UX specifications and paired with a reference implementation. Specifications are validated by handing them to agents and inspecting what they build.",
};

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

/** What the study sets out to produce, each tied to the question it serves. */
export const OBJECTIVES = [
  { id: "O1", rq: "RQ1", text: "Build a coding scheme that separates what an AI interface pattern is from what it does for the person." },
  { id: "O2", rq: "RQ2", text: "Assemble an evidence-backed corpus of patterns, each traced to the products that ship it." },
  { id: "O3", rq: "RQ3", text: "Define a specification format readable by people and agents alike, and implement every pattern against it." },
  { id: "O4", rq: "RQ3", text: "Distribute the specifications to agents and evaluate how faithfully they are reproduced." },
];

/** The literature the study positions itself against. Numbers are citation keys used in the text. */
export const REFERENCES = [
  { id: 1, text: "Alexander, C., Ishikawa, S. & Silverstein, M. (1977). A Pattern Language: Towns, Buildings, Construction. Oxford University Press." },
  { id: 2, text: "Gamma, E., Helm, R., Johnson, R. & Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley." },
  { id: 3, text: "Tidwell, J. (2005). Designing Interfaces: Patterns for Effective Interaction Design. O'Reilly Media." },
  { id: 4, text: "Horvitz, E. (1999). Principles of mixed-initiative user interfaces. Proceedings of CHI '99, 159–166. ACM." },
  { id: 5, text: "Parasuraman, R., Sheridan, T. B. & Wickens, C. D. (2000). A model for types and levels of human interaction with automation. IEEE Transactions on Systems, Man, and Cybernetics — Part A, 30(3), 286–297." },
  { id: 6, text: "Lee, J. D. & See, K. A. (2004). Trust in automation: designing for appropriate reliance. Human Factors, 46(1), 50–80." },
  { id: 7, text: "Amershi, S. et al. (2019). Guidelines for human-AI interaction. Proceedings of CHI '19, paper 3. ACM." },
  { id: 8, text: "Google PAIR (2019). People + AI Guidebook. pair.withgoogle.com/guidebook." },
  { id: 9, text: "Shneiderman, B. (2022). Human-Centered AI. Oxford University Press." },
  { id: 10, text: "Campbell, E. The Shape of AI: UX patterns for artificial intelligence design. shapeof.ai." },
];

/** Chapter 2: where the study sits in prior work, and the gap it fills. */
export const RELATED_WORK = [
  {
    id: "2.1",
    title: "Pattern languages",
    body: "Alexander's pattern language [1] framed design knowledge as named, recurring solutions to problems in context, each linked to the patterns around it. Software [2] and interaction design [3] adopted the form. This study keeps its structure — problem, context, solution, related patterns — and adds two sections the earlier traditions left implicit: when not to use a pattern, and how it must behave for assistive technology.",
  },
  {
    id: "2.2",
    title: "Mixed initiative and levels of automation",
    body: "Horvitz's principles for mixed-initiative interfaces [4] and Parasuraman, Sheridan and Wickens' levels of automation [5] describe how control is shared between a person and a system. Agentic AI moves products up those levels within a single session, which is why patterns for approving, pausing and handing back control recur in the corpus.",
  },
  {
    id: "2.3",
    title: "Trust and reliance",
    body: "Lee and See [6] argue that the goal is appropriate reliance — trust calibrated to a system's real capability — rather than more trust. The study's Trust and Recover jobs operationalise this: patterns are judged by whether they help people check and correct AI work, not by whether they make it feel reliable.",
  },
  {
    id: "2.4",
    title: "Human–AI interaction guidelines",
    body: "Amershi et al.'s eighteen guidelines [7], Google's People + AI Guidebook [8] and Shneiderman's human-centred AI [9] set out principles for AI products. They say what an interface should achieve, but not how a specific interface element should look, behave and fail — the level at which designers and coding agents actually work.",
  },
  {
    id: "2.5",
    title: "Contemporary pattern catalogues",
    body: "Practitioner catalogues such as The Shape of AI [10] collect AI interface patterns from shipping products; the study's job facet is adapted from its pattern types. These catalogues are descriptive and visual. They are not written as contracts an implementer can be held to, and none is designed to be read by an agent.",
  },
];

export const RESEARCH_GAP =
  "Principles for human–AI interaction are well established, and practitioner catalogues show what products ship. What is missing is the layer between them: patterns specified precisely enough to be built, reviewed and disputed, grounded in observed products, and readable by the coding agents that increasingly do the building.";

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
    validity: "External",
    title: "Sampling bias",
    body: "Sources skew toward English-language, Western and developer-facing products, where public documentation is richest.",
  },
  {
    validity: "Construct",
    title: "Observation, not usage",
    body: "Patterns are inferred from what products ship and document, not from usage data or controlled studies with people.",
  },
  {
    validity: "Internal",
    title: "Automated sampling",
    body: "The scout is a language model reading public pages: it can miss features, misread them or over-report variants, and its watchlist is curated by hand. Its reports are leads to verify, not findings.",
  },
  {
    validity: "Reliability",
    title: "Single coder",
    body: "Categories and jobs are assigned by one maintainer; there is no inter-rater reliability measure yet.",
  },
  {
    validity: "External",
    title: "Platform bias",
    body: "Reference implementations are web and React; voice, mobile-native and ambient interfaces are under-represented.",
  },
  {
    validity: "Construct",
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
/** Convergence (RQ2): how many product teams ship each pattern. */
export const CONVERGENCE = [
  { id: "converged", label: "Converged", rule: "Seen in 3 or more products", min: 3 },
  { id: "emerging", label: "Emerging", rule: "Seen in 1–2 products", min: 1 },
  { id: "proposed", label: "Proposed", rule: "Argued from a documented failure; no product yet", min: 0 },
] as const;

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

  const teamCount = (e: (typeof registry)[number]) => new Set(e.seenIn.map((s) => s.team)).size;
  const convergence = CONVERGENCE.map((band, i) => {
    const upper = i === 0 ? Infinity : CONVERGENCE[i - 1].min;
    const count = registry.filter((e) => teamCount(e) >= band.min && teamCount(e) < upper).length;
    return { ...band, count, share: pct(count, total) };
  });
  const mostShared = [...registry].sort((a, b) => teamCount(b) - teamCount(a)).slice(0, 5).map((e) => ({ ...e, teams: teamCount(e) }));

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
    convergence,
    mostShared,
    growth,
    latest: [...sorted].reverse().slice(0, 6),
  };
}

export type Corpus = ReturnType<typeof getCorpus>;

/** Working hypotheses: claims the corpus suggests and the next round of research should test. */
export type HypothesisStatus = "Supported" | "Open";

export function getHypotheses(c: Corpus): { id: string; claim: string; evidence: string; status: HypothesisStatus; test: string }[] {
  return [
    {
      id: "H1",
      claim: "Most new interface lives between the request and the result.",
      evidence: `Oversee and Trust together hold ${c.oversightShare}% of the corpus; the single largest job is ${c.largest.label} (${c.largest.count} patterns). The hard problem is no longer getting intent in, but following and checking what the AI does with it.`,
      status: "Supported",
      test: "Descriptive support only. Re-test once sampling widens beyond developer tools, which may over-represent oversight.",
    },
    {
      id: "H2",
      claim: "Reversibility earns more trust than confidence.",
      evidence: `Patterns that let people review or reverse AI work — approvals, plan review, diffs, stop, compare — outnumber confidence signals ${c.reviewCount} to ${c.confidenceCount}. Products appear to earn acceptance by making action inspectable, not by labelling it as likely correct.`,
      status: "Supported",
      test: "Counts what products ship, not what people trust. Needs a study with people comparing reversible and confidence-labelled designs.",
    },
    {
      id: "H3",
      claim: "Every pattern now has two readers.",
      evidence: "The same pattern is used by a person and implemented by an agent. A spec that only shows the UI fails the second reader; written as a contract, it can travel between codebases (RQ3).",
      status: "Open",
      test: "Untested until the scored agent-reproduction benchmark exists (O4).",
    },
    {
      id: "H4",
      claim: "The gaps in the corpus are findings too.",
      evidence: `The least-populated job is ${c.smallest.label} — "${c.smallest.question}" — with ${c.smallest.count} patterns. Fewer conventions exist where AI fails or reaches its limits than where it succeeds.`,
      status: "Supported",
      test: "Could reflect documentation bias — products document successes more than failures. Needs sampling from support forums and incident reports.",
    },
  ];
}

/** Chapter 7.1: the current, provisional answer to each research question. */
export function getAnswers(c: Corpus) {
  const [converged, emerging, proposed] = c.convergence;
  return [
    {
      id: "RQ1",
      answer: `Six jobs cover every pattern found so far. What is new concentrates after the request is made: Oversee and Trust hold ${c.oversightShare}% of the corpus, against ${c.jobs.find((j) => j.id === "ask")?.share ?? 0}% for Ask.`,
      status: "Provisional",
    },
    {
      id: "RQ2",
      answer: `${converged.count} patterns (${converged.share}%) have converged across three or more products; ${emerging.count} are emerging in one or two, and ${proposed.count} are proposed without a shipping example yet.`,
      status: "Provisional",
    },
    {
      id: "RQ3",
      answer: "Not yet answered. Agents built from the specifications reproduce intent well on inspection, but there is no scored benchmark to compare against a baseline.",
      status: "Open",
    },
  ];
}

/** Chapter 7.2: what the study produces, and the objective each output serves. */
export function getOutputs(c: Corpus) {
  return [
    { title: "Pattern corpus", kind: "Dataset", objective: "O2", body: `${c.total} patterns, each traced to the products that ship it.`, href: "/patterns" },
    { title: "Job taxonomy", kind: "Framework", objective: "O1", body: "Six functions an AI interface pattern can serve, orthogonal to its form.", href: "/patterns" },
    { title: "Specification format", kind: "Method", objective: "O3", body: "An eight-section UX contract, from Summary to Related patterns.", href: "/patterns" },
    { title: "Reference implementations", kind: "Software", objective: "O3", body: "Copy-paste React for every pattern, with a live preview.", href: "/patterns" },
    { title: "Agent skill & MCP server", kind: "Instrument", objective: "O4", body: "Delivers the specifications to coding agents for validation.", href: "/skill" },
    { title: "Research scout", kind: "Instrument", objective: "O2", body: "Automated sampling of product changelogs into reviewable reports.", href: "https://github.com/carlosmarch/ai-patterns/tree/main/research/scout" },
  ];
}

export function getCitation(c: Corpus) {
  return `@misc{march${c.started.slice(0, 4)}aipatterns,
  author       = {March, Carlos},
  title        = {${RESEARCH_TITLE}},
  year         = {${c.started.slice(0, 4)}},
  howpublished = {\\url{https://ai-patterns.app/research}},
  note         = {Research thesis, working draft; ${c.total} patterns as of ${c.updated}}
}`;
}
