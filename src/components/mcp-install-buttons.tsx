"use client";

import { ArrowUpRight } from "lucide-react";

import { trackMcpInstallClicked } from "@/lib/analytics";
import { CURSOR_INSTALL_URL, VSCODE_INSTALL_URL } from "@/lib/mcp-install";

const CLIENTS = [
  { client: "cursor", label: "Add to Cursor", href: CURSOR_INSTALL_URL },
  { client: "vscode", label: "Add to VS Code", href: VSCODE_INSTALL_URL },
];

// One-click installs: each link opens the client's own "add MCP server"
// prompt, so nothing is installed without the user confirming it there.
export function McpInstallButtons({ page }: { page: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CLIENTS.map(({ client, label, href }) => (
        <a
          key={client}
          href={href}
          onClick={() => trackMcpInstallClicked({ client, page })}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          {label}
          <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden />
        </a>
      ))}
    </div>
  );
}
