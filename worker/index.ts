import { handleMcp, type McpData, type McpEnv } from "../src/lib/mcp";

// Cloudflare Worker for the static site in out/ (see wrangler.jsonc).
//
// Static assets are served without running this Worker, so pages, the .md
// twins, the JSON API and llms.txt cost no Worker CPU — the free plan only
// allows 10 ms per request, which a Next.js server can't meet. The Worker
// only runs for requests no file matches: the MCP endpoint, the
// /api/patterns index, and 404s.

type Env = { ASSETS: { fetch(input: Request | string): Promise<Response> } };

let mcpEnv: Promise<McpEnv> | undefined;

function getMcpEnv(env: Env, origin: string) {
  mcpEnv ??= (async () => {
    const res = await env.ASSETS.fetch(`${origin}/api/mcp-data.json`);
    if (!res.ok) throw new Error(`Failed to load /api/mcp-data.json (${res.status})`);
    const data = (await res.json()) as McpData;
    return {
      data,
      async loadMarkdown(path: string) {
        const md = await env.ASSETS.fetch(`${origin}${path}`);
        if (!md.ok) throw new Error(`Failed to load ${path} (${md.status})`);
        return md.text();
      },
    };
  })();
  // Don't cache a failed load.
  mcpEnv.catch(() => (mcpEnv = undefined));
  return mcpEnv;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/mcp") return handleMcp(request, () => getMcpEnv(env, url.origin));

    if (path === "/api/patterns") {
      const res = await env.ASSETS.fetch(`${url.origin}/api/patterns/index.json`);
      return new Response(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Anything else: let the assets layer answer (404.html for unknown paths).
    return env.ASSETS.fetch(request);
  },
};

export default worker;
