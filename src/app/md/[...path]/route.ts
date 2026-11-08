import {
  buildHomeMarkdown,
  buildPatternMarkdown,
  buildPatternsIndexMarkdown,
  buildResearchMarkdown,
  buildSkillMarkdown,
  markdownResponse,
} from "@/lib/agent";
import { getRegistryEntry, registry } from "@/registry";

// Markdown twins of the site's pages, exported at build time to
// out/md/<page>.md. scripts/finalize-export.mjs then moves them next to the
// HTML pages, so they're served at `<page>.md` (e.g. /patterns.md,
// /patterns/buttons/shiny-button.md). Each path ends in a file name, so no
// exported file collides with a directory.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: ["index.md"] },
    { path: ["patterns.md"] },
    { path: ["skill.md"] },
    { path: ["research.md"] },
    ...registry.map(({ category, slug }) => ({ path: ["patterns", category, `${slug}.md`] })),
  ];
}

export async function GET(_request: Request, { params }: RouteContext<"/md/[...path]">) {
  const { path } = await params;
  const key = path.join("/");

  if (key === "index.md") return markdownResponse(buildHomeMarkdown());
  if (key === "patterns.md") return markdownResponse(buildPatternsIndexMarkdown());
  if (key === "research.md") return markdownResponse(buildResearchMarkdown());
  if (key === "skill.md") return markdownResponse(buildSkillMarkdown());

  if (path.length === 3 && path[0] === "patterns") {
    const entry = getRegistryEntry(path[1], path[2].replace(/\.md$/, ""));
    if (entry) return markdownResponse(await buildPatternMarkdown(entry));
  }

  return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
