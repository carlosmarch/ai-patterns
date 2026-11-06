import fs from "node:fs/promises";
import path from "node:path";

import { TEAMS } from "@/lib/teams";
import { getCategories, getEntryHref, getRegistryEntry, registry, type RegistryEntry } from "@/registry";

// Everything the site serves to agents instead of browsers — llms.txt,
// Markdown twins of the pages, the JSON API and the MCP server — is built
// from here, so all of them describe the registry the same way.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-patterns.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "AI Patterns";
export const SITE_DESCRIPTION =
  "A pattern library for AI product UI — tool approval, confidence indicators, agent handoff, error recovery, streaming answers and more. Each pattern is a UX spec (when to use, anatomy, behavior, content, accessibility) plus a copy-paste React implementation (Next.js, TypeScript, Tailwind v4, Motion, Radix).";
export const REPO_URL = "https://github.com/carlosmarch/ai-patterns";
export const INSTALL_SKILL = "/plugin marketplace add carlosmarch/ai-patterns\n/plugin install ai-patterns@ai-patterns";

export const abs = (pathname: string) => `${SITE_URL}${pathname}`;

export type PatternRef = Pick<RegistryEntry, "category" | "slug">;

export const patternUrl = (e: PatternRef) => abs(getEntryHref(e));
export const patternMarkdownUrl = (e: PatternRef) => `${patternUrl(e)}.md`;
export const patternJsonUrl = (e: PatternRef) => abs(`/api/patterns/${e.category}/${e.slug}`);

