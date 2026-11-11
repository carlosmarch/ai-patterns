"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { SiteSearch, recordVisit } from "@/components/site-search";

export function SiteCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // "/" opens search too, unless the user is typing somewhere.
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Remember pattern pages for "Recently visited".
  React.useEffect(() => {
    recordVisit(pathname);
  }, [pathname]);

  // The pill and the panel share a layoutId, so opening morphs the pill into
  // the panel (and closing folds it back) instead of fading a modal in.
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false);
  const reduceMotion = useReducedMotion();
  // One clock for the whole opening: the pill grows into the field (just
  // below the header, so it barely travels) over OPEN_S, and the results
  // drop in under it only as that growth is finishing.
  const morph = reduceMotion ? { duration: 0 } : { duration: OPEN_S, ease: OPEN_EASE };
  const pillRef = React.useRef<HTMLButtonElement>(null);
  const wasOpen = React.useRef(false);

  // Hand focus back to the pill once it is back in place.
  React.useEffect(() => {
    if (wasOpen.current && !open) pillRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  // Lock page scroll behind the panel.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <LayoutGroup id="site-search">
      {/* Holds the pill's slot in the header while it is morphed away. */}
      <div className="h-9 w-9 md:w-56">
        {!open && (
          <motion.button
            ref={pillRef}
            layoutId="site-search"
            transition={morph}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Search patterns"
            aria-haspopup="dialog"
            style={{ borderRadius: 18 }}
            className="flex h-9 w-full items-center gap-2 overflow-hidden bg-muted px-[10px] text-sm text-muted-foreground transition-colors hover:text-foreground md:px-4"
          >
            <motion.span layout="position" transition={morph} className="flex min-w-0 flex-1 items-center gap-2">
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">Search</span>
              <kbd className="ml-auto hidden font-sans text-xs text-muted-foreground/70 md:inline">⌘K</kbd>
            </motion.span>
          </motion.button>
        )}
      </div>

      {mounted &&
        // Portal to <body>: the header's backdrop-filter would otherwise
        // become the containing block for this fixed overlay.
        createPortal(
          <AnimatePresence>
            {open && (
              <div key="palette" className="fixed inset-0 z-50 flex justify-center px-4 pt-2">
                <motion.div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={close}
                  aria-hidden
                />
                {/* The search field and the results are two separate surfaces
                    with a gap between them: the field is the header pill, grown
                    in place; the results drop in underneath it. */}
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Search"
                  className="relative z-10 flex h-fit w-full max-w-xl flex-col gap-2"
                >
                  <SiteSearch
                    currentPath={pathname}
                    onClose={close}
                    onNavigate={(href, newTab) => {
                      if (newTab) window.open(href, "_blank", "noopener");
                      else router.push(href);
                      close();
                    }}
                    renderField={(field) => (
                      <motion.div
                        layoutId="site-search"
                        transition={morph}
                        style={{ borderRadius: 24 }}
                        className="overflow-hidden border bg-popover"
                      >
                        {/* Fades in once the pill has nearly finished growing,
                            so the contents are never seen stretched. */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: reduceMotion ? { duration: 0 } : { duration: OPEN_S * 0.5, delay: OPEN_S * 0.5 },
                          }}
                          exit={{ opacity: 0, transition: { duration: 0.08 } }}
                        >
                          {field}
                        </motion.div>
                      </motion.div>
                    )}
                    renderResults={(results) => (
                      <motion.div
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: reduceMotion
                            ? { duration: 0 }
                            : // Only once the field has nearly finished growing,
                              // so the two never move at the same time.
                              { duration: OPEN_S * 0.5, delay: OPEN_S * 0.75, ease: "easeOut" },
                        }}
                        exit={{ opacity: 0, y: -6, transition: { duration: 0.1 } }}
                        style={{ transformOrigin: "top center" }}
                        className="overflow-hidden rounded-2xl border bg-popover"
                      >
                        {results}
                      </motion.div>
                    )}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </LayoutGroup>
  );
}

/** Seconds the search takes to open, field and results alike. */
const OPEN_S = 0.32;
/** A timed ease-out rather than a spring: a spring's tail keeps the big
 *  pill-to-field morph creeping after the small results drop has stopped. */
const OPEN_EASE = [0.32, 0.72, 0, 1] as const;

function subscribeNoop() {
  return () => {};
}
