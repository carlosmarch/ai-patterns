import { registry, type RegistryEntry } from "@/registry";

// Helpers that let Origami answer from the real registry: find the pattern
// a prompt is about, and read sections straight out of its UX spec.

export function entryPath(entry: Pick<RegistryEntry, "category" | "slug">) {
  return `${entry.category}/${entry.slug}`;
}

export function findEntry(path: string | null | undefined) {
  return path ? registry.find((e) => entryPath(e) === path) : undefined;
}

/** The pattern a free-typed prompt names, preferring the longest title ("Prompt Bar Pro" over "Prompt Bar"). */
export function matchEntry(prompt: string) {
  const p = prompt.toLowerCase();
  return registry
    .filter((e) => p.includes(e.title.toLowerCase()) || p.includes(e.slug.replace(/-/g, " ")))
    .sort((a, b) => b.title.length - a.title.length)[0];
}

/** The body of a `## Heading` section in a pattern spec, trimmed. */
export function specSection(doc: string, heading: string) {
  const lines = doc.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return "";
  const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join("\n")
    .trim();
}

/** The first bullet of a spec section, without its leading "- " and inline code ticks. */
export function firstBullet(doc: string, heading: string) {
  const line = specSection(doc, heading)
    .split("\n")
    .find((l) => l.startsWith("- "));
  return line?.slice(2).replace(/`/g, "").trim() ?? "";
}

/** Registry entries named in a spec's Related patterns section. */
export function relatedEntries(entry: RegistryEntry) {
  const related = specSection(entry.uxDoc, "Related patterns").toLowerCase();
  return registry.filter((e) => e !== entry && related.includes(e.title.toLowerCase()));
}

export interface PatternSource {
  code: string;
  codeHtml: string;
  specHtml: string;
}

const sourceCache = new Map<string, Promise<PatternSource>>();

/** A pattern's component source and spec, highlighted — served by ./source/[category]/[slug]. */
export function loadSource(path: string) {
  let pending = sourceCache.get(path);
  if (!pending) {
    pending = fetch(`/workspace/source/${path}`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<PatternSource>;
    });
    pending.catch(() => sourceCache.delete(path));
    sourceCache.set(path, pending);
  }
  return pending;
}
