#!/usr/bin/env node
// The research scout: automates method 3.1 (Sampling) on /research.
//
// 1. Search — Claude, with web search and web fetch, reads recent changelogs,
//    help centres and docs of the products in research/sources.json and notes
//    every AI-specific interaction it finds, with the URL and a quote.
// 2. Analyse — a second call codes each finding against the inclusion
//    criteria (a) AI-specific problem, (b) observed in a public product,
//    (c) differs from existing entries in behaviour, and against the
//    current registry: new candidate, new evidence for an existing pattern
//    (a `seenIn` source to add), or rejected.
// 3. Report — writes research/scout/<date>.md and updates
//    research/scout/state.json so the next run skips what it already saw.
//
// Nothing is added to the registry automatically: the report is the input to
// a human (or agent) writing the pattern, which keeps coding (3.2) and
// specification (3.3) where they are.
//
// Usage: ANTHROPIC_API_KEY=… npm run scout [-- --days 30] [-- --dry-run]
// Runs weekly in .github/workflows/scout.yml, which opens a PR with the report.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import Anthropic from "@anthropic-ai/sdk";

import { parseRegistryEntries, repoRoot } from "./registry.mjs";

const MODEL = "claude-opus-5-5";
const SOURCES_PATH = join(repoRoot, "research/sources.json");
const SCOUT_DIR = join(repoRoot, "research/scout");
const STATE_PATH = join(SCOUT_DIR, "state.json");
const JOBS = ["start", "ask", "steer", "oversee", "trust", "recover"];

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const today = new Date().toISOString().slice(0, 10);

const sources = readJson(SOURCES_PATH);
const state = readJson(STATE_PATH);
const registry = parseRegistryEntries();
const categories = [...new Set(registry.map((e) => e.category))].sort();

const lookbackDays = Number(option("days") ?? sources.lookbackDays ?? 14);
const since = new Date(Date.now() - lookbackDays * 864e5).toISOString().slice(0, 10);

const client = new Anthropic();

// Server-side refusal fallback (beta): a declined request is re-run on
// Anthropic's recommended fallback model instead of returning a refusal.
const BASE = {
  model: MODEL,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  thinking: { type: "adaptive" },
};

const knownUrls = new Set([
  ...registry.flatMap((e) => e.seenIn.map((s) => s.source)),
  ...state.candidates.flatMap((c) => c.evidence.map((ev) => ev.url)),
]);

// ---------------------------------------------------------------------------
// 1. Search

const SEARCH_SYSTEM = `You are the field researcher for AI Patterns, a catalogue of interface patterns for AI products (https://ai-patterns.app/research). You read what shipping products publicly document and note the interaction patterns they ship.

Look for interface behaviour that exists because an AI is involved: how people start, ask, steer, oversee, trust or recover from an AI that answers or acts for them. Ignore model launches, pricing, benchmarks, integrations with no UI, and general UI with no AI-specific behaviour.

Prefer primary sources — the product's own changelog, release notes, help-centre article or docs page — over press coverage. Every finding needs a URL you actually opened and a short verbatim quote from it that shows the behaviour.`;

function searchPrompt() {
  const watchlist = sources.products
    .map((p) => `- ${p.name}: ${p.domains.join(", ")}`)
    .join("\n");
  return `Survey what these products shipped or documented between ${since} and ${today}. Search their changelogs, release notes and help centres (start from the domains listed), open the pages that look relevant, and read them.

${watchlist}

Also run a few open searches for AI interface features launched in that window by products not on this list, and include them if they meet the bar.

These URLs are already credited in the catalogue — skip them unless the page shows something new:
${[...knownUrls].map((u) => `- ${u}`).join("\n")}

For each finding, write:
- Product
- URL (the page you opened)
- Date (published or updated, if shown)
- Quote (verbatim, under 40 words)
- What the person sees and does, in two or three sentences, describing behaviour rather than visual style

Aim for breadth: cover as many products as you can within your search budget. If a product shipped nothing relevant, skip it.`;
}

async function search() {
  const tools = [
    { type: "web_search_20260209", name: "web_search", max_uses: 40 },
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: 40 },
  ];
  const messages = [{ role: "user", content: searchPrompt() }];

  for (let turn = 0; turn < 8; turn++) {
    const response = await client.beta.messages
      .stream({
        ...BASE,
        max_tokens: 64000,
        output_config: { effort: "high" },
        system: SEARCH_SYSTEM,
        tools,
        messages,
      })
      .finalMessage();

    if (response.stop_reason === "refusal") throw new Error("Search request was declined.");
    messages.push({ role: "assistant", content: response.content });
    // Server tools hit their per-turn iteration limit: send the turn back and the server resumes.
    if (response.stop_reason === "pause_turn") continue;

    return messages
      .filter((m) => m.role === "assistant")
      .flatMap((m) => m.content)
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  }
  throw new Error("Search did not finish after 8 continuations.");
}

