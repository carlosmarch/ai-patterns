import fs from "node:fs/promises";
import path from "node:path";
import { codeToHtml } from "shiki";

import { getRegistryEntry, registry } from "@/registry";

// The workspace is a client app, so its Code and Guardrails tabs fetch a
// pattern's source and spec from here — highlighted at build time, the
// same way the pattern pages do it, so no highlighter ships to the browser.

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/workspace/source/[category]/[slug]">) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });

  const code = await fs.readFile(path.join(process.cwd(), "src/registry", category, slug, "component.tsx"), "utf-8");
  const [codeHtml, specHtml] = await Promise.all([
    codeToHtml(code, { lang: "tsx", theme: "github-dark" }),
    codeToHtml(entry.uxDoc, { lang: "markdown", theme: "github-dark" }),
  ]);

  return Response.json({ code, codeHtml, specHtml });
}
