import { patternMarkdownUrl, SITE_DESCRIPTION } from "@/lib/agent";
import type { McpData } from "@/lib/mcp";
import { getCategories, getEntryHref, registry } from "@/registry";
import { JOBS } from "@/registry/jobs";

// The catalogue the MCP server (src/lib/mcp.ts, run by worker/index.ts)
// works from, exported at build time so the Worker never loads the registry.

export const dynamic = "force-static";

export function GET() {
  const data: McpData = {
    description: SITE_DESCRIPTION,
    categories: getCategories(),
    jobs: JOBS.map(({ id, label, description }) => ({ id, label, description })),
    patterns: registry.map((e) => ({
      category: e.category,
      job: e.job,
      slug: e.slug,
      title: e.title,
      description: e.description,
      uxDoc: e.uxDoc,
      markdownUrl: patternMarkdownUrl(e),
      markdownPath: `${getEntryHref(e)}.md`,
    })),
  };
  return Response.json(data);
}
