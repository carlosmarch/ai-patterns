import type { MetadataRoute } from "next";

import { abs, patternUrl } from "@/lib/agent";
import { registry } from "@/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: abs("/"), priority: 1 },
    { url: abs("/patterns"), priority: 0.9 },
    { url: abs("/research"), priority: 0.8 },
    { url: abs("/skill"), priority: 0.7 },
    { url: abs("/demo"), priority: 0.5 },
    { url: abs("/workspace"), priority: 0.5 },
    { url: abs("/license"), priority: 0.3 },
    ...registry.map((entry) => ({ url: patternUrl(entry), priority: 0.8 })),
  ];
}