export const MARKDOWN_HEADERS = { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" };
export const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8" };

export function markdownResponse(body: string) {
  return new Response(body, { headers: MARKDOWN_HEADERS });
}

export async function readComponentSource(e: PatternRef) {
  return fs.readFile(path.join(process.cwd(), "src/registry", e.category, e.slug, "component.tsx"), "utf-8");
}

/** npm packages the component imports (skipping `react`, path aliases and relative imports). */
export function getDependencies(source: string) {
  const deps = new Set<string>();
  for (const [, spec] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    if (spec.startsWith(".") || spec.startsWith("@/")) continue;
    const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
    if (name === "react" || name === "react-dom" || name === "next") continue;
    deps.add(name);
  }
  return [...deps].sort();
}

/** Internal helpers (e.g. `@/lib/utils`) the component imports, so an agent knows to bring them along. */
export function getLocalImports(source: string) {
  return [...source.matchAll(/from\s+["'](@\/[^"']+)["']/g)].map(([, spec]) => spec).filter((v, i, a) => a.indexOf(v) === i);
}

function seenInList(entry: RegistryEntry) {
  return entry.seenIn.map(({ team, source }) => ({ team: TEAMS.find((t) => t.id === team)?.name ?? team, source }));
}

export function summarize(entry: RegistryEntry) {
  return {
    slug: entry.slug,
    category: entry.category,
    title: entry.title,
    description: entry.description,
    url: patternUrl(entry),
    markdown: patternMarkdownUrl(entry),
    json: patternJsonUrl(entry),
    seenIn: seenInList(entry),
  };
}

export async function getPatternDetail(entry: RegistryEntry) {
  const code = await readComponentSource(entry);
  return {
    ...summarize(entry),
    spec: entry.uxDoc,
    code,
    dependencies: getDependencies(code),
    localImports: getLocalImports(code),
  };
}

export function groupByCategory() {
  return getCategories().map((category) => ({
    category,
    patterns: registry.filter((e) => e.category === category),
  }));
}

/** Rank patterns for a free-text query; title/slug hits outweigh description hits, which outweigh spec hits. */
export function searchPatterns(query: string, limit = 10) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
  if (terms.length === 0) return [];
  return registry
    .map((entry) => {
      const head = `${entry.title} ${entry.slug} ${entry.category}`.toLowerCase();
      const desc = entry.description.toLowerCase();
      const spec = entry.uxDoc.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (head.includes(t)) score += 5;
        if (desc.includes(t)) score += 3;
        if (spec.includes(t)) score += 1;
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}

export function resolvePattern(category: string, slug: string) {
  return getRegistryEntry(category, slug) ?? registry.find((e) => e.slug === slug);
}

// ---------------------------------------------------------------------------
// Markdown documents

const AGENT_ACCESS = `## For agents

- [llms.txt](${abs("/llms.txt")}): this index.
- [llms-full.txt](${abs("/llms-full.txt")}): every pattern's full spec in one file (code omitted).
- Markdown: append \`.md\` to any page URL (e.g. \`/patterns.md\`, \`/patterns/buttons/shiny-button.md\`), or request any page with \`Accept: text/markdown\`.
- JSON API: [\`GET /api/patterns\`](${abs("/api/patterns")}) lists every pattern; \`GET /api/patterns/<category>/<slug>\` returns its spec, source code and npm dependencies.
- MCP server (Streamable HTTP, no auth): \`${abs("/mcp")}\` with tools \`list_patterns\`, \`search_patterns\` and \`get_pattern\`.
- Claude Code skill — recommends and scaffolds patterns into a project:

\`\`\`
${INSTALL_SKILL}
\`\`\``;

export function buildLlmsTxt() {
  const sections = groupByCategory()
    .map(
      ({ category, patterns }) =>
        `## ${category}\n\n${patterns.map((e) => `- [${e.title}](${patternMarkdownUrl(e)}): ${e.description}`).join("\n")}`
    )
    .join("\n\n");

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Each pattern is a portable UX contract. Read its spec before implementing it — the "When not to use" and "Accessibility" sections are the contract; the Tailwind/Radix/Motion code is one default expression of it and can be re-expressed in any design system. Every pattern link below is the Markdown version: spec followed by the full \`component.tsx\`.

${AGENT_ACCESS}

${sections}

## Optional

- [Home](${abs("/index.md")}): what the catalogue is.
- [Claude Code skill](${abs("/skill.md")}): install and use the skill.
- [Source on GitHub](${REPO_URL}): the registry lives in \`src/registry/<category>/<slug>/\` (MIT).
`;
}

export function buildLlmsFullTxt() {
  const body = registry
    .map((e) => `<!-- ${e.category}/${e.slug} · ${patternUrl(e)} -->\n\n${e.uxDoc.trim()}\n\nCode: ${patternMarkdownUrl(e)}`)
    .join("\n\n---\n\n");
  return `# ${SITE_NAME} — full pattern specs

> ${SITE_DESCRIPTION}

${registry.length} patterns follow, each as its UX spec. The reference implementation for a pattern is in its Markdown page (linked after each spec) or at \`/api/patterns/<category>/<slug>\`.

---

${body}
`;
}

export function buildPatternsIndexMarkdown() {
  const sections = groupByCategory()
    .map(({ category, patterns }) => {
      const rows = patterns
        .map((e) => `| [${e.title}](${patternMarkdownUrl(e)}) | \`${e.slug}\` | ${e.description.replace(/\|/g, "\\|")} |`)
        .join("\n");
      return `## ${category}\n\n| pattern | slug | description |\n| --- | --- | --- |\n${rows}`;
    })
    .join("\n\n");
  return `# Patterns (${registry.length})

Every pattern in the ${SITE_NAME} catalogue, grouped by category. Open a pattern's Markdown page for its full UX spec and implementation.

HTML: ${abs("/patterns")}

${sections}
`;
}

export async function buildPatternMarkdown(entry: RegistryEntry) {
  const code = await readComponentSource(entry);
  const deps = getDependencies(code);
  const local = getLocalImports(code);
  const seen = seenInList(entry);

  const meta = [
    `- Category: ${entry.category}`,
    `- Slug: \`${entry.slug}\``,
    `- HTML: ${patternUrl(entry)}`,
    `- JSON: ${patternJsonUrl(entry)}`,
    seen.length ? `- Seen in: ${seen.map((s) => `[${s.team}](${s.source})`).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Lead with the spec's own "# Title", then the summary and links.
  const [heading, ...spec] = entry.uxDoc.trim().split("\n");
  const title = heading.startsWith("# ") ? heading : `# ${entry.title}`;
  const rest = heading.startsWith("# ") ? spec.join("\n").trim() : entry.uxDoc.trim();

  return `${title}

> ${entry.description}

${meta}

${rest}

## Implementation

Reference implementation (React, TypeScript, Tailwind v4, Motion, Radix). Keep every rule from the spec above; if the host project has its own design system, re-express the markup and motion in it rather than copying these classes.

${deps.length ? `npm dependencies: ${deps.map((d) => `\`${d}\``).join(", ")}\n\n` : ""}${local.length ? `Local imports to provide: ${local.map((d) => `\`${d}\``).join(", ")} (\`cn\` is the usual \`clsx\` + \`tailwind-merge\` helper).\n\n` : ""}\`\`\`tsx title="component.tsx"
${code.trim()}
\`\`\`
`;
}

export function buildHomeMarkdown() {
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

The interactions in AI products that don't have established conventions yet — tool approval, confidence, agent handoff, error recovery, streaming — distilled from shipping products into ${registry.length} patterns across ${getCategories().length} categories.

- [Browse the patterns](${abs("/patterns.md")})
- [Claude Code skill](${abs("/skill.md")})
- [Source on GitHub](${REPO_URL})

${AGENT_ACCESS}
`;
}

export function buildSkillMarkdown() {
  return `# The ai-patterns skill

A Claude Code plugin that turns your coding agent into a design-engineering expert for AI product UI. It shortlists patterns from this catalogue, weighs each one's "When to use" against its "When not to use", and scaffolds the one that fits — in this catalogue's Tailwind v4 + Radix + Motion default or re-expressed in the host project's own design system.

## Install

\`\`\`
${INSTALL_SKILL}
\`\`\`

## Commands

- \`/ai-patterns list\` — every pattern, grouped by category.
- \`/ai-patterns review\` — scan a project for hand-rolled UI a catalogue pattern could replace (read-only).
- \`/ai-patterns apply\` (or just describe what you need) — recommend and scaffold a pattern.

HTML: ${abs("/skill")}
`;
}
