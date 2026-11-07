import type { NextConfig } from "next";

// Matches requests from agents that ask for Markdown instead of HTML.
const acceptsMarkdown = [{ type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" }];

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Keep the full Shiki bundle out of the server (see the stub).
      shiki: { browser: "shiki", default: "./src/lib/shiki-server-stub.ts" },
    },
  },

  async rewrites() {
    // Markdown twins of the pages live at /md/** (see src/app/md). Reach
    // them by appending `.md` to a page URL, or with `Accept: text/markdown`.
    // beforeFiles, so the header variants win over the HTML pages.
    return {
      beforeFiles: [
        { source: "/index.md", destination: "/md" },
        { source: "/patterns.md", destination: "/md/patterns" },
        { source: "/skill.md", destination: "/md/skill" },
        { source: "/patterns/:category/:slug.md", destination: "/md/patterns/:category/:slug" },
        { source: "/", destination: "/md", has: acceptsMarkdown },
        { source: "/patterns", destination: "/md/patterns", has: acceptsMarkdown },
        { source: "/skill", destination: "/md/skill", has: acceptsMarkdown },
        { source: "/patterns/:category/:slug", destination: "/md/patterns/:category/:slug", has: acceptsMarkdown },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async headers() {
    const markdownPages = ["/", "/patterns", "/skill", "/patterns/:category/:slug"];
    return [
      {
        // Point agents at the machine-readable index from every page.
        source: "/:path*",
        headers: [{ key: "Link", value: '</llms.txt>; rel="describedby"; type="text/plain", </mcp>; rel="service"; title="MCP server"' }],
      },
      ...markdownPages.map((source) => ({ source, headers: [{ key: "Vary", value: "Accept" }] })),
    ];
  },
};

export default nextConfig;
