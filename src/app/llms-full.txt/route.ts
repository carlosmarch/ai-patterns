import { buildLlmsFullTxt, TEXT_HEADERS } from "@/lib/agent";

// Every pattern's UX spec in one file, for agents that want the whole
// catalogue in context at once.

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsFullTxt(), { headers: TEXT_HEADERS });
}
