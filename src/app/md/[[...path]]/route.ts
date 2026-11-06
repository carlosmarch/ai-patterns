import {
  buildHomeMarkdown,
  buildPatternMarkdown,
  buildPatternsIndexMarkdown,
  buildSkillMarkdown,
  markdownResponse,
} from "@/lib/agent";
import { getRegistryEntry, registry } from "@/registry";

// Markdown twins of the site's pages. Not linked directly: next.config.ts
// rewrites `<page>.md` and requests sending `Accept: text/markdown` here.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: [] },
    { path: ["patterns"] },
    { path: ["skill"] },
    ...registry.map(({ category, slug }) => ({ path: ["patterns", category, slug] })),
  ];
}

export async function GET(_request: Request, { params }: RouteContext<"/md/[[...path]]">) {
  const { path = [] } = await params;
  const key = path.join("/");

  if (key === "") return markdownResponse(buildHomeMarkdown());
  if (key === "patterns") return markdownResponse(buildPatternsIndexMarkdown());
  if (key === "skill") return markdownResponse(buildSkillMarkdown());

  if (path.length === 3 && path[0] === "patterns") {
    const entry = getRegistryEntry(path[1], path[2]);
    if (entry) return markdownResponse(await buildPatternMarkdown(entry));
  }

  return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