// ---------------------------------------------------------------------------
// 2. Analyse

const EVIDENCE_SCHEMA = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["product", "url", "date", "quote"],
    properties: {
      product: { type: "string" },
      url: { type: "string" },
      date: { type: "string", description: "Published or updated date, or empty if not shown" },
      quote: { type: "string" },
    },
  },
};

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["candidates", "evidence", "rejected"],
  properties: {
    candidates: {
      type: "array",
      description: "Findings that meet (a), (b) and (c): a pattern the catalogue does not have yet.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "title", "category", "job", "summary", "behavior", "criteria", "nearest", "difference", "evidence", "confidence"],
        properties: {
          slug: { type: "string", description: "kebab-case" },
          title: { type: "string" },
          category: { type: "string", description: "An existing category, or a new one if none fits" },
          job: { type: "string", enum: JOBS },
          summary: { type: "string", description: "One sentence, in the voice of a registry description" },
          behavior: { type: "string", description: "What the person sees and does, step by step" },
          criteria: {
            type: "object",
            additionalProperties: false,
            required: ["aiSpecific", "observed", "distinct"],
            properties: {
              aiSpecific: { type: "string", description: "(a) Why this problem exists because an AI is involved" },
              observed: { type: "string", description: "(b) Where it ships" },
              distinct: { type: "string", description: "(c) How it differs in behaviour from the nearest entry" },
            },
          },
          nearest: { type: "string", description: "Slug of the closest existing entry" },
          difference: { type: "string" },
          evidence: EVIDENCE_SCHEMA,
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
    },
    evidence: {
      type: "array",
      description: "Findings that match an existing entry: a new product or page to add to its seenIn.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slug", "product", "url", "quote", "note"],
        properties: {
          slug: { type: "string", description: "Existing registry slug" },
          product: { type: "string" },
          url: { type: "string" },
          quote: { type: "string" },
          note: { type: "string", description: "Anything this source adds to or contradicts in the spec" },
        },
      },
    },
    rejected: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["finding", "url", "reason"],
        properties: {
          finding: { type: "string" },
          url: { type: "string" },
          reason: { type: "string", description: "Which criterion failed and why" },
        },
      },
    },
  },
};

const ANALYSIS_SYSTEM = `You are the coder for AI Patterns. You apply its sampling rule and its coding scheme to field notes.

Inclusion: a candidate is included when it (a) addresses a problem that exists because an AI is involved, (b) is observed in at least one public product, and (c) differs from existing entries in behaviour, not only appearance.

Coding: category records form — what kind of UI it is. Job records function — what it does for the person:
${JOBS.join(", ")} (start: help people take the first step; ask: get intent in; steer: shape how the AI works; oversee: follow and step into what it is doing; trust: check results and see what it keeps; recover: get back from failures and limits). Ties are broken by the person's goal, not the element: a cost meter is oversee, an error card is recover.

Be strict on (c). Variants of an existing entry are evidence for that entry, not new candidates. Merge findings that describe the same behaviour in several products into one candidate with several pieces of evidence. Only use URLs and quotes that appear in the notes.`;

async function analyse(notes) {
  const catalogue = registry
    .map((e) => `- ${e.slug} [${e.category} · ${e.job}] ${e.title}: ${e.description}`)
    .join("\n");
  const pending = state.candidates
    .filter((c) => c.status === "open")
    .map((c) => `- ${c.slug}: ${c.summary}`)
    .join("\n");

  const response = await client.beta.messages
    .stream({
      ...BASE,
      max_tokens: 32000,
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
      },
      system: ANALYSIS_SYSTEM,
      messages: [
        {
          role: "user",
          content: `<catalogue categories="${categories.join(", ")}">\n${catalogue}\n</catalogue>\n\n<already-proposed>\n${pending || "(none)"}\n</already-proposed>\n\nTreat already-proposed candidates like catalogue entries: new sightings go in evidence with their slug.\n\n<field-notes since="${since}">\n${notes}\n</field-notes>`,
        },
      ],
    })
    .finalMessage();

  if (response.stop_reason === "refusal") throw new Error("Analysis request was declined.");
  if (response.stop_reason === "max_tokens") throw new Error("Analysis was cut off at max_tokens.");
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// 3. Report

