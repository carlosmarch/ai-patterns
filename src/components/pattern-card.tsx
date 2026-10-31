import Link from "next/link";

import type { RegistryEntry } from "@/registry";

// The thumbnail card used on the home page groups and the /patterns index:
// a wireframe print on a white surface, framed by a muted card.
export function PatternCard({ entry }: { entry: RegistryEntry }) {
  const { Thumbnail } = entry;
  return (
    <Link
      href={`/patterns/${entry.category}/${entry.slug}`}
      className="group block h-full rounded-xl border bg-muted/40 p-1.5 transition-colors hover:bg-muted/70"
    >
      <div className="aspect-[5/3] rounded-lg border bg-card p-2 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-background">
        <Thumbnail />
      </div>
      <div className="px-1.5 pt-2.5 pb-1.5">
        <p className="text-sm font-medium">{entry.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{entry.description}</p>
      </div>
    </Link>
  );
}
