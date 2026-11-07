import { highlight } from "@/lib/highlight";
import { readComponentSource } from "@/lib/agent";
import { getRegistryEntry, registry } from "@/registry";

// The workspace is a client app, so its Code and Guardrails tabs fetch a
// pattern's source and spec from here — highlighted at build time, the
// same way the pattern pages do it, so no highlighter ships to the browser.

export const dynamic = "force-static";

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/workspace/source/[category]/[slug]">) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });

  const code = await readComponentSource(entry);
  const [codeHtml, specHtml] = await Promise.all([
    highlight(code, "tsx"),
    highlight(entry.uxDoc, "markdown"),
  ]);

  return Response.json({ code, codeHtml, specHtml });
}
