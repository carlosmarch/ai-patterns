#!/usr/bin/env node
// Runs after `next build` (npm "postbuild"). Moves the Markdown twins that
// src/app/md/[...path]/route.ts exported to out/md/** next to the HTML
// pages, so /patterns.md and /patterns/<category>/<slug>.md are plain
// static files on Cloudflare.

import { cpSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
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
