import { abs, groupByCategory, groupByJob, SITE_DESCRIPTION, SITE_NAME, summarize } from "@/lib/agent";
import { registry } from "@/registry";

// JSON index of the catalogue, exported as /api/patterns/index.json and
// served at /api/patterns by the Worker (worker/index.ts). Each pattern
// links to its detail endpoint, which carries the spec and source code.

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      count: registry.length,
      categories: groupByCategory().map(({ category, patterns }) => ({ category, count: patterns.length })),
      jobs: groupByJob().map(({ patterns, ...job }) => ({ ...job, count: patterns.length })),
      patterns: registry.map(summarize),
      links: { llms: abs("/llms.txt"), mcp: abs("/mcp") },
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}
