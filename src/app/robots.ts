import type { MetadataRoute } from "next";

import { abs } from "@/lib/agent";

// Everyone — search engines and AI agents alike — is welcome.

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/sections", "/gallery"] },
    sitemap: abs("/sitemap.xml"),
  };
}
