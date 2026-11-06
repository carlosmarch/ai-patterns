import type { MetadataRoute } from "next";

import { abs } from "@/lib/agent";

// Everyone — search engines and AI agents alike — is welcome. /md/ only
// holds the targets of the `.md` rewrites, so crawlers should use those URLs.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/md/", "/sections"] },
    sitemap: abs("/sitemap.xml"),
  };
}
