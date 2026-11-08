import Link from "next/link";

import { NewBadge, formatAdded } from "@/components/new-badge";
import { SeenIn } from "@/components/seen-in";
import { isNewEntry, type RegistryEntry } from "@/registry";

// The thumbnail card used on the home page and the /patterns index: a
// wireframe print on a white surface, framed by a muted card. Recently added
// patterns get the "New" tag on the print. `compact` is the small card of the
// home page's "New" block: title and date added, no description or tag (the
// whole block is new).
export function PatternCard({ entry, compact }: { entry: RegistryEntry; compact?: boolean }) {
  const { Thumbnail } = entry;
  const showNew = !compact && isNewEntry(entry);
  return (
    <Link
      href={`/patterns/${entry.category}/${entry.slug}`}
      className="group block h-full rounded-xl border bg-muted/40 p-1.5 transition-colors hover:bg-muted/70"
    >
      <div className="relative aspect-[5/3] rounded-lg border bg-card p-2 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-background">
        <Thumbnail />
        {showNew && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-card dark:bg-background">
            <NewBadge />
          </span>
        )}
      </div>
      {compact ? (
        <div className="px-1.5 pt-2 pb-1">
          <p className="truncate text-xs font-medium">{entry.title}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            <span className="capitalize">{entry.category}</span> · <time dateTime={entry.added}>{formatAdded(entry.added)}</time>
          </p>
        </div>
      ) : (
        <div className="px-1.5 pt-2.5 pb-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{entry.title}</p>
            <SeenIn items={entry.seenIn} size="sm" showLabel={false} className="shrink-0" />
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{entry.description}</p>
        </div>
      )}
    </Link>
  );
}
