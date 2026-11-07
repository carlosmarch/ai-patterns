// Server stand-in for the full "shiki" package (aliased in next.config.ts).
//
// Pattern components such as code-preview load "shiki" lazily inside an
// effect, so it only ever runs in the browser — but the server bundle would
// still include every Shiki grammar and theme (~10 MB), pushing the
// Cloudflare Worker past its size limit. Server code highlights through
// src/lib/highlight.ts ("shiki/core") instead.

export function codeToHtml(): Promise<string> {
  return Promise.reject(new Error('"shiki" is browser-only here; use src/lib/highlight.ts on the server.'));
}
