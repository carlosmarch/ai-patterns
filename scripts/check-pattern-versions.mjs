#!/usr/bin/env node
// Guardrail for the registry's public API: the exported types in each
// pattern's component.tsx (Props interfaces/types, and anything exported
// alongside them) are what every project that installed the `ai-patterns`
// skill is holding a copy of. If that surface changes shape in a way that
// breaks existing usage — a removed export, a dropped or newly-required
// prop, a changed prop type — and the pattern's `version` in
// src/registry/index.ts isn't bumped, this script fails.
//
// It works against a committed snapshot (pattern-api-snapshot.json) of each
// pattern's exported API. On a clean run it rewrites that snapshot to match
// the current registry, the same way `npm run skill:build` regenerates the
// skill's reference docs — commit the updated snapshot alongside your change.
//
// Usage: node scripts/check-pattern-versions.mjs   (or: npm run check:patterns)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryDir = join(repoRoot, "src/registry");
const snapshotPath = join(repoRoot, "scripts/pattern-api-snapshot.json");

function parseRegistryEntries() {
  const indexSource = readFileSync(join(registryDir, "index.ts"), "utf8");
  const arrayMatch = indexSource.match(/export const registry: RegistryEntry\[\] = \[([\s\S]*?)\n\];/);
  if (!arrayMatch) {
    throw new Error("Could not find `export const registry: RegistryEntry[] = [...]` in src/registry/index.ts");
  }

  const field = (name) => new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const objectBlocks = arrayMatch[1].match(/\{\s*slug:[\s\S]*?\n {2}\},/g) ?? [];

  const entries = [];
  for (const block of objectBlocks) {
    const slug = block.match(field("slug"))?.[1];
    const category = block.match(field("category"))?.[1];
    const version = block.match(field("version"))?.[1];
    if (!slug || !category || !version) {
      throw new Error(`Could not parse slug/category/version from registry block:\n${block}`);
    }
    entries.push({ slug, category, version, key: `${category}/${slug}` });
  }
  return entries;
}

// Reduce whitespace/newlines in a type's source text to single spaces so
// harmless reformatting doesn't register as an API change.
function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function membersOf(sourceFile, memberNodes) {
  return memberNodes.map((member, i) => {
    if (ts.isPropertySignature(member) && member.name && member.type) {
      return {
        name: member.name.getText(sourceFile),
        optional: member.questionToken !== undefined,
        type: normalizeText(member.type.getText(sourceFile)),
      };
    }
    // Method/index/call signatures are rare here — track them opaquely
    // rather than skipping them silently.
    return { name: `__member_${i}`, optional: false, type: normalizeText(member.getText(sourceFile)) };
  });
}

// Extracts every top-level exported interface/type alias from a
// component.tsx into a normalized, comparable shape.
function extractApi(componentPath) {
  const source = readFileSync(componentPath, "utf8");
  const sourceFile = ts.createSourceFile(componentPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const isExported = (node) =>
    ts.canHaveModifiers(node) && (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;

  const api = {};
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && isExported(node)) {
      api[node.name.text] = {
        kind: "interface",
        heritage: node.heritageClauses ? normalizeText(node.heritageClauses.map((h) => h.getText(sourceFile)).join(" ")) : null,
        members: membersOf(sourceFile, [...node.members]),
      };
      return;
    }
    if (ts.isTypeAliasDeclaration(node) && isExported(node)) {
      const type = node.type;
      if (ts.isTypeLiteralNode(type)) {
        api[node.name.text] = { kind: "type-object", heritage: null, members: membersOf(sourceFile, [...type.members]) };
      } else if (ts.isUnionTypeNode(type)) {
        api[node.name.text] = {
          kind: "type-union",
          members: type.types.map((t) => normalizeText(t.getText(sourceFile))).sort(),
        };
      } else {
        api[node.name.text] = { kind: "type-opaque", text: normalizeText(type.getText(sourceFile)) };
      }
    }
  });
  return api;
}

// Returns a list of human-readable breaking-change descriptions between an
// exported declaration's previously-snapshotted shape and its current one.
function diffExport(name, before, after) {
  if (before.kind !== after.kind) {
    return [`\`${name}\` changed from ${before.kind} to ${after.kind}`];
  }

  if (before.kind === "type-opaque") {
    return before.text !== after.text ? [`\`${name}\`'s definition changed (was \`${before.text}\`, now \`${after.text}\`)`] : [];
  }

  if (before.kind === "type-union") {
    const removed = before.members.filter((m) => !after.members.includes(m));
    return removed.map((m) => `\`${name}\` lost union member ${m}`);
  }

  // interface | type-object
  const breaking = [];
  if ((before.heritage ?? null) !== (after.heritage ?? null)) {
    breaking.push(`\`${name}\`'s extends clause changed (was \`${before.heritage ?? "none"}\`, now \`${after.heritage ?? "none"}\`)`);
  }
  const beforeByName = new Map(before.members.map((m) => [m.name, m]));
  const afterByName = new Map(after.members.map((m) => [m.name, m]));
  for (const [propName, prop] of beforeByName) {
    const now = afterByName.get(propName);
    if (!now) {
      breaking.push(`\`${name}.${propName}\` was removed`);
      continue;
    }
    if (prop.type !== now.type) {
      breaking.push(`\`${name}.${propName}\`'s type changed (was \`${prop.type}\`, now \`${now.type}\`)`);
    } else if (!prop.optional && now.optional) {
      // widening (required -> optional) is not breaking
    } else if (prop.optional && !now.optional) {
      breaking.push(`\`${name}.${propName}\` is now required (was optional)`);
    }
  }
  for (const [propName, prop] of afterByName) {
    if (!beforeByName.has(propName) && !prop.optional) {
      breaking.push(`\`${name}.${propName}\` was added as a required prop`);
    }
  }
  return breaking;
}

function diffApi(before, after) {
  const breaking = [];
  for (const name of Object.keys(before)) {
    if (!(name in after)) {
      breaking.push(`\`${name}\` was removed`);
      continue;
    }
    breaking.push(...diffExport(name, before[name], after[name]));
  }
  return breaking;
}

function main() {
  const entries = parseRegistryEntries();
  const snapshot = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, "utf8")) : {};
  const nextSnapshot = {};
  const errors = [];

  for (const entry of entries) {
    const componentPath = join(registryDir, entry.category, entry.slug, "component.tsx");
    const currentApi = extractApi(componentPath);
    const previous = snapshot[entry.key];

    if (previous) {
      const breaking = diffApi(previous.api, currentApi);
      if (breaking.length > 0 && previous.version === entry.version) {
        errors.push(
          `${entry.key} (still v${entry.version}) has breaking prop/type changes but no version bump:\n` +
            breaking.map((line) => `    - ${line}`).join("\n")
        );
        // Keep the old snapshot for this pattern so re-running after a fix
        // diffs against the last-known-good shape, not a half-written one.
        nextSnapshot[entry.key] = previous;
        continue;
      }
    }

    nextSnapshot[entry.key] = { version: entry.version, api: currentApi };
  }

  if (errors.length > 0) {
    console.error("✖ pattern versioning guardrail failed\n");
    console.error(errors.join("\n\n"));
    console.error(
      `\nBump \`version\` in src/registry/index.ts for the pattern(s) above, then re-run \`npm run check:patterns\`.`
    );
    process.exit(1);
  }

  writeFileSync(snapshotPath, JSON.stringify(nextSnapshot, null, 2) + "\n");
  console.log(`✓ pattern versioning guardrail passed (${entries.length} patterns checked)`);
}

main();
