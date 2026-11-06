import { getPatternDetail } from "@/lib/agent";
import { getRegistryEntry, registry } from "@/registry";

// One pattern as JSON: summary, UX spec (Markdown), component source and
// the npm packages it imports.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/api/patterns/[category]/[slug]">) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(await getPatternDetail(entry), { headers: { "Access-Control-Allow-Origin": "*" } });
}
