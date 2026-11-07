#!/usr/bin/env node
// Runs after `next build` (npm "postbuild").
//
// 1. Moves the Markdown twins that
// src/app/md/[...path]/route.ts exported to out/md/** next to the HTML
// pages, so /patterns.md and /patterns/<category>/<slug>.md are plain
// static files on Cloudflare.
// 2. Gives the share images (`opengraph-image` routes, exported as PNGs with
// no file extension) an image/png Content-Type in out/_headers — Cloudflare
// picks types from the extension, and crawlers skip octet-stream images.

import { appendFileSync, cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const md = join(out, "md");

if (!existsSync(md)) {
  console.error("finalize-export: out/md not found — did `next build` run with output: \"export\"?");
  process.exit(1);
}

cpSync(md, out, { recursive: true });
rmSync(md, { recursive: true });
// Next also writes RSC payloads for the md route group; none are needed.
for (const f of ["md.txt", "md.html"]) rmSync(join(out, f), { force: true });
console.log("finalize-export: moved Markdown twins into out/");

// Share images: one _headers rule per route shape, with each dynamic
// segment (/patterns/<category>/<slug>/…) as a placeholder.
const images = readdirSync(out, { recursive: true })
  .map(String)
  .filter((f) => /(^|[\\/])opengraph-image(-[\w]+)?$/.test(f));
const rules = new Set(
  images.map((f) => {
    const parts = relative(out, join(out, f)).split(sep);
    return "/" + parts.map((p, i) => (i === parts.length - 1 || i === 0 ? p : `:p${i}`)).join("/");
  }),
);
if (rules.size === 0) {
  console.error("finalize-export: no opengraph-image files found in out/");
  process.exit(1);
}
appendFileSync(
  join(out, "_headers"),
  `\n# Share images (added by scripts/finalize-export.mjs)\n` +
    [...rules].map((r) => `${r}\n  Content-Type: image/png\n`).join("\n"),
);
console.log(`finalize-export: added Content-Type rules for ${images.length} share images`);
