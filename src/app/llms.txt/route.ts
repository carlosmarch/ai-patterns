import { buildLlmsTxt, TEXT_HEADERS } from "@/lib/agent";

// The llms.txt index (https://llmstxt.org): what the site is and a link to
// the Markdown version of every pattern.

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), { headers: TEXT_HEADERS });
}
