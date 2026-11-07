import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { McpInstallButtons } from "@/components/mcp-install-buttons";
import { CLAUDE_CODE_MCP_COMMAND, MCP_JSON_CONFIG, MCP_TOOLS, MCP_URL } from "@/lib/mcp-install";

// Everything needed to connect the /mcp server: the URL, one-click installs
// for Cursor and VS Code, the Claude Code command and a generic JSON config.
// A server component, so the snippets are highlighted at build time.
export function McpInstall({ page }: { page: string }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3">
          <span className="sr-only">Server URL</span>
          <code className="min-w-0 flex-1 truncate font-mono text-sm">{MCP_URL}</code>
          <CopyButton text={MCP_URL} trackAs="mcp_config" />
        </div>
        <McpInstallButtons page={page} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Claude Code</p>
        <CodeBlock code={CLAUDE_CODE_MCP_COMMAND} lang="bash" trackAs="mcp_config" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Claude Desktop &amp; claude.ai</p>
        <p className="text-sm text-muted-foreground">
          Settings → Connectors → <span className="text-foreground">Add custom connector</span>, then paste the URL above.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Windsurf, Cline, Zed and other clients</p>
        {/* JSON is a valid TS expression, so the tsx grammar highlights it without bundling another. */}
        <CodeBlock code={MCP_JSON_CONFIG} lang="tsx" trackAs="mcp_config" />
      </div>

      <p className="text-sm text-muted-foreground">
        Read-only, no auth, Streamable HTTP. Tools:{" "}
        {MCP_TOOLS.map((tool, i) => (
          <span key={tool}>
            {i > 0 && ", "}
            <code className="font-mono text-xs text-foreground">{tool}</code>
          </span>
        ))}
        .
      </p>
    </div>
  );
}
