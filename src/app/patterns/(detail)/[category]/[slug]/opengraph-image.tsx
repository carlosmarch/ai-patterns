import { OG_SIZE, ThumbnailCard, ogImage } from "@/lib/og";
import { getRegistryEntry, registry } from "@/registry";

export const dynamic = "force-static";
export const alt = "AI Patterns pattern preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return registry.map(({ category, slug }) => ({ category, slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const entry = getRegistryEntry(category, slug);
  if (!entry) throw new Error(`Unknown pattern ${category}/${slug}`);
  return ogImage({
    eyebrow: category.charAt(0).toUpperCase() + category.slice(1),
    title: entry.title,
    description: entry.description,
    aside: <ThumbnailCard Thumbnail={entry.Thumbnail} scale={2.2} />,
  });
}
