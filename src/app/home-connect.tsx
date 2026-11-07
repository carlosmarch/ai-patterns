import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { McpInstall } from "@/components/mcp-install";
import { LLMS_URL } from "@/lib/mcp-install";
import { INSTALL_COMMAND } from "./skill/content";
import { ConnectTabs } from "./connect-tabs";

// "Use it from your agent": the three ways an agent can read the catalogue.
// The skill leads (it does the most), MCP covers every other client, and
// llms.txt is the fallback for anything that can fetch a URL.
export function HomeConnect() {
  return (
    <section id="connect" className="scroll-mt-20">
      <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
        Use it from your agent
        <span className="block text-muted-foreground">in whatever tool you build with.</span>
      </h2>

      <div className="mt-8">
        <ConnectTabs
          panels={[
            {
              value: "skill",
              label: "Claude Code skill",
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The most complete option: it recommends a pattern, checks it against the spec and scaffolds it into your project.
                  </p>
                  <CodeBlock code={INSTALL_COMMAND} lang="bash" trackAs="install_command" />
                  <p className="text-sm text-muted-foreground">
                    Then run <span className="font-mono text-foreground">/ai-patterns</span> in any project.{" "}
                    <Link href="/skill" className="text-foreground underline underline-offset-4">
                      More about the skill
                    </Link>
                  </p>
                </div>
              ),
            },
            {
              value: "mcp",
              label: "MCP server",
              content: (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    For Cursor, VS Code, Claude Desktop, Windsurf and any other MCP client. Your agent searches the catalogue and pulls a
                    pattern&apos;s spec and code when it needs one.
                  </p>
                  <McpInstall page="home" />
                </div>
              ),
            },
            {
              value: "llms",
              label: "llms.txt",
              content: (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    For anything that can fetch a URL. Each pattern page also has a Markdown version: add{" "}
                    <span className="font-mono text-foreground">.md</span> to its URL.
                  </p>
                  <CodeBlock code={LLMS_URL} lang="bash" />
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
