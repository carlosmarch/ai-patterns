import { OG_SIZE, ThumbnailCard, ogImage } from "@/lib/og";
import { getRegistryEntry } from "@/registry";

export const dynamic = "force-static";
export const alt = "AI Patterns — production components for AI agent UIs";
export const size = OG_SIZE;
export const contentType = "image/png";

const SHOWCASE = [
  ["permissions", "tool-approval"],
  ["traces", "multi-agent-trace"],
  ["composer", "prompt-bar"],
  ["tables", "ai-fill-drawer"],
] as const;

export default async function Image() {
  const thumbs = SHOWCASE.map(([category, slug]) => getRegistryEntry(category, slug)).filter((e) => e !== undefined);
  return ogImage({
    title: "Components for AI agent UIs",
    titleSize: 60,
    description: "Copy-paste, animated, each with a UX spec the harness can read.",
    aside: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, width: 2 * 240 + 16 }}>
        {thumbs.map((entry) => (
          <ThumbnailCard key={entry.slug} Thumbnail={entry.Thumbnail} scale={1.2} />
        ))}
      </div>
    ),
  });
}