function report(result, notes) {
  const titleOf = new Map(registry.map((e) => [e.slug, e.title]));
  const quote = (q) => `> ${q.replace(/\n+/g, " ")}`;
  const lines = [
    `# Scout report — ${today}`,
    "",
    `Automated sampling (method 3.1) of ${sources.products.length} watched products plus open search, ${since} to ${today}. Generated by \`scripts/scout.mjs\`; review before acting on it.`,
    "",
    `**${result.candidates.length}** new candidates · **${result.evidence.length}** new sources for existing patterns · **${result.rejected.length}** rejected`,
    "",
    "## New candidates",
    "",
  ];

  if (result.candidates.length === 0) lines.push("None this run.", "");
  for (const c of result.candidates) {
    lines.push(
      `### ${c.title} \`${c.category}/${c.slug}\``,
      "",
      `**Job:** ${c.job} · **Confidence:** ${c.confidence} · **Nearest:** \`${c.nearest}\`${titleOf.has(c.nearest) ? ` (${titleOf.get(c.nearest)})` : ""}`,
      "",
      c.summary,
      "",
      `**Behavior.** ${c.behavior}`,
      "",
      `- **(a) AI-specific:** ${c.criteria.aiSpecific}`,
      `- **(b) Observed:** ${c.criteria.observed}`,
      `- **(c) Distinct:** ${c.criteria.distinct}`,
      "",
      "**Evidence**",
      "",
    );
    for (const ev of c.evidence) {
      lines.push(`- ${ev.product}${ev.date ? ` (${ev.date})` : ""} — ${ev.url}`, "", `  ${quote(ev.quote)}`, "");
    }
  }

  lines.push("## New sources for existing patterns", "");
  if (result.evidence.length === 0) lines.push("None this run.", "");
  else {
    lines.push("Candidates for each entry's `seenIn` in `src/registry/index.ts`.", "");
    for (const ev of result.evidence) {
      lines.push(`- \`${ev.slug}\` — ${ev.product}: ${ev.url}`, "", `  ${quote(ev.quote)}`, "");
      if (ev.note) lines.push(`  ${ev.note}`, "");
    }
  }

  lines.push("## Rejected", "");
  if (result.rejected.length === 0) lines.push("None this run.", "");
  for (const r of result.rejected) lines.push(`- ${r.finding} — ${r.reason} (${r.url})`);

  lines.push("", "<details><summary>Field notes</summary>", "", notes, "", "</details>", "");
  return lines.join("\n");
}

function updateState(result) {
  const bySlug = new Map(state.candidates.map((c) => [c.slug, c]));
  for (const c of result.candidates) {
    const existing = bySlug.get(c.slug);
    if (existing) existing.evidence.push(...c.evidence);
    else bySlug.set(c.slug, { ...c, status: "open", firstSeen: today });
  }
  for (const ev of result.evidence) {
    const pending = bySlug.get(ev.slug);
    if (pending) pending.evidence.push({ product: ev.product, url: ev.url, quote: ev.quote });
  }
  // A candidate that has since been added to the registry is closed.
  const inRegistry = new Set(registry.map((e) => e.slug));
  for (const c of bySlug.values()) if (c.status === "open" && inRegistry.has(c.slug)) c.status = "added";

  return { lastRun: today, candidates: [...bySlug.values()] };
}

// ---------------------------------------------------------------------------

console.log(`Scouting ${sources.products.length} products, ${since} → ${today}…`);
const notes = await search();
console.log(`Search done (${notes.length} chars of notes). Analysing against ${registry.length} patterns…`);
const result = await analyse(notes);
const markdown = report(result, notes);

if (flag("dry-run")) {
  console.log(markdown);
} else {
  mkdirSync(SCOUT_DIR, { recursive: true });
  writeFileSync(join(SCOUT_DIR, `${today}.md`), markdown);
  writeFileSync(STATE_PATH, JSON.stringify(updateState(result), null, 2) + "\n");
  console.log(`Wrote research/scout/${today}.md`);
}
console.log(`${result.candidates.length} candidates, ${result.evidence.length} new sources, ${result.rejected.length} rejected.`);

// Lets the workflow skip the PR when there is nothing to review.
if (process.env.GITHUB_OUTPUT) {
  const found = result.candidates.length + result.evidence.length;
  writeFileSync(process.env.GITHUB_OUTPUT, `found=${found}\nreport=research/scout/${today}.md\n`, { flag: "a" });
}
