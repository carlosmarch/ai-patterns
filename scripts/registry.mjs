// Reads the registry's entries out of src/registry/index.ts without importing
// it (it pulls in React). Shared by scripts/build-skill.mjs and scripts/scout.mjs.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
export const registryDir = join(repoRoot, "src/registry");

export function parseRegistryEntries() {
  const indexSource = readFileSync(join(registryDir, "index.ts"), "utf8");
  const arrayMatch = indexSource.match(/export const registry: RegistryEntry\[\] = \[([\s\S]*?)\n\];/);
  if (!arrayMatch) {
    throw new Error("Could not find `export const registry: RegistryEntry[] = [...]` in src/registry/index.ts");
  }

  // (?:[^"\\]|\\.)* matches a JS string body, letting an escaped quote
  // (e.g. the \"Thought for Xs\" inside Expandable Trace's description)
  // pass through instead of ending the match early.
  const field = (name) => new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const unescape = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

  const entries = [];
  const objectBlocks = arrayMatch[1].match(/\{\s*slug:[\s\S]*?\n {2}\},/g) ?? [];
  for (const block of objectBlocks) {
    const slug = block.match(field("slug"))?.[1];
    const category = block.match(field("category"))?.[1];
    const job = block.match(field("job"))?.[1];
    const title = block.match(field("title"))?.[1];
    const description = block.match(field("description"))?.[1];
    if (!slug || !category || !job || !title || !description) {
      throw new Error(`Could not parse a registry entry from block:\n${block}`);
    }
    const seenIn = [...block.matchAll(/\{\s*team:\s*"([^"]+)",\s*source:\s*"([^"]+)"/g)].map(([, team, source]) => ({ team, source }));
    entries.push({ slug, category, job, title: unescape(title), description: unescape(description), seenIn });
  }
  if (entries.length === 0) {
    throw new Error("Parsed zero registry entries — check the regex against the current index.ts shape.");
  }
  return entries;
}
