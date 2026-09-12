"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Globe, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TrustedSource {
  title: string;
  domain: string;
  description: string;
  url: string;
  /** Falls back to a globe icon when omitted or when the image fails to load. */
  faviconUrl?: string;
  /** Shows the trust badge and, when given, why the source is trusted. */
  trustReason?: string;
}

export interface SourceTrustCardProps {
  sources: TrustedSource[];
  defaultIndex?: number;
  className?: string;
}

export function SourceTrustCard({ sources, defaultIndex = 0, className }: SourceTrustCardProps) {
  const [index, setIndex] = React.useState(defaultIndex);
  const [direction, setDirection] = React.useState(0);
  const source = sources[index];

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + sources.length) % sources.length);
  }

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }

  return (
    <div className={cn("w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={sources.length < 2}
            aria-label="Previous source"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[3ch] text-center text-xs tabular-nums text-muted-foreground">
            {index + 1}/{sources.length}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={sources.length < 2}
            aria-label="Next source"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {sources.length} source{sources.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            initial={{ x: direction >= 0 ? 24 : -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -24 : 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-3"
          >
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="-m-1 flex items-start gap-2.5 rounded-lg p-1 transition-colors hover:bg-accent/50"
            >
              <Favicon source={source} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-muted-foreground">{source.domain}</span>
                <span className="mt-0.5 block line-clamp-2 text-sm font-medium leading-snug text-foreground">
                  {source.title}
                </span>
                <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {source.description}
                </span>
              </span>
            </a>

            {source.trustReason && (
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Trusted
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground/80">{source.domain}</span> {source.trustReason}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Learn more
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {sources.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
          {sources.map((s, i) => (
            <button
              key={s.url}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === index}
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs transition-colors",
                i === index
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-transparent bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {s.domain}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Favicon({ source }: { source: TrustedSource }) {
  const [errored, setErrored] = React.useState(false);
  const showImage = source.faviconUrl && !errored;

  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source.faviconUrl} alt="" className="size-full object-cover" onError={() => setErrored(true)} />
      ) : (
        <Globe className="size-4 text-muted-foreground" aria-hidden />
      )}
    </span>
  );
}
