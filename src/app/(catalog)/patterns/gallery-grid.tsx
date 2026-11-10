"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { markOpeningFromGallery } from "@/components/pattern-expand";
import { CatalogHeader, type CatalogFilter } from "@/components/catalog-header";
import { setCatalogJob } from "@/components/catalog-filter-store";
import { DemoWall, expandedHref, SM, type WallItem } from "@/components/demo-wall";

export type GalleryItem = WallItem;

const ALL = "all";
const NEW = "new";

// Filter and scroll position, kept while a pattern is open so closing it lands
// back in place. Coming back is a client-side navigation, so a module variable
// survives it; on a hard load it's null, matching the static HTML.
let returnState: { filter: string; y: number } | null = null;

function saveReturnState(state: { filter: string; y: number }) {
  returnState = state;
}

function takeReturnState() {
  const state = returnState;
  returnState = null;
  return state;
}

/** The gallery URL for the job filter (`?job=`). */
function galleryHref(filter: string) {
  return filter === ALL ? "/patterns" : `/patterns?job=${encodeURIComponent(filter)}`;
}

export function GalleryGrid({
  items,
  filters,
}: {
  /** In catalogue order: by job, clustered by category. */
  items: GalleryItem[];
  filters: CatalogFilter[];
}) {
  const router = useRouter();
  // Read, not taken, in the initializer: Strict Mode runs initializers twice.
  const [restore] = useState(() => returnState);
  const [active, setActive] = useState(restore?.filter ?? ALL);

  // Put the scroll back before the first paint, so the view transition
  // morphs into the right card.
  useLayoutEffect(() => {
    takeReturnState();
    if (restore) window.scrollTo(0, restore.y);
  }, [restore]);

  // Otherwise the filter comes from ?job= (a shared link or a reload). Synced
  // after hydration: the static HTML always renders "all".
  useEffect(() => {
    if (restore) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("job");
    const valid = fromUrl === NEW || filters.some((f) => f.id === fromUrl);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && valid) setActive(fromUrl);
  }, [restore, filters]);

  // Tell the patterns sidebar which job is in play, so it can fold the others.
  useEffect(() => {
    setCatalogJob(active === ALL || active === NEW ? null : active);
  }, [active]);

  function choose(id: string) {
    setActive(id);
    window.history.replaceState(window.history.state, "", galleryHref(id));
  }

  function open(item: GalleryItem) {
    saveReturnState({ filter: active, y: window.scrollY });
    // On phones the full-screen expanded view is too cramped: open the
    // pattern page itself, and let back return to the gallery.
    if (!window.matchMedia(SM).matches) {
      router.push(item.href);
      return;
    }
    markOpeningFromGallery(galleryHref(active));
    router.push(expandedHref(item));
  }

  // One wall, no section headings: catalogue order (by job) or, for "New", newest first.
  const visible = items.filter((item) => (active === ALL ? true : active === NEW ? item.isNew : item.job === active));

  return (
    <>
      <CatalogHeader
        total={items.length}
        newCount={items.filter((item) => item.isNew).length}
        filters={filters}
        active={active}
        onChoose={choose}
      />

      <DemoWall items={visible} onOpen={open} />
    </>
  );
}
