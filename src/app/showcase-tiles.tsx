import type { ShowcaseTile } from "@/components/showcase";
import { registry } from "@/registry";

// The live demos glimpsed in the showcase blocks (home and /skill). Two per
// column, column by column; the first of each pair is the top row, which stays
// clear of the fade.
const SHOWCASE = [
  "create-agent", "command-palette",
  "multi-agent-trace", "inline-citation",
  "tool-approval", "thinking-loader",
  "voice-orb", "diff-summary",
  "plan-review", "sources-stack",
  "cost-estimate", "model-picker",
];

export function getShowcaseTiles(): ShowcaseTile[] {
  const bySlug = new Map(registry.map((entry) => [entry.slug, entry]));
  return SHOWCASE.flatMap((slug) => {
    const entry = bySlug.get(slug);
    return entry ? [{ id: `${entry.category}/${entry.slug}`, demo: <entry.Demo /> }] : [];
  });
}
