"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ExternalLink, Globe } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Source {
  title: string;
  domain: string;
  url: string;
  /** Falls back to a globe icon when omitted or when the image fails to load. */
  faviconUrl?: string;
}

export interface SourcesStackProps {
  sources: Source[];
  /** How many favicons render in the collapsed stack before folding into the count. */
  visibleCount?: number;
  defaultOpen?: boolean;
  className?: string;
}

export function SourcesStack({
  sources,
  visibleCount = 3,
  defaultOpen = false,
  className,
}: SourcesStackProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const listId = React.useId();
  const stacked = sources.slice(0, visibleCount);

  return (
    <div className={cn("w-full max-w-xs", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-3 text-sm transition-colors hover:bg-accent/50"
      >
        <span aria-hidden className="flex -space-x-2">
          {stacked.map((source, i) => (
            <Favicon key={source.url} source={source} style={{ zIndex: stacked.length - i }} />
          ))}
        </span>
        <span className="text-muted-foreground">
          {sources.length} source{sources.length === 1 ? "" : "s"}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={listId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-1.5 overflow-hidden rounded-xl border bg-popover"
          >
            {sources.map((source) => (
              <li key={source.url} className="border-b last:border-b-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-accent/50"
                >
                  <Favicon source={source} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground/90">{source.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{source.domain}</span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Favicon({ source, style }: { source: Source; style?: React.CSSProperties }) {
  const [errored, setErrored] = React.useState(false);
  const showImage = source.faviconUrl && !errored;

  return (
    <span
      style={style}
      className="relative flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source.faviconUrl} alt="" className="size-full object-cover" onError={() => setErrored(true)} />
      ) : (
        <Globe className="size-2.5 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}
