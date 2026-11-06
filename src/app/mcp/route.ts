import {
  buildPatternMarkdown,
  groupByCategory,
  patternMarkdownUrl,
  resolvePattern,
  searchPatterns,
  SITE_DESCRIPTION,
} from "@/lib/agent";
import { getCategories, type RegistryEntry } from "@/registry";

// A stateless MCP server over Streamable HTTP (JSON responses, no sessions,
// no auth), so any MCP client can browse and pull patterns:
//
//   claude mcp add --transport http ai-patterns https://<site>/mcp
//
// Only the JSON-RPC methods a tools-only server needs are implemented.

export const dynamic = "force-dynamic";

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const SERVER_INFO = { name: "ai-patterns", title: "AI Patterns", version: "1.0.0" };

const INSTRUCTIONS = `${SITE_DESCRIPTION}

Use search_patterns (or list_patterns) to shortlist, then get_pattern before recommending or implementing anything: the spec's "When not to use" and "Accessibility" sections are the contract. The bundled code is Tailwind v4 + Radix + Motion; in a project with its own design system, keep the spec's rules and re-express the markup in that system.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const TOOLS = [
  {
    name: "list_patterns",
    title: "List patterns",
    description: "List every UI pattern in the catalogue (slug, title, one-line description), optionally filtered to one category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: getCategories(), description: "Only list patterns in this category." },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "search_patterns",
    title: "Search patterns",
    description: "Find patterns relevant to a UI need, e.g. 'approve a tool call', 'show the agent is thinking', 'review a code diff'. Matches titles, descriptions and specs.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What the UI needs to do." },
        limit: { type: "integer", minimum: 1, maximum: 25, description: "Maximum results (default 8)." },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_pattern",
    title: "Get pattern",
    description: "Get one pattern's full UX spec (summary, when to use / not to use, anatomy, behavior, content, accessibility) and, by default, its React/TypeScript implementation and npm dependencies.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Pattern slug, e.g. 'tool-approval'." },
        category: { type: "string", description: "Pattern category, e.g. 'permissions'. Optional when the slug is unique." },
        include_code: { type: "boolean", description: "Include component.tsx (default true)." },
      },
      required: ["slug"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

type JsonRpcRequest = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };

const line = (e: RegistryEntry) => `- ${e.category}/${e.slug} — ${e.title}: ${e.description}`;
const text = (t: string, isError = false) => ({ content: [{ type: "text", text: t }], ...(isError ? { isError } : {}) });

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "list_patterns": {
      const category = typeof args.category === "string" ? args.category : undefined;
      const groups = groupByCategory().filter((g) => !category || g.category === category);
      if (groups.length === 0) return text(`Unknown category "${category}". Categories: ${getCategories().join(", ")}`, true);
      return text(groups.map((g) => `## ${g.category}\n${g.patterns.map(line).join("\n")}`).join("\n\n"));
    }
    case "search_patterns": {
      const query = typeof args.query === "string" ? args.query : "";
      const limit = typeof args.limit === "number" ? Math.min(Math.max(1, Math.floor(args.limit)), 25) : 8;
      const results = searchPatterns(query, limit);
      if (results.length === 0) return text(`No patterns match "${query}". Try list_patterns to browse.`);
      return text(`${results.map(line).join("\n")}\n\nCall get_pattern with a slug for the full spec and code.`);
    }
    case "get_pattern": {
      const slug = typeof args.slug === "string" ? args.slug : "";
      const category = typeof args.category === "string" ? args.category : "";
      const entry = resolvePattern(category, slug);
      if (!entry) return text(`No pattern "${[category, slug].filter(Boolean).join("/")}". Use search_patterns or list_patterns.`, true);
      if (args.include_code === false) {
        return text(`${entry.uxDoc.trim()}\n\nCode: ${patternMarkdownUrl(entry)}`);
      }
      return text(await buildPatternMarkdown(entry));
    }
    default:
      return null;
  }
}

async function handle(message: JsonRpcRequest) {
  const { id, method, params = {} } = message;
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, msg: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message: msg } });

  switch (method) {
    case "initialize": {
      const requested = typeof params.protocolVersion === "string" ? params.protocolVersion : "";
      return ok({
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: TOOLS });
    case "tools/call": {
      const name = typeof params.name === "string" ? params.name : "";
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await callTool(name, args);
      return result ? ok(result) : fail(-32602, `Unknown tool: ${name}`);
    }
    case "resources/list":
      return ok({ resources: [] });
    case "prompts/list":
      return ok({ prompts: [] });
    default:
      return fail(-32601, `Method not found: ${method}`);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: CORS });
  }

  const messages = (Array.isArray(body) ? body : [body]) as JsonRpcRequest[];
  if (messages.some((m) => !m || typeof m !== "object" || typeof m.method !== "string")) {
    // Responses from the client (we never send requests) or malformed input.
    const onlyResponses = messages.every((m) => m && typeof m === "object" && !("method" in m));
    if (onlyResponses) return new Response(null, { status: 202, headers: CORS });
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }, { status: 400, headers: CORS });
  }

  // Notifications (no id) get no response.
  const requests = messages.filter((m) => m.id !== undefined && m.id !== null);
  if (requests.length === 0) return new Response(null, { status: 202, headers: CORS });

  const responses = await Promise.all(requests.map(handle));
  return Response.json(Array.isArray(body) ? responses : responses[0], { headers: CORS });
}

// No server-initiated stream: this server never sends requests or notifications.
export function GET() {
  return new Response("This MCP endpoint accepts JSON-RPC over POST (Streamable HTTP).\n", {
    status: 405,
    headers: { ...CORS, Allow: "POST, OPTIONS" },
  });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
