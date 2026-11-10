import Link from "next/link";

import { getEntryHref, type RelatedEntry } from "@/registry";

// "Related patterns" on a pattern page: each card shows the other pattern's
// wireframe and one sentence on when to use it instead of, or as well as, this one.
// `layout="panel"`: the single-column version for the expanded view's Context tab.
export function RelatedPatterns({
  items,
  layout = "page",
  headingId = "related-patterns",
}: {
  items: RelatedEntry[];
  layout?: "page" | "panel";
  headingId?: string;
}) {
  if (items.length === 0) return null;
  const panel = layout === "panel";

  return (
    <section aria-labelledby={headingId} className={panel ? undefined : "mt-12"}>
      <h2 id={headingId} className={panel ? "mb-3 text-sm font-medium" : "mb-4 text-lg font-semibold tracking-tight"}>
        Related patterns
      </h2>
      <ul className={panel ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        {items.map(({ entry, reason }) => {
          const { Thumbnail } = entry;
          return (
            <li key={`${entry.category}/${entry.slug}`}>
              <Link
                href={getEntryHref(entry)}
                className="group flex h-full gap-3 rounded-xl border bg-muted/40 p-1.5 transition-colors hover:bg-muted/70"
              >
                <div className="aspect-[5/3] w-24 shrink-0 self-start rounded-lg border bg-card p-1.5 transition-transform duration-300 group-hover:-translate-y-0.5 dark:bg-background">
                  <Thumbnail />
                </div>
                <div className="min-w-0 py-1 pr-1.5">
                  <p className="text-sm font-medium">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
