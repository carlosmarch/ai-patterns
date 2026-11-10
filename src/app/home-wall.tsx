"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { CatalogPills, type CatalogFilter } from "@/components/catalog-header";
import { DemoWall, expandedHref, SM, useColumnCount, type WallItem } from "@/components/demo-wall";
import { markOpeningFromGallery } from "@/components/pattern-expand";

export interface HomeWallFilter extends CatalogFilter {
  /** Ids of the cards to preview, best first; more than are shown. */
  itemIds: string[];
  /** How many patterns the filter has in the full catalogue. */
  total: number;
  /** Where "See all" goes: the /patterns wall with this filter. */
  href: string;
  /** "See all 23 Oversee patterns" vs. "See all 10 new patterns". */
  noun: string;
}

// Filter and scroll position, kept while a pattern is open from here so
// collapsing it lands back on the same cards (a client-side navigation, so a
// module variable survives it; null on a hard load).
let returnState: { filter: string; y: number } | null = null;

/**
 * The home page's slice of the /patterns wall: the same live-demo cards and
 * job pills, two rows deep, with a way through to the full wall per filter.
 */
export function HomeWall({ items, filters }: { items: WallItem[]; filters: HomeWallFilter[] }) {
  const router = useRouter();
  const [restore] = useState(() => returnState);
  const [active, setActive] = useState(restore?.filter ?? filters[0].id);

  useLayoutEffect(() => {
    returnState = null;
    if (restore) window.scrollTo(0, restore.y);
  }, [restore]);

  const columns = useColumnCount();
  const filter = filters.find((f) => f.id === active) ?? filters[0];
  const byId = new Map(items.map((item) => [item.id, item]));
  const visible = filter.itemIds
    .slice(0, Math.max(3, columns * 2))
    .map((id) => byId.get(id))
    .filter((item): item is WallItem => Boolean(item));

  function open(item: WallItem) {
    returnState = { filter: active, y: window.scrollY };
    // Phones get the pattern page itself, as on /patterns.
    if (!window.matchMedia(SM).matches) {
      router.push(item.href);
      return;
    }
    markOpeningFromGallery("/");
    router.push(expandedHref(item));
  }

  return (
    <section id="patterns" className="scroll-mt-16">
      <div>
        <h2 className="text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl">
          Play with them first.
          <span className="block text-muted-foreground">Sorted by the job they do.</span>
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Every pattern is a live demo. Pick what your user is trying to do, try the patterns that help, then open one
          for the code and the spec.
        </p>
      </div>

      <div className="mt-10 mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CatalogPills pills={filters} active={active} onChoose={setActive} />
        <p className="text-sm text-muted-foreground md:text-right" aria-live="polite">
          {filter.question ? <>&ldquo;{filter.question}&rdquo;</> : filter.description}
        </p>
      </div>

      <DemoWall items={visible} onOpen={open} />

      <div className="mt-8 flex justify-center">
        <Link
          href={filter.href}
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[15px] font-medium text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          See all {filter.total} {filter.noun}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
