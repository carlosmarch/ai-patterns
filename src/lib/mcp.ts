// A stateless MCP server over Streamable HTTP (JSON responses, no sessions,
// no auth), so any MCP client can browse and pull patterns:
//
//   claude mcp add --transport http ai-patterns https://<site>/mcp
//
// Only the JSON-RPC methods a tools-only server needs are implemented.
//
// The site is a static export, so this runs in the Cloudflare Worker
// (worker/index.ts), not in Next.js. It must stay free of registry/React
// imports: the catalogue arrives as `McpData` (exported at build time to
// /api/mcp-data.json by src/app/api/mcp-data.json/route.ts) and each
// pattern's full Markdown is loaded on demand.

export type McpPattern = {
  category: string;
  slug: string;
  title: string;
  description: string;
  uxDoc: string;
  /** Absolute URL of the pattern's Markdown twin. */
  markdownUrl: string;
  /** Site path of the pattern's Markdown twin, e.g. /patterns/buttons/shiny-button.md */
  markdownPath: string;
};

export type McpData = {
  description: string;
  categories: string[];
  patterns: McpPattern[];
};

export type McpEnv = {
  data: McpData;
  /** Returns the Markdown at a site path (spec + code + dependencies). */
  loadMarkdown: (path: string) => Promise<string>;
};

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const SERVER_INFO = { name: "ai-patterns", title: "AI Patterns", version: "1.0.0" };

const instructions = (data: McpData) => `${data.description}

Use search_patterns (or list_patterns) to shortlist, then get_pattern before recommending or implementing anything: the spec's "When not to use" and "Accessibility" sections are the contract. The bundled code is Tailwind v4 + Radix + Motion; in a project with its own design system, keep the spec's rules and re-express the markup in that system.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const tools = (data: McpData) => [
  {
    name: "list_patterns",
    title: "List patterns",
    description: "List every UI pattern in the catalogue (slug, title, one-line description), optionally filtered to one category.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: data.categories, description: "Only list patterns in this category." },
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

const line = (e: McpPattern) => `- ${e.category}/${e.slug} — ${e.title}: ${e.description}`;
const text = (t: string, isError = false) => ({ content: [{ type: "text", text: t }], ...(isError ? { isError } : {}) });

function groupByCategory(data: McpData) {
  return data.categories.map((category) => ({
    category,
    patterns: data.patterns.filter((p) => p.category === category),
  }));
}

// Same scoring as searchPatterns in src/lib/agent.ts.
function searchPatterns(data: McpData, query: string, limit: number) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
  if (terms.length === 0) return [];
  return data.patterns
    .map((entry) => {
      const head = `${entry.title} ${entry.slug} ${entry.category}`.toLowerCase();
      const desc = entry.description.toLowerCase();
      const spec = entry.uxDoc.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (head.includes(t)) score += 5;
        if (desc.includes(t)) score += 3;
        if (spec.includes(t)) score += 1;
      }
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}

function resolvePattern(data: McpData, category: string, slug: string) {
  return (
    data.patterns.find((p) => p.category === category && p.slug === slug) ??
    data.patterns.find((p) => p.slug === slug)
  );
}

async function callTool(env: McpEnv, name: string, args: Record<string, unknown>) {
  const { data } = env;
  switch (name) {
    case "list_patterns": {
      const category = typeof args.category === "string" ? args.category : undefined;
      const groups = groupByCategory(data).filter((g) => !category || g.category === category);
      if (groups.length === 0) return text(`Unknown category "${category}". Categories: ${data.categories.join(", ")}`, true);
      return text(groups.map((g) => `## ${g.category}\n${g.patterns.map(line).join("\n")}`).join("\n\n"));
    }
    case "search_patterns": {
      const query = typeof args.query === "string" ? args.query : "";
      const limit = typeof args.limit === "number" ? Math.min(Math.max(1, Math.floor(args.limit)), 25) : 8;
      const results = searchPatterns(data, query, limit);
      if (results.length === 0) return text(`No patterns match "${query}". Try list_patterns to browse.`);
      return text(`${results.map(line).join("\n")}\n\nCall get_pattern with a slug for the full spec and code.`);
    }
    case "get_pattern": {
      const slug = typeof args.slug === "string" ? args.slug : "";
      const category = typeof args.category === "string" ? args.category : "";
      const entry = resolvePattern(data, category, slug);
      if (!entry) return text(`No pattern "${[category, slug].filter(Boolean).join("/")}". Use search_patterns or list_patterns.`, true);
      if (args.include_code === false) {
        return text(`${entry.uxDoc.trim()}\n\nCode: ${entry.markdownUrl}`);
      }
      return text(await env.loadMarkdown(entry.markdownPath));
    }
    default:
      return null;
  }
}

async function handle(env: McpEnv, message: JsonRpcRequest) {
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
        instructions: instructions(env.data),
      });
    }
    case "ping":
      return ok({});
    case "tools/list":
      return ok({ tools: tools(env.data) });
    case "tools/call": {
      const name = typeof params.name === "string" ? params.name : "";
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await callTool(env, name, args);
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

/** Handles a request to /mcp. `getEnv` is only called for JSON-RPC requests that need the catalogue. */
export async function handleMcp(request: Request, getEnv: () => Promise<McpEnv>): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") {
    // No server-initiated stream: this server never sends requests or notifications.
    const body = request.method === "GET" ? "This MCP endpoint accepts JSON-RPC over POST (Streamable HTTP).\n" : null;
    return new Response(body, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } });
  }

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

  const env = await getEnv();
  const responses = await Promise.all(requests.map((m) => handle(env, m)));
  return Response.json(Array.isArray(body) ? responses : responses[0], { headers: CORS });
}
