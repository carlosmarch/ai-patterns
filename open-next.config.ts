import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve the pages prerendered at build time straight from Workers static
// assets instead of rendering them on every request. Rendering a pattern
// page (React + Shiki) takes far longer than the Workers free plan's 10 ms
// CPU budget, which showed up as "Error 1102: Worker exceeded resource
// limits". The site has no revalidation, so a read-only cache is enough.
//
// The cache is copied into the assets by `opennextjs-cloudflare deploy`
// (or `populateCache`), so deploy with `npm run deploy`, not a bare
// `wrangler deploy`.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
