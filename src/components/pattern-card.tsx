import Link from "next/link";

import { NewBadge } from "@/components/new-badge";
import { SeenIn } from "@/components/seen-in";
import { isNewEntry, type RegistryEntry } from "@/registry";

// The thumbnail card used on the home page and the /patterns index: a
// wireframe print on a white surface, framed by a muted card. Recently added
// patterns get the "New" tag on the print.
// `showCategory`: tag the card with its category, where the cards are grouped by job (/patterns).
export function PatternCard({ entry, showCategory = false }: { entry: RegistryEntry; showCategory?: boolean }) {
  const { Thumbnail } = entry;
  const showNew = isNewEntry(entry);
  return (
    <Link
      href={`/patterns/${entry.category}/${entry.slug}`}
      className="group block h-full rounded-xl border bg-muted/40 p-1.5 transition-colors hover:bg-muted/70"
    >
      <div className="relative aspect-[5/3] rounded-lg border bg-card p-2 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-background">
        <Thumbnail />
        {showNew && (
          <span className="absolute top-1.5 left-1.5 flex rounded-full bg-card dark:bg-background">
            <NewBadge />
          </span>
        )}
      </div>
      <div className="px-1.5 pt-2.5 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{entry.title}</p>
          <SeenIn items={entry.seenIn} size="sm" showLabel={false} className="shrink-0" />
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{entry.description}</p>
        {showCategory && (
          <p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground/80 uppercase">{entry.category}</p>
        )}
      </div>
    </Link>
  );
}
