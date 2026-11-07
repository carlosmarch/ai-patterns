// How to connect the /mcp server from each client, shared by the home page's
// "Use it from your agent" section and the /skill page. Kept free of registry
// imports so client components can use it without bundling the catalogue.

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-patterns.app").replace(/\/$/, "");

export const MCP_NAME = "ai-patterns";
export const MCP_URL = `${SITE_URL}/mcp`;
export const LLMS_URL = `${SITE_URL}/llms.txt`;

export const MCP_TOOLS = ["search_patterns", "get_pattern", "list_patterns"];

export const CLAUDE_CODE_MCP_COMMAND = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;

// The generic config most clients (Windsurf, Cline, Zed, …) accept.
export const MCP_JSON_CONFIG = JSON.stringify({ mcpServers: { [MCP_NAME]: { url: MCP_URL } } }, null, 2);

// btoa is available in browsers, Node 16+ and workerd.
const base64 = (s: string) => btoa(s);

// https://docs.cursor.com/deeplinks — config is the server entry, base64-encoded.
export const CURSOR_INSTALL_URL = `cursor://anysphere.cursor-deeplink/mcp/install?name=${MCP_NAME}&config=${encodeURIComponent(
  base64(JSON.stringify({ url: MCP_URL }))
)}`;

// https://code.visualstudio.com/docs/copilot/chat/mcp-servers — vscode:mcp/install?{url-encoded JSON}
export const VSCODE_INSTALL_URL = `vscode:mcp/install?${encodeURIComponent(
  JSON.stringify({ name: MCP_NAME, type: "http", url: MCP_URL })
)}`;
